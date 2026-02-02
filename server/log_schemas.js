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
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('kesatuan', 'subdis', 'corps', 'pangkat')
      ORDER BY table_name, ordinal_position
    `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        pool.end();
    }
}

check();
