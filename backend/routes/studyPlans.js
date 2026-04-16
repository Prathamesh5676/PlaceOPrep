const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlanController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/active', studyPlanController.getActivePlan);
router.get('/today', studyPlanController.getTodayTasks);
router.post('/', studyPlanController.createPlan);
router.post('/complete-task', studyPlanController.completeTask);
router.delete('/cancel', studyPlanController.cancelPlan);

module.exports = router;
