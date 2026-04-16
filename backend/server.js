const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const sessionRoutes = require('./routes/sessions');
const questionRoutes = require('./routes/questions');
const achievementRoutes = require('./routes/achievements');
const aptitudeRoutes = require('./routes/aptitude');
const codeExecutionRoutes = require('./routes/codeExecution');
const submissionRoutes = require('./routes/submissions');
const bookmarkRoutes = require('./routes/bookmarks');
const leaderboardRoutes = require('./routes/leaderboard');
const dailyChallengeRoutes = require('./routes/dailyChallenge');
const noteRoutes = require('./routes/notes');
const studyPlanRoutes = require('./routes/studyPlans');
const reportRoutes = require('./routes/reports');
const hintRoutes = require('./routes/hints');
const companyRoutes = require('./routes/companies');
const notificationRoutes = require('./routes/notifications');
const schedulerRoutes = require('./routes/scheduler');

// Initialize app
const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS — restrict to frontend origin
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global rate limiter — 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';
const PY_ENGINE_URL = process.env.PY_ENGINE_URL || 'http://localhost:8000';
app.set('PY_ENGINE_URL', PY_ENGINE_URL);

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit instead of silently continuing
  });

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/code', codeExecutionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/hints', hintRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedule', schedulerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS error: origin not allowed' });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 PlaceOPrep Backend running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`🤖 AI Engine: ${PY_ENGINE_URL}`);
});
