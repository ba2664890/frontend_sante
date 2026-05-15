// src/pages/Patients.tsx — Design "Clinical Precision" Bento
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
            onClick={() => setShowForm(true)}
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
                className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(42,127,130,0.06)] border border-[#bec9c9]/10 group hover:border-[#006669]/20 transition-all flex flex-col"
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
                    onClick={() => navigate(`/patients/${patient.record_id}`)}
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

      {/* Modal Nouveau Patient */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Enregistrer une nouvelle patiente" size="6xl">
        <PatientFormWizard onSubmit={() => { setShowForm(false); refetch(); toast.success('Patiente enregistrée !'); }} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
};

export default Patients;
