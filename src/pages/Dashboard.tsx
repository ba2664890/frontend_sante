import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import AdminDashboard from './dashboards/AdminDashboard.tsx';
import HealthAgentDashboard from './dashboards/HealthAgentDashboard.tsx';
import PatientDashboard from './dashboards/PatientDashboard.tsx';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  console.log('Dashboard - user:', user?.role, 'loading:', loading);

  if (loading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  if (!user) {
    return <div className="p-4 text-center">Non authentifié</div>;
  }
  console.log('Dashboard - rendering for role:', user.role);

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'health_agent':
      return <HealthAgentDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return <div className="p-4 text-center">Rôle inconnu</div>;
  }
};

export default Dashboard;
