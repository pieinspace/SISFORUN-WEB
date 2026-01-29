import { Router } from 'express';
import { getRunners, getRunnerById, getRunnerSessions, updateRunner } from '../controllers/runnerController';

const router = Router();

router.get('/', getRunners);
router.get('/:id', getRunnerById);
router.get('/:id/sessions', getRunnerSessions);
router.put('/:id', updateRunner);

export default router;
