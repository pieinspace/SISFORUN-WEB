const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const res = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.pangkat AS rank,
        u.role,
        u.kesatuan,
        u.created_at AS "createdAt",
        u.kd_ktm,
        u.kd_smkl,
        u.kd_corps,
        u.kd_pkt,
        COALESCE(SUM(rs.distance_km), 0) AS "totalDistance",
        COUNT(rs.id) AS "totalSessions"
      FROM users u
      LEFT JOIN run_sessions rs ON rs.user_id = u.id
      WHERE u.role != 'admin'
      GROUP BY u.id, u.name, u.pangkat, u.role, u.kesatuan, u.created_at, u.kd_ktm, u.kd_smkl, u.kd_corps, u.kd_pkt
      ORDER BY 1, 2
    `);
        console.log("Success! Row count:", res.rowCount);
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        pool.end();
    }
}

check();
