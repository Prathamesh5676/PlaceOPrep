import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import History from '../pages/History';
import Achievements from '../pages/Achievements';
import QuestionBank from '../pages/QuestionBank';
import Profile from '../pages/Profile';
import Aptitude from '../pages/Aptitude';
import CodingTest from '../pages/CodingTest';
import CodingProblems from '../pages/CodingProblems';
import CodingEditor from '../pages/CodingEditor';
import AiInterviewer from '../pages/AiInterviewer';
import Bookmarks from '../pages/Bookmarks';
import Leaderboard from '../pages/Leaderboard';
import DailyChallenge from '../pages/DailyChallenge';
import Notes from '../pages/Notes';
import StudyPlan from '../pages/StudyPlan';
import CompanyPrep from '../pages/CompanyPrep';
import Scheduler from '../pages/Scheduler';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Protected Route Component
function ProtectedRoute({ user, onLogout }) {
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 ml-64 overflow-auto bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute user={user} onLogout={handleLogout} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-interviewer" element={<AiInterviewer />} />
          <Route path="/aptitude" element={<Aptitude />} />
          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/history" element={<History />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/coding-test" element={<CodingTest />} />
          <Route path="/coding-problems" element={<CodingProblems />} />
          <Route path="/coding-editor/:id" element={<CodingEditor />} />
          {/* New feature routes */}
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/daily-challenge" element={<DailyChallenge />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/company-prep" element={<CompanyPrep />} />
          <Route path="/scheduler" element={<Scheduler />} />
        </Route>

        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}
