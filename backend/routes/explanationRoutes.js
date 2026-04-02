import express from 'express';
import { getExplanation } from '../controllers/explanationController.js';

const router = express.Router();

router.post('/', getExplanation);

export default router;
