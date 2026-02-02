import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db";

const router = Router();

// POST /api/auth/login - Admin web login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body ?? {};

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username dan password wajib diisi"
            });
        }

        // Find user by username
        const result = await pool.query(
            "SELECT id, username, password_hash, role, name, is_active FROM login_web WHERE username = $1",
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Username atau password salah"
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: "Akun tidak aktif. Hubungi administrator."
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Username atau password salah"
            });
        }

        // Login successful
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (err: any) {
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server"
        });
    }
});

// GET /api/auth/me - Check current session (optional)
router.get("/me", async (_req, res) => {
    // For now, just return unauthorized since we don't have session/JWT yet
    res.status(401).json({ success: false, message: "Not authenticated" });
});

export default router;
