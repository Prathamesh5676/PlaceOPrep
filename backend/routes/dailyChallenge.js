const express = require('express');
const router = express.Router();
const dailyChallengeController = require('../controllers/dailyChallengeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', dailyChallengeController.getDailyChallenge);
router.post('/complete', dailyChallengeController.completeChallenge);
router.get('/history', dailyChallengeController.getChallengeHistory);

module.exports = router;
