import { Router } from "express";
import { pool } from "../db";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/summary", authenticateToken, async (req: any, res) => {
    try {
        const { role, kd_ktm, kd_smkl } = req.user;
        let whereClause = "";
        let params: any[] = [];

        if (role === 'admin_kotama') {
            whereClause = "WHERE kd_ktm = $1";
            params = [kd_ktm];
        } else if (role === 'admin_satuan') {
            whereClause = "WHERE kd_ktm = $1 AND kd_smkl = $2";
            params = [kd_ktm, kd_smkl];
        }

        // 1. Total Pelari Dikelola
        const runnersCount = await pool.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);

        // 2. Laporan Dibuat (Total Sessions in Scope)
        const sessionsCount = await pool.query(`
            SELECT COUNT(rs.*) FROM run_sessions rs
            INNER JOIN users u ON rs.user_id = u.id
            ${whereClause.replace('WHERE', 'AND').length > 0 ? 'WHERE ' + whereClause.replace('WHERE ', '') : ''}
        `, params);

        // 3. Tingkat Kelengkapan Data (Percentage of users with Rank, Corps, and valid NRP)
        const completeness = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE pangkat IS NOT NULL AND kd_corps IS NOT NULL AND nrp IS NOT NULL) as complete
            FROM users ${whereClause}
        `, params);

        const total = parseInt(completeness.rows[0].total) || 1;
        const complete = parseInt(completeness.rows[0].complete) || 0;
        const completenessRate = Math.round((complete / total) * 100);

        res.json({
            success: true,
            data: {
                totalRunners: parseInt(runnersCount.rows[0].count),
                totalReports: parseInt(sessionsCount.rows[0].count),
                dataCompleteness: completenessRate
            }
        });
    } catch (err) {
        console.error("Summary stats error:", err);
        res.status(500).json({ success: false, message: "Gagal mengambil statistik" });
    }
});

export default router;
