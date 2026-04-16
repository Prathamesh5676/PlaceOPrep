const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../utils/upload');

// Validation rules
// NOTE: No normalizeEmail() — it rewrites emails (e.g. Gmail dot removal) and
// would cause lookup mismatches for existing users registered without it.
const registerRules = [
  body('email').isEmail().toLowerCase().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required')
];

const loginRules = [
  body('email').isEmail().toLowerCase().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', body('email').isEmail().toLowerCase().withMessage('Valid email required'), validate, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);
router.put('/profile', authMiddleware, upload.single('avatar'), authController.updateProfile);

module.exports = router;
