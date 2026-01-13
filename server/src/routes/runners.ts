import { Router } from 'express';
import { getRunners } from '../controllers/runnerController';

const router = Router();

router.get('/', getRunners);

export default router;
