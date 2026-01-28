import { Router } from 'express';
import { getRunners, updateRunner } from '../controllers/runnerController';

const router = Router();

router.get('/', getRunners);
router.put('/:id', updateRunner);

export default router;
