const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function populate() {
  try {
    console.log("Populating master data...");

    // Master Kesatuan
    await pool.query(`
      INSERT INTO kesatuan (kd_ktm, ur_ktm) VALUES 
      ('01', 'KODAM I / BUKIT BARISAN'),
      ('02', 'KODAM II / SRIWIJAYA'),
      ('03', 'KODAM III / SILIWANGI'),
      ('04', 'KODAM IV / DIPONEGORO'),
      ('05', 'KODAM V / BRAWIJAYA'),
      ('06', 'KODAM VI / MULAWARMAN'),
      ('09', 'KODAM IX / UDAYANA'),
      ('13', 'KODAM JAYA / JAYAKARTA'),
      ('99', 'DISINFOLAHTAD')
      ON CONFLICT (kd_ktm) DO UPDATE SET ur_ktm = EXCLUDED.ur_ktm
    `);
    console.log("✅ Kesatuan populated");

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
      ('01', '2Z3C', 'KODIM 0208 /ASAHAN REM 022'),
      ('99', '9901', 'SUBDIS BIN SISTEM'),
      ('99', '9902', 'SUBDIS BIN INFOHLAT')
      ON CONFLICT (kd_ktm, kd_smkl) DO UPDATE SET ur_smkl = EXCLUDED.ur_smkl
    `);
    console.log("✅ Subdis populated");

    // Master Corps
    await pool.query(`
      INSERT INTO corps (kd_corps, init_corps, ur_corps) VALUES 
      ('A', 'INF', 'INFANTERI'), ('B', 'KAV', 'KAVALERI'), ('C', 'ARM', 'ARMED'), 
      ('D', 'ARH', 'ARHANUD'), ('E', 'CZI', 'ZENI'), ('F', 'CPM', 'POLISI MILITER'),
      ('G', 'CBA', 'PERBEKALAN DAN ANGKUTAN'), ('K', 'CKM', 'KESEHATAN MILTER'),
      ('M', 'CPL', 'PERALATAN'), ('N', 'CKE', 'KOMUNIKASI DAN ELEKTRONIKA'),
      ('O', 'CHK', 'HUKUM'), ('P', 'CAJ', 'AJUDAN JENDRAL'),
      ('Q', 'CKU', 'KEUANGAN'), ('R', 'CTP', 'TOPOGRAFI'),
      ('S', 'MK', 'MULTI CORPS'), ('X', 'TIT', 'TITULER'),
      ('Y', 'CPN', 'PENERBANGAN'), ('Z', '-', '-')
      ON CONFLICT (kd_corps) DO UPDATE SET ur_corps = EXCLUDED.ur_corps, init_corps = EXCLUDED.init_corps
    `);
    console.log("✅ Corps populated");

    // Master Pangkat
    await pool.query(`
      INSERT INTO pangkat (kd_pkt, ur_pkt) VALUES 
      ('94', 'JENDERAL'), ('93', 'LETJEN'), ('92', 'MAYJEN'), ('91', 'BRIGJEN'),
      ('83', 'KOLONEL'), ('82', 'LETKOL'), ('81', 'MAYOR'), ('73', 'KAPTEN'),
      ('72', 'LETTU'), ('71', 'LETDA'), ('67', 'P LETNAN'), ('66', 'PELTU'),
      ('65', 'PELDA'), ('64', 'SERMA'), ('63', 'SERKA'), ('62', 'SERTU'),
      ('61', 'SERDA'), ('56', 'KOPKA'), ('55', 'KOPTU'), ('54', 'KOPDA'),
      ('53', 'PRAKA'), ('52', 'PRATU'), ('51', 'PRADA'), ('45', 'IV/E'),
      ('44', 'IV/D'), ('43', 'IV/C'), ('42', 'IV/B'), ('41', 'IV/A'),
      ('34', 'III/D'), ('33', 'III/C'), ('32', 'III/B'), ('31', 'III/A'),
      ('24', 'II/D'), ('23', 'II/C'), ('22', 'II/B'), ('21', 'II/A')
      ON CONFLICT (kd_pkt) DO UPDATE SET ur_pkt = EXCLUDED.ur_pkt
    `);
    console.log("✅ Pangkat populated");

    console.log("All master data populated successfully!");
  } catch (err) {
    console.error("Population Error:", err.message);
  } finally {
    pool.end();
  }
}

populate();
