import { Router } from "express";
import { pool } from "../db";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/targets/14km
 * Data untuk halaman Target 14 KM dan tabel dashboard "Target 14 KM Tercapai"
 */
router.get("/14km", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let whereClause = "WHERE ((u.kd_pkt <= '45' AND rs.distance_km >= 10) OR (u.kd_pkt > '45' AND rs.distance_km >= 14))";
    const params: any[] = [];

    if (user?.role === 'admin_kotama' && user.kd_ktm) {
      whereClause += ` AND u.kd_ktm = $${params.length + 1}`;
      params.push(user.kd_ktm);
    } else if (user?.role === 'admin_satuan' && user.kd_ktm && user.kd_smkl) {
      whereClause += ` AND u.kd_ktm = $${params.length + 1} AND u.kd_smkl = $${params.length + 2}`;
      params.push(user.kd_ktm);
      params.push(user.kd_smkl);
    }

    const result = await pool.query(`
      SELECT
        u.id AS id,
        rs.id AS session_id,
        u.name,
        u.pangkat AS rank,
        rs.distance_km,
        rs.duration_sec,
        rs.date_created AS achieved_date,
        rs.validation_status,
        u.kd_ktm,
        u.kd_smkl,
        u.kd_corps,
        u.kd_pkt,
        k.ur_ktm AS kesatuan_name,
        s.ur_smkl AS subdis_name,
        c.init_corps AS corps_name,
        p.ur_pkt AS pangkat_name
      FROM run_sessions rs
      JOIN users u ON u.id = rs.user_id
      LEFT JOIN kotama k ON u.kd_ktm = k.kd_ktm
      LEFT JOIN kesatuan s ON u.kd_ktm = s.kd_ktm AND u.kd_smkl = s.kd_smkl
      LEFT JOIN corps c ON u.kd_corps = c.kd_corps
      LEFT JOIN pangkat p ON u.kd_pkt = p.kd_pkt
      ${whereClause}
      ORDER BY rs.date_created DESC
    `, params);

    // Transform data to match frontend expectations
    const data = result.rows.map((row) => {
      // Calculate time_taken (HH:MM:SS)
      const duration = row.duration_sec || 0;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      const time_taken = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      // Calculate pace (min/km)
      const distance = row.distance_km || 1;
      const paceVal = duration / 60 / distance;
      const paceMin = Math.floor(paceVal);
      const paceSec = Math.round((paceVal - paceMin) * 60);
      const pace = `${paceMin}'${paceSec.toString().padStart(2, "0")}"/km`;

      return {
        ...row,
        // Frontend expects these fields
        time_taken,
        pace,
      };
    });

    res.json({ data });
  } catch (err) {
    console.error("GET /api/targets/14km error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/targets/weekly-stats
 * Statistik jarak mingguan untuk DistanceChart (4 minggu terakhir)
 */
router.get("/weekly-stats", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let whereClause = "WHERE rs.date_created >= NOW() - INTERVAL '4 weeks'";
    const params: any[] = [];

    // Note: For stats, we need to join users table to filter by scope
    let joinUsers = "";
    if (user?.role === 'admin_kotama' || user?.role === 'admin_satuan') {
      joinUsers = "JOIN users u ON u.id = rs.user_id";
    }

    if (user?.role === 'admin_kotama' && user.kd_ktm) {
      whereClause += ` AND u.kd_ktm = $${params.length + 1}`;
      params.push(user.kd_ktm);
    } else if (user?.role === 'admin_satuan' && user.kd_ktm && user.kd_smkl) {
      whereClause += ` AND u.kd_ktm = $${params.length + 1} AND u.kd_smkl = $${params.length + 2}`;
      params.push(user.kd_ktm);
      params.push(user.kd_smkl);
    }

    const result = await pool.query(`
      SELECT
        DATE_TRUNC('week', rs.date_created) AS week_start,
        SUM(rs.distance_km) AS total_distance,
        COUNT(rs.id) AS total_sessions
      FROM run_sessions rs
      ${joinUsers}
      ${whereClause}
      GROUP BY DATE_TRUNC('week', rs.date_created)
      ORDER BY week_start ASC
    `, params);

    // Transform to chart-friendly format
    const data = result.rows.map((row, index) => ({
      name: `Minggu ${index + 1}`,
      distance: parseFloat(row.total_distance) || 0,
      sessions: parseInt(row.total_sessions) || 0,
      weekStart: row.week_start,
    }));

    res.json({ data });
  } catch (err) {
    console.error("GET /api/targets/weekly-stats error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/targets/daily-achievement
 * Pencapaian target 14km per hari dalam 7 hari terakhir
 */
router.get("/daily-achievement", async (_req, res) => {
  try {
    // Get daily counts of sessions >= 14km in the last 7 days
    const result = await pool.query(`
      SELECT
        DATE(rs.date_created) AS date,
        EXTRACT(DOW FROM rs.date_created) AS day_of_week,
        COUNT(rs.id) AS targets_achieved,
        SUM(rs.distance_km) AS total_distance
      FROM run_sessions rs
      JOIN users u ON u.id = rs.user_id
      WHERE ((u.kd_pkt <= '45' AND rs.distance_km >= 10) OR (u.kd_pkt > '45' AND rs.distance_km >= 14))
        AND rs.date_created >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(rs.date_created), EXTRACT(DOW FROM rs.date_created)
      ORDER BY date ASC
    `);

    // Create day names mapping (0 = Sunday, 1 = Monday, etc.)
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Initialize all days with 0
    const today = new Date();
    const last7Days: { name: string; targets: number; distance: number; date: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayIndex = d.getDay();
      const dateStr = d.toISOString().slice(0, 10);

      // Find matching data from query result
      const found = result.rows.find((row: any) => {
        const rowDate = new Date(row.date).toISOString().slice(0, 10);
        return rowDate === dateStr;
      });

      last7Days.push({
        name: dayNames[dayIndex],
        targets: found ? parseInt(found.targets_achieved) : 0,
        distance: found ? parseFloat(found.total_distance) : 0,
        date: dateStr,
      });
    }

    res.json({ data: last7Days });
  } catch (err) {
    console.error("GET /api/targets/daily-achievement error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/targets/report
 * Returns all users in a unit with their best session in the last 7 days
 */
router.get("/report", authenticateToken, async (req, res) => {
  try {
    const { kd_ktm, kd_smkl } = req.query;
    if (!kd_ktm || !kd_smkl) {
      return res.status(400).json({ message: "kd_ktm and kd_smkl are required" });
    }

    const result = await pool.query(`
      WITH BestSessions AS (
        SELECT DISTINCT ON (user_id)
          user_id,
          id AS session_id,
          distance_km,
          duration_sec,
          date_created,
          validation_status
        FROM run_sessions
        WHERE date_created >= NOW() - INTERVAL '7 days'
        ORDER BY user_id, distance_km DESC, date_created DESC
      )
      SELECT
        u.id,
        u.name,
        u.pangkat AS rank,
        u.kd_ktm,
        u.kd_smkl,
        u.kd_corps,
        u.kd_pkt,
        k.ur_ktm AS kesatuan_name,
        s.ur_smkl AS subdis_name,
        c.init_corps AS corps_name,
        p.ur_pkt AS pangkat_name,
        bs.session_id,
        bs.distance_km,
        bs.duration_sec,
        bs.date_created AS achieved_date,
        bs.validation_status
      FROM users u
      LEFT JOIN BestSessions bs ON bs.user_id = u.id
      LEFT JOIN kotama k ON u.kd_ktm = k.kd_ktm
      LEFT JOIN kesatuan s ON u.kd_ktm = s.kd_ktm AND u.kd_smkl = s.kd_smkl
      LEFT JOIN corps c ON u.kd_corps = c.kd_corps
      LEFT JOIN pangkat p ON u.kd_pkt = p.kd_pkt
      WHERE u.kd_ktm = $1 AND u.kd_smkl = $2 AND u.role != 'admin'
      ORDER BY 
        CASE 
          WHEN u.kd_pkt IS NOT NULL THEN CAST(u.kd_pkt AS INTEGER)
          ELSE 0
        END DESC,
        u.name ASC
    `, [kd_ktm, kd_smkl]);

    const data = result.rows.map((row) => {
      const duration = row.duration_sec || 0;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      const time_taken = duration > 0 ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}` : "-";

      const distance = parseFloat(row.distance_km) || 0;
      let pace = "-";
      if (distance > 0 && duration > 0) {
        const paceVal = duration / 60 / distance;
        const paceMin = Math.floor(paceVal);
        const paceSec = Math.round((paceVal - paceMin) * 60);
        pace = `${paceMin}'${paceSec.toString().padStart(2, "0")}"/km`;
      }

      return {
        ...row,
        time_taken,
        pace,
        distance_km: distance
      };
    });

    res.json({ data });
  } catch (err) {
    console.error("GET /api/targets/report error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

