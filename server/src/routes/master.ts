import { Router } from "express";
import { getKesatuan, getSubdisByKtm, getCorps, getPangkat } from "../controllers/masterController";

const router = Router();

router.get("/kesatuan", getKesatuan);
router.get("/subdis/:kd_ktm", getSubdisByKtm);
router.get("/corps", getCorps);
router.get("/pangkat", getPangkat);

export default router;
