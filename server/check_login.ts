import dotenv from "dotenv";
dotenv.config();
import { pool } from "./src/db";

const check = async () => {
    try {
        // Check login table structure
        const loginCols = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'login'"
        );
        console.log("LOGIN TABLE COLUMNS:", loginCols.rows);
        
        // Check sample data
        const sample = await pool.query("SELECT * FROM login LIMIT 5");
        console.log("LOGIN SAMPLE DATA:", sample.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};
check();
