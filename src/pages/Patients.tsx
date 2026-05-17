// src/pages/Patients.tsx — Design "Clinical Precision" Bento with details drawer
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { patientService } from '../services/patientService.ts';
import { Patient, PatientFilters } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import PatientFormWizard from '../components/PatientForm.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<PatientFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Details drawer state
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [selectedPatientList, setSelectedPatientList] = useState<Patient | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'medical' | 'history'>('identity');

  useEffect(() => {
    if (location.state?.openForm) {
      setShowForm(true);
      // Nettoyer l'état pour éviter de réouvrir au refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Récupérer la liste des patientes
  const { data, isLoading, refetch } = useQuery(
    ['patients', filters, currentPage, searchTerm],
    () => patientService.getPatients({ ...filters, search: searchTerm }, currentPage),
    { keepPreviousData: true }
  );

  // Fetch full details of the active patient
  const { data: selectedPatient } = useQuery(
    ['patient-detail', activePatientId],
    () => activePatientId ? patientService.getPatient(activePatientId) : Promise.resolve(null),
    { enabled: !!activePatientId && showDrawer }
  );

  // Fetch follow-ups for selected patient
  const { data: followUpsData } = useQuery(
    ['followUps', activePatientId],
    () => activePatientId ? patientService.getFollowUps({ patient: activePatientId }) : Promise.resolve(null),
    { enabled: !!activePatientId && showDrawer }
  );

  const patientToDisplay = selectedPatient || selectedPatientList;

  const patients = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);

  const handleExport = async () => {
    try {
      const blob = await patientService.exportPatientsData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patientes_cervicare_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Données exportées !');
    } catch {
      toast.error("Erreur lors de l'exportation");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || 'NEW';
    switch (s) {
      case 'SCREENED':
        return <span className="px-3 py-1 bg-[#ffdbcf] text-[#9a4523] rounded-full text-[10px] font-bold tracking-wider">SCREENED</span>;
      case 'FOLLOW_UP':
        return <span className="px-3 py-1 bg-[#ffdeaa] text-[#795500] rounded-full text-[10px] font-bold tracking-wider">FOLLOW UP</span>;
      case 'NEW':
        return <span className="px-3 py-1 bg-[#dcf1fb] text-[#006669] rounded-full text-[10px] font-bold tracking-wider">NEW</span>;
      default:
        return <span className="px-3 py-1 bg-[#bec9c9]/20 text-[#3e4949] rounded-full text-[10px] font-bold tracking-wider">{s}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header Bento */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
            File d'attente des patientes
          </h1>
          <p className="text-[#3e4949] text-sm mt-1">Gestion centralisée des dépistages et suivis régionaux</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#bec9c9]/30 text-[#3e4949] font-bold hover:bg-[#dcf1fb] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Exporter
          </button>
          <button
            onClick={() => {
              setSelectedPatient(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#006669] text-white font-bold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nouvelle Patiente
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6f7979] text-[20px] group-focus-within:text-[#006669]">search</span>
          <input
            type="text"
            placeholder="Rechercher par nom, ID ou région..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#bec9c9]/20 rounded-2xl focus:ring-4 focus:ring-[#006669]/5 shadow-sm font-medium text-[#091e25] outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            className="flex-1 lg:w-56 px-4 py-3.5 bg-white border border-[#bec9c9]/20 rounded-2xl text-sm font-bold text-[#3e4949] outline-none shadow-sm"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
          >
            <option value="">Tous les statuts</option>
            <option value="new">Nouvelle</option>
            <option value="screened">Dépistée</option>
            <option value="follow_up">À revoir</option>
          </select>

          <button className="p-3.5 bg-white border border-[#bec9c9]/20 rounded-2xl hover:bg-[#dcf1fb] transition-all text-[#3e4949] shadow-sm">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Grid Bento */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {patients.map((patient: Patient) => (
              <div 
                key={patient.record_id}
                onClick={() => {
                  setSelectedPatientList(patient);
                  setActivePatientId(patient.record_id);
                  setActiveTab('identity');
                  setShowDrawer(true);
                }}
                className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(42,127,130,0.06)] border border-[#bec9c9]/10 group hover:border-[#006669]/20 transition-all flex flex-col cursor-pointer"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#f2fbff] border border-[#bec9c9]/20 flex items-center justify-center text-[#006669]">
                      <span className="material-symbols-outlined text-[28px]">account_circle</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#091e25] text-lg leading-tight group-hover:text-[#006669] transition-colors">{patient.full_name}</h3>
                      <p className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest mt-0.5 font-mono">ID: {patient.id_patient}</p>
                    </div>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
                    <p className="text-[9px] uppercase font-bold text-[#6f7979] mb-1 tracking-wider">RÉGION</p>
                    <p className="text-sm font-bold text-[#091e25]">{patient.region_display || '—'}</p>
                  </div>
                  <div className="p-4 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
                    <p className="text-[9px] uppercase font-bold text-[#6f7979] mb-1 tracking-wider">IVA RESULT</p>
                    <p className={`text-sm font-bold ${patient.dep_resultat_iva === 2 ? 'text-[#9a4523]' : 'text-[#006669]'}`}>
                      {patient.resultat_examen_display || 'Normal'}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#bec9c9]/10 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-[#6f7979] tracking-wider">Dernier passage</span>
                    <span className="text-xs font-bold text-[#091e25] font-mono">
                      {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/patients/${patient.record_id}`);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#dcf1fb] text-[#006669] rounded-2xl text-xs font-bold hover:bg-[#006669] hover:text-white transition-all group/btn"
                  >
                    Voir dossier
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover/btn:translate-x-1">chevron_right</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 py-8">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(v => v - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#bec9c9]/30 text-sm font-bold text-[#3e4949] disabled:opacity-30 hover:bg-[#dcf1fb] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Précédent
              </button>
              <span className="font-bold text-[#091e25] bg-white px-4 py-2 rounded-xl border border-[#bec9c9]/20 shadow-sm">
                Page <span className="text-[#006669]">{currentPage}</span> / {totalPages}
              </span>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(v => v + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#bec9c9]/30 text-sm font-bold text-[#3e4949] disabled:opacity-30 hover:bg-[#dcf1fb] transition-all"
              >
                Suivant
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Slide-in Detail View Sidebar */}
      {showDrawer && patientToDisplay && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with transition */}
          <div 
            className="fixed inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowDrawer(false)}
          ></div>
          
          {/* Panel */}
          <div className="relative w-full md:w-[480px] h-full bg-white shadow-2xl border-l border-[#bec9c9]/20 flex flex-col z-10 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 bg-[#f2fbff] border-b border-[#bec9c9]/20">
              <div className="flex justify-between items-start mb-4">
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="w-10 h-10 rounded-full hover:bg-[#d0e6ef] flex items-center justify-center text-[#3e4949] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <button 
                  onClick={() => {
                    setShowDrawer(false);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 border border-[#9a4523] text-[#9a4523] hover:bg-[#ffdbcf]/40 rounded-lg font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Modifier
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#006669]/10 border border-[#006669]/20 flex items-center justify-center text-[#006669] shadow-sm">
                  <span className="material-symbols-outlined text-[36px]">account_circle</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#091e25] flex items-center" style={{ fontFamily: 'Literata, serif' }}>
                    {patientToDisplay.full_name}
                    {!selectedPatient && (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#006669] border-t-transparent ml-2" title="Chargement des données complètes..."></span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-[#3e4949]">ID: {patientToDisplay.id_patient}</span>
                    <span className="px-2 py-0.5 bg-[#ffdbcf] text-[#9a4523] rounded font-bold text-[10px] uppercase tracking-wider">
                      {patientToDisplay.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex border-b border-[#bec9c9]/20 px-6 bg-white">
              <button 
                onClick={() => setActiveTab('identity')}
                className={`px-4 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'identity' ? 'border-[#006669] text-[#006669]' : 'border-transparent text-[#3e4949] hover:text-[#006669]'}`}
              >
                Identité
              </button>
              <button 
                onClick={() => setActiveTab('medical')}
                className={`px-4 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'medical' ? 'border-[#006669] text-[#006669]' : 'border-transparent text-[#3e4949] hover:text-[#006669]'}`}
              >
                Médical
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'history' ? 'border-[#006669] text-[#006669]' : 'border-transparent text-[#3e4949] hover:text-[#006669]'}`}
              >
                Historique
              </button>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {activeTab === 'identity' && (
                <section className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-bold text-[#006669] uppercase tracking-wider mb-3">Informations Personnelles</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Âge</p>
                        <p className="font-bold text-sm text-[#091e25]">
                          {patientToDisplay.age} ans {patientToDisplay.date_naiss ? `(${new Date(patientToDisplay.date_naiss).toLocaleDateString('fr-FR')})` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Téléphone</p>
                        <p className="font-bold text-sm text-[#091e25] font-mono">{patientToDisplay.num_phone || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Localité (Adresse)</p>
                        <p className="font-bold text-sm text-[#091e25]">{patientToDisplay.pat_adresse || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">NIN (Identifiant National)</p>
                        <p className="font-bold text-sm text-[#091e25] font-mono">{patientToDisplay.pat_nin || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#bec9c9]/10">
                    <h4 className="text-[11px] font-bold text-[#006669] uppercase tracking-wider mb-3">Sociodémographique</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Profession</p>
                        <p className="font-bold text-sm text-[#091e25]">
                          {patientToDisplay.soc_profession ? { 1: 'Ménagère', 2: 'Salariée', 3: 'Étudiante/Élève', 4: 'Commerçante', 5: 'Couturière/Coiffeuse/Restauratrice', 6: 'Paysanne/Éleveuse', 7: 'Sans emploi', 8: 'Autre' }[patientToDisplay.soc_profession] || '—' : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Niveau d'instruction</p>
                        <p className="font-bold text-sm text-[#091e25]">
                          {patientToDisplay.soc_niveau_instruction !== undefined ? { 0: 'Aucun', 1: 'Primaire', 2: 'Secondaire', 3: 'Supérieur', 4: 'École coranique/Daara', 5: 'Alphabétisation' }[patientToDisplay.soc_niveau_instruction] || '—' : '—'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Statut Matrimonial</p>
                        <p className="font-bold text-sm text-[#091e25]">
                          {patientToDisplay.soc_statut_matrimonial ? { 1: 'Célibataire', 2: 'Mariée monogame', 3: 'Mariée polygame', 4: 'Veuve', 5: 'Divorcée/Séparée', 6: 'Union libre' }[patientToDisplay.soc_statut_matrimonial] || '—' : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'medical' && (
                <section className="space-y-6">
                  <div className="p-4 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-[#006669] text-sm">Dernier Examen (IVA/IVL)</h4>
                      <span className="material-symbols-outlined text-[#006669]">verified</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-[#bec9c9]/10 pb-1.5">
                        <span className="text-[#3e4949]">Date d'examen</span>
                        <span className="font-bold text-[#091e25]">{patientToDisplay.dep_date ? new Date(patientToDisplay.dep_date).toLocaleDateString('fr-FR') : '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#bec9c9]/10 pb-1.5">
                        <span className="text-[#3e4949]">Méthode</span>
                        <span className="font-bold text-[#091e25]">{patientToDisplay.dep_methode || 'IVA / IVL'}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#bec9c9]/10 pb-1.5">
                        <span className="text-[#3e4949]">Résultat IVA</span>
                        <span className={`font-bold ${patientToDisplay.dep_resultat_iva === 2 ? 'text-[#9a4523]' : 'text-[#006669]'}`}>
                          {patientToDisplay.dep_resultat_iva ? { 1: 'Négatif', 2: 'Positif', 3: 'Polype', 4: 'Suspicion cancer', 5: 'Non concluant' }[patientToDisplay.dep_resultat_iva] || '—' : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-[#3e4949]">Résultat IVL</span>
                        <span className="font-bold text-[#091e25]">
                          {patientToDisplay.dep_resultat_ivl ? { 1: 'Négatif', 2: 'Positif', 3: 'Non concluant' }[patientToDisplay.dep_resultat_ivl] || '—' : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-[#006669] uppercase tracking-wider mb-3">Facteurs Cliniques & Risques</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Statut VIH</p>
                        <p className="font-bold text-[#091e25]">
                          {patientToDisplay.ris_vih_statut ? { 1: 'Négatif', 2: 'Positif sous TARV', 3: 'Positif sans TARV', 9: 'Inconnu/Refus' }[patientToDisplay.ris_vih_statut] || '—' : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Contraception</p>
                        <p className="font-bold text-[#091e25]">
                          {(patientToDisplay.ris_contraception && patientToDisplay.ris_contraception !== '0') || patientToDisplay.traitema_contraceptif === 1 ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Premières règles</p>
                        <p className="font-bold text-[#091e25]">{patientToDisplay.age_menstrue || '—'} ans</p>
                      </div>
                      <div>
                        <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">Enfants vivants</p>
                        <p className="font-bold text-[#091e25]">{patientToDisplay.gyn_parite_simple !== undefined ? patientToDisplay.gyn_parite_simple : '—'}</p>
                      </div>
                    </div>
                  </div>

                  {patientToDisplay.ai_synthese && (
                    <div className="p-4 bg-[#f8fcfc] rounded-3xl border border-[#006669]/10 mt-4 shadow-sm">
                      <h4 className="font-bold text-[#006669] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#bec9c9]/10 pb-2">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                        Synthèse Clinique IA
                      </h4>
                      <ClinicalAiSummary text={patientToDisplay.ai_synthese} isSidebar={true} />
                    </div>
                  )}
                </section>
              )}

              {activeTab === 'history' && (
                <section className="space-y-6">
                  <h4 className="text-[11px] font-bold text-[#006669] uppercase tracking-wider mb-4">Parcours de Suivi</h4>
                  
                  {followUpsData?.results && followUpsData.results.length > 0 ? (
                    <div className="relative border-l-2 border-[#006669]/20 ml-2 pl-6 space-y-6">
                      {followUpsData.results.map((f: any) => (
                        <div key={f.id} className="relative">
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#006669] z-10 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#006669]"></div>
                          </div>
                          <div>
                            <div className="flex justify-between items-start">
                              <h5 className="font-bold text-[#091e25] text-sm">{f.follow_up_type_display}</h5>
                              <span className="px-2 py-0.5 bg-[#f2fbff] text-[#006669] rounded font-bold text-[9px] uppercase tracking-wider">
                                {f.status_display || f.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#3e4949] font-mono mt-0.5">
                              {new Date(f.scheduled_date).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-xs text-[#3e4949] mt-2 leading-relaxed bg-[#f2fbff]/40 p-2.5 rounded-xl border border-[#bec9c9]/10">
                              {f.notes || 'Consultation de suivi planifiée.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-[#f2fbff]/30 rounded-2xl border border-[#bec9c9]/10">
                      <span className="material-symbols-outlined text-[32px] text-[#6f7979] mb-2">event_busy</span>
                      <p className="text-xs text-[#3e4949] font-bold">Aucun historique de suivi enregistré.</p>
                    </div>
                  )}
                </section>
              )}

            </div>

            {/* Detail Footer Actions */}
            <div className="p-6 bg-[#f2fbff] border-t border-[#bec9c9]/20 flex gap-4">
              <button 
                onClick={() => {
                  setShowDrawer(false);
                  setShowForm(true);
                }}
                className="flex-1 py-3 bg-[#9a4523] text-white rounded-xl font-bold shadow-sm hover:bg-[#7b2e0d] active:scale-[0.98] transition-all"
              >
                Lancer le Dépistage
              </button>
              <button 
                onClick={() => {
                  setShowDrawer(false);
                  navigate(`/patients/${patientToDisplay.record_id}`);
                }}
                className="px-4 py-3 bg-[#dcf1fb] text-[#006669] rounded-xl hover:bg-[#006669] hover:text-white transition-all"
                title="Voir dossier complet"
              >
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Patient */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={patientToDisplay ? "Modifier le dossier patiente" : "Enregistrer une nouvelle patiente"} size="6xl">
        <PatientFormWizard 
          patient={patientToDisplay}
          onSubmit={() => { 
            setShowForm(false); 
            refetch(); 
            toast.success(patientToDisplay ? 'Dossier patiente mis à jour !' : 'Patiente enregistrée !'); 
          }} 
          onCancel={() => setShowForm(false)} 
        />
      </Modal>
    </div>
  );
};

// --- AI Summary parser & renderer helper ---
export const parseAiSummary = (text: string) => {
  if (!text) return null;
  
  let cleanText = text
    .replace(/<\/?s>/g, '')
    .replace(/\[\/?INST\]/g, '')
    .trim();

  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  
  return lines.map((line, idx) => {
    const boldHeaderMatch = line.match(/^[* \-–\u2022]*\*\*([^*]+)\*\*[\s:]*(.*)$/) || line.match(/^[* \-–\u2022]*\*([^*]+)\*[\s:]*(.*)$/);
    
    if (boldHeaderMatch) {
      const [, header, content] = boldHeaderMatch;
      return {
        id: idx,
        type: 'section',
        header: header.replace(/[:*]/g, '').trim(),
        content: content.replace(/[*]/g, '').trim()
      };
    }
    
    const isListItem = line.startsWith('-') || line.startsWith('*') || line.startsWith('•');
    if (isListItem) {
      return {
        id: idx,
        type: 'list_item',
        content: line.replace(/^[\s*\-\u2022]+/, '').replace(/[*]/g, '').trim()
      };
    }
    
    return {
      id: idx,
      type: 'paragraph',
      content: line.replace(/[*]/g, '').trim()
    };
  });
};

export const ClinicalAiSummary: React.FC<{ text?: string; isSidebar?: boolean }> = ({ text, isSidebar = false }) => {
  if (!text) return null;
  const parsed = parseAiSummary(text);
  if (!parsed || parsed.length === 0) return null;

  const getIcon = (header: string) => {
    const h = header.toLowerCase();
    if (h.includes('profil') || h.includes('épidém') || h.includes('identité') || h.includes('facteur')) return 'assignment_ind';
    if (h.includes('résultat') || h.includes('dépist') || h.includes('analyse')) return 'biotech';
    if (h.includes('recommand') || h.includes('conduite') || h.includes('trait') || h.includes('suivi')) return 'healing';
    return 'clinical_notes';
  };

  const getColorClasses = (header: string) => {
    const h = header.toLowerCase();
    if (h.includes('profil') || h.includes('épidém') || h.includes('identité') || h.includes('facteur')) return {
      bg: 'bg-[#f2fbff]', border: 'border-[#bec9c9]/10', iconBg: 'bg-[#006669]/10', iconColor: 'text-[#006669]'
    };
    if (h.includes('résultat') || h.includes('dépist') || h.includes('analyse')) return {
      bg: 'bg-[#fffbf0]', border: 'border-[#eec290]/20', iconBg: 'bg-[#9a6a23]/10', iconColor: 'text-[#9a6a23]'
    };
    return {
      bg: 'bg-[#fdf3f0]', border: 'border-[#ffdbcf]/40', iconBg: 'bg-[#9a4523]/10', iconColor: 'text-[#9a4523]'
    };
  };

  return (
    <div className="space-y-4">
      {parsed.map((item) => {
        if (item.type === 'section') {
          const colors = getColorClasses(item.header);
          return (
            <div key={item.id} className={`p-4 rounded-2xl border ${colors.border} ${colors.bg} transition-all hover:shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${colors.iconBg} ${colors.iconColor} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{getIcon(item.header)}</span>
                </div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#091e25]">{item.header}</h5>
              </div>
              <p className={`text-[#3e4949] leading-relaxed ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                {item.content}
              </p>
            </div>
          );
        }
        
        if (item.type === 'list_item') {
          return (
            <div key={item.id} className="flex gap-2 items-start pl-2">
              <span className="material-symbols-outlined text-[#006669] text-[16px] mt-0.5">check_circle</span>
              <p className={`text-[#3e4949] leading-relaxed ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>{item.content}</p>
            </div>
          );
        }

        return (
          <p key={item.id} className={`text-[#3e4949] leading-relaxed ${isSidebar ? 'text-[11px]' : 'text-xs'} italic pl-2 border-l-2 border-[#bec9c9]/30`}>
            {item.content}
          </p>
        );
      })}
    </div>
  );
};

export default Patients;
