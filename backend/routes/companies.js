const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', companyController.getCompanies);
router.get('/:name/questions', companyController.getCompanyQuestions);
router.get('/:name/stats', companyController.getCompanyStats);

module.exports = router;
