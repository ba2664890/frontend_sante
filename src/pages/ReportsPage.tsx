// src/pages/ReportsPage.tsx — Design "Clinical Precision" Bento
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { analyticsService } from '../services/analyticsService.ts';
import { Report } from '../types/analytics.ts';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner.tsx';

const REGIONS = ['Toutes', 'Dakar', 'Thiès', 'Diourbel', 'Kaolack', 'Fatick', 'Louga', 'Saint-Louis', 'Matam', 'Tambacounda', 'Kolda', 'Ziguinchor', 'Kédougou', 'Sédhiou'];

const ReportsPage: React.FC = () => {
  const [regionFilter, setRegionFilter] = useState('Toutes');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: reportsResponse, isLoading } = useQuery(
    ['reports', regionFilter],
    () => analyticsService.getReports({ region: regionFilter === 'Toutes' ? undefined : regionFilter }),
    { refetchInterval: 15000 }
  );

  const reports: Report[] = Array.isArray(reportsResponse) ? reportsResponse : reportsResponse?.results || [];

  const generateMutation = useMutation((id: number) => analyticsService.generateReport(id), {
    onSuccess: () => { queryClient.invalidateQueries('reports'); toast.success('Génération lancée !'); },
    onError: () => toast.error('Erreur lors de la génération'),
  });

  const downloadMutation = useMutation(async (id: number) => {
    const blob = await analyticsService.downloadReport(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${id}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, {
    onSuccess: () => toast.success('Téléchargé !'),
    onError: () => toast.error('Erreur de téléchargement'),
  });

  const deleteMutation = useMutation((id: number) => analyticsService.deleteReport(id), {
    onSuccess: () => { queryClient.invalidateQueries('reports'); toast.success('Supprimé !'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const stats = [
    { label: 'Total', value: reports.length, icon: 'description', color: '#006669', bg: '#dcf1fb' },
    { label: 'Génération', value: reports.filter(r => r.status === 'generating').length, icon: 'sync', color: '#006669', bg: '#dcf1fb' },
    { label: 'Terminés', value: reports.filter(r => r.status === 'completed').length, icon: 'check_circle', color: '#2a7f82', bg: '#e4f7ff' },
    { label: 'Échoués', value: reports.filter(r => r.status === 'failed').length, icon: 'error', color: '#ba1a1a', bg: '#ffdad6' },
  ];

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Rapports d'Analyse</h1>
          <p className="text-[#3e4949] text-sm mt-1">Générez et gérez les rapports périodiques de votre zone</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#bec9c9]/30 rounded-xl text-sm font-bold text-[#3e4949] outline-none shadow-sm focus:ring-2 focus:ring-[#006669]/10"
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#006669] text-white rounded-xl font-bold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nouveau rapport
          </button>
        </div>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#bec9c9]/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <span className="material-symbols-outlined text-[24px]" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-bold text-[#091e25] font-mono">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="flex-1 bg-white rounded-3xl shadow-[0_2px_12px_rgba(42,127,130,0.06)] border border-[#bec9c9]/10 overflow-hidden flex flex-col min-h-0">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-[#bec9c9]/10 bg-[#f2fbff] font-bold text-[10px] text-[#6f7979] uppercase tracking-wider">
          <span className="col-span-4">Nom du rapport</span>
          <span className="col-span-2 text-center">Type</span>
          <span className="col-span-2 text-center">Région</span>
          <span className="col-span-2 text-center">Statut</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#bec9c9]/10">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#bec9c9]">
              <span className="material-symbols-outlined text-[64px]">find_in_page</span>
              <p className="mt-2 font-bold italic">Aucun rapport trouvé</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-[#f2fbff] transition-colors group">
                <div className="col-span-4">
                  <p className="font-bold text-[#091e25] group-hover:text-[#006669] transition-colors">{report.name}</p>
                  <p className="text-[10px] text-[#6f7979] font-mono">CRÉÉ LE {new Date(report.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className="col-span-2 text-center text-xs font-bold text-[#3e4949] capitalize">{report.report_type}</span>
                <span className="col-span-2 text-center text-xs text-[#3e4949]">{report.region || 'Toutes'}</span>
                <div className="col-span-2 flex justify-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    report.status === 'completed' ? 'bg-[#dcf1fb] text-[#006669]' :
                    report.status === 'generating' ? 'bg-[#ffdeaa] text-[#795500]' :
                    report.status === 'failed' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#bec9c9]/20 text-[#6f7979]'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {report.status === 'pending' && (
                    <button onClick={() => generateMutation.mutate(report.id)} className="w-8 h-8 rounded-lg bg-[#dcf1fb] text-[#006669] flex items-center justify-center hover:bg-[#006669] hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    </button>
                  )}
                  {report.status === 'completed' && (
                    <button onClick={() => downloadMutation.mutate(report.id)} className="w-8 h-8 rounded-lg bg-[#dcf1fb] text-[#006669] flex items-center justify-center hover:bg-[#006669] hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  )}
                  <button onClick={() => { if(window.confirm('Supprimer ?')) deleteMutation.mutate(report.id); }} className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center hover:bg-[#ba1a1a] hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slide-left p-8 overflow-y-auto">
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const report = await analyticsService.createReport({
                  name: formData.get('name') as string,
                  report_type: formData.get('report_type') as any,
                  region: formData.get('region') as string || undefined
                });
                toast.success('Rapport créé !');
                setDrawerOpen(false);
                queryClient.invalidateQueries('reports');
              } catch {
                toast.error('Erreur lors de la création');
              }
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Nom du rapport</label>
                <input name="name" required className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" placeholder="Ex: Rapport Hebdomadaire Dakar" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Périodicité</label>
                <select name="report_type" className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none">
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Région ciblée</label>
                <select name="region" className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none">
                  <option value="">Toutes les régions</option>
                  {REGIONS.filter(r => r !== 'Toutes').map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full py-4 bg-[#006669] text-white rounded-xl font-bold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] transition-all">
                  Générer le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;