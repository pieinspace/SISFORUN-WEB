import { Request, Response } from "express";
import { pool } from "../db";

import { authenticateToken } from "../middleware/authMiddleware";

export const getRunners = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    // --- Query parameters for server-side pagination, search & filtering ---
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const search = (req.query.search as string || "").trim();
    const filterKtm = (req.query.kd_ktm as string || "").trim();
    const filterSmkl = (req.query.kd_smkl as string || "").trim();
    const filterStatus = (req.query.status as string || "").trim(); // "Tercapai" | "Dalam Proses" | "Belum Mulai"

    // --- Build dynamic WHERE clause ---
    const conditions: string[] = ["u.role != 'admin'"];
    const params: any[] = [];

    // Role-based scope restrictions (overrides filter params)
    if (user?.role === 'admin_kotama' && user.kd_ktm) {
      params.push(user.kd_ktm);
      conditions.push(`u.kd_ktm = $${params.length}`);
    } else if (user?.role === 'admin_satuan' && user.kd_ktm && user.kd_smkl) {
      params.push(user.kd_ktm);
      conditions.push(`u.kd_ktm = $${params.length}`);
      params.push(user.kd_smkl);
      conditions.push(`u.kd_smkl = $${params.length}`);
    } else {
      // Superadmin — respect optional filter params from frontend
      if (filterKtm) {
        params.push(filterKtm);
        conditions.push(`u.kd_ktm = $${params.length}`);
      }
      if (filterSmkl) {
        params.push(filterSmkl);
        conditions.push(`u.kd_smkl = $${params.length}`);
      }
    }

    // Search by name (case-insensitive)
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`u.name ILIKE $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    // --- CTE: pre-aggregate run_sessions to avoid Cartesian explosion ---
    // --- Also compute target status server-side ---
    const cteQuery = `
      WITH user_stats AS (
        SELECT
          user_id,
          COALESCE(SUM(distance_km), 0) AS total_distance,
          COUNT(id) AS total_sessions
        FROM run_sessions
        WHERE date_created >= NOW() - INTERVAL '7 days'
        GROUP BY user_id
      ),
      user_best AS (
        SELECT DISTINCT ON (user_id)
          user_id,
          distance_km AS best_distance,
          validation_status AS best_validation
        FROM run_sessions
        WHERE date_created >= NOW() - INTERVAL '7 days'
        ORDER BY user_id, distance_km DESC
      )
    `;

    // --- Count total matching rows (for pagination meta) ---
    const countQuery = `
      ${cteQuery}
      SELECT COUNT(*) AS total
      FROM users u
      LEFT JOIN user_stats us ON us.user_id = u.id
      LEFT JOIN user_best ub ON ub.user_id = u.id
      ${whereClause}
      ${filterStatus ? `AND (
        CASE
          WHEN ub.best_distance IS NOT NULL AND (
            (CAST(COALESCE(u.kd_pkt, '0') AS INTEGER) <= 45 AND ub.best_distance >= 10)
            OR (CAST(COALESCE(u.kd_pkt, '0') AS INTEGER) > 45 AND ub.best_distance >= 14)
          ) AND ub.best_validation = 'validated' THEN 'Tercapai'
          WHEN COALESCE(us.total_distance, 0) > 0 THEN 'Dalam Proses'
          ELSE 'Belum Mulai'
        END
      ) = $${params.length + 1}` : ""}
    `;

    const countParams = filterStatus ? [...params, filterStatus] : [...params];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total) || 0;

    // --- Main data query with LIMIT/OFFSET ---
    const statusCase = `
      CASE
        WHEN ub.best_distance IS NOT NULL AND (
          (CAST(COALESCE(u.kd_pkt, '0') AS INTEGER) <= 45 AND ub.best_distance >= 10)
          OR (CAST(COALESCE(u.kd_pkt, '0') AS INTEGER) > 45 AND ub.best_distance >= 14)
        ) AND ub.best_validation = 'validated' THEN 'Tercapai'
        WHEN COALESCE(us.total_distance, 0) > 0 THEN 'Dalam Proses'
        ELSE 'Belum Mulai'
      END AS "statusTarget"
    `;

    // Build the status filter for the main query too
    let statusFilter = "";
    const mainParams = [...params];
    if (filterStatus) {
      mainParams.push(filterStatus);
      statusFilter = `AND (
        CASE
          WHEN ub.best_distance IS NOT NULL AND (
            (CAST(COALESCE(u.kd_pkt, '0') AS INTEGER) <= 45 AND ub.best_distance >= 10)
            OR (CAST(COALESCE(u.kd_pkt, '0') AS INTEGER) > 45 AND ub.best_distance >= 14)
          ) AND ub.best_validation = 'validated' THEN 'Tercapai'
          WHEN COALESCE(us.total_distance, 0) > 0 THEN 'Dalam Proses'
          ELSE 'Belum Mulai'
        END
      ) = $${mainParams.length}`;
    }

    mainParams.push(limit);
    const limitParam = `$${mainParams.length}`;
    mainParams.push(offset);
    const offsetParam = `$${mainParams.length}`;

    const dataQuery = `
      ${cteQuery}
      SELECT
        u.id,
        u.name,
        u.pangkat AS rank,
        u.role,
        u.created_at AS "createdAt",
        u.kd_ktm,
        u.kd_smkl,
        u.kd_corps,
        u.kd_pkt,
        k.ur_ktm AS kesatuan_name,
        s.ur_smkl AS subdis_name,
        c.init_corps AS corps_name,
        p.ur_pkt AS pangkat_name,
        COALESCE(us.total_distance, 0) AS "totalDistance",
        COALESCE(us.total_sessions, 0) AS "totalSessions",
        ${statusCase}
      FROM users u
      LEFT JOIN user_stats us ON us.user_id = u.id
      LEFT JOIN user_best ub ON ub.user_id = u.id
      LEFT JOIN kotama k ON u.kd_ktm = k.kd_ktm
      LEFT JOIN kesatuan s ON u.kd_ktm = s.kd_ktm AND u.kd_smkl = s.kd_smkl
      LEFT JOIN corps c ON u.kd_corps = c.kd_corps
      LEFT JOIN pangkat p ON u.kd_pkt = p.kd_pkt
      ${whereClause}
      ${statusFilter}
      ORDER BY
        CASE
          WHEN u.kd_pkt IS NOT NULL THEN CAST(u.kd_pkt AS INTEGER)
          ELSE 0
        END DESC,
        u.name ASC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const result = await pool.query(dataQuery, mainParams);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: result.rows,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
};

export const getRunnerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.pangkat AS rank,
        u.role,
        u.nrp,
        u.created_at AS "createdAt",
        u.kd_ktm,
        u.kd_smkl,
        u.kd_corps,
        u.kd_pkt,
        k.ur_ktm AS kesatuan_name,
        s.ur_smkl AS subdis_name,
        c.init_corps AS corps_name,
        p.ur_pkt AS pangkat_name,
        COALESCE(SUM(rs.distance_km), 0) AS "totalDistance",
        COALESCE(SUM(rs.duration_sec), 0) AS "totalDuration",
        COUNT(rs.id) AS "totalSessions"
      FROM users u
      LEFT JOIN run_sessions rs ON rs.user_id = u.id
      LEFT JOIN kotama k ON u.kd_ktm = k.kd_ktm
      LEFT JOIN kesatuan s ON u.kd_ktm = s.kd_ktm AND u.kd_smkl = s.kd_smkl
      LEFT JOIN corps c ON u.kd_corps = c.kd_corps
      LEFT JOIN pangkat p ON u.kd_pkt = p.kd_pkt
      WHERE u.id = $1
      GROUP BY 
        u.id, u.name, u.pangkat, u.role, u.nrp, u.created_at, 
        u.kd_ktm, u.kd_smkl, u.kd_corps, u.kd_pkt,
        k.ur_ktm, s.ur_smkl, c.init_corps, p.ur_pkt
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Runner not found" });
    }

    const row = result.rows[0];

    // Calculate average pace
    const totalDistance = parseFloat(row.totalDistance) || 0;
    const totalDuration = parseInt(row.totalDuration) || 0;
    let avgPace = "-";
    if (totalDistance > 0 && totalDuration > 0) {
      const paceVal = totalDuration / 60 / totalDistance;
      const paceMin = Math.floor(paceVal);
      const paceSec = Math.round((paceVal - paceMin) * 60);
      avgPace = `${paceMin}'${paceSec.toString().padStart(2, "0")}"/km`;
    }

    // Format total time
    let totalTime = "-";
    if (totalDuration > 0) {
      const hours = Math.floor(totalDuration / 3600);
      const minutes = Math.floor((totalDuration % 3600) / 60);
      const seconds = totalDuration % 60;
      totalTime = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    res.json({
      data: {
        ...row,
        totalDistance,
        totalTime,
        avgPace,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
};

export const getRunnerSessions = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        rs.id,
        rs.distance_km,
        rs.duration_sec,
        rs.date_created,
        rs.validation_status,
        rs.route_json
      FROM run_sessions rs
      WHERE rs.user_id = $1
      ORDER BY rs.date_created DESC
    `, [id]);

    // Transform data
    const sessions = result.rows.map((row) => {
      const duration = row.duration_sec || 0;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      const time = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      const distance = parseFloat(row.distance_km) || 0;
      let pace = "-";
      if (distance > 0 && duration > 0) {
        const paceVal = duration / 60 / distance;
        const paceMin = Math.floor(paceVal);
        const paceSec = Math.round((paceVal - paceMin) * 60);
        pace = `${paceMin}'${paceSec.toString().padStart(2, "0")}"/km`;
      }

      return {
        id: row.id,
        distance: distance,
        time,
        pace,
        date: row.date_created,
        validationStatus: row.validation_status || "pending",
        targetMet: distance >= 14,
      };
    });

    res.json({ data: sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
};

export const updateRunner = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, rank, kd_pkt, kd_ktm, kd_smkl, kd_corps } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, pangkat = $2, kd_pkt = $3, kd_ktm = $4, kd_smkl = $5, kd_corps = $6 WHERE id = $7 RETURNING *",
      [name, rank, kd_pkt, kd_ktm, kd_smkl, kd_corps, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Runner not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
};
