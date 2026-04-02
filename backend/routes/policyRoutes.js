import express from 'express';
import { getPolicies, getPolicyById, createPolicy, updatePolicy, renewPolicy, getPolicyStats } from '../controllers/policyController.js';

const router = express.Router();

router.get('/', getPolicies);
router.get('/stats', getPolicyStats);
router.get('/:id', getPolicyById);
router.post('/', createPolicy);
router.put('/:id', updatePolicy);
router.post('/:id/renew', renewPolicy);

export default router;
