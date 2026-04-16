const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// All routes require authentication
router.use(authMiddleware);

// Question routes
router.get('/', questionController.getQuestions);
router.get('/random', questionController.getRandomQuestion);
router.get('/:id', questionController.getQuestionById);
// Only admins can create questions
router.post('/', adminMiddleware, questionController.createQuestion);

module.exports = router;
