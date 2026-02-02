import dotenv from "dotenv";
dotenv.config();
import { pool } from "./src/db";

const check = async () => {
    try {
        // Check login_web table structure
        const cols = await pool.query(
            "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'login_web' ORDER BY ordinal_position"
        );
        console.log("LOGIN_WEB TABLE COLUMNS:", cols.rows);
        
        // Check sample data
        const sample = await pool.query("SELECT * FROM login_web LIMIT 5");
        console.log("LOGIN_WEB SAMPLE DATA:", sample.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};
check();
