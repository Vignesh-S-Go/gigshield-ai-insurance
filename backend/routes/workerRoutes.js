import express from 'express';
import { getWorkers, getWorkerById, createWorker, updateWorker, getWorkerMetrics, syncWorkerStats } from '../controllers/workerController.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/metrics', getWorkerMetrics);
router.get('/:id', getWorkerById);
router.post('/', createWorker);
router.put('/:id', updateWorker);
router.put('/:id/sync-stats', syncWorkerStats);

export default router;
