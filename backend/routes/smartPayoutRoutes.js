import express from 'express';
import { 
    getSmartPayoutData, 
    processSmartPayout, 
    rejectPayout, 
    markForReview,
    getPayoutQueue 
} from '../controllers/smartPayoutController.js';

const router = express.Router();

router.get('/smart-data', getSmartPayoutData);
router.get('/queue', getPayoutQueue);
router.post('/process', processSmartPayout);
router.post('/reject', rejectPayout);
router.post('/review', markForReview);

export default router;
