import { Router } from "express";
import runnersRoutes from "./runners";
import targetsRoutes from "./targets";
import integrationRoutes from "./integration";

const router = Router();

router.use("/integration", integrationRoutes);
router.use("/runners", runnersRoutes);
router.use("/targets", targetsRoutes);

export default router;
