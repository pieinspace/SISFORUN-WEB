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
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("Tables in public schema:", res.rows.map(r => r.table_name).join(', '));
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        pool.end();
    }
}

check();
