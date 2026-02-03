const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const firstNames = [
    'BUDI', 'SLAMET', 'AGUS', 'HERI', 'ANDI', 'EKO', 'IWAN', 'DEDI', 'IRWAN', 'RIDWAN',
    'SITI', 'SRI', 'WATI', 'LANI', 'NOVI', 'ANISA', 'DIANA', 'RINA', 'SARI', 'PUTRI',
    'MUHAMMAD', 'ACHMAD', 'FAJAR', 'GUNAWAN', 'HENDRA', 'BAMBANG', 'SUYANTO', 'MULYONO',
    'WIDODO', 'SURYADI', 'KURNIAWAN', 'ADITYA', 'SAPUTRA', 'PRATAMA', 'HIDAYAT', 'WIJAYA'
];

const lastNames = [
    'SANTOSO', 'HIDAYAT', 'SAPUTRA', 'WIJAYA', 'KUSUMA', 'SETIAWAN', 'PRADANA', 'NUGROHO',
    'CAHYONO', 'WICAKSONO', 'SITOMPUL', 'PASARIBU', 'SIMANJUNTAK', 'WULANDARI', 'LESTARI',
    'PUSPITA', 'SYAHPUTRA', 'RAHMADANI', 'HARTONO', 'SUSANTO', 'GUNAWAN', 'SURYANA'
];

function generateRealName() {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${fn} ${ln}`;
}

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    const header = lines[0].split('|').map(h => h.trim().replace(/^"|"$/g, ''));

    console.log(`   Header for ${path.basename(filePath)}:`, header);

    return lines.slice(1).map(line => {
        const values = line.split('|').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        header.forEach((h, i) => {
            obj[h] = values[i] || null;
        });
        return obj;
    });
}

async function run() {
    try {
        console.log("🚀 Starting Import Process...");

        // 1. Import Pangkat
        console.log("📦 Importing Pangkat...");
        const pangkatData = parseCSV(path.join(__dirname, '../tblpkt.csv'));
        for (const p of pangkatData) {
            if (!p.kd_pkt || p.kd_pkt === '-') continue;
            await pool.query(
                'INSERT INTO pangkat (kd_pkt, ur_pkt) VALUES ($1, $2) ON CONFLICT (kd_pkt) DO UPDATE SET ur_pkt = $2',
                [p.kd_pkt, p.ur_pkt]
            );
        }
        console.log("✅ Pangkat Imported");

        // 2. Import Corps
        console.log("📦 Importing Corps...");
        const corpsData = parseCSV(path.join(__dirname, '../tblcorps.csv'));
        for (const c of corpsData) {
            if (!c.kd_corps) continue;
            await pool.query(
                'INSERT INTO corps (kd_corps, init_corps, ur_corps) VALUES ($1, $2, $3) ON CONFLICT (kd_corps) DO UPDATE SET init_corps = $2, ur_corps = $3',
                [c.kd_corps, c.init_corps, c.ur_corps]
            );
        }
        console.log("✅ Corps Imported");

        // 3. Import Kotama
        console.log("📦 Importing Kotama...");
        const ktmData = parseCSV(path.join(__dirname, '../tblktm.csv'));
        for (const k of ktmData) {
            if (!k.kd_ktm) continue;
            await pool.query(
                'INSERT INTO kotama (kd_ktm, ur_ktm) VALUES ($1, $2) ON CONFLICT (kd_ktm) DO UPDATE SET ur_ktm = $2',
                [k.kd_ktm, k.ur_ktm]
            );
        }
        console.log("✅ Kotama Imported");

        // 4. Import Kesatuan (Satuan/Subdis)
        console.log("📦 Importing Kesatuan (Satuan)...");
        const smklData = parseCSV(path.join(__dirname, '../tblsmkl.csv'));
        // Chunked insert or loop. Loop is safer for small sets, but here 1300.
        for (const s of smklData) {
            if (!s.kd_smkl) continue;
            await pool.query(
                'INSERT INTO kesatuan (kd_ktm, kd_smkl, ur_smkl) VALUES ($1, $2, $3) ON CONFLICT (kd_ktm, kd_smkl) DO UPDATE SET ur_smkl = $3',
                [s.kd_ktm, s.kd_smkl, s.ur_smkl]
            );
        }
        console.log("✅ Kesatuan (Satuan) Imported");

        // 5. Create Admins for Kotama
        console.log("👤 Creating Admins for Kotamas...");
        const hash = await bcrypt.hash('admin123', 10);
        for (const k of ktmData) {
            if (!k.kd_ktm) continue;
            const username = `admin_ktm${k.kd_ktm}`;
            await pool.query(
                `INSERT INTO login_web (username, password_hash, role, name, kd_ktm) 
         VALUES ($1, $2, 'admin_kotama', $3, $4) 
         ON CONFLICT (username) DO NOTHING`,
                [username, hash, `Admin ${k.ur_ktm}`, k.kd_ktm]
            );
        }
        console.log("✅ Kotama Admins Created");

        // 5b. Create Admins for Satuan
        console.log("👤 Creating Admins for Satuans...");
        for (const s of smklData) {
            if (!s.kd_smkl) continue;
            const username = `admin_smkl${s.kd_smkl}`;
            await pool.query(
                `INSERT INTO login_web (username, password_hash, role, name, kd_ktm, kd_smkl) 
         VALUES ($1, $2, 'admin_satuan', $3, $4, $5) 
         ON CONFLICT (username) DO NOTHING`,
                [username, hash, `Admin ${s.ur_smkl}`, s.kd_ktm, s.kd_smkl]
            );
        }
        console.log("✅ Satuan Admins Created");

        // 6. Populate Personnel (Military & ASN) for all Kotamas
        console.log("👥 Populating personnel for all Kotamas...");

        // Fetch VALID CODES from the database to ensure we don't have '-' or empty ranks
        const milPktRes = await pool.query("SELECT kd_pkt FROM pangkat WHERE kd_pkt ~ '^[0-9]+$' AND CAST(kd_pkt AS INTEGER) >= 51 AND CAST(kd_pkt AS INTEGER) <= 83");
        const asnPktRes = await pool.query("SELECT kd_pkt FROM pangkat WHERE kd_pkt ~ '^[0-9]+$' AND CAST(kd_pkt AS INTEGER) <= 45");
        const corpsRes = await pool.query("SELECT kd_corps FROM corps WHERE kd_corps NOT IN ('Z', '-')");

        const milPktList = milPktRes.rows.map(r => r.kd_pkt);
        const asnPktList = asnPktRes.rows.map(r => r.kd_pkt);
        const corpsList = corpsRes.rows.map(r => r.kd_corps);

        console.log(`   Fetched ${milPktList.length} militer ranks, ${asnPktList.length} ASN ranks, and ${corpsList.length} valid corps.`);

        // const hash = await bcrypt.hash('admin123', 10); // Already defined above
        // const ktmData = parseCSV(path.join(__dirname, '../tblktm.csv')); // Already defined above
        // const smklData = parseCSV(path.join(__dirname, '../tblsmkl.csv')); // Already defined above

        for (const k of ktmData) {
            if (!k.kd_ktm) continue;

            // Find units for this Kotama
            const units = smklData.filter(s => s.kd_ktm === k.kd_ktm).slice(0, 2);
            if (units.length === 0) continue;

            console.log(`   Populating personnel for Kotama: ${k.ur_ktm}`);

            for (const unit of units) {
                // 10 Militer
                for (let i = 1; i <= 10; i++) {
                    const nrp = `${unit.kd_smkl}01${i.toString().padStart(2, '0')}`;
                    const name = generateRealName();
                    const pkt = milPktList[Math.floor(Math.random() * milPktList.length)];
                    const corps = corpsList[Math.floor(Math.random() * corpsList.length)];

                    await pool.query(
                        `INSERT INTO users (name, nrp, role, kd_ktm, kd_smkl, kd_corps, kd_pkt) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7) 
                         ON CONFLICT (nrp) DO UPDATE SET name = EXCLUDED.name, kd_ktm = EXCLUDED.kd_ktm, kd_smkl = EXCLUDED.kd_smkl, kd_corps = EXCLUDED.kd_corps, kd_pkt = EXCLUDED.kd_pkt`,
                        [name, nrp, 'militer', unit.kd_ktm, unit.kd_smkl, corps, pkt]
                    );

                    await pool.query('INSERT INTO login (nrp, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (nrp) DO NOTHING', [nrp, hash, 'militer']);
                }

                // 10 ASN
                for (let i = 1; i <= 10; i++) {
                    const nrp = `${unit.kd_smkl}02${i.toString().padStart(2, '0')}`;
                    const name = generateRealName();
                    const pkt = asnPktList[Math.floor(Math.random() * asnPktList.length)];

                    await pool.query(
                        `INSERT INTO users (name, nrp, role, kd_ktm, kd_smkl, kd_corps, kd_pkt) 
                         VALUES ($1, $2, $3, $4, $5, NULL, $6) 
                         ON CONFLICT (nrp) DO UPDATE SET name = EXCLUDED.name, kd_ktm = EXCLUDED.kd_ktm, kd_smkl = EXCLUDED.kd_smkl, kd_corps = NULL, kd_pkt = EXCLUDED.kd_pkt`,
                        [name, nrp, 'asn', unit.kd_ktm, unit.kd_smkl, pkt]
                    );

                    await pool.query('INSERT INTO login (nrp, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (nrp) DO NOTHING', [nrp, hash, 'asn']);
                }
            }
        }
        console.log("✅ All Personnel Repopulated with Valid Data");

        console.log("🏁 Import Process Completed Successfully!");

    } catch (err) {
        console.error("❌ Error during import:", err);
    } finally {
        await pool.end();
    }
}

run();
