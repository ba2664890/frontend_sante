// src/pages/dashboards/AdminDashboard.tsx — Refonte Multi-Cancer avec isolation structurelle
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService.ts';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import Chart from '../../components/Chart.tsx';
import SenegalMap from '../../components/SenegalMap.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import screeningService from '../../services/screeningService.ts';

type CancerModule = 'col' | 'sein' | 'prostate';

const CANCER_LABELS: Record<CancerModule, { label: string; color: string; bg: string; icon: string }> = {
  col: { label: "Col de l'utérus", color: '#9013fe', bg: '#9013fe1a', icon: 'biotech' },
  sein: { label: 'Cancer du Sein', color: '#e02020', bg: '#e020201a', icon: 'cardiology' },
  prostate: { label: 'Prostate', color: '#006669', bg: '#0066691a', icon: 'male' },
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCancer, setActiveCancer] = useState<CancerModule>('col');
  const [structureFilter, setStructureFilter] = useState<{ type: 'campaign' | 'center' | null; id?: number | null }>({ type: null });

  const isGlobalAdmin = user?.role === 'global_admin' || user?.role === 'admin';

  // Sélecteurs de structure (global admin uniquement)
  const { data: campaignsRes } = useQuery(
    'all-campaigns',
    () => screeningService.getCampaigns({}, 1),
    { enabled: isGlobalAdmin, retry: false }
  );
  const { data: centersRes } = useQuery(
    'all-centers',
    () => screeningService.getHealthCenters({}, 1),
    { enabled: isGlobalAdmin, retry: false }
  );

  // Query params selon la structure sélectionnée
  const queryKey = ['dashboard-data-admin', structureFilter];
  const { data: dashboardData, isLoading, error } = useQuery(
    queryKey,
    () => {
      if (structureFilter.type === 'campaign' && structureFilter.id) {
        return analyticsService.getDashboardData({ campaign_id: structureFilter.id });
      }
      if (structureFilter.type === 'center' && structureFilter.id) {
        return analyticsService.getDashboardData({ health_center_id: structureFilter.id });
      }
      return analyticsService.getDashboardData();
    },
    { refetchInterval: 60000, retry: false }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const data = dashboardData || {};
  const cancerStats = data.cancer_stats || {};
  const activeCancerData = cancerStats[activeCancer] || {};
  const { label: cLabel, color: cColor, bg: cBg, icon: cIcon } = CANCER_LABELS[activeCancer];

  const campaigns = campaignsRes?.results || [];
  const centers = centersRes?.results || [];

  // Tendance mensuelle formatée pour Chart
  const trendData = (data.screening_trend || []).map((t: any) => ({
    month: t.label || t.month,
    col: t.col || 0,
    sein: t.sein || 0,
    prostate: t.prostate || 0,
  }));

  // Données par région pour le cancer actif
  const regionDetailData = Object.entries(data.patients_by_region_detail || {}).map(
    ([region, vals]: [string, any]) => ({
      region,
      col: vals.col || 0,
      sein: vals.sein || 0,
      prostate: vals.prostate || 0,
      total: vals.total || 0,
    })
  );

  const oms = data.oms_90_70_90 || {};

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ——— Entête & Contexte Structurel ——— */}
      <div className="bg-[#006669] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-[#006669]/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-white/70">monitoring</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">Depisteel — Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-2" style={{ fontFamily: 'Literata, serif' }}>
              {data.structure_context ? `Structure : ${data.structure_context.name}` : 'Vue Globale'}
            </h1>
            <p className="text-white/70 text-base">
              {isGlobalAdmin && !data.structure_context
                ? 'Données agrégées de toutes les campagnes et centres de santé'
                : data.structure_context?.type === 'campaign'
                ? 'Campagne de dépistage mobile / caravane'
                : 'Centre de santé fixe'}
            </p>
          </div>

          {/* Filtres de structure — global admin uniquement */}
          {isGlobalAdmin && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Campagne</label>
                <select
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  value={structureFilter.type === 'campaign' ? String(structureFilter.id) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setStructureFilter({ type: 'campaign', id: Number(e.target.value) });
                    } else {
                      setStructureFilter({ type: null });
                    }
                  }}
                >
                  <option value="">-- Toutes les campagnes --</option>
                  {campaigns.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Centre</label>
                <select
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  value={structureFilter.type === 'center' ? String(structureFilter.id) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setStructureFilter({ type: 'center', id: Number(e.target.value) });
                    } else {
                      setStructureFilter({ type: null });
                    }
                  }}
                >
                  <option value="">-- Tous les centres --</option>
                  {centers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ——— OMS 90-70-90 ——— */}
      <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
        <h2 className="text-sm font-bold text-[#3e4949] uppercase tracking-widest mb-4">
          Performance Objectifs OMS (90-70-90) — Col de l'utérus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Dépistage', pct: oms.screened_percentage || 0, color: '#006669', bg: '#dcf1fb' },
            { label: 'Traitement immédiat', pct: oms.treated_percentage || 0, color: '#9a4523', bg: '#ffdbcf' },
            { label: 'Suivi / Conformité', pct: oms.suppressed_percentage || 0, color: '#795500', bg: '#ffdeaa' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[#091e25]">{item.label} <span className="text-xs text-[#3e4949]">(objectif 90%)</span></span>
                <span className="font-mono text-sm font-bold" style={{ color: item.color }}>{item.pct.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: item.bg }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(item.pct, 100)}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ——— Sélecteur Cancer ——— */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(CANCER_LABELS) as CancerModule[]).map((c) => {
          const info = CANCER_LABELS[c];
          const active = activeCancer === c;
          return (
            <button
              key={c}
              onClick={() => setActiveCancer(c)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                active
                  ? 'text-white shadow-md'
                  : 'bg-white text-[#3e4949] border-[#bec9c9]/30 hover:border-current'
              }`}
              style={active ? { background: info.color, borderColor: info.color } : { borderColor: '#bec9c9' }}
            >
              <span className="material-symbols-outlined text-[18px]">{info.icon}</span>
              {info.label}
              <span
                className="ml-1 font-mono text-[11px] px-1.5 py-0.5 rounded-full"
                style={active ? { background: 'rgba(255,255,255,0.2)' } : { background: info.bg, color: info.color }}
              >
                {cancerStats[c]?.total ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ——— KPIs du cancer actif ——— */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total enregistrés', value: activeCancerData.total ?? 0, icon: 'group', suffix: '' },
          { label: 'Dépistages réalisés', value: activeCancerData.screened ?? 0, icon: 'biotech', suffix: '' },
          { label: 'Cas anormaux', value: activeCancerData.abnormal ?? 0, icon: 'warning', suffix: '' },
          { label: 'Taux de couverture', value: activeCancerData.coverage_rate ?? 0, icon: 'monitoring', suffix: '%' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl p-5 border-l-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            style={{ borderLeftColor: cColor }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#3e4949]">{kpi.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cBg }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: cColor }}>{kpi.icon}</span>
              </div>
            </div>
            <div className="font-mono text-3xl font-bold text-[#091e25]">
              {kpi.value.toLocaleString()}{kpi.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* ——— Graphiques ——— */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tendance mensuelle multi-cancer */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
              Évolution des dépistages (6 mois)
            </h3>
            <span className="material-symbols-outlined text-[#bec9c9]">show_chart</span>
          </div>
          {trendData.length > 0 ? (
            <Chart
              type="line"
              data={trendData}
              xKey="month"
              yKeys={['col', 'sein', 'prostate']}
              colors={['#9013fe', '#e02020', '#006669']}
              height={220}
            />
          ) : (
            <div className="flex items-center justify-center h-52 text-[#bec9c9] text-sm">Aucune donnée</div>
          )}
        </div>

        {/* Répartition par âge du cancer actif */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
              Répartition par âge — {cLabel}
            </h3>
            <span className="material-symbols-outlined text-[#bec9c9]">pie_chart</span>
          </div>
          {Object.keys(activeCancerData.age_distribution || {}).length > 0 ? (
            <Chart
              type="pie"
              data={Object.entries(activeCancerData.age_distribution || {}).map(([name, value]) => ({ name, value }))}
              colors={['#006669', '#2a7f82', '#9a4523', '#795500', '#9013fe', '#e02020']}
              height={220}
            />
          ) : (
            <div className="flex items-center justify-center h-52 text-[#bec9c9] text-sm">Aucune donnée</div>
          )}
        </div>

        {/* Carte Sénégal */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
              Carte des dépistages — {cLabel}
            </h3>
            <span className="material-symbols-outlined text-[#bec9c9]">map</span>
          </div>
          <SenegalMap data={data.patients_by_region || {}} height={220} />
        </div>

        {/* Comparatif régional */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
              Comparatif régional par cancer
            </h3>
            <span className="material-symbols-outlined text-[#bec9c9]">bar_chart</span>
          </div>
          {regionDetailData.length > 0 ? (
            <Chart
              type="bar"
              data={regionDetailData}
              xKey="region"
              yKeys={['col', 'sein', 'prostate']}
              colors={['#9013fe', '#e02020', '#006669']}
              height={220}
            />
          ) : (
            <div className="flex items-center justify-center h-52 text-[#bec9c9] text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* ——— Tableau régional ——— */}
      <div className="bg-white rounded-2xl border border-[#bec9c9]/10 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#bec9c9]/10">
          <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
            Détail par région — {cLabel}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#bec9c9]/10 bg-[#f2fbff]">
                <th className="text-left text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Région</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Col</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Sein</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Prostate</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {regionDetailData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#3e4949] text-sm italic">
                    Aucune donnée régionale disponible
                  </td>
                </tr>
              ) : (
                regionDetailData.map((row) => (
                  <tr key={row.region} className="border-b border-[#bec9c9]/10 hover:bg-[#f2fbff] transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#091e25]">{row.region}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-[#9013fe]">{row.col}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-[#e02020]">{row.sein}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-[#006669]">{row.prostate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-xs font-bold text-[#006669] bg-[#dcf1fb] px-2 py-1 rounded-full">
                        {row.total}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ——— Alertes et patients récents ——— */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <h3 className="font-semibold text-[#091e25] mb-4" style={{ fontFamily: 'Literata, serif' }}>
            Alertes récentes
          </h3>
          <div className="space-y-3">
            {(data.recent_alerts || []).length === 0 ? (
              <p className="text-[#3e4949] text-sm italic text-center py-6">Aucune alerte active</p>
            ) : (
              (data.recent_alerts || []).slice(0, 4).map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#ffdeaa]/50 border border-[#795500]/10">
                  <span className="material-symbols-outlined text-[#795500] text-[20px] flex-shrink-0">warning</span>
                  <div>
                    <p className="font-semibold text-[#091e25] text-sm">{alert.title}</p>
                    <p className="text-[#3e4949] text-xs mt-0.5 line-clamp-2">{alert.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
              Patients récents — Col
            </h3>
            <button onClick={() => navigate('/patients')} className="text-sm text-[#006669] font-semibold hover:underline">
              Voir tout →
            </button>
          </div>
          <div className="space-y-2">
            {(data.recent_patients || []).length === 0 ? (
              <p className="text-[#3e4949] text-sm italic text-center py-6">Aucun patient récent</p>
            ) : (
              (data.recent_patients || []).slice(0, 4).map((p: any) => (
                <div
                  key={p.record_id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f2fbff] cursor-pointer transition-colors"
                  onClick={() => navigate(`/patients/${p.record_id}`)}
                >
                  <div className="w-9 h-9 rounded-full bg-[#dcf1fb] flex items-center justify-center text-[#006669] font-bold text-sm flex-shrink-0">
                    {p.full_name?.[0] || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#091e25] text-sm truncate">{p.full_name}</p>
                    <p className="text-[10px] text-[#6f7979] font-mono">ID: {p.id_patient}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#bec9c9] text-[16px]">chevron_right</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;