import { Router } from "express";
import runnersRoutes from "./runners";
import targetsRoutes from "./targets";
import integrationRoutes from "./integration";
import authRoutes from "./auth";
import statsRoutes from "./stats";
import masterRoutes from "./master";

const router = Router();

router.use("/integration", integrationRoutes);
router.use("/runners", runnersRoutes);
router.use("/targets", targetsRoutes);
router.use("/auth", authRoutes);
router.use("/stats", statsRoutes);
router.use("/master", masterRoutes);

export default router;
