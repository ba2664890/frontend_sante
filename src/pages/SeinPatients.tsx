import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { seinService } from '../services/seinService.ts';
import { SeinPatient } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import SeinFormWizard from '../components/SeinForm.tsx';
import Modal from '../components/Modal.tsx';

const SeinPatients: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<SeinPatient | null>(null);

  const { data, isLoading, refetch } = useQuery(
    ['sein-patients', currentPage, searchTerm],
    () => seinService.getPatients({ search: searchTerm }, currentPage),
    { keepPreviousData: true }
  );

  const patients = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'screened':
        return <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-[10px] font-bold">DÉPISTÉE</span>;
      case 'follow_up':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">À REVOIR</span>;
      default:
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">NOUVELLE</span>;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      {/* Header Bento */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#bec9c9]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#831843]" style={{ fontFamily: 'Literata, serif' }}>
            Dépistage Cancer du Sein
          </h1>
          <p className="text-gray-600 text-sm mt-1">Gestion des fiches de collecte et bilans mammo/écho</p>
        </div>
        <button
          onClick={() => {
            setSelectedPatient(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#be185d] text-white font-bold shadow-lg hover:bg-[#9d174d] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nouvelle Patiente Sein
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Rechercher par nom, ID ou région..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-pink-100 rounded-2xl outline-none font-medium"
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
            {patients.map((patient: SeinPatient) => (
              <div 
                key={patient.record_id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setShowForm(true);
                }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 hover:border-[#be185d]/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#be185d]">
                      <span className="material-symbols-outlined text-[28px]">female</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#831843] text-lg">{patient.full_name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 font-mono">ID: {patient.id_patient}</p>
                    </div>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="p-3 bg-pink-50/50 rounded-xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">ÂGE</p>
                    <p className="text-sm font-bold text-gray-900">{patient.age} ans</p>
                  </div>
                  <div className="p-3 bg-pink-50/50 rounded-xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">BIRADS D</p>
                    <p className="text-sm font-bold text-[#be185d]">{patient.dep_mammo_birads_droit !== undefined ? `BIRADS ${patient.dep_mammo_birads_droit}` : '—'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                  <span>Inscrite le {new Date(patient.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-xs font-bold text-[#831843]">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={selectedPatient ? "Modifier dossier sein" : "Nouveau Dépistage Sein"} size="6xl">
        <SeinFormWizard 
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
export default SeinPatients;
