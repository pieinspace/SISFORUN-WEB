import { Router } from 'express';
import runners from './runners';

const router = Router();

router.use('/runners', runners);

export default router;
