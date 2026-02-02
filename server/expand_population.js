const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log("Expanding master data...");

        // 1. Add more Kesatuan
        const kesatuanData = [
            ['02', 'KODAM II / SRIWIJAYA'],
            ['03', 'KODAM III / SILIWANGI'],
            ['04', 'KODAM IV / DIPONEGORO'],
            ['05', 'KODAM V / BRAWIJAYA'],
            ['06', 'KODAM VI / MULAWARMAN'],
            ['09', 'KODAM IX / UDAYANA'],
            ['13', 'KODAM JAYA / JAYAKARTA']
        ];

        for (const [kd, ur] of kesatuanData) {
            await pool.query("INSERT INTO kesatuan (kd_ktm, ur_ktm) VALUES ($1, $2) ON CONFLICT (kd_ktm) DO NOTHING", [kd, ur]);
        }
        console.log("✅ Kesatuan expanded");

        // 2. Add more Subdis
        const subdisData = [
            ['02', '2A01', 'KOREM 044/GAPO'], ['02', '2B01', 'YON KAV 5/DPC'],
            ['03', '3A01', 'KOREM 064/MY'], ['03', '3B01', 'YONIF 310/KK'],
            ['04', '4A01', 'KOREM 072/PMK'], ['04', '4B01', 'YONIF 400/BR'],
            ['05', '5A01', 'KOREM 084/BJ'], ['05', '5B01', 'YON KAV 3/AC'],
            ['06', '6A01', 'KOREM 091/ASN'], ['06', '6B01', 'YONIF 600/R'],
            ['09', '9A01', 'KOREM 161/WS'], ['09', '9B01', 'YONIF 742/SWY'],
            ['13', '13A1', 'KOREM 051/WKT'], ['13', '13B1', 'YON KAV 7/PS']
        ];

        for (const [ktm, smkl, ur] of subdisData) {
            await pool.query("INSERT INTO subdis (kd_ktm, kd_smkl, ur_smkl) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [ktm, smkl, ur]);
        }
        console.log("✅ Subdis expanded");

        // 3. Populate existing users with random data
        console.log("Updating users with plausible data...");

        // Get all master codes
        const ktms = (await pool.query("SELECT kd_ktm FROM kesatuan")).rows.map(r => r.kd_ktm);
        const corps = (await pool.query("SELECT kd_corps FROM corps")).rows.map(r => r.kd_corps);
        const pangkatMiliter = (await pool.query("SELECT kd_pkt FROM pangkat WHERE CAST(kd_pkt AS INTEGER) >= 51")).rows.map(r => r.kd_pkt);
        const pangkatASN = (await pool.query("SELECT kd_pkt FROM pangkat WHERE CAST(kd_pkt AS INTEGER) <= 45")).rows.map(r => r.kd_pkt);

        const users = (await pool.query("SELECT id, role FROM users")).rows;

        for (const user of users) {
            const randomKtm = ktms[Math.floor(Math.random() * ktms.length)];
            const subdisBatch = (await pool.query("SELECT kd_smkl FROM subdis WHERE kd_ktm = $1", [randomKtm])).rows;
            const randomSmkl = subdisBatch.length > 0 ? subdisBatch[Math.floor(Math.random() * subdisBatch.length)].kd_smkl : null;
            const randomCorps = corps[Math.floor(Math.random() * corps.length)];

            let randomPkt;
            if (user.role === 'militer') {
                randomPkt = pangkatMiliter[Math.floor(Math.random() * pangkatMiliter.length)];
            } else {
                randomPkt = pangkatASN[Math.floor(Math.random() * pangkatASN.length)];
            }

            await pool.query(`
        UPDATE users SET 
          kd_ktm = $1, 
          kd_smkl = $2, 
          kd_corps = $3, 
          kd_pkt = $4 
        WHERE id = $5
      `, [randomKtm, randomSmkl, randomCorps, randomPkt, user.id]);
        }

        console.log("✅ Users populated with random data");
        console.log("All done!");
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        pool.end();
    }
}

run();
