const fs = require('fs');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        const defaultPassword = 'admin123';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        console.log(`Starting to generate admins... Password: ${defaultPassword}`);

        // Insert Kotama Admins
        for (const k of data.ktm) {
            const username = `admin_ktm${k.kd_ktm}`;
            const name = `Admin ${k.ur_ktm}`;
            const role = 'admin_kotama';

            console.log(`Inserting ${username}...`);
            await pool.query(
                `INSERT INTO login_web (username, password_hash, role, name, kd_ktm, kd_smkl, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (username) DO UPDATE SET 
                 password_hash = $2, role = $3, name = $4, kd_ktm = $5, kd_smkl = $6, is_active = $7`,
                [username, passwordHash, role, name, k.kd_ktm, null, true]
            );
        }

        // Insert Kesatuan Admins
        for (const s of data.sat) {
            const username = `admin_sat${s.kd_smkl}`;
            const name = `Admin ${s.ur_smkl}`;
            const role = 'admin_satuan';

            console.log(`Inserting ${username}...`);
            await pool.query(
                `INSERT INTO login_web (username, password_hash, role, name, kd_ktm, kd_smkl, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (username) DO UPDATE SET 
                 password_hash = $2, role = $3, name = $4, kd_ktm = $5, kd_smkl = $6, is_active = $7`,
                [username, passwordHash, role, name, s.kd_ktm, s.kd_smkl, true]
            );
        }

        console.log('✅ Admin accounts generated successfully');
    } catch (err) {
        console.error('❌ Error generating admins:', err);
    } finally {
        await pool.end();
    }
}

run();
