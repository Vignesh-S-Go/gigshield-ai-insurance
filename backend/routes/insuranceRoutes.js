import express from 'express';
import { calculateInsurance } from '../controllers/insuranceController.js';

const router = express.Router();

router.post('/calculate', calculateInsurance);

export default router;