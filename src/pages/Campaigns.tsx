// src/pages/Campaigns.tsx — Design "Clinical Precision" Bento
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { analyticsService } from '../services/analyticsService.ts';
import { Campaign } from '../types/analytics.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>();

  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const { data: campaigns, isLoading, error } = useQuery(
    ['campaigns', filter],
    () => analyticsService.getCampaigns({ status: filter !== 'all' ? filter : undefined }),
    { 
      refetchInterval: 30000,
      retry: false
    }
  );

  const deleteMutation = useMutation(
    (id: number) => analyticsService.deleteCampaign(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
        toast.success('Campagne supprimée');
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    }
  );

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl p-12 text-center border border-[#bec9c9]/10 shadow-sm">
        <div className="w-20 h-20 bg-[#ffdeaa] text-[#795500] rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl">visibility_off</span>
        </div>
        <h2 className="text-2xl font-bold text-[#091e25] mb-2" style={{ fontFamily: 'Literata, serif' }}>Campagnes Restreintes</h2>
        <p className="text-[#6f7979] max-w-md">Vous n'avez pas la permission de consulter les campagnes globales ou aucune campagne n'est affectée à votre zone.</p>
      </div>
    );
  }

  const campaignsList = Array.isArray(campaigns) ? campaigns : campaigns?.results || [];

  const stats = {
    total: campaignsList.length,
    active: campaignsList.filter((c: Campaign) => c.status === 'active').length,
    screened: campaignsList.reduce((sum: number, c: Campaign) => sum + (c.actual_screenings || 0), 0),
    target: campaignsList.reduce((sum: number, c: Campaign) => sum + (c.target_population || 0), 0),
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in">
      {/* Hero Section Bento */}
      <div className="bg-[#006669] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-[#006669]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-white/80">campaign</span>
              <span className="text-sm font-bold uppercase tracking-widest text-white/80">CerviCare+ Missions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-4" style={{ fontFamily: 'Literata, serif' }}>
              Campagnes de Dépistage Régional
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Planifiez et suivez l'impact des campagnes de sensibilisation et de dépistage à travers toutes les régions du Sénégal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-xs font-bold text-white/60 uppercase tracking-tighter mb-1">Missions</p>
              <p className="text-3xl font-mono font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-xs font-bold text-white/60 uppercase tracking-tighter mb-1">Actives</p>
              <p className="text-3xl font-mono font-bold">{stats.active}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-xs font-bold text-white/60 uppercase tracking-tighter mb-1">Dépistées</p>
              <p className="text-3xl font-mono font-bold">{stats.screened}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-xs font-bold text-white/60 uppercase tracking-tighter mb-1">Objectif</p>
              <p className="text-3xl font-mono font-bold">{stats.target}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-[#bec9c9]/20 w-fit">
          {['all', 'active', 'planned', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f ? 'bg-[#006669] text-white shadow-md' : 'text-[#3e4949] hover:bg-[#dcf1fb]'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : f === 'planned' ? 'Planifiées' : 'Terminées'}
            </button>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={() => { setSelectedCampaign(undefined); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-[#9a4523] text-white rounded-xl font-bold shadow-lg shadow-[#9a4523]/20 hover:bg-[#7b2e0d] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nouvelle campagne
          </button>
        )}
      </div>

      {/* Grid Bento */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {campaignsList.map((campaign: Campaign) => {
            const progress = campaign.target_population > 0 
              ? Math.round(((campaign.actual_screenings || 0) / campaign.target_population) * 100) 
              : 0;
            
            return (
              <div key={campaign.id} className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-[0_2px_12px_rgba(42,127,130,0.06)] flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        campaign.status === 'active' ? 'bg-[#dcf1fb] text-[#006669]' : 'bg-[#bec9c9]/20 text-[#3e4949]'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#091e25] leading-tight group-hover:text-[#006669] transition-colors">{campaign.name}</h3>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedCampaign(campaign); setShowModal(true); }} className="p-2 hover:bg-[#dcf1fb] rounded-full text-[#006669]">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => { if(window.confirm('Supprimer ?')) deleteMutation.mutate(campaign.id); }} className="p-2 hover:bg-[#ffdad6] rounded-full text-[#ba1a1a]">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-[#3e4949] line-clamp-2 mb-6 h-10">{campaign.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
                    <p className="text-[9px] font-bold text-[#6f7979] uppercase mb-1">PÉRIODE</p>
                    <p className="text-xs font-bold text-[#091e25]">{format(parseISO(campaign.start_date), 'dd MMM', { locale: fr })} - {format(parseISO(campaign.end_date), 'dd MMM', { locale: fr })}</p>
                  </div>
                  <div className="p-3 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
                    <p className="text-[9px] font-bold text-[#6f7979] uppercase mb-1">RÉGION</p>
                    <p className="text-xs font-bold text-[#091e25]">{campaign.region}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-[#3e4949]">{campaign.actual_screenings || 0} / {campaign.target_population} patientes</span>
                    <span className="font-mono text-sm font-bold text-[#006669]">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#f2fbff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#006669] rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'} size="xl">
        {/* Formulaire simplifié ici ou composant dédié */}
        <div className="p-4 text-center italic text-[#3e4949]">Formulaire de campagne en cours d'adaptation...</div>
      </Modal>
    </div>
  );
};

export default Campaigns;