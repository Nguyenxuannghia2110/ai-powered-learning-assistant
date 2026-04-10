import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DocumentListPage from "./pages/Documents/DocumentListPage";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage";
import QuizTakePage from "./pages/Quizzes/QuizTakePage";
import QuizResultPage from "./pages/Quizzes/QuizResultPage";
import QuizzesPage from "./pages/QuizManual/QuizzesPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import FlashcardsPage from "./pages/Flashcards/FlashcardsPage";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";

import { Toaster } from "react-hot-toast";

const App = () => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-2 border-[#34d399] border-solid rounded-full animate-spin"></div>
          <p className="text-[#34d399] text-xs tracking-[0.2em] uppercase">Initializing Neural Core...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0a0f0d',
            color: '#34d399',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: '8px',
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          },
        }} 
      /> */}
      <Router>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />

             
              <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
              <Route
                path="/quizzes/:quizId/results"
                element={<QuizResultPage />}
              />
               <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
