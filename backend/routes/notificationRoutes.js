import express from 'express';
import { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
