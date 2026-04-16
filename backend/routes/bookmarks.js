const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', bookmarkController.getBookmarks);
router.post('/', bookmarkController.addBookmark);
router.get('/check/:questionId', bookmarkController.checkBookmark);
router.delete('/:questionId', bookmarkController.removeBookmark);

module.exports = router;
