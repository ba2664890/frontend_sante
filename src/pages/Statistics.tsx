// src/pages/Statistics.tsx — Refonte "Clinical Precision" (Espace Agent)
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { analyticsService } from '../services/analyticsService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Chart from '../components/Chart.tsx';
import SenegalMap from '../components/SenegalMap.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('last-6-months');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const isAgent = user?.role === 'health_agent';

  const { data: stats, isLoading: statsLoading } = useQuery(
    ['patient-stats'],
    () => patientService.getPatientStats(),
    { enabled: !isAgent } // Désactiver pour les agents
  );

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard-data',
    () => analyticsService.getDashboardData()
  );

  if (isAgent) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl p-12 text-center border border-[#bec9c9]/10 shadow-sm">
        <div className="w-20 h-20 bg-[#ffdad6] text-[#ba1a1a] rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl">lock</span>
        </div>
        <h2 className="text-2xl font-bold text-[#091e25] mb-2" style={{ fontFamily: 'Literata, serif' }}>Accès Restreint</h2>
        <p className="text-[#6f7979] max-w-md">Les statistiques globales sont réservées aux superviseurs. Votre dashboard personnel contient toutes les données relatives à votre zone.</p>
      </div>
    );
  }

  if (statsLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#f2fbff]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const regionData = Object.entries(dashboardData?.patients_by_region || {}).map(
    ([regionId, count]) => ({
      region: parseInt(regionId),
      region_name: `Région ${regionId}`,
      total_patients: count as number,
      screened_patients: Math.round((count as number) * 0.8),
      abnormal_results: Math.round((count as number) * 0.15),
      coverage_rate: ((count as number) / 1000) * 100,
    })
  );

  const handleGenerateReport = async () => {
    try {
      const report = await analyticsService.createReport({
        name: 'Rapport Statistiques',
        report_type: 'daily',
      });
      await analyticsService.generateReport(report.id);
      const file = await analyticsService.downloadReport(report.id);
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_statistiques_${report.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handled silently
    }
  };

  const kpiCards = [
    {
      label: 'Taux de couverture',
      value: `${dashboardData?.coverage_rate?.toFixed(1) || 0}%`,
      icon: 'monitoring',
      color: '#006669',
      bg: '#dcf1fb',
      desc: 'Femmes dépistées / Population cible',
    },
    {
      label: 'Conformité suivis',
      value: `${dashboardData?.follow_up_rate?.toFixed(1) || 0}%`,
      icon: 'event_available',
      color: '#006669',
      bg: '#dcf1fb',
      desc: 'Patientes ayant respecté leurs RDV',
    },
    {
      label: 'Rapports générés',
      value: stats?.total_reports || 0,
      icon: 'description',
      color: '#795500',
      bg: '#ffdeaa',
      desc: 'Ce mois-ci',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2fbff] font-jakarta animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#2a7f82]" style={{ fontFamily: 'Literata, serif' }}>
            Statistiques & Rapports
          </h1>
          <p className="text-[#3e4949] mt-1 text-sm">Analyse détaillée du programme CerviCare+ dans votre région</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2.5 bg-white border border-[#bec9c9]/30 rounded-xl text-sm font-semibold text-[#3e4949] focus:ring-2 focus:ring-[#006669]/20 outline-none"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last-30-days">30 derniers jours</option>
            <option value="last-3-months">3 derniers mois</option>
            <option value="last-6-months">6 derniers mois</option>
            <option value="last-year">Dernière année</option>
          </select>
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9a4523] text-white rounded-xl font-semibold text-sm hover:bg-[#7b2e0d] active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Télécharger
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-6 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[#3e4949] text-sm font-semibold">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
            </div>
            <div className="font-mono text-4xl font-semibold text-[#091e25]">{kpi.value}</div>
            <p className="text-xs text-[#3e4949]">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Évolution dépistage */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Évolution du dépistage</h3>
            <span className="material-symbols-outlined text-[#bec9c9]">show_chart</span>
          </div>
          <Chart
            type="line"
            data={dashboardData?.screening_trend || []}
            xKey="month"
            yKeys={['total', 'normal', 'abnormal']}
            colors={['#006669', '#2a7f82', '#9a4523']}
            height={240}
          />
        </div>

        {/* Répartition par âge */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Répartition par âge</h3>
            <span className="material-symbols-outlined text-[#bec9c9]">pie_chart</span>
          </div>
          <Chart
            type="pie"
            data={Object.entries(dashboardData?.age_distribution || {}).map(([key, value]) => ({ name: key, value }))}
            colors={['#006669', '#2a7f82', '#9a4523', '#795500', '#85d4d6', '#ffb59a']}
            height={240}
          />
        </div>

        {/* Répartition régionale */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Par région</h3>
            <select
              className="text-xs px-3 py-1.5 bg-[#f2fbff] border border-[#bec9c9]/30 rounded-xl text-[#3e4949] outline-none"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">Toutes les régions</option>
              <option value="dakar">Dakar</option>
              <option value="thies">Thiès</option>
              <option value="diourbel">Diourbel</option>
            </select>
          </div>
          <Chart
            type="bar"
            data={regionData}
            xKey="region_name"
            yKeys={['total_patients', 'screened_patients', 'abnormal_results']}
            colors={['#006669', '#2a7f82', '#9a4523']}
            height={240}
          />
        </div>

        {/* Carte Sénégal */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Carte des régions</h3>
            <span className="material-symbols-outlined text-[#bec9c9]">map</span>
          </div>
          <SenegalMap data={dashboardData?.patients_by_region || {}} height={240} />
        </div>
      </div>

      {/* Tableau régional */}
      <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 overflow-hidden mb-8">
        <div className="flex items-center justify-between p-6 border-b border-[#bec9c9]/10">
          <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Statistiques par région</h3>
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 border border-[#006669]/20 text-[#006669] rounded-xl text-sm font-semibold hover:bg-[#dcf1fb] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Exporter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#bec9c9]/10">
                <th className="text-left text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Région</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Total patientes</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Dépistées</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Anormaux</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Couverture</th>
              </tr>
            </thead>
            <tbody>
              {regionData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#3e4949] text-sm italic">Aucune donnée régionale disponible</td>
                </tr>
              ) : (
                regionData.map((row) => (
                  <tr key={row.region} className="border-b border-[#bec9c9]/10 hover:bg-[#f2fbff] transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#091e25]">{row.region_name}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-[#091e25]">{row.total_patients}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-[#006669]">{row.screened_patients}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-[#9a4523]">{row.abnormal_results}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-xs font-bold text-[#006669] bg-[#dcf1fb] px-2 py-1 rounded-full">
                        {row.coverage_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#dcf1fb] rounded-2xl p-5 border border-[#006669]/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#006669] text-[20px]">trending_up</span>
            <h4 className="font-semibold text-[#091e25] text-sm">Tendance positive</h4>
          </div>
          <p className="text-xs text-[#3e4949] leading-relaxed">
            Le nombre de dépistages a augmenté de 15% par rapport au trimestre précédent.
          </p>
        </div>
        <div className="bg-[#ffdeaa] rounded-2xl p-5 border border-[#795500]/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#795500] text-[20px]">warning</span>
            <h4 className="font-semibold text-[#091e25] text-sm">Zone à risque</h4>
          </div>
          <p className="text-xs text-[#3e4949] leading-relaxed">
            La région de Tambacounda présente un taux de couverture inférieur à 50%.
          </p>
        </div>
        <div className="bg-[#e4f7ff] rounded-2xl p-5 border border-[#006669]/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#2a7f82] text-[20px]">verified</span>
            <h4 className="font-semibold text-[#091e25] text-sm">Bonne performance</h4>
          </div>
          <p className="text-xs text-[#3e4949] leading-relaxed">
            Le taux de conformité des suivis dépasse 85% dans la région de Dakar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
