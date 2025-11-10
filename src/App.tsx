import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRedirect from './pages/AdminRedirect.tsx';

// pages
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Patients from './pages/Patients.tsx';
import PatientDetail from './pages/PatientDetail.tsx';
import Statistics from './pages/Statistics.tsx';
import Settings from './pages/Settings.tsx';
import Notifications from './pages/Notifications.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import Appointments from './pages/Appointments.tsx';
console.log('Public route - /login')
const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <Routes>
        {/* public route */}
        <Route path="/login" element={<Login />} />

        

        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/admin" element={<AdminRedirect />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<div className="text-center mt-20 text-xl">Page non trouvée</div>} />
      </Routes>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
