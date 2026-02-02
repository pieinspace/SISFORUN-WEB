import { Router } from 'express';
import { getRunners, getRunnerById, getRunnerSessions, updateRunner } from '../controllers/runnerController';

import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getRunners);
router.get('/:id', getRunnerById);
router.get('/:id/sessions', getRunnerSessions);
router.put('/:id', updateRunner);

export default router;
