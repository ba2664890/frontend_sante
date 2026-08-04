import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import ChatbotPage from './pages/ChatbotPage.tsx';
import AgentChatbotPage from './pages/AgentChatbotPage.tsx';
import Campaigns from './pages/Campaigns.tsx';
import HomePage from './pages/HomePage.tsx';
import MedicalRecords from './pages/patient/MedicalRecords.tsx';
import PatientAppointments from './pages/patient/Appointments.tsx';
import PatientCancerSpace from './pages/patient/PatientCancerSpace.tsx';
import PatientSpaceRedirect from './pages/patient/PatientSpaceRedirect.tsx';
import PatientNoRecord from './pages/patient/PatientNoRecord.tsx';
import ProstatePatients from './pages/ProstatePatients.tsx';
import SeinPatients from './pages/SeinPatients.tsx';
import HealthCenters from './pages/HealthCenters.tsx';
import CampaignRequestsPage from './pages/CampaignRequests.tsx';

console.log('Public route - /login')
const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <Routes>
        {/* public route */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />

        

        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/acceuil_patient" element={<PatientSpaceRedirect />} />
          <Route path="/patient" element={<PatientSpaceRedirect />} />
          <Route path="/patient/col" element={<PatientCancerSpace module="col" />} />
          <Route path="/patient/prostate" element={<PatientCancerSpace module="prostate" />} />
          <Route path="/patient/sein" element={<PatientCancerSpace module="sein" />} />
          <Route path="/patient/no-record" element={<PatientNoRecord />} />
          <Route path="/patient/records" element={<MedicalRecords />} />
          <Route path="/patient/appointments" element={<PatientAppointments />} />
          <Route path="/chatbot" element={<ChatbotPage />} />

          <Route path="/settings" element={<Settings />} />

          {/* Admin & Health Agent Routes (With Sidebar) — ESPACE AGENT */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/prostate" element={<ProstatePatients />} />
            <Route path="/sein" element={<SeinPatients />} />
            <Route path="/accueil" element={<Campaigns />} />
            <Route path="/centers" element={<HealthCenters />} />
            <Route path="/campaign-requests" element={<CampaignRequestsPage />} />
            <Route path="/appointments/:id" element={<Appointments />} />
            <Route path="/admin" element={<AdminRedirect />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/agent/chatbot" element={<AgentChatbotPage />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<div className="text-center mt-20 text-xl">Page non trouvée</div>} />
      </Routes>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
