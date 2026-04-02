import express from 'express';
import { sendOtp, verifyOtp, createUser, getUsers, deleteUser, updateUser } from '../controllers/authController.js';

const router = express.Router();

// Public routes (for login)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Admin routes (protected - should add auth middleware in production)
router.post('/users', createUser);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
