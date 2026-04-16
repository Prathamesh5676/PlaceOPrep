const express = require('express');
const router = express.Router();
const schedulerController = require('../controllers/schedulerController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', schedulerController.getSchedules);
router.get('/upcoming', schedulerController.getUpcoming);
router.post('/', schedulerController.createSchedule);
router.delete('/:id', schedulerController.cancelSchedule);

module.exports = router;
