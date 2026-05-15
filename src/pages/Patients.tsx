import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  ArrowDownTrayIcon as DownloadIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { patientService } from '../services/patientService.ts';
import { Patient, PatientFilters } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import PatientFormWizard from '../components/PatientForm.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

const Patients: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<PatientFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer la liste des patientes
  const { data: patients, isLoading, refetch } = useQuery(
    ['patients', filters, currentPage, searchTerm],
    () => patientService.getPatients({ ...filters, search: searchTerm }, currentPage),
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: PatientFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePatientCreated = () => {
    setShowForm(false);
    refetch();
    toast.success('Patiente enregistrée avec succès !');
  };

  const handleExport = async () => {
    try {
      const blob = await patientService.exportPatientsData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patientes_cervicare_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Données exportées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'exportation des données');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fbff] font-jakarta animate-fade-in">
      {/* Header Section */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-headline text-3xl text-[#091e25]">File d'attente des patientes</h1>
          <p className="text-[#3e4949] mt-1">Gestion centralisée des dépistages et suivis régionaux</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#bec9c9]/30 text-[#3e4949] font-bold hover:bg-[#dcf1fb] transition-all"
          >
            <DownloadIcon className="w-5 h-5" />
            Exporter
          </button>
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#006669] text-white font-bold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] transition-all active:scale-95"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle Patiente
          </button>
        </div>
      </header>

      {/* Search & Global Filters Bar */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3e4949] group-focus-within:text-[#006669]" />
          <input
            type="text"
            placeholder="Rechercher par nom, ID ou région..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#bec9c9]/20 rounded-2xl focus:ring-4 focus:ring-[#006669]/5 shadow-sm font-medium text-[#091e25]"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            className="flex-1 lg:w-48 px-4 py-3 bg-white border border-[#bec9c9]/20 rounded-2xl text-sm font-bold text-[#3e4949]"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange({ ...filters, status: e.target.value || undefined })}
          >
            <option value="">Tous les statuts</option>
            <option value="new">Nouvelle</option>
            <option value="screened">Dépistée</option>
            <option value="follow_up">À revoir</option>
            <option value="treatment">En traitement</option>
            <option value="completed">Terminé</option>
          </select>

          <button className="p-3 bg-white border border-[#bec9c9]/20 rounded-2xl hover:bg-[#dcf1fb] transition-all text-[#3e4949]">
            <AdjustmentsHorizontalIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patients?.results?.map((patient: Patient) => (
            <div 
              key={patient.record_id}
              className="bento-card group hover:border-[#006669]/30"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f2fbff] border border-[#bec9c9]/20 flex items-center justify-center text-[#006669]">
                    <UserCircleIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#091e25] group-hover:text-[#006669] transition-colors">{patient.full_name}</h3>
                    <p className="text-[10px] font-bold text-[#3e4949] uppercase tracking-widest mt-0.5">ID: {patient.id_patient}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  patient.status === 'completed' 
                    ? 'bg-[#006669]/10 text-[#006669]' 
                    : 'bg-[#9a4523]/10 text-[#9a4523]'
                }`}>
                  {patient.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-[#f2fbff]/50 rounded-xl border border-[#bec9c9]/10">
                  <p className="text-[10px] uppercase font-bold text-[#3e4949] mb-1">Région</p>
                  <p className="text-sm font-bold text-[#091e25]">{patient.region_name}</p>
                </div>
                <div className="p-3 bg-[#f2fbff]/50 rounded-xl border border-[#bec9c9]/10">
                  <p className="text-[10px] uppercase font-bold text-[#3e4949] mb-1">IVA Result</p>
                  <p className={`text-sm font-bold ${patient.dep_resultat_iva === 2 ? 'text-[#ba1a1a]' : 'text-[#006669]'}`}>
                    {patient.resultat_examen_display || 'Non fait'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#bec9c9]/10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#3e4949]/50">Dernier passage</span>
                  <span className="text-xs font-bold text-[#091e25]">
                    {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <Link 
                  to={`/patients/${patient.record_id}`}
                  className="flex items-center gap-1 px-4 py-2 bg-[#dcf1fb] text-[#006669] rounded-xl text-xs font-bold hover:bg-[#006669] hover:text-white transition-all group/btn"
                >
                  Voir dossier
                  <ChevronRightIcon className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && patients && patients.count > 0 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(v => v - 1)}
            className="p-2 rounded-xl border border-[#bec9c9]/30 disabled:opacity-30 hover:bg-white transition-all"
          >
            Précédent
          </button>
          <span className="font-bold text-[#091e25]">Page {currentPage} / {Math.ceil(patients.count / 20)}</span>
          <button 
            disabled={currentPage >= Math.ceil(patients.count / 20)}
            onClick={() => setCurrentPage(v => v + 1)}
            className="p-2 rounded-xl border border-[#bec9c9]/30 disabled:opacity-30 hover:bg-white transition-all"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal for new patient */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Enregistrer une nouvelle patiente"
        size="6xl"
      >
        <PatientFormWizard
          onSubmit={handlePatientCreated}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

export default Patients;
