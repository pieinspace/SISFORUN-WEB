import { Request, Response } from "express";
import { pool } from "../db";

export const getRunners = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.pangkat AS rank,
        u.role,
        u.kesatuan,
        u.created_at AS "createdAt",
        COALESCE(SUM(rs.distance_km), 0) AS "totalDistance",
        COUNT(rs.id) AS "totalSessions"
      FROM users u
      LEFT JOIN run_sessions rs ON rs.user_id = u.id
      WHERE u.role != 'admin'
      GROUP BY u.id, u.name, u.pangkat, u.role, u.kesatuan, u.created_at
      ORDER BY 
        CASE u.pangkat
          -- Militer (dari tertinggi)
          WHEN 'Jenderal' THEN 1
          WHEN 'Letnan Jenderal' THEN 2
          WHEN 'Mayor Jenderal' THEN 3
          WHEN 'Brigadir Jenderal' THEN 4
          WHEN 'Kolonel' THEN 5
          WHEN 'Letnan Kolonel' THEN 6
          WHEN 'Mayor' THEN 7
          WHEN 'Kapten' THEN 8
          WHEN 'Lettu' THEN 9
          WHEN 'Letda' THEN 10
          WHEN 'Serma' THEN 11
          WHEN 'Serka' THEN 12
          WHEN 'Sertu' THEN 13
          WHEN 'Serda' THEN 14
          WHEN 'Kopral' THEN 15
          -- ASN (dari tertinggi)
          WHEN 'PNS Gol IV/e' THEN 20
          WHEN 'PNS Gol IV/d' THEN 21
          WHEN 'PNS Gol IV/c' THEN 22
          WHEN 'PNS Gol IV/b' THEN 23
          WHEN 'PNS Gol IV/a' THEN 24
          WHEN 'PNS Gol III/d' THEN 25
          WHEN 'PNS Gol III/c' THEN 26
          WHEN 'PNS Gol III/b' THEN 27
          WHEN 'PNS Gol III/a' THEN 28
          WHEN 'PNS Gol III' THEN 29
          WHEN 'PNS Gol II/d' THEN 30
          WHEN 'PNS Gol II/c' THEN 31
          WHEN 'PNS Gol II/b' THEN 32
          WHEN 'PNS Gol II/a' THEN 33
          ELSE 100
        END ASC,
        u.name ASC
    `);

    res.json({ data: result.rows });
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
        u.kesatuan,
        u.nrp,
        u.created_at AS "createdAt",
        COALESCE(SUM(rs.distance_km), 0) AS "totalDistance",
        COALESCE(SUM(rs.duration_sec), 0) AS "totalDuration",
        COUNT(rs.id) AS "totalSessions"
      FROM users u
      LEFT JOIN run_sessions rs ON rs.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.pangkat, u.role, u.kesatuan, u.nrp, u.created_at
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
  const { name, rank } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, pangkat = $2 WHERE id = $3 RETURNING *",
      [name, rank, id]
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
