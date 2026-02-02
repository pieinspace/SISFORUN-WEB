const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fix() {
    try {
        console.log("Connecting to:", process.env.DATABASE_URL.split('@')[1]);
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS kd_ktm VARCHAR(10),
      ADD COLUMN IF NOT EXISTS kd_smkl VARCHAR(10),
      ADD COLUMN IF NOT EXISTS kd_corps VARCHAR(10),
      ADD COLUMN IF NOT EXISTS kd_pkt VARCHAR(10)
    `);
        console.log("Successfully added columns!");

        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log("Columns in users table:", res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error("Fix Error:", err.message);
    } finally {
        pool.end();
    }
}

fix();
