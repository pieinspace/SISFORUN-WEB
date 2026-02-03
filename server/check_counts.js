
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:admin123@localhost:5432/postgres',
});

async function check() {
    try {
        const users = await pool.query('SELECT count(*) FROM users');
        const sessions = await pool.query('SELECT count(*) FROM run_sessions');
        const kotama = await pool.query('SELECT count(*) FROM kotama');
        const kesatuan = await pool.query('SELECT count(*) FROM kesatuan');

        console.log('Users:', users.rows[0].count);
        console.log('Sessions:', sessions.rows[0].count);
        console.log('Kotama:', kotama.rows[0].count);
        console.log('Kesatuan:', kesatuan.rows[0].count);

        const roles = await pool.query('SELECT role, count(*) FROM users GROUP BY role');
        console.log('Roles:', roles.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
