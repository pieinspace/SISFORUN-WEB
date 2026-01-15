import { Router } from "express";
import axios from "axios";
import * as CryptoJS from "crypto-js";
import { pool } from "../db";

const router = Router();

const ENC_SECRET = process.env.INTEGRATION_SECRET || "dev-secret-change-me";

const encrypt = (plain: string) =>
  CryptoJS.AES.encrypt(plain, ENC_SECRET).toString();

const decrypt = (cipher: string) =>
  CryptoJS.AES.decrypt(cipher, ENC_SECRET).toString(CryptoJS.enc.Utf8);

// GET config (masked)
router.get("/", async (_req, res) => {
  const result = await pool.query(
    "SELECT id, api_endpoint, status, last_test_at, last_sync_at, created_at, updated_at FROM public.integration_settings ORDER BY id DESC LIMIT 1"
  );
  res.json({ data: result.rows[0] ?? null });
});

// SAVE config
router.post("/", async (req, res) => {
  const { apiEndpoint, apiKey } = req.body ?? {};
  if (!apiEndpoint || !apiKey) {
    return res.status(400).json({ message: "apiEndpoint dan apiKey wajib" });
  }

  const encrypted = encrypt(String(apiKey));

  await pool.query(
    `INSERT INTO public.integration_settings (api_endpoint, api_key_encrypted, status)
     VALUES ($1, $2, 'unknown')`,
    [String(apiEndpoint), encrypted]
  );

  res.json({ ok: true });
});

// TEST connection (example: call /health)
router.post("/test", async (_req, res) => {
  try {
    const cfg = await pool.query(
      "SELECT * FROM public.integration_settings ORDER BY id DESC LIMIT 1"
    );
    const row = cfg.rows[0];
    if (!row) return res.status(400).json({ message: "Konfigurasi belum disimpan" });

    const apiKey = decrypt(row.api_key_encrypted);
    const endpoint = row.api_endpoint;

    // contoh endpoint health
    await axios.get(`${endpoint}/health`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });

    await pool.query(
      "UPDATE public.integration_settings SET status='connected', last_test_at=NOW() WHERE id=$1",
      [row.id]
    );

    res.json({ status: "connected" });
  } catch (err: any) {
    // update status failed
    const cfg = await pool.query(
      "SELECT id FROM public.integration_settings ORDER BY id DESC LIMIT 1"
    );
    const row = cfg.rows[0];
    if (row?.id) {
      await pool.query(
        "UPDATE public.integration_settings SET status='failed', last_test_at=NOW() WHERE id=$1",
        [row.id]
      );
    }

    res.status(500).json({ status: "failed", message: err?.message || "Gagal test koneksi" });
  }
});

export default router;
