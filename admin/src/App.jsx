import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import UserManagement from './pages/UserManagement';
import DocumentManagement from './pages/DocumentManagement';
import QuizManagement from './pages/QuizManagement';
import FlashcardManagement from './pages/FlashcardManagement';
import LearningTopics from './pages/LearningTopics';
import AIMonitoring from './pages/AIMonitoring';
import Analytics from './pages/Analytics';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userInfo);
  } catch {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role || user?.user?.role;
  if (role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          
          <Route path="users" element={<UserManagement />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="quizzes" element={<QuizManagement />} />
          <Route path="flashcards" element={<FlashcardManagement />} />
          <Route path="topics" element={<LearningTopics />} />
          <Route path="ai-monitoring" element={<AIMonitoring />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="payments" element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Placeholders for remaining less critical pages */}
          <Route path="feedback" element={<div className="p-8">Feedback Reports (Coming Soon)</div>} />
          <Route path="activity-logs" element={<div className="p-8">Activity Logs (Coming Soon)</div>} />
          <Route path="security" element={<div className="p-8">Security Center (Coming Soon)</div>} />
          <Route path="profile" element={<div className="p-8">Admin Profile (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
