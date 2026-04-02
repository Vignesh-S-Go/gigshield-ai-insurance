import express from 'express';
import { getUserByPhone, createUser, updateUser, toggleWork, updateEarnings, completeDelivery } from '../controllers/userController.js';

const router = express.Router();

router.get('/:phone', getUserByPhone);
router.post('/create', createUser);
router.put('/update', updateUser);
router.post('/work-toggle', toggleWork);
router.post('/earnings', updateEarnings);
router.post('/complete-delivery', completeDelivery);

export default router;
