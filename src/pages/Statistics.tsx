// src/pages/Statistics.tsx — Refonte Multi-Cancer avec isolation structurelle
import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { analyticsService } from '../services/analyticsService.ts';
import screeningService from '../services/screeningService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Chart from '../components/Chart.tsx';
import SenegalMap from '../components/SenegalMap.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

type CancerModule = 'col' | 'sein' | 'prostate';
type PeriodFilter = '1m' | '3m' | '6m' | '1y';

const CANCER_CONFIG: Record<CancerModule, {
  label: string; fullLabel: string; color: string; bg: string;
  gradient: string; icon: string;
}> = {
  col: {
    label: 'Col', fullLabel: "Col de l'utérus",
    color: '#9013fe', bg: '#9013fe12',
    gradient: 'linear-gradient(135deg, #9013fe, #bd65ff)',
    icon: 'biotech',
  },
  sein: {
    label: 'Sein', fullLabel: 'Cancer du Sein',
    color: '#e02020', bg: '#e0202012',
    gradient: 'linear-gradient(135deg, #e02020, #ff6060)',
    icon: 'cardiology',
  },
  prostate: {
    label: 'Prostate', fullLabel: 'Cancer de la Prostate',
    color: '#006669', bg: '#00666912',
    gradient: 'linear-gradient(135deg, #006669, #2a7f82)',
    icon: 'male',
  },
};

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  '1m': '30 jours', '3m': '3 mois', '6m': '6 mois', '1y': '12 mois',
};

interface CancerStatCardProps {
  type: CancerModule;
  active: boolean;
  stats: any;
  onClick: () => void;
}

const CancerStatCard: React.FC<CancerStatCardProps> = ({ type, active, stats, onClick }) => {
  const cfg = CANCER_CONFIG[type];
  const coverage = stats?.coverage_rate ?? 0;

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl p-5 border-2 transition-all duration-300 ${
        active ? 'border-transparent shadow-xl scale-[1.02]' : 'border-transparent bg-white hover:border-current hover:shadow-md'
      }`}
      style={active ? { background: cfg.gradient, borderColor: 'transparent' } : { borderColor: `${cfg.color}30` }}
    >
      <div className={`flex items-center justify-between mb-4 ${active ? 'text-white' : ''}`}>
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={active ? { background: 'rgba(255,255,255,0.2)' } : { background: cfg.bg }}
          >
            <span className="material-symbols-outlined text-[18px]" style={active ? { color: 'white' } : { color: cfg.color }}>
              {cfg.icon}
            </span>
          </div>
          <span className={`text-sm font-bold ${active ? 'text-white' : 'text-[#3e4949]'}`}>{cfg.fullLabel}</span>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
          active ? 'bg-white/20 text-white' : ''
        }`} style={active ? {} : { background: cfg.bg, color: cfg.color }}>
          {stats?.total ?? 0}
        </span>
      </div>

      <div className={`font-mono text-4xl font-bold mb-1 ${active ? 'text-white' : 'text-[#091e25]'}`}>
        {coverage.toFixed(1)}<span className="text-2xl">%</span>
      </div>
      <div className={`text-xs mb-3 ${active ? 'text-white/70' : 'text-[#3e4949]'}`}>Taux de couverture</div>

      <div className={`w-full h-1.5 rounded-full overflow-hidden ${active ? 'bg-white/20' : ''}`}
        style={active ? {} : { background: cfg.bg }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(coverage, 100)}%`,
            background: active ? 'white' : cfg.color,
          }}
        />
      </div>
      <div className={`flex justify-between text-[10px] mt-2 ${active ? 'text-white/70' : 'text-[#6f7979]'}`}>
        <span>{stats?.screened ?? 0} dépistés</span>
        <span className={`font-semibold ${active ? 'text-white' : ''}`} style={active ? {} : { color: cfg.color }}>
          {stats?.abnormal ?? 0} anormaux
        </span>
      </div>
    </button>
  );
};

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [activeCancer, setActiveCancer] = useState<CancerModule>('col');
  const [period, setPeriod] = useState<PeriodFilter>('6m');
  const [structureFilter, setStructureFilter] = useState<{
    type: 'campaign' | 'center' | null; id?: number | null;
  }>({ type: null });

  const isGlobalAdmin = user?.role === 'global_admin' || user?.role === 'admin';

  const { data: campaignsRes } = useQuery(
    'stats-campaigns',
    () => screeningService.getCampaigns({}, 1),
    { enabled: isGlobalAdmin, retry: false }
  );
  const { data: centersRes } = useQuery(
    'stats-centers',
    () => screeningService.getHealthCenters({}, 1),
    { enabled: isGlobalAdmin, retry: false }
  );

  const queryKey = ['dashboard-stats', structureFilter, period];
  const { data: dashboardData, isLoading, isError } = useQuery(
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
    { refetchInterval: 120_000, retry: false }
  );

  const cancerStats = dashboardData?.cancer_stats || {} as any;
  const activeCancerData = cancerStats[activeCancer] || {};
  const cfg = CANCER_CONFIG[activeCancer];

  // Tendance mensuelle
  const trendData = useMemo(() => {
    const raw: any[] = dashboardData?.screening_trend || [];
    const limit = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
    return raw.slice(-limit);
  }, [dashboardData?.screening_trend, period]);

  // Données régionales du cancer actif
  const regionData = useMemo(() => {
    const detail = dashboardData?.patients_by_region_detail || {};
    return Object.entries(detail)
      .map(([region, vals]: [string, any]) => ({
        region,
        col: vals.col || 0,
        sein: vals.sein || 0,
        prostate: vals.prostate || 0,
        active: vals[activeCancer] || 0,
      }))
      .sort((a, b) => b.active - a.active);
  }, [dashboardData?.patients_by_region_detail, activeCancer]);

  // Ages du cancer actif
  const ageDist = useMemo(() => {
    const ages = activeCancerData.age_distribution || {};
    return Object.entries(ages).map(([name, value]) => ({ name, value }));
  }, [activeCancerData.age_distribution]);

  // Tendance du cancer actif
  const cancerTrend = useMemo(() => {
    return (activeCancerData.trend || []).map((t: any) => ({
      month: t.label || t.month,
      Dépistages: t.total || 0,
      Anormaux: t.abnormal || 0,
    }));
  }, [activeCancerData.trend]);

  const campaigns = campaignsRes?.results || [];
  const centers = centersRes?.results || [];
  const oms = dashboardData?.oms_90_70_90 || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ——— Header ——— */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#006669] text-[20px]">analytics</span>
            <span className="text-xs font-bold text-[#3e4949] uppercase tracking-widest">Statistiques Depisteel</span>
          </div>
          <h1
            className="text-[36px] leading-[44px] font-semibold tracking-tight text-[#091e25]"
            style={{ fontFamily: 'Literata, serif' }}
          >
            {dashboardData?.structure_context
              ? dashboardData.structure_context.name
              : 'Statistiques Nationales'}
          </h1>
          <p className="text-[#3e4949] text-sm mt-1">
            {dashboardData?.structure_context
              ? dashboardData.structure_context.type === 'campaign'
                ? 'Données de la campagne de dépistage'
                : 'Données du centre de santé'
              : 'Données agrégées · Col · Sein · Prostate'}
          </p>
        </div>

        {/* Contrôles */}
        <div className="flex flex-wrap gap-3">
          {/* Filtre période */}
          <div className="flex bg-white border border-[#bec9c9]/20 rounded-xl p-1 shadow-sm">
            {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-[#006669] text-white shadow-sm'
                    : 'text-[#3e4949] hover:text-[#006669]'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          {/* Filtres de structure — global admin uniquement */}
          {isGlobalAdmin && (
            <>
              <select
                className="bg-white border border-[#bec9c9]/20 rounded-xl px-4 py-2 text-sm font-semibold text-[#091e25] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006669]/20"
                value={structureFilter.type === 'campaign' ? String(structureFilter.id) : ''}
                onChange={(e) => {
                  setStructureFilter(e.target.value
                    ? { type: 'campaign', id: Number(e.target.value) }
                    : { type: null }
                  );
                }}
              >
                <option value="">Toutes campagnes</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="bg-white border border-[#bec9c9]/20 rounded-xl px-4 py-2 text-sm font-semibold text-[#091e25] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006669]/20"
                value={structureFilter.type === 'center' ? String(structureFilter.id) : ''}
                onChange={(e) => {
                  setStructureFilter(e.target.value
                    ? { type: 'center', id: Number(e.target.value) }
                    : { type: null }
                  );
                }}
              >
                <option value="">Tous les centres</option>
                {centers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* ——— Cartes cancer — sélecteur ——— */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(CANCER_CONFIG) as CancerModule[]).map((c) => (
          <CancerStatCard
            key={c}
            type={c}
            active={activeCancer === c}
            stats={cancerStats[c]}
            onClick={() => setActiveCancer(c)}
          />
        ))}
      </div>

      {/* ——— KPIs totaux ——— */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total patients',
            value: (dashboardData?.total_patients || 0).toLocaleString(),
            icon: 'group',
            color: '#006669',
            bg: '#dcf1fb',
            sub: 'Toutes pathologies',
          },
          {
            label: 'Total dépistages',
            value: (dashboardData?.total_screened || 0).toLocaleString(),
            icon: 'biotech',
            color: '#006669',
            bg: '#dcf1fb',
            sub: `${(dashboardData?.coverage_rate || 0).toFixed(1)}% couverture globale`,
          },
          {
            label: 'Résultats anormaux',
            value: (dashboardData?.abnormal_results || 0).toLocaleString(),
            icon: 'warning',
            color: '#9a4523',
            bg: '#ffdbcf',
            sub: 'Nécessitent un suivi',
          },
          {
            label: 'Suivis en attente',
            value: (dashboardData?.pending_followups || 0).toLocaleString(),
            icon: 'schedule',
            color: '#795500',
            bg: '#ffdeaa',
            sub: `${(dashboardData?.follow_up_rate || 0).toFixed(1)}% conformité`,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#bec9c9]/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#3e4949]">{kpi.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
            </div>
            <div className="font-mono text-3xl font-bold text-[#091e25] mb-1">{kpi.value}</div>
            <p className="text-[11px] text-[#6f7979]">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ——— Tendances ——— */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tendance multi-cancer globale */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#091e25] text-base" style={{ fontFamily: 'Literata, serif' }}>
                Évolution mensuelle
              </h3>
              <p className="text-xs text-[#3e4949]">Dépistages par type de cancer — {PERIOD_LABELS[period]}</p>
            </div>
            <div className="flex items-center gap-3">
              {(Object.keys(CANCER_CONFIG) as CancerModule[]).map((c) => (
                <div key={c} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CANCER_CONFIG[c].color }} />
                  <span className="text-[10px] text-[#3e4949]">{CANCER_CONFIG[c].label}</span>
                </div>
              ))}
            </div>
          </div>
          {trendData.length > 0 ? (
            <Chart
              type="line"
              data={trendData}
              xKey="month"
              yKeys={['col', 'sein', 'prostate']}
              colors={['#9013fe', '#e02020', '#006669']}
              height={240}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-[#bec9c9] gap-2">
              <span className="material-symbols-outlined text-4xl">show_chart</span>
              <span className="text-sm">Aucune donnée de tendance</span>
            </div>
          )}
        </div>

        {/* Tendance spécifique au cancer actif */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#091e25] text-base" style={{ fontFamily: 'Literata, serif' }}>
                Détail — {cfg.fullLabel}
              </h3>
              <p className="text-xs text-[#3e4949]">Dépistages vs cas anormaux</p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: cfg.color }}
            >
              {activeCancerData.coverage_rate?.toFixed(1)}% couverture
            </div>
          </div>
          {cancerTrend.length > 0 ? (
            <Chart
              type="bar"
              data={cancerTrend}
              xKey="month"
              yKeys={['Dépistages', 'Anormaux']}
              colors={[cfg.color, '#9a4523']}
              height={240}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-[#bec9c9] gap-2">
              <span className="material-symbols-outlined text-4xl">bar_chart</span>
              <span className="text-sm">Aucune donnée disponible</span>
            </div>
          )}
        </div>
      </div>

      {/* ——— Carte + Âges ——— */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Carte Sénégal */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#091e25] text-base" style={{ fontFamily: 'Literata, serif' }}>
                Carte nationale — {cfg.fullLabel}
              </h3>
              <p className="text-xs text-[#3e4949]">Distribution géographique des dépistages</p>
            </div>
          </div>
          <SenegalMap
            data={
              Object.fromEntries(
                Object.entries(dashboardData?.patients_by_region_detail || {}).map(
                  ([region, vals]: [string, any]) => [region, vals[activeCancer] || 0]
                )
              )
            }
            height={300}
          />
        </div>

        {/* Pyramide des âges */}
        <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#091e25] text-base" style={{ fontFamily: 'Literata, serif' }}>
                Tranches d'âge — {cfg.label}
              </h3>
              <p className="text-xs text-[#3e4949]">Répartition des patients par âge</p>
            </div>
          </div>
          {ageDist.length > 0 ? (
            <div className="space-y-3">
              {ageDist.map((d: any) => {
                const total = ageDist.reduce((s: number, x: any) => s + (Number(x.value) || 0), 0);
                const pct = total > 0 ? Math.round(((d.value as number) / total) * 100) : 0;
                return (
                  <div key={d.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-[#091e25]">{d.name} ans</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#3e4949]">{d.value as number}</span>
                        <span className="font-mono text-xs font-bold w-10 text-right" style={{ color: cfg.color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: cfg.bg }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-[#bec9c9] gap-2">
              <span className="material-symbols-outlined text-4xl">person</span>
              <span className="text-sm">Données d'âge non disponibles</span>
            </div>
          )}
        </div>
      </div>

      {/* ——— OMS 90-70-90 ——— */}
      <div className="bg-white rounded-2xl p-6 border border-[#bec9c9]/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#006669]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#006669]">verified</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#091e25] text-base" style={{ fontFamily: 'Literata, serif' }}>
              Objectifs OMS 90-70-90 — Col de l'utérus
            </h3>
            <p className="text-xs text-[#3e4949]">Performance par rapport aux cibles mondiales MSAS</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              number: '90%', label: 'Dépistage',
              desc: "90% des femmes de 30-49 ans ont été dépistées",
              pct: oms.screened_percentage || 0,
              color: '#006669', bg: '#dcf1fb',
            },
            {
              number: '70%', label: 'Traitement immédiat',
              desc: "70% des femmes avec résultat positif traitées immédiatement",
              pct: oms.treated_percentage || 0,
              color: '#9a4523', bg: '#ffdbcf',
            },
            {
              number: '90%', label: 'Suivi & Conformité',
              desc: "90% des patientes avec suivi régulier post-dépistage",
              pct: oms.suppressed_percentage || 0,
              color: '#795500', bg: '#ffdeaa',
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                style={{ background: item.bg }}
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={item.color} strokeWidth="2.5"
                    strokeDasharray={`${Math.min(item.pct, 100)} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-mono text-xl font-bold" style={{ color: item.color }}>
                  {item.pct.toFixed(0)}%
                </span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: item.color }}>
                Objectif {item.number}
              </div>
              <div className="font-semibold text-sm text-[#091e25] mb-1">{item.label}</div>
              <p className="text-xs text-[#6f7979] leading-relaxed">{item.desc}</p>
              <div className="mt-2 text-xs font-bold" style={{
                color: item.pct >= parseFloat(item.number) ? '#006669' : '#9a4523'
              }}>
                {item.pct >= parseFloat(item.number) ? '✓ Objectif atteint' : `${(parseFloat(item.number) - item.pct).toFixed(1)}% à atteindre`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ——— Tableau régional ——— */}
      <div className="bg-white rounded-2xl border border-[#bec9c9]/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#bec9c9]/10 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#091e25] text-base" style={{ fontFamily: 'Literata, serif' }}>
              Répartition régionale détaillée
            </h3>
            <p className="text-xs text-[#3e4949]">Dépistages par région et par type de cancer</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#bec9c9]/10 bg-[#f2fbff]">
                <th className="text-left text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Région</th>
                <th className="text-right text-[10px] font-bold text-[#9013fe] uppercase tracking-wider px-6 py-3">Col</th>
                <th className="text-right text-[10px] font-bold text-[#e02020] uppercase tracking-wider px-6 py-3">Sein</th>
                <th className="text-right text-[10px] font-bold text-[#006669] uppercase tracking-wider px-6 py-3">Prostate</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Total</th>
                <th className="text-right text-[10px] font-bold text-[#3e4949] uppercase tracking-wider px-6 py-3">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bec9c9]/10">
              {regionData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#3e4949] text-sm italic">
                    Aucune donnée régionale disponible
                  </td>
                </tr>
              ) : (
                regionData.map((row) => {
                  const grandTotal = regionData.reduce((s, r) => s + r.col + r.sein + r.prostate, 0);
                  const rowTotal = row.col + row.sein + row.prostate;
                  const pct = grandTotal > 0 ? Math.round((rowTotal / grandTotal) * 100) : 0;
                  return (
                    <tr key={row.region} className="hover:bg-[#f2fbff] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#091e25] text-sm">{row.region}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-[#9013fe]">{row.col}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-[#e02020]">{row.sein}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-[#006669]">{row.prostate}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-xs font-bold bg-[#dcf1fb] text-[#006669] px-2.5 py-1 rounded-full">
                          {rowTotal}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-[#dcf1fb] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#006669]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-[#3e4949] w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isError && (
        <div className="bg-[#ffdad6] border border-[#9a4523]/20 rounded-2xl p-6 flex items-center gap-4">
          <span className="material-symbols-outlined text-[#9a4523] text-3xl">error</span>
          <div>
            <p className="font-semibold text-[#091e25]">Erreur de chargement</p>
            <p className="text-sm text-[#3e4949]">Impossible de récupérer les données statistiques. Vérifiez la connexion au serveur.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
