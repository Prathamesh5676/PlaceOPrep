const express = require('express');
const router = express.Router();
const hintController = require('../controllers/hintController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', hintController.getHint);

module.exports = router;
