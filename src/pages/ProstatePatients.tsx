import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { prostateService } from '../services/prostateService.ts';
import { ProstatePatient } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ProstateFormWizard from '../components/ProstateForm.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

const ProstatePatients: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<ProstatePatient | null>(null);

  const { data, isLoading, refetch } = useQuery(
    ['prostate-patients', currentPage, searchTerm],
    () => prostateService.getPatients({ search: searchTerm }, currentPage),
    { keepPreviousData: true }
  );

  const patients = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'screened':
        return <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold">DÉPISTÉ</span>;
      case 'follow_up':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">À REVOIR</span>;
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">NOUVEAU</span>;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      {/* Header Bento */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#bec9c9]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
            Dépistage Prostate
          </h1>
          <p className="text-[#3e4949] text-sm mt-1">Gestion des fiches de collecte et dosages PSA</p>
        </div>
        <button
          onClick={() => {
            setSelectedPatient(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#006669] text-white font-bold shadow-lg hover:bg-[#2a7f82] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nouveau Patient Prostate
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Rechercher par nom, ID ou région..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#bec9c9]/20 rounded-2xl outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Bento */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {patients.map((patient: ProstatePatient) => (
              <div 
                key={patient.record_id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setShowForm(true);
                }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-[#bec9c9]/10 hover:border-[#006669]/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#006669]">
                      <span className="material-symbols-outlined text-[28px]">male</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#091e25] text-lg">{patient.full_name}</h3>
                      <p className="text-[10px] font-bold text-[#6f7979] font-mono">ID: {patient.id_patient}</p>
                    </div>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">ÂGE</p>
                    <p className="text-sm font-bold text-gray-900">{patient.age} ans</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">PSA</p>
                    <p className="text-sm font-bold text-[#006669]">{patient.dep_psa_valeur ? `${patient.dep_psa_valeur} ng/mL` : '—'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                  <span>Inscrit le {new Date(patient.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={selectedPatient ? "Modifier dossier prostate" : "Nouveau Dépistage Prostate"} size="6xl">
        <ProstateFormWizard 
          patient={selectedPatient}
          onSubmit={() => { 
            setShowForm(false); 
            refetch(); 
          }} 
          onCancel={() => setShowForm(false)} 
        />
      </Modal>
    </div>
  );
};
export default ProstatePatients;
