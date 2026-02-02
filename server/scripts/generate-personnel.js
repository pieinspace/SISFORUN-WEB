const fs = require('fs');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MILITER_RANKS = [
    { kd: '51', name: 'PRADA' },
    { kd: '52', name: 'PRATU' },
    { kd: '53', name: 'PRAKA' },
    { kd: '54', name: 'KOPDA' },
    { kd: '55', name: 'KOPTU' },
    { kd: '56', name: 'KOPKA' },
    { kd: '61', name: 'SERDA' },
    { kd: '62', name: 'SERTU' },
    { kd: '63', name: 'SERKA' },
    { kd: '64', name: 'SERMA' },
    { kd: '71', name: 'LETDA' },
    { kd: '72', name: 'LETTU' },
    { kd: '73', name: 'KAPTEN' },
    { kd: '81', name: 'MAYOR' },
    { kd: '82', name: 'LETKOL' },
    { kd: '83', name: 'KOLONEL' }
];

const ASN_RANKS = [
    { kd: '21', name: 'II/A' },
    { kd: '22', name: 'II/B' },
    { kd: '23', name: 'II/C' },
    { kd: '24', name: 'II/D' },
    { kd: '31', name: 'III/A' },
    { kd: '32', name: 'III/B' },
    { kd: '33', name: 'III/C' },
    { kd: '34', name: 'III/D' },
    { kd: '41', name: 'IV/A' },
    { kd: '42', name: 'IV/B' }
];

const FIRST_NAMES = [
    "Budi", "Andi", "Agus", "Iwan", "Slamet", "Dedi", "Eko", "Hery", "Maman", "Toto",
    "Siti", "Sri", "Dewi", "Ani", "Ratna", "Lilis", "Eni", "Wati", "Novi", "Indah",
    "Rahmat", "Syarif", "Hidayat", "Faisal", "Aditya", "Rizki", "Aris", "Fajar", "Bambang", "Wawan",
    "Yanto", "Hadi", "Guntur", "Bayu", "Saputra", "Pratama", "Kusuma", "Wibowo", "Santoso", "Prayitno"
];

const LAST_NAMES = [
    "Susanto", "Gunawan", "Setiawan", "Heryanto", "Kurniawan", "Sanjaya", "Wijaya", "Permana", "Mulyono", "Suharto",
    "Lestari", "Utami", "Sari", "Puspita", "Anggraini", "Rahayu", "Wulandari", "Fitriani", "Safitri", "Handayani",
    "Maulana", "Iskandar", "Nasution", "Siregar", "Lubis", "Ginting", "Pohan", "Tambunan", "Sinaga", "Manurung",
    "Hutagalung", "Sitompul", "Simanjuntak", "Siahaan", "Gultom", "Pasaribu", "Pane", "Sagala", "Haloho", "Damanik"
];

function getRandomName() {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${first} ${last}`;
}

async function run() {
    try {
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        const passwordHash = await bcrypt.hash('password123', 10);
        let nrpCounter = 26000101;

        console.log('Cleaning up old generated personnel...');
        await pool.query("DELETE FROM users WHERE nrp LIKE '260%'");

        console.log('Generating 250 personnel with realistic names...');

        const fullList = [];

        for (const s of data.sat) {
            // 5 Militer
            for (let i = 0; i < 5; i++) {
                const rank = MILITER_RANKS[Math.floor(Math.random() * MILITER_RANKS.length)];
                const nrp = String(nrpCounter++);
                const name = getRandomName().toUpperCase();

                await pool.query(
                    `INSERT INTO users (name, nrp, role, pangkat, kd_ktm, kd_smkl, kd_corps, kd_pkt, created_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [name, nrp, 'militer', rank.name, s.kd_ktm, s.kd_smkl, s.kd_smkl.startsWith('2B') || s.kd_smkl.startsWith('5B') ? 'B' : 'A', rank.kd]
                );
                fullList.push({ nrp, name, rank: rank.name, unit: s.ur_smkl, role: 'militer' });
            }

            // 5 ASN
            for (let i = 0; i < 5; i++) {
                const rank = ASN_RANKS[Math.floor(Math.random() * ASN_RANKS.length)];
                const nrp = String(nrpCounter++);
                const name = getRandomName().toUpperCase();

                await pool.query(
                    `INSERT INTO users (name, nrp, role, pangkat, kd_ktm, kd_smkl, kd_corps, kd_pkt, created_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [name, nrp, 'asn', rank.name, s.kd_ktm, s.kd_smkl, 'Z', rank.kd]
                );
                fullList.push({ nrp, name, rank: rank.name, unit: s.ur_smkl, role: 'asn' });
            }
            console.log(`✅ Generated 10 personnel for ${s.ur_smkl}`);
        }

        // Save to file for documentation
        let md = "# Personnel List\n\n| No | NRP | Name | Rank | Unit | Role |\n|---|---|---|---|---|---|\n";
        fullList.forEach((p, idx) => {
            md += `| ${idx + 1} | ${p.nrp} | ${p.name} | ${p.rank} | ${p.unit} | ${p.role} |\n`;
        });
        fs.writeFileSync('personnel_list.md', md);

        console.log('✅ All 250 personnel generated successfully. List saved to scripts/personnel_list.md');
    } catch (err) {
        console.error('❌ Error generating personnel:', err);
    } finally {
        await pool.end();
    }
}

run();
