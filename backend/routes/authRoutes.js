import express from 'express';
import { sendOtp, verifyOtp, createUser, getUsers, deleteUser, updateUser, registerWorker } from '../controllers/authController.js';
import { otpRateLimiter } from '../middlewares/rateLimiter.js';
import { authMiddleware, adminMiddleware } from '../middlewares/jwtAuth.js';

const router = express.Router();

router.post('/send-otp', otpRateLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);

// Public worker registration - no auth required
router.post('/register', registerWorker);

router.post('/users', authMiddleware, adminMiddleware, createUser);
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
