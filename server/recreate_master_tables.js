const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function recreate() {
    try {
        console.log("Re-creating master tables...");

        // Drop and Create Kesatuan
        await pool.query("DROP TABLE IF EXISTS kesatuan CASCADE");
        await pool.query(`
      CREATE TABLE kesatuan (
        kd_ktm VARCHAR(10) PRIMARY KEY,
        ur_ktm VARCHAR(255) NOT NULL
      )
    `);
        console.log("✅ Kesatuan re-created");

        // Drop and Create Subdis
        await pool.query("DROP TABLE IF EXISTS subdis CASCADE");
        await pool.query(`
      CREATE TABLE subdis (
        kd_ktm VARCHAR(10),
        kd_smkl VARCHAR(10),
        ur_smkl VARCHAR(255) NOT NULL,
        PRIMARY KEY (kd_ktm, kd_smkl)
      )
    `);
        console.log("✅ Subdis re-created");

        // Drop and Create Corps
        await pool.query("DROP TABLE IF EXISTS corps CASCADE");
        await pool.query(`
      CREATE TABLE corps (
        kd_corps VARCHAR(10) PRIMARY KEY,
        init_corps VARCHAR(20),
        ur_corps VARCHAR(100)
      )
    `);
        console.log("✅ Corps re-created");

        // Populating
        console.log("Populating data...");

        // Master Kesatuan
        await pool.query(`INSERT INTO kesatuan (kd_ktm, ur_ktm) VALUES ('01', 'KODAM I / BUKIT BARISAN')`);

        // Master Subdis
        await pool.query(`
      INSERT INTO subdis (kd_ktm, kd_smkl, ur_smkl) VALUES 
      ('01', '1A0B', 'YONIF 100 /PRAJURIT SETIA'),
      ('01', '1A1A', 'BRIGIF 7 /RIMBA RAYA'),
      ('01', '1A1B', 'YONIF 122 /TOMBAK SAKTI'),
      ('01', '1A1C', 'YONIF 125 /SIMBISA'),
      ('01', '1A1D', 'YONIF 126 /KALA SAKTI'),
      ('01', '2Z0B', 'KODIM 0201 /MEDAN'),
      ('01', '2Z3A', 'KOREM 022 /PANTAI TIMUR'),
      ('01', '2Z3B', 'KODIM 0207 /SIMALUNGUN REM 022'),
      ('01', '2Z3C', 'KODIM 0208 /ASAHAN REM 022')
    `);

        // Master Corps
        await pool.query(`
      INSERT INTO corps (kd_corps, init_corps, ur_corps) VALUES 
      ('A', 'INF', 'INFANTERI'), 
      ('B', 'KAV', 'KAVALERI'), 
      ('C', 'ARM', 'ARMED'), 
      ('D', 'ARH', 'ARHANUD'), 
      ('E', 'CZI', 'ZENI'), 
      ('F', 'CPM', 'POLISI MILITER'),
      ('G', 'CHB', 'HUBDIV'),
      ('H', 'CBA', 'BEKANG'),
      ('I', 'CPD', 'AJUDAN JENDERAL'),
      ('J', 'CAJ', 'AJU'),
      ('K', 'CKU', 'KEUANGAN'),
      ('L', 'CHK', 'HUKUM'),
      ('M', 'CMM', 'KESEHATAN'),
      ('N', 'CTP', 'TOPOGRAFI')
    `);

        console.log("✅ Data populated successfully!");
    } catch (err) {
        console.error("Recreate/Populate Error:", err.message);
    } finally {
        pool.end();
    }
}

recreate();
