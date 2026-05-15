// src/pages/dashboards/HealthAgentDashboard.tsx — Design Clinical Precision COMPLET
import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService.ts';
import { patientService } from '../../services/patientService.ts';
import { notificationService } from '../../services/notificationService.ts';
import { DashboardStats } from '../../types/analytics.ts';
import { Patient } from '../../types';
import { useAuth } from '../../contexts/AuthContext.tsx';

const HealthAgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboardData } = useQuery<DashboardStats>(
    'health-agent-dashboard',
    () => analyticsService.getDashboardData(),
    { 
      refetchInterval: 60_000,
      retry: false, // Ne pas boucler sur les 403
    }
  );

  const { data: recentPatientsData } = useQuery(
    ['recent-patients-dashboard'],
    () => patientService.getPatients({}, 1),
    { 
      refetchInterval: 60_000,
      retry: false
    }
  );

  const { data: pendingNotifs = [] } = useQuery(
    ['notifs-pending-dashboard'],
    () => notificationService.getPendingNotifications(),
    { 
      refetchInterval: 60_000,
      retry: false
    }
  );

  const recentPatients: Patient[] = Array.isArray(recentPatientsData?.results) ? recentPatientsData.results.slice(0, 5) : [];

  // On ne bloque plus tout l'affichage pendant le chargement
  // if (isLoading) { ... }

  const kpis = [
    {
      label: 'Patientes suivies',
      value: dashboardData?.active_patients ?? 0,
      icon: 'diversity_1',
      color: '#006669',
      bg: '#dcf1fb',
      border: '#006669',
      trend: '+12% ce mois',
      trendUp: true,
    },
    {
      label: 'Dépistages effectués',
      value: dashboardData?.monthly_screenings ?? 0,
      icon: 'biotech',
      color: '#2a7f82',
      bg: '#e4f7ff',
      border: '#2a7f82',
      sub: 'Objectif mensuel: 100',
      trendUp: null,
    },
    {
      label: 'Alertes critiques',
      value: dashboardData?.pending_alerts ?? 0,
      icon: 'error',
      color: '#9a4523',
      bg: '#ffdbcf',
      border: '#9a4523',
      trend: 'Action requise',
      trendUp: false,
    },
    {
      label: 'Couverture zone',
      value: `${dashboardData?.coverage_rate?.toFixed(0) ?? 0}%`,
      icon: 'monitoring',
      color: '#795500',
      bg: '#ffdeaa',
      border: '#795500',
      sub: 'Taux de dépistage',
      trendUp: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 bg-[#dcf1fb] text-[#006669] rounded-full text-[10px] font-bold uppercase">Nouveau</span>;
      case 'screened':
        return <span className="px-2.5 py-0.5 bg-[#dcf1fb] text-[#2a7f82] rounded-full text-[10px] font-bold uppercase">Dépisté</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 bg-[#ffdeaa] text-[#795500] rounded-full text-[10px] font-bold uppercase">En attente</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-[#ffdad6] text-[#9a4523] rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  const alerts = dashboardData?.recent_alerts || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[40px] leading-[48px] font-semibold tracking-tight text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
            Bonjour, {user?.first_name || 'Agent'} 👋
          </h1>
          <p className="text-[#3e4949] text-lg flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[#006669] text-[18px]">location_on</span>
            Poste de santé · {user?.region || 'Dakar'}
          </p>
        </div>
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#006669] text-white rounded-xl font-semibold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] active:scale-95 transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nouveau Dépistage
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border-l-4" style={{ borderLeftColor: kpi.border }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#3e4949] text-sm font-semibold">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
            </div>
            <div className="font-mono text-4xl font-semibold text-[#091e25]">{kpi.value}</div>
            {kpi.trend && (
              <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${kpi.trendUp ? 'text-[#006669]' : 'text-[#9a4523]'}`}>
                <span className="material-symbols-outlined text-[14px]">{kpi.trendUp ? 'trending_up' : 'priority_high'}</span>
                {kpi.trend}
              </div>
            )}
            {kpi.sub && <div className="mt-2 text-xs text-[#3e4949]">{kpi.sub}</div>}
          </div>
        ))}
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Rendez-vous */}
        <section className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 overflow-hidden h-full">
            <div className="flex items-center justify-between p-6 border-b border-[#bec9c9]/10">
              <h2 className="font-semibold text-[#091e25] text-xl" style={{ fontFamily: 'Literata, serif' }}>File d'attente — Aujourd'hui</h2>
              <button onClick={() => navigate('/patients')} className="text-[#006669] text-sm font-semibold hover:underline">
                Voir tout →
              </button>
            </div>
            {/* Table Header */}
            <div className="grid grid-cols-4 px-6 py-3 border-b border-[#bec9c9]/10 bg-[#f2fbff]">
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Patiente</span>
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Région</span>
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Résultat IVA</span>
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Statut</span>
            </div>
            {/* Table Body */}
            <div className="divide-y divide-[#bec9c9]/10">
              {recentPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="material-symbols-outlined text-5xl text-[#bec9c9]">group</span>
                  <p className="text-[#3e4949] text-sm italic">Aucune patiente récente</p>
                </div>
              ) : (
                recentPatients.map((p: Patient) => (
                  <div
                    key={p.record_id}
                    className="grid grid-cols-4 px-6 py-4 items-center hover:bg-[#f2fbff] transition-colors cursor-pointer group"
                    onClick={() => navigate(`/patients/${p.record_id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#dcf1fb] flex items-center justify-center text-[#006669] font-bold text-sm flex-shrink-0">
                        {p.full_name?.[0] || 'P'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#091e25] text-sm truncate group-hover:text-[#006669]">{p.full_name}</p>
                        <p className="font-mono text-[10px] text-[#6f7979]">ID: {p.id_patient}</p>
                      </div>
                    </div>
                    <span className="text-sm text-[#3e4949]">{p.region_display || '—'}</span>
                    <span className={`text-sm font-semibold font-mono ${p.dep_resultat_iva === 2 ? 'text-[#9a4523]' : p.dep_resultat_iva === 1 ? 'text-[#006669]' : 'text-[#3e4949]'}`}>
                      {p.resultat_examen_display || 'Normal'}
                    </span>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(p.status || 'new')}
                      <span className="material-symbols-outlined text-[#bec9c9] text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Colonne droite: Alertes + Stats rapides */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          {/* Alertes zone */}
          <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 p-5 flex-1">
            <h2 className="font-semibold text-[#091e25] mb-4" style={{ fontFamily: 'Literata, serif' }}>Alertes de votre zone</h2>
            {alerts.length === 0 && pendingNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="material-symbols-outlined text-4xl text-[#bec9c9]">check_circle</span>
                <p className="text-sm text-[#3e4949] italic">Aucune alerte active</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Alertes analytiques */}
                {alerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className="p-3 bg-[#ffdeaa] rounded-xl border border-[#795500]/20 flex gap-3">
                    <span className="material-symbols-outlined text-[#795500] text-[20px] flex-shrink-0">warning</span>
                    <div>
                      <p className="font-semibold text-[#091e25] text-sm">{alert.title}</p>
                      <p className="text-[#3e4949] text-xs mt-0.5 line-clamp-2">{alert.description}</p>
                    </div>
                  </div>
                ))}
                {/* Notifications en attente */}
                {pendingNotifs.slice(0, 2).map((notif) => (
                  <div key={notif.id} className="p-3 bg-[#ffdbcf] rounded-xl border border-[#9a4523]/20 flex gap-3">
                    <span className="material-symbols-outlined text-[#9a4523] text-[20px] flex-shrink-0">person_cancel</span>
                    <div>
                      <p className="font-semibold text-[#091e25] text-sm">{notif.title}</p>
                      <p className="text-[#3e4949] text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/notifications')} className="mt-4 w-full text-xs text-[#006669] font-semibold hover:underline text-center">
              Gérer les notifications →
            </button>
          </div>

          {/* Carte Distribution résultats */}
          <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 p-5">
            <h3 className="font-semibold text-[#091e25] mb-4 text-sm" style={{ fontFamily: 'Literata, serif' }}>Distribution des résultats</h3>
            <div className="space-y-3">
              {[
                { label: 'Normal (IVA-)', value: dashboardData?.normal_results ?? 0, total: (dashboardData?.monthly_screenings ?? 1), color: '#006669', bg: '#dcf1fb' },
                { label: 'Anormal (IVA+)', value: dashboardData?.abnormal_results ?? 0, total: (dashboardData?.monthly_screenings ?? 1), color: '#9a4523', bg: '#ffdbcf' },
                { label: 'En attente', value: dashboardData?.pending_results ?? 0, total: (dashboardData?.monthly_screenings ?? 1), color: '#795500', bg: '#ffdeaa' },
              ].map((item) => {
                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#3e4949] font-semibold">{item.label}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: item.color }}>{item.value} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#f2fbff] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Row: Actions prioritaires + Stats région */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="bg-[#006669] text-white rounded-2xl p-5 cursor-pointer hover:bg-[#2a7f82] transition-all active:scale-95 shadow-lg shadow-[#006669]/20"
          onClick={() => navigate('/patients')}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">group_add</span>
            <span className="font-semibold">File d'attente</span>
          </div>
          <p className="font-mono text-3xl font-bold">{recentPatientsData?.count || 0}</p>
          <p className="text-white/70 text-xs mt-1">Patientes enregistrées</p>
        </div>

        <div
          className="bg-[#9a4523] text-white rounded-2xl p-5 cursor-pointer hover:bg-[#7b2e0d] transition-all active:scale-95 shadow-lg shadow-[#9a4523]/20"
          onClick={() => navigate('/statistics')}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">analytics</span>
            <span className="font-semibold">Statistiques</span>
          </div>
          <p className="font-mono text-3xl font-bold">{dashboardData?.coverage_rate?.toFixed(1) ?? 0}%</p>
          <p className="text-white/70 text-xs mt-1">Taux de couverture</p>
        </div>

        <div
          className="bg-[#2a7f82] text-white rounded-2xl p-5 cursor-pointer hover:bg-[#006669] transition-all active:scale-95 shadow-lg shadow-[#2a7f82]/20"
          onClick={() => navigate('/agent/chatbot')}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">robot_2</span>
            <span className="font-semibold">Assistant Njariñu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <p className="text-white/70 text-xs">En ligne · Prêt à assister</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAgentDashboard;