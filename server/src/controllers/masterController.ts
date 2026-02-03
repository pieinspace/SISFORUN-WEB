import { Request, Response } from "express";
import { pool } from "../db";

export const getKesatuan = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT DISTINCT ON (ur_ktm) kd_ktm, ur_ktm FROM kotama ORDER BY ur_ktm ASC, kd_ktm ASC");
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get kesatuan error:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data kesatuan" });
    }
};

export const getSubdisByKtm = async (req: Request, res: Response) => {
    const { kd_ktm } = req.params;
    try {
        const result = await pool.query(
            "SELECT DISTINCT ON (ur_smkl) kd_ktm, kd_smkl, ur_smkl FROM kesatuan WHERE kd_ktm = $1 ORDER BY ur_smkl ASC, kd_smkl ASC",
            [kd_ktm]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get subdis error:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data subdis" });
    }
};

export const getCorps = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM corps ORDER BY ur_corps ASC");
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get corps error:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data corps" });
    }
};

export const getPangkat = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM pangkat ORDER BY kd_pkt DESC");
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get pangkat error:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data pangkat" });
    }
};
