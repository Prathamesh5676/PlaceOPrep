const express = require("express");
const router = express.Router();
const codeExecutionController = require("../controllers/codeExecutionController");
const authMiddleware = require("../middleware/auth");

// Public health/info endpoints
router.get("/languages", codeExecutionController.getLanguages);
router.get("/health", codeExecutionController.healthCheck);

// Code execution requires authentication to prevent API key abuse
router.post("/run", authMiddleware, codeExecutionController.executeCode);
router.post("/execute", authMiddleware, codeExecutionController.executeCode);

module.exports = router;
