// src/pages/Campaigns.tsx — Design "Clinical Precision" Bento
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import screeningService from '../services/screeningService.ts';
import { ScreeningCampaign, User } from '../types';
import { useAuth } from '../contexts/AuthContext.tsx';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';
import api from '../services/api.ts';

const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<ScreeningCampaign | undefined>();
  const [adminsList, setAdminsList] = useState<User[]>([]);

  const isGlobalAdmin = user?.role === 'global_admin' || user?.role === 'admin';

  // Charger la liste des administrateurs de campagne potentiels
  useEffect(() => {
    if (isGlobalAdmin) {
      api.get('/accounts/users/')
        .then((res) => {
          const users: User[] = res.data.results || res.data || [];
          const potential = users.filter((u) => u.role === 'campaign_admin' || u.role === 'health_agent' || u.role === 'global_admin');
          setAdminsList(potential);
        })
        .catch((err) => console.error('Erreur lors du chargement des admins', err));
    }
  }, [isGlobalAdmin]);

  const { data: campaignsRes, isLoading, error } = useQuery(
    ['campaigns', filter],
    () => screeningService.getCampaigns({ status: filter !== 'all' ? filter : undefined }),
    { 
      refetchInterval: 30000,
      retry: false
    }
  );

  const deleteMutation = useMutation(
    (id: number) => screeningService.deleteCampaign(id),
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

  const campaignsList = campaignsRes?.results || [];

  const stats = {
    total: campaignsList.length,
    active: campaignsList.filter((c: ScreeningCampaign) => c.status === 'active').length,
    screened: campaignsList.reduce((sum: number, c: ScreeningCampaign) => sum + (c.actual_screenings || 0), 0),
    target: campaignsList.reduce((sum: number, c: ScreeningCampaign) => sum + (c.target_population || 0), 0),
  };

  const formatCampaignDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in overflow-y-auto p-4">
      {/* Hero Section Bento */}
      <div className="bg-[#006669] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-[#006669]/20 flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-white/80">campaign</span>
              <span className="text-sm font-bold uppercase tracking-widest text-white/80">Depisteel Missions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-4" style={{ fontFamily: 'Literata, serif' }}>
              Campagnes de Dépistage
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Configurez, planifiez et suivez la couverture des campagnes mobiles et caravanes de dépistage multi-cancers à travers le Sénégal.
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
              <p className="text-xs font-bold text-white/60 uppercase tracking-tighter mb-1">Cible</p>
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

        {isGlobalAdmin && (
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
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {campaignsList.map((campaign: ScreeningCampaign) => {
            const progress = campaign.target_population && campaign.target_population > 0 
              ? Math.round(((campaign.actual_screenings || 0) / campaign.target_population) * 100) 
              : 0;
            
            return (
              <div key={campaign.id} className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-[0_2px_12px_rgba(42,127,130,0.06)] flex flex-col group justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
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
                    {isGlobalAdmin && (
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

                  <p className="text-sm text-[#3e4949] line-clamp-2 mb-4 h-10">{campaign.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
                      <p className="text-[9px] font-bold text-[#6f7979] uppercase mb-1">PÉRIODE</p>
                      <p className="text-xs font-bold text-[#091e25]">
                        {formatCampaignDate(campaign.start_date)} - {formatCampaignDate(campaign.end_date)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
                      <p className="text-[9px] font-bold text-[#6f7979] uppercase mb-1">ADMINISTRATEUR</p>
                      <p className="text-xs font-bold text-[#091e25] truncate">
                        {campaign.admin ? `${campaign.admin.first_name} ${campaign.admin.last_name}` : 'Non assigné'}
                      </p>
                    </div>
                  </div>

                  {/* Cancers couverts */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider mb-1.5">Cancers couverts</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.covers_col && (
                        <span className="text-[10px] font-semibold text-[#9013fe] bg-[#9013fe]/10 px-2 py-0.5 rounded">Col Utérin</span>
                      )}
                      {campaign.covers_sein && (
                        <span className="text-[10px] font-semibold text-[#e02020] bg-[#e02020]/10 px-2 py-0.5 rounded">Sein</span>
                      )}
                      {campaign.covers_prostate && (
                        <span className="text-[10px] font-semibold text-[#006669] bg-[#006669]/10 px-2 py-0.5 rounded">Prostate</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 pt-4 border-t border-[#bec9c9]/25">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-[#3e4949]">
                      Dépistages : {campaign.actual_screenings || 0} / {campaign.target_population || 0}
                    </span>
                    <span className="font-mono text-sm font-bold text-[#006669]">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f2fbff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#006669] rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedCampaign(undefined); }} title={selectedCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'} size="xl">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          
          const payload: any = {
            name: formData.get('name') as string,
            campaign_type: formData.get('campaign_type') as string,
            status: formData.get('status') as string,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            region: Number(formData.get('region')),
            district: formData.get('district') as string,
            location_details: formData.get('location_details') as string,
            target_population: Number(formData.get('target_population')),
            description: formData.get('description') as string,
            covers_col: formData.get('covers_col') === 'on',
            covers_sein: formData.get('covers_sein') === 'on',
            covers_prostate: formData.get('covers_prostate') === 'on',
            objectif_col: formData.get('objectif_col') ? Number(formData.get('objectif_col')) : null,
            objectif_sein: formData.get('objectif_sein') ? Number(formData.get('objectif_sein')) : null,
            objectif_prostate: formData.get('objectif_prostate') ? Number(formData.get('objectif_prostate')) : null,
          };

          const adminId = formData.get('admin_id');
          if (adminId) {
            payload.admin_id = Number(adminId);
          }

          try {
            if (selectedCampaign) {
              await screeningService.updateCampaign(selectedCampaign.id, payload);
              toast.success('Campagne mise à jour !');
            } else {
              await screeningService.createCampaign(payload);
              toast.success('Campagne créée !');
            }
            setShowModal(false);
            setSelectedCampaign(undefined);
            queryClient.invalidateQueries('campaigns');
          } catch (err: any) {
            toast.error(err.message || 'Erreur lors de l\'enregistrement');
          }
        }} className="space-y-6 p-2 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Nom de la campagne</label>
              <input name="name" defaultValue={selectedCampaign?.name} required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" placeholder="Ex: Mission Touba 2024" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Type de campagne</label>
              <select name="campaign_type" defaultValue={selectedCampaign?.campaign_type || 'outreach'} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20">
                <option value="routine">Dépistage de Routine</option>
                <option value="outreach">Campagne Mobile / Caravane</option>
                <option value="special">Campagne Spéciale</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Statut</label>
              <select name="status" defaultValue={selectedCampaign?.status || 'planned'} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20">
                <option value="planned">Planifiée</option>
                <option value="active">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            {isGlobalAdmin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#006669] uppercase">Administrateur de la campagne</label>
                <select name="admin_id" defaultValue={selectedCampaign?.admin?.id || ''} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20">
                  <option value="">-- Choisir un administrateur --</option>
                  {adminsList.map((u) => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Région</label>
              <select name="region" defaultValue={selectedCampaign?.region || 1} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20">
                <option value={1}>Dakar</option>
                <option value={13}>Thiès</option>
                <option value={10}>Saint-Louis</option>
                <option value={2}>Diourbel</option>
                <option value={5}>Kaolack</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">District Sanitaire</label>
              <input name="district" defaultValue={selectedCampaign?.district} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none" placeholder="Ex: Touba" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Date de début</label>
              <input type="date" name="start_date" defaultValue={selectedCampaign?.start_date} required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Date de fin</label>
              <input type="date" name="end_date" defaultValue={selectedCampaign?.end_date} required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Population cible totale</label>
              <input type="number" name="target_population" defaultValue={selectedCampaign?.target_population} required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none" placeholder="Ex: 500" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Détails localisation</label>
              <input name="location_details" defaultValue={selectedCampaign?.location_details} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none" placeholder="Ex: Place publique, Gare routière..." />
            </div>
          </div>

          <div className="p-4 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/20 space-y-4">
            <h3 className="text-sm font-bold text-[#006669]">Configuration des types de cancer et objectifs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 p-3 bg-white rounded-xl border border-[#bec9c9]/20">
                <label className="flex items-center gap-2 font-bold text-[#9013fe] text-xs">
                  <input type="checkbox" name="covers_col" defaultChecked={selectedCampaign?.covers_col ?? true} className="rounded" />
                  COL DE L'UTÉRUS
                </label>
                <input type="number" name="objectif_col" defaultValue={selectedCampaign?.objectif_col} className="w-full p-2 bg-[#f2fbff] border rounded-lg text-xs" placeholder="Objectif (ex: 200)" />
              </div>

              <div className="space-y-3 p-3 bg-white rounded-xl border border-[#bec9c9]/20">
                <label className="flex items-center gap-2 font-bold text-[#e02020] text-xs">
                  <input type="checkbox" name="covers_sein" defaultChecked={selectedCampaign?.covers_sein} className="rounded" />
                  SEIN
                </label>
                <input type="number" name="objectif_sein" defaultValue={selectedCampaign?.objectif_sein} className="w-full p-2 bg-[#f2fbff] border rounded-lg text-xs" placeholder="Objectif (ex: 150)" />
              </div>

              <div className="space-y-3 p-3 bg-white rounded-xl border border-[#bec9c9]/20">
                <label className="flex items-center gap-2 font-bold text-[#006669] text-xs">
                  <input type="checkbox" name="covers_prostate" defaultChecked={selectedCampaign?.covers_prostate} className="rounded" />
                  PROSTATE
                </label>
                <input type="number" name="objectif_prostate" defaultValue={selectedCampaign?.objectif_prostate} className="w-full p-2 bg-[#f2fbff] border rounded-lg text-xs" placeholder="Objectif (ex: 150)" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#006669] uppercase">Description</label>
            <textarea name="description" defaultValue={selectedCampaign?.description} rows={3} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none" placeholder="Objectifs de la mission..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-[#6f7979] font-bold">Annuler</button>
            <button type="submit" className="px-8 py-2.5 bg-[#006669] text-white rounded-xl font-bold shadow-lg shadow-[#006669]/20">Confirmer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Campaigns;