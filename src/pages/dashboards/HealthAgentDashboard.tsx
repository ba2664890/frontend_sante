import React from 'react';
import { useQuery } from 'react-query';
import { analyticsService } from '../../services/analyticsService.ts';
import { DashboardStats } from '../../types/analytics.ts';
import { StatCardProps, ChartProps, SenegalMapProps, RecentPatientsProps, RecentAlertsProps } from '../../types/components.ts';
import StatCard from '../../components/StatCard.tsx';
import Chart from '../../components/Chart.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import RecentPatients from '../../components/RecentPatients.tsx';
import RecentAlerts from '../../components/RecentAlerts.tsx';
import SenegalMap from '../../components/SenegalMap.tsx';
import {
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HealthAgentDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery<DashboardStats>(
    'health-agent-dashboard',
    () => analyticsService.getDashboardData()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats: StatCardProps[] = [
    {
      title: 'Patients Actifs',
      value: dashboardData?.active_patients || 0,
      icon: UserGroupIcon,
      color: 'primary'
    },
    {
      title: 'Dépistages du Mois',
      value: dashboardData?.monthly_screenings || 0,
      icon: ClipboardDocumentCheckIcon,
      color: 'success'
    },
    {
      title: 'Alertes en Attente',
      value: dashboardData?.pending_alerts || 0,
      icon: ExclamationTriangleIcon,
      color: 'warning'
    },
    {
      title: 'Taux de Suivi',
      value: `${dashboardData?.follow_up_rate || 0}%`,
      icon: ChartBarIcon,
      color: 'info'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as 'primary' | 'success' | 'warning' | 'error' | 'info'}
          />
        ))}
      </div>

      {/* Charts and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Dépistages par Mois</h3>
          <Chart
            data={dashboardData?.screening_trend || []}
            type="line"
            height={300}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Répartition Géographique</h3>
          <SenegalMap data={dashboardData?.geographic_data || []} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Patients Récents</h3>
          <RecentPatients
            patients={dashboardData?.recent_patients || []}
            showActions
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Alertes Récentes</h3>
          <RecentAlerts alerts={dashboardData?.recent_alerts || []} />
        </div>
      </div>

      {/* Pending Actions */}
      <div className="card bg-yellow-50">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          Actions en Attente
        </h3>
        {(() => {
          const pendingActions = dashboardData?.pending_actions ?? [];
          if (pendingActions.length > 0) {
            return (
              <div className="space-y-4">
                {pendingActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => {/* Handle action */}}
                >
                  Traiter
                </button>
              </div>
                ))}
              </div>
            );
          }
          return <p className="text-yellow-800">Aucune action en attente</p>;
        })()}
      </div>
    </div>
  );
};

export default HealthAgentDashboard;