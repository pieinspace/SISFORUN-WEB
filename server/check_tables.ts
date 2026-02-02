import dotenv from "dotenv";
dotenv.config();
import { pool } from "./src/db";

const check = async () => {
    try {
        // List all tables
        const tables = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        console.log("ALL TABLES:", tables.rows);

        // Check if admin_users exists
        const adminCols = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admin_users'"
        );
        console.log("ADMIN_USERS TABLE:", adminCols.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};
check();
