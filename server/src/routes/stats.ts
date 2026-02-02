import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/summary", async (_req, res) => {
    try {
        const runnersCount = await pool.query("SELECT COUNT(*) FROM users");
        const targetsCount = await pool.query("SELECT COUNT(*) FROM run_sessions WHERE distance_km >= 14");

        res.json({
            success: true,
            data: {
                totalRunners: parseInt(runnersCount.rows[0].count),
                targetAchieved: parseInt(targetsCount.rows[0].count)
            }
        });
    } catch (err) {
        console.error("Summary stats error:", err);
        res.status(500).json({ success: false, message: "Gagal mengambil statistik" });
    }
});

export default router;
