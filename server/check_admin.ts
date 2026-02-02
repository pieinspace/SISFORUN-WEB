import dotenv from "dotenv";
dotenv.config();
import { pool } from "./src/db";

const check = async () => {
    try {
        // Check for superadmin or admin roles
        const admins = await pool.query("SELECT id, nrp, role, is_active FROM login WHERE role LIKE '%admin%' OR nrp = 'superadmin'");
        console.log("ADMIN ENTRIES:", admins.rows);
        
        // Check all unique roles
        const roles = await pool.query("SELECT DISTINCT role FROM login");
        console.log("UNIQUE ROLES:", roles.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};
check();
