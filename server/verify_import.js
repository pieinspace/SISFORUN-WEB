const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const u = await pool.query('SELECT count(*) FROM users');
        const a = await pool.query('SELECT count(*) FROM login_web');
        const k = await pool.query('SELECT count(DISTINCT kd_ktm) FROM users');
        const s = await pool.query('SELECT count(DISTINCT kd_smkl) FROM users');

        console.log('Total Users:', u.rows[0].count);
        console.log('Total Admins:', a.rows[0].count);
        console.log('Kotamas with users:', k.rows[0].count);
        console.log('Satuans with users:', s.rows[0].count);

        const sample = await pool.query('SELECT u.name, kt.ur_ktm, ks.ur_smkl FROM users u JOIN kotama kt ON u.kd_ktm = kt.kd_ktm JOIN kesatuan ks ON u.kd_ktm = ks.kd_ktm AND u.kd_smkl = ks.kd_smkl LIMIT 5');
        console.log('\nSample Data:');
        console.table(sample.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
