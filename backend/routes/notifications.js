const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Settings routes must come before /:id to avoid route shadowing
router.get('/settings', notificationController.getSettings);
router.put('/settings', notificationController.updateSettings);
router.post('/test', notificationController.createTestNotification);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
