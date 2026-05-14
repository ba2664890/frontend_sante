import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import AdminDashboard from './dashboards/AdminDashboard.tsx';
import HealthAgentDashboard from './dashboards/HealthAgentDashboard.tsx';
import PatientDashboard from './dashboards/PatientDashboard.tsx';
import Layout from '../components/Layout.tsx';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  console.log('Dashboard - user:', user?.role, 'loading:', loading);

  if (loading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  if (!user) {
    return <div className="p-4 text-center">Non authentifié</div>;
  }

  switch (user.role) {
    case 'admin':
      return (
        <Layout>
          <AdminDashboard />
        </Layout>
      );
    case 'health_agent':
      return (
        <Layout>
          <HealthAgentDashboard />
        </Layout>
      );
    case 'patient':
      return <PatientDashboard />;
    default:
      return (
        <Layout>
          <div className="p-4 text-center">Rôle inconnu</div>
        </Layout>
      );
  }
};

export default Dashboard;
