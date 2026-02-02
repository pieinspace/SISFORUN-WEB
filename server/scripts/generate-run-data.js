const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log('Fetching users...');
        const usersRes = await pool.query("SELECT id FROM users");
        const users = usersRes.rows;

        if (users.length < 150) {
            console.error(`❌ Not enough users to generate 150 unique sessions. Found: ${users.length}`);
            process.exit(1);
        }

        // Shuffle users
        const shuffled = users.sort(() => 0.5 - Math.random());
        const selectedUsers = shuffled.slice(0, 150);

        console.log('Generating 150 run sessions...');

        // 50 Completed Targets (14.10 - 16.50 km)
        for (let i = 0; i < 50; i++) {
            const userId = selectedUsers[i].id;
            const distance = parseFloat((Math.random() * (16.5 - 14.1) + 14.1).toFixed(2));
            const paceMinPerKm = Math.random() * (6.5 - 5.5) + 5.5; // 5:30 - 6:30 min/km
            const durationSec = Math.round(distance * paceMinPerKm * 60);

            await pool.query(
                `INSERT INTO run_sessions (user_id, distance_km, duration_sec, date_created, validation_status) 
                 VALUES ($1, $2, $3, NOW() - interval '2 days', 'validated')`,
                [userId, distance, durationSec]
            );
        }

        // 100 In Progress (3.20 - 13.80 km)
        for (let i = 50; i < 150; i++) {
            const userId = selectedUsers[i].id;
            const distance = parseFloat((Math.random() * (13.8 - 3.2) + 3.2).toFixed(2));
            const paceMinPerKm = Math.random() * (7.5 - 6.0) + 6.0; // 6:00 - 7:30 min/km
            const durationSec = Math.round(distance * paceMinPerKm * 60);

            await pool.query(
                `INSERT INTO run_sessions (user_id, distance_km, duration_sec, date_created, validation_status) 
                 VALUES ($1, $2, $3, NOW() - interval '1 day', 'validated')`,
                [userId, distance, durationSec]
            );
        }

        console.log('✅ 150 run sessions generated successfully (50 Target, 100 In Progress).');

    } catch (err) {
        console.error('❌ Error generating run data:', err);
    } finally {
        await pool.end();
    }
}

run();
