import dotenv from "dotenv";
dotenv.config();
import { pool } from "./src/db";

const setup = async () => {
    try {
        // Drop and recreate table
        await pool.query(`DROP TABLE IF EXISTS login_web`);
        console.log("✅ Dropped old table");
        
        await pool.query(`
            CREATE TABLE login_web (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                name VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        console.log("✅ Created login_web table");
        
        // Insert admins
        await pool.query(`
            INSERT INTO login_web (username, password_hash, role, name, is_active)
            VALUES 
                ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye.qLmV.HV8p.pNXYJq6pJjXJ5xNcKXHu', 'admin', 'Administrator', true),
                ('superadmin', '$2b$10$RlZhSnVYVzZXVmZYWVp6dOJQWkxGR3pKWlhWVkVGVlZYWVpjZGVm', 'superadmin', 'Super Administrator', true)
        `);
        console.log("✅ Inserted admin users");
        
        // Verify
        const result = await pool.query("SELECT id, username, role, name FROM login_web");
        console.log("\n📋 Data di login_web:");
        console.table(result.rows);
        
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        process.exit();
    }
};
setup();
