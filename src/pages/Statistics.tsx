import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  ChartBarIcon,
  DocumentTextIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { patientService } from '../services/patientService.ts';
import { analyticsService } from '../services/analyticsService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import StatCard, { StatCardProps } from '../components/StatCard.tsx';
import Chart from '../components/Chart.tsx';
import SenegalMap from '../components/SenegalMap.tsx';
import DataTable from '../components/DataTable.tsx';

const Statistics: React.FC = () => {
  const [dateRange, setDateRange] = useState('last-6-months');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Récupérer les statistiques
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['patient-stats'],
    () => patientService.getPatientStats()
  );

  
  // Récupérer les données du tableau de bord
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard-data',
    () => analyticsService.getDashboardData()
  );

  if (statsLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Taux de Couverture',
      value: `${dashboardData?.coverage_rate?.toFixed(1) || 0}%`,
      icon: ChartBarIcon,
      color: 'primary',
      description: 'Femmes dépistées / Population cible',
    },
    {
      title: 'Conformité des Suivis',
      // backend exposes follow_up_rate in DashboardStats
      value: `${dashboardData?.follow_up_rate?.toFixed(1) || 0}%`,
      icon: CalendarDaysIcon,
      color: 'success',
      description: 'Patientes ayant respecté leurs rendez-vous',
    },
    {
      title: 'Rapports Générés',
      value: stats?.total_reports || 0,
      icon: DocumentTextIcon,
      color: 'info',
      description: 'Rapports générés ce mois-ci',
    },
  ];

  const columns = [
    {
      key: 'region',
      header: 'Région',
      render: (row: any) => row.region_name || `Région ${row.region}`,
    },
    {
      key: 'total_patients',
      header: 'Total Patientes',
      sortable: true,
    },
    {
      key: 'screened_patients',
      header: 'Patientes Dépistées',
      sortable: true,
    },
    {
      key: 'abnormal_results',
      header: 'Résultats Anormaux',
      sortable: true,
    },
    {
      key: 'coverage_rate',
      header: 'Taux de Couverture',
      render: (row: any) => `${row.coverage_rate?.toFixed(1) || 0}%`,
    },
  ];

  const regionData = Object.entries(dashboardData?.patients_by_region || {}).map(
    ([regionId, count]) => ({
      region: parseInt(regionId),
      region_name: `Région ${regionId}`,
      total_patients: count,
      screened_patients: Math.round(count * 0.8),
      abnormal_results: Math.round(count * 0.15),
      coverage_rate: (count / 1000) * 100,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques et Rapports</h1>
          <p className="text-gray-600">
            Analyse détaillée des données du programme CerviCare+
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="input-field"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last-30-days">30 derniers jours</option>
            <option value="last-3-months">3 derniers mois</option>
            <option value="last-6-months">6 derniers mois</option>
            <option value="last-year">Dernière année</option>
          </select>
            <button
              className="btn-primary"
              onClick={async () => {
                const report = await analyticsService.createReport({
                  name: "Rapport Admin",
                  report_type: "daily",
                });

                await analyticsService.generateReport(report.id);

                const file = await analyticsService.downloadReport(report.id);
                const url = URL.createObjectURL(file);
                const a = document.createElement("a");
                a.href = url;
                a.download = `report_${report.id}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Générer & Télécharger Rapport
            </button>


        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewStats.map((stat) => (
          <div key={stat.title} className="card">
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color as 'primary' | 'success' | 'warning' | 'error' | 'info'}
            />
            <p className="text-sm text-gray-600 mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Évolution du dépistage
            </h3>
            <FunnelIcon className="w-5 h-5 text-gray-400" />
          </div>
          <Chart
            type="line"
            data={dashboardData?.screening_trend || []}
            xKey="month"
            yKeys={['total', 'normal', 'abnormal']}
            colors={['#8b5cf6', '#22c55e', '#f59e0b']}
            height={300}
          />
        </div>

        {/* Age Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Répartition par âge</h3>
            <FunnelIcon className="w-5 h-5 text-gray-400" />
          </div>
          <Chart
            type="pie"
            data={Object.entries(dashboardData?.age_distribution || {}).map(
              ([key, value]) => ({
                name: key,
                value,
              })
            )}
            colors={[
              '#8b5cf6',
              '#22c55e',
              '#f59e0b',
              '#ef4444',
              '#6366f1',
              '#ec4899',
            ]}
            height={300}
          />
        </div>

        {/* Regional Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Répartition régionale
            </h3>
            <select
              className="input-field text-sm py-1 px-2"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">Toutes les régions</option>
              <option value="dakar">Dakar</option>
              <option value="thiès">Thiès</option>
              <option value="diourbel">Diourbel</option>
            </select>
          </div>
          <Chart
            type="bar"
            data={regionData}
            xKey="region_name"
            yKeys={['total_patients', 'screened_patients', 'abnormal_results']}
            colors={['#8b5cf6', '#22c55e', '#f59e0b']}
            height={300}
          />
        </div>

        {/* Geographic Map */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Carte des régions</h3>
            <FunnelIcon className="w-5 h-5 text-gray-400" />
          </div>
          <SenegalMap data={dashboardData?.patients_by_region || {}} height={300} />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Statistiques par région
          </h3>
          <button className="btn-secondary flex items-center">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
        <DataTable 
          columns={columns} 
          data={regionData} 
          pagination={{
            current: 1,
            total: regionData.length,
            pageSize: regionData.length,
            onChange: () => {}
          }} 
        />
      </div>

      {/* Key Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Analyses et insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 mb-2">Tendance positive</h4>
            <p className="text-sm text-primary-700">
              Le nombre de dépistages a augmenté de 15% par rapport au trimestre
              précédent.
            </p>
          </div>
          <div className="bg-warning-50 rounded-lg p-4">
            <h4 className="font-medium text-warning-900 mb-2">Zone à risque</h4>
            <p className="text-sm text-warning-700">
              La région de Tambacounda présente un taux de couverture inférieur à
              50%.
            </p>
          </div>
          <div className="bg-success-50 rounded-lg p-4">
            <h4 className="font-medium text-success-900 mb-2">Bonne performance</h4>
            <p className="text-sm text-success-700">
              Le taux de conformité des suivis dépasse les 85% dans la région de
              Dakar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
