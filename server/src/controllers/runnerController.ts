import { Request, Response } from "express";
import { pool } from "../db";

export const getRunners = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        rank,
        status,
        total_distance AS "totalDistance",
        total_sessions AS "totalSessions",
        created_at AS "createdAt"
      FROM runners
      ORDER BY id ASC
    `);

    res.json({ data: result.rows });
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
      "UPDATE runners SET name = $1, rank = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
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
