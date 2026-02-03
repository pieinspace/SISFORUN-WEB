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
        u.nrp, 
        COALESCE(SUM(r.distance_km), 0) as dist 
      FROM users u 
      LEFT JOIN run_sessions r ON u.id = r.user_id 
        AND r.date_created >= date_trunc('month', CURRENT_DATE)
        AND r.date_created < date_trunc('month', CURRENT_DATE) + interval '1 month'
      GROUP BY u.id, u.nrp 
      ORDER BY dist DESC
    `);

        const list = res.rows;
        const find = (nrp) => {
            const idx = list.findIndex(r => r.nrp === nrp);
            return idx === -1 ? 'Not found' : idx + 1;
        };

        console.log('Rank 888888:', find('888888'));
        console.log('Rank 200101:', find('200101'));
        console.log('Rank 999999:', find('999999'));
        console.log('Total users:', list.length);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
