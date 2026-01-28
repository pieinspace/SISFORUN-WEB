import { Router } from "express";
import { pool } from "../db";

const router = Router();

/**
 * GET /api/targets/14km
 * Data untuk halaman Target 14 KM dan tabel dashboard "Target 14 KM Tercapai"
 */
router.get("/14km", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.runner_id AS id,
        r.name,
        r.rank,
        t.distance_km,
        t.time_taken,
        t.pace,
        t.achieved_date,
        t.validation_status
      FROM target_14km t
      JOIN runners r ON r.id = t.runner_id
      ORDER BY t.achieved_date DESC, t.distance_km DESC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/targets/14km error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/targets/14km/validate/:id
 * Toggles or sets validation_status to 'validated'
 */
router.post("/14km/validate/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE target_14km SET validation_status = 'validated' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Target record not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("POST /api/targets/14km/validate/:id error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
