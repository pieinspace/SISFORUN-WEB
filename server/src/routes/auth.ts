import bcrypt from "bcrypt";
import { Router } from "express";
import { pool } from "../db";

import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-ganti-di-env";

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
            "SELECT id, username, password_hash, role, name, is_active, kd_ktm, kd_smkl FROM login_web WHERE username = $1",
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

        // Generate Token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                kd_ktm: user.kd_ktm,
                kd_smkl: user.kd_smkl
            },
            JWT_SECRET,
            { expiresIn: "12h" }
        );

        // Login successful
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                kd_ktm: user.kd_ktm,
                kd_smkl: user.kd_smkl
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

// GET /api/auth/admins - List all admins
router.get("/admins", async (_req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, username, role, name, is_active, kd_ktm, kd_smkl FROM login_web ORDER BY id ASC"
        );
        res.json({
            success: true,
            admins: result.rows
        });
    } catch (err) {
        console.error("Fetch admins error:", err);
        res.status(500).json({ success: false, message: "Gagal mengambil daftar admin" });
    }
});

// POST /api/auth/admins - Create new admin
router.post("/admins", authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: "Hanya superadmin yang dapat menambah admin" });
        }
        const { username, password, role, name, kd_ktm, kd_smkl } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO login_web (username, password_hash, role, name, kd_ktm, kd_smkl) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, role, name, kd_ktm, kd_smkl",
            [username, password_hash, role, name || username, kd_ktm, kd_smkl]
        );

        res.status(201).json({
            success: true,
            admin: result.rows[0]
        });
    } catch (err: any) {
        console.error("Create admin error:", err);
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: "Username sudah digunakan" });
        }
        res.status(500).json({ success: false, message: "Gagal menambahkan admin" });
    }
});

// DELETE /api/auth/admins/:id - Delete admin
router.delete("/admins/:id", authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: "Hanya superadmin yang dapat menghapus admin" });
        }
        const { id } = req.params;

        // Prevent deleting original admin (optional but safer)
        const checkResult = await pool.query("SELECT username FROM login_web WHERE id = $1", [id]);
        if (checkResult.rows[0]?.username === 'admin') {
            return res.status(400).json({ success: false, message: "Admin utama tidak dapat dihapus" });
        }

        await pool.query("DELETE FROM login_web WHERE id = $1", [id]);
        res.json({ success: true, message: "Admin berhasil dihapus" });
    } catch (err) {
        console.error("Delete admin error:", err);
        res.status(500).json({ success: false, message: "Gagal menghapus admin" });
    }
});

// POST /api/auth/change-password - Change admin password
router.post("/change-password", authenticateToken, async (req: any, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Password saat ini dan password baru wajib diisi" });
        }

        // Get user from DB
        const result = await pool.query("SELECT password_hash FROM login_web WHERE id = $1", [userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Password saat ini salah" });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update DB
        await pool.query("UPDATE login_web SET password_hash = $1 WHERE id = $2", [newPasswordHash, userId]);

        res.json({ success: true, message: "Password berhasil diperbarui" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ success: false, message: "Gagal memperbarui password" });
    }
});

export default router;
