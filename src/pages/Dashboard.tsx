// src/pages/Dashboard.tsx — Simple Dispatcher (Layout géré par App.tsx)
import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import AdminDashboard from './dashboards/AdminDashboard.tsx';
import HealthAgentDashboard from './dashboards/HealthAgentDashboard.tsx';
import PatientDashboard from './dashboards/PatientDashboard.tsx';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-[#006669] font-bold">Chargement de votre espace...</div>;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-500">Non authentifié</div>;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'health_agent':
      return <HealthAgentDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return <div className="p-10 text-center italic">Rôle inconnu : {user.role}</div>;
  }
};

export default Dashboard;
