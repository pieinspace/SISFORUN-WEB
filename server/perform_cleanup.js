const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log("🔍 Checking for duplicates in kotama...");

        const dups = await pool.query(`
      SELECT ur_ktm, array_agg(kd_ktm ORDER BY kd_ktm) as codes 
      FROM kotama 
      GROUP BY ur_ktm 
      HAVING count(*) > 1
    `);

        console.log(`Found ${dups.rows.length} duplicate Kotama sets.`);

        for (const r of dups.rows) {
            const survivor = r.codes[0];
            const victims = r.codes.slice(1);

            console.log(`Merging ${r.ur_ktm} into code ${survivor} (Victims: ${victims.join(', ')})`);

            await pool.query('UPDATE kesatuan SET kd_ktm = $1 WHERE kd_ktm = ANY($2)', [survivor, victims]);
            await pool.query('UPDATE users SET kd_ktm = $1 WHERE kd_ktm = ANY($2)', [survivor, victims]);
            await pool.query('UPDATE login_web SET kd_ktm = $1 WHERE kd_ktm = ANY($2)', [survivor, victims]);
            await pool.query('DELETE FROM kotama WHERE kd_ktm = ANY($1)', [victims]);
        }

        console.log("🔍 Checking for duplicate units in kesatuan...");
        const unitDups = await pool.query(`
      SELECT kd_ktm, ur_smkl, array_agg(kd_smkl ORDER BY kd_smkl) as codes 
      FROM kesatuan 
      GROUP BY kd_ktm, ur_smkl 
      HAVING count(*) > 1
    `);

        console.log(`Found ${unitDups.rows.length} duplicate Satuan sets.`);

        for (const r of unitDups.rows) {
            const survivor = r.codes[0];
            const victims = r.codes.slice(1);

            console.log(`Merging unit ${r.ur_smkl} (Kotama ${r.kd_ktm}) into code ${survivor} (Victims: ${victims.join(', ')})`);

            await pool.query('UPDATE users SET kd_smkl = $1 WHERE kd_ktm = $2 AND kd_smkl = ANY($3)', [survivor, r.kd_ktm, victims]);
            await pool.query('UPDATE login_web SET kd_smkl = $1 WHERE kd_ktm = $2 AND kd_smkl = ANY($3)', [survivor, r.kd_ktm, victims]);
            await pool.query('DELETE FROM kesatuan WHERE kd_ktm = $1 AND kd_smkl = ANY($2)', [r.kd_ktm, victims]);
        }

        console.log("✅ Cleanup complete!");
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
    } finally {
        await pool.end();
    }
}

run();
