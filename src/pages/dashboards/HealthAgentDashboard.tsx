import React from 'react';
import { useQuery } from 'react-query';
import { analyticsService } from '../../services/analyticsService.ts';
import { DashboardStats } from '../../types/analytics.ts';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import RecentPatients from '../../components/RecentPatients.tsx';
import RecentAlerts from '../../components/RecentAlerts.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import {
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const HealthAgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading } = useQuery<DashboardStats>(
    'health-agent-dashboard',
    () => analyticsService.getDashboardData()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f2fbff]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2fbff] font-jakarta animate-fade-in">
      {/* Welcome Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl text-[#091e25] mb-1">
            Bonjour, {user?.first_name || 'Agent'} 👋
          </h1>
          <p className="text-[#3e4949] flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-[#006669]" />
            Poste de santé de {user?.region || 'Pikine'} · Dakar
          </p>
        </div>
        <button className="bg-[#006669] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#006669]/20 flex items-center gap-2 hover:bg-[#2a7f82] transition-all active:scale-95">
          <PlusIcon className="h-5 w-5" />
          Nouveau Dépistage
        </button>
      </header>

      {/* KPI Row - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bento-card border-l-4 border-[#006669]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#3e4949] font-semibold">Patientes suivies</span>
            <div className="p-2 bg-[#006669]/10 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-[#006669]" />
            </div>
          </div>
          <div className="font-headline text-4xl text-[#091e25]">
            {dashboardData?.active_patients || 0}
          </div>
          <div className="mt-2 text-xs text-[#006669] font-bold flex items-center gap-1">
            <ArrowTrendingUpIcon className="h-3 w-3" /> +12% ce mois
          </div>
        </div>

        <div className="bento-card border-l-4 border-[#2a7f82]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#3e4949] font-semibold">Dépistages (Mois)</span>
            <div className="p-2 bg-[#2a7f82]/10 rounded-lg">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-[#2a7f82]" />
            </div>
          </div>
          <div className="font-headline text-4xl text-[#091e25]">
            {dashboardData?.monthly_screenings || 0}
          </div>
          <div className="mt-2 text-xs text-[#3e4949]">
            Objectif mensuel: 100
          </div>
        </div>

        <div className="bento-card border-l-4 border-[#9a4523]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#3e4949] font-semibold">Alertes critiques</span>
            <div className="p-2 bg-[#9a4523]/10 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-[#9a4523]" />
            </div>
          </div>
          <div className="font-headline text-4xl text-[#9a4523]">
            {dashboardData?.pending_alerts || 0}
          </div>
          <div className="mt-2 text-xs text-[#9a4523] font-bold flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3 w-3" /> Action requise immédiate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments Section */}
        <section className="lg:col-span-8">
          <div className="bento-card h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-xl text-[#091e25]">Rendez-vous du jour</h2>
              <button className="text-[#006669] font-semibold hover:underline">Voir tout</button>
            </div>
            <RecentPatients 
              patients={dashboardData?.recent_patients || []} 
              showActions={true}
            />
          </div>
        </section>

        {/* Sidebar Alerts & Area */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bento-card">
            <h2 className="font-headline text-xl text-[#091e25] mb-4">Alertes de zone</h2>
            <RecentAlerts alerts={dashboardData?.recent_alerts || []} />
          </div>

          <div className="bento-card relative overflow-hidden h-64 p-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT-E3AfHm9qRM4DgcEPFtXd_Bbv5l40DNPEaHV9o3YIiz1QWw3V6nvfnyswycm14huBvpR1xp2-j2fuJxETHOqAP2z0Tf74MXkeu9e7XlbP5iACzBP8Mq_tlkI2FCTTkb8LkCCbOri4Z3XG3EfDUNLQY8cY6xbPHWGrBuxvQp_aJNGsPc9PMYvsivqK8AJoN5hJ07RQe6ytlfGNYIMLOGmT2Nav-eci_weZstgL8gCAOpWY4TwTCt1fgaOIZD1CtkbWDSH7kOg4Wk" 
              alt="Dakar Map"
              className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-[#006669]/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#9a4523] animate-pulse"></div>
                <span className="font-semibold text-sm text-[#091e25]">Zones critiques identifiées</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Pending Actions Footer Card */}
      {dashboardData?.pending_actions && dashboardData.pending_actions.length > 0 && (
        <div className="mt-8 bento-card bg-[#ffdad6]/30 border border-[#ba1a1a]/10">
          <h3 className="font-headline text-lg text-[#ba1a1a] mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            Actions prioritaires en attente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.pending_actions.map((action) => (
              <div key={action.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group hover:border-[#006669] border border-transparent transition-all">
                <div>
                  <p className="font-semibold text-[#091e25]">{action.title}</p>
                  <p className="text-sm text-[#3e4949]">{action.description}</p>
                </div>
                <button className="bg-[#006669] text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all">
                  Traiter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthAgentDashboard;