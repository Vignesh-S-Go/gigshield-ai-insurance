import express from 'express';
import { getPayouts, createPayout, processPayout, getPayoutStats, getPayoutsByZone } from '../controllers/payoutController.js';

const router = express.Router();

router.get('/', getPayouts);
router.get('/stats', getPayoutStats);
router.get('/by-zone', getPayoutsByZone);
router.post('/', createPayout);
router.put('/:id/process', processPayout);

export default router;
