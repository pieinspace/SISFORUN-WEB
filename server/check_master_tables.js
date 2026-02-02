const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const ktm = await pool.query("SELECT * FROM kesatuan");
        console.log("Kesatuan count:", ktm.rowCount);

        const smkl = await pool.query("SELECT * FROM subdis");
        console.log("Subdis count:", smkl.rowCount);

        const corps = await pool.query("SELECT * FROM corps");
        console.log("Corps count:", corps.rowCount);

        const pkt = await pool.query("SELECT * FROM pangkat");
        console.log("Pangkat count:", pkt.rowCount);
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        pool.end();
    }
}

check();
