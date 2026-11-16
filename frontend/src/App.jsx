import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentChatPage } from './pages/StudentChatPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminKnowledge } from './pages/AdminKnowledge';
import { AdminCategories } from './pages/AdminCategories';
import { AdminQueries } from './pages/AdminQueries';
import { AdminFeedback } from './pages/AdminFeedback';

export const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Student Chatbot (Main Public Interface) */}
        <Route path="/" element={<StudentChatPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="knowledge" element={<AdminKnowledge />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="queries" element={<AdminQueries />} />
          <Route path="feedback" element={<AdminFeedback />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
