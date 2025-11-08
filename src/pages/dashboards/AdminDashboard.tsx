import React from 'react';
import { useQuery } from 'react-query';
import { analyticsService } from '../../services/analyticsService.ts';
import StatCard from '../../components/StatCard.tsx';
import Chart from '../../components/Chart.tsx';
import SenegalMap from '../../components/SenegalMap.tsx';
import RecentPatients from '../../components/RecentPatients.tsx';
import RecentAlerts from '../../components/RecentAlerts.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import {
  UsersIcon,
  ClipboardIcon as ClipboardCheckIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard-data',
    () => analyticsService.getDashboardData(),
    {
      refetchInterval: 60000,
      retry: 2,
      onError: (error: any) => {
        console.error('Dashboard error:', error);
      },
    }
  );

  console.log('AdminDashboard - dashboardData:', dashboardData);
  console.log('AdminDashboard - error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ExclamationTriangleIcon className="w-16 h-16 text-error-500 mb-4" />
        <p className="text-gray-600 text-center">
          Erreur lors du chargement du tableau de bord
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : 'Erreur inconnue'}
        </p>
      </div>
    );
  }

  // Données par défaut si pas de données
  const defaultData = {
    total_patients: 0,
    total_screened: 0,
    abnormal_results: 0,
    pending_followups: 0,
    screening_trend: [],
    age_distribution: {},
    patients_by_region: {},
    recent_alerts: [],
    recent_patients: [],
  };

  const data = dashboardData || defaultData;

  const stats = [
    {
      title: 'Total Patientes',
      value: data.total_patients,
      icon: UsersIcon,
      color: 'primary',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Dépistages',
      value: data.total_screened,
      icon: ClipboardCheckIcon,
      color: 'success',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Résultats Anormaux',
      value: data.abnormal_results,
      icon: ExclamationTriangleIcon,
      color: 'warning',
      change: '+3%',
      changeType: 'increase',
    },
    {
      title: 'Suivis en Attente',
      value: data.pending_followups,
      icon: CalendarIcon,
      color: 'error',
      change: '-5%',
      changeType: 'decrease',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as 'primary' | 'success' | 'warning' | 'error' | 'info'}
            change={stat.change}
            changeType={stat.changeType as 'increase' | 'decrease'}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tendance du dépistage</h3>
          {data.screening_trend && data.screening_trend.length > 0 ? (
            <Chart
              type="line"
              data={data.screening_trend}
              xKey="month"
              yKeys={['total', 'normal', 'abnormal']}
              colors={['#8b5cf6', '#22c55e', '#f59e0b']}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Distribution par âge</h3>
          {data.age_distribution && Object.keys(data.age_distribution).length > 0 ? (
            <Chart
              type="pie"
              data={Object.entries(data.age_distribution).map(([key, value]) => ({
                name: key,
                value,
              }))}
              colors={['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#6366f1']}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Map and Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold mb-4">Répartition régionale</h3>
          {data.patients_by_region && Object.keys(data.patients_by_region).length > 0 ? (
            <SenegalMap data={data.patients_by_region} height={300} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Alertes récentes</h3>
            <RecentAlerts alerts={data.recent_alerts} />
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Patientes récentes</h3>
            <RecentPatients patients={data.recent_patients} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;