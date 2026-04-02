import express from 'express';
import { calculateRiskFromLocation, getCalculatedRisk } from '../controllers/riskController.js';

const router = express.Router();

router.post('/calculate', calculateRiskFromLocation);
router.post('/score', getCalculatedRisk);

export default router;
