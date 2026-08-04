// src/pages/dashboards/HealthAgentDashboard.tsx — Refonte avec contexte structurel et multi-cancer
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService.ts';
import { patientService } from '../../services/patientService.ts';
import { notificationService } from '../../services/notificationService.ts';
import { Patient } from '../../types';
import { useAuth } from '../../contexts/AuthContext.tsx';

type CancerModule = 'col' | 'sein' | 'prostate';

const CANCER_CONFIG: Record<CancerModule, { label: string; color: string; bg: string; href: string }> = {
  col: { label: "Col", color: '#9013fe', bg: '#9013fe1a', href: '/patients' },
  sein: { label: 'Sein', color: '#e02020', bg: '#e020201a', href: '/sein' },
  prostate: { label: 'Prostate', color: '#006669', bg: '#0066691a', href: '/prostate' },
};

const HealthAgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCancer, setActiveCancer] = useState<CancerModule>('col');

  const { data: dashboardData } = useQuery(
    'health-agent-dashboard',
    () => analyticsService.getDashboardData(),
    { refetchInterval: 60_000, retry: false }
  );

  const { data: recentPatientsData } = useQuery(
    ['recent-patients-dashboard'],
    () => patientService.getPatients({}, 1),
    { refetchInterval: 60_000, retry: false }
  );

  const { data: pendingNotifs = [] } = useQuery(
    ['notifs-pending-dashboard'],
    () => notificationService.getPendingNotifications(),
    { refetchInterval: 60_000, retry: false }
  );

  const recentPatients: Patient[] = Array.isArray(recentPatientsData?.results)
    ? recentPatientsData.results.slice(0, 5)
    : [];

  const cancerStats = dashboardData?.cancer_stats || {};
  const activeCancerData = cancerStats[activeCancer] || {};
  const structureContext = dashboardData?.structure_context;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 bg-[#dcf1fb] text-[#006669] rounded-full text-[10px] font-bold uppercase">Nouveau</span>;
      case 'screened':
        return <span className="px-2.5 py-0.5 bg-[#e4f7ff] text-[#2a7f82] rounded-full text-[10px] font-bold uppercase">Dépisté</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 bg-[#ffdeaa] text-[#795500] rounded-full text-[10px] font-bold uppercase">En attente</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-[#ffdad6] text-[#9a4523] rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  const alerts = dashboardData?.recent_alerts || [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ——— Header avec contexte structurel ——— */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1
            className="text-[36px] leading-[44px] font-semibold tracking-tight text-[#091e25]"
            style={{ fontFamily: 'Literata, serif' }}
          >
            Bonjour, {user?.first_name || 'Agent'} 👋
          </h1>
          <div className="flex items-center gap-2 mt-2 text-[#3e4949] text-sm">
            <span className="material-symbols-outlined text-[#006669] text-[16px]">location_on</span>
            <span>
              {structureContext
                ? <>
                    <span className="font-semibold text-[#006669]">
                      {structureContext.type === 'campaign' ? 'Campagne' : 'Centre de santé'}
                    </span>
                    {' '}· {structureContext.name}
                  </>
                : <span>{user?.structure_name || 'Votre structure'} · {user?.region || 'Dakar'}</span>
              }
            </span>
          </div>
          {structureContext && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                structureContext.type === 'campaign'
                  ? 'bg-[#9a4523]/10 text-[#9a4523]'
                  : 'bg-[#006669]/10 text-[#006669]'
              }`}>
                {structureContext.type === 'campaign' ? '🏕 Campagne Mobile' : '🏥 Centre Fixe'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#006669] text-white rounded-xl font-semibold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] active:scale-95 transition-all self-start"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nouveau Dépistage
        </button>
      </div>

      {/* ——— Sélecteur Cancer ——— */}
      <div className="flex gap-2">
        {(Object.keys(CANCER_CONFIG) as CancerModule[]).map((c) => {
          const cfg = CANCER_CONFIG[c];
          const active = activeCancer === c;
          const count = cancerStats[c]?.total ?? 0;
          return (
            <button
              key={c}
              onClick={() => setActiveCancer(c)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                active ? 'text-white shadow-md' : 'bg-white text-[#3e4949] border-[#bec9c9]/30'
              }`}
              style={active ? { background: cfg.color, borderColor: cfg.color } : { borderColor: '#d1d5db' }}
            >
              {cfg.label}
              <span
                className="text-[11px] font-mono px-1.5 py-0.5 rounded-full"
                style={active ? { background: 'rgba(255,255,255,0.25)' } : { background: cfg.bg, color: cfg.color }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ——— KPI du cancer actif ——— */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Enregistrés',
            value: activeCancerData.total ?? 0,
            icon: 'group',
            color: CANCER_CONFIG[activeCancer].color,
            bg: CANCER_CONFIG[activeCancer].bg,
          },
          {
            label: 'Dépistages',
            value: activeCancerData.screened ?? 0,
            icon: 'biotech',
            color: CANCER_CONFIG[activeCancer].color,
            bg: CANCER_CONFIG[activeCancer].bg,
          },
          {
            label: 'Cas anormaux',
            value: activeCancerData.abnormal ?? 0,
            icon: 'warning',
            color: '#9a4523',
            bg: '#ffdbcf',
          },
          {
            label: 'Couverture',
            value: `${(activeCancerData.coverage_rate ?? 0).toFixed(1)}%`,
            icon: 'monitoring',
            color: '#006669',
            bg: '#dcf1fb',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border-l-4"
            style={{ borderLeftColor: kpi.color }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#3e4949] text-sm font-semibold">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
            </div>
            <div className="font-mono text-3xl font-semibold text-[#091e25]">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* ——— Progression par type de cancer (barres) ——— */}
      <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
        <h3 className="font-semibold text-[#091e25] mb-4 text-sm" style={{ fontFamily: 'Literata, serif' }}>
          Avancement des dépistages par cancer
        </h3>
        <div className="space-y-4">
          {(Object.keys(CANCER_CONFIG) as CancerModule[]).map((c) => {
            const cfg = CANCER_CONFIG[c];
            const stats = cancerStats[c] || {};
            const pct = stats.screened > 0 ? Math.round((stats.screened / Math.max(stats.total, 1)) * 100) : 0;
            return (
              <div key={c}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-[#091e25]">{cfg.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#3e4949]">{stats.screened ?? 0} / {stats.total ?? 0}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: cfg.color }}>{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: cfg.bg }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, background: cfg.color }}
                  />
                </div>
                {stats.abnormal > 0 && (
                  <p className="text-[11px] text-[#9a4523] mt-0.5">
                    {stats.abnormal} cas anormaux détectés
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ——— File d'attente + Alertes ——— */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* File d'attente — patientes col */}
        <section className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 overflow-hidden h-full">
            <div className="flex items-center justify-between p-6 border-b border-[#bec9c9]/10">
              <h2 className="font-semibold text-[#091e25] text-xl" style={{ fontFamily: 'Literata, serif' }}>
                File d'attente — Aujourd'hui
              </h2>
              <button onClick={() => navigate('/patients')} className="text-[#006669] text-sm font-semibold hover:underline">
                Voir tout →
              </button>
            </div>
            <div className="grid grid-cols-4 px-6 py-3 border-b border-[#bec9c9]/10 bg-[#f2fbff]">
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Patiente</span>
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Région</span>
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Résultat</span>
              <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Statut</span>
            </div>
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
                    <span className="text-sm text-[#3e4949]">{(p as any).region_display || '—'}</span>
                    <span className={`text-sm font-semibold font-mono ${p.dep_resultat_iva === 2 ? 'text-[#9a4523]' : 'text-[#006669]'}`}>
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

        {/* Alertes + Distribution */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 p-5 flex-1">
            <h2 className="font-semibold text-[#091e25] mb-4" style={{ fontFamily: 'Literata, serif' }}>
              Alertes de votre zone
            </h2>
            {alerts.length === 0 && pendingNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="material-symbols-outlined text-4xl text-[#bec9c9]">check_circle</span>
                <p className="text-sm text-[#3e4949] italic">Aucune alerte active</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 2).map((alert: any) => (
                  <div key={alert.id} className="p-3 bg-[#ffdeaa] rounded-xl border border-[#795500]/20 flex gap-3">
                    <span className="material-symbols-outlined text-[#795500] text-[20px] flex-shrink-0">warning</span>
                    <div>
                      <p className="font-semibold text-[#091e25] text-sm">{alert.title}</p>
                      <p className="text-[#3e4949] text-xs mt-0.5 line-clamp-2">{alert.description}</p>
                    </div>
                  </div>
                ))}
                {pendingNotifs.slice(0, 2).map((notif: any) => (
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
            <button
              onClick={() => navigate('/notifications')}
              className="mt-4 w-full text-xs text-[#006669] font-semibold hover:underline text-center"
            >
              Gérer les notifications →
            </button>
          </div>
        </section>
      </div>

      {/* ——— Raccourcis Actions ——— */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(CANCER_CONFIG) as CancerModule[]).map((c) => {
          const cfg = CANCER_CONFIG[c];
          const stats = cancerStats[c] || {};
          return (
            <div
              key={c}
              className="rounded-2xl p-5 cursor-pointer transition-all active:scale-95 shadow-lg text-white"
              style={{ background: cfg.color, boxShadow: `0 4px 20px ${cfg.color}40` }}
              onClick={() => navigate(cfg.href)}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-[24px]">group_add</span>
                <span className="font-semibold">Dépistage {cfg.label}</span>
              </div>
              <p className="font-mono text-3xl font-bold">{stats.total ?? 0}</p>
              <p className="text-white/70 text-xs mt-1">{stats.screened ?? 0} dépistés · {stats.abnormal ?? 0} anormaux</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthAgentDashboard;