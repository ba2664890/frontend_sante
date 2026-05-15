// src/pages/PatientDetail.tsx — Design "Clinical Precision" Bento
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import PatientForm from '../components/PatientForm.tsx';
import FollowUpForm from '../components/FollowUpForm.tsx';
import { toast } from 'react-hot-toast';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // Étape "Résumé IA" par défaut
  
  const recordId = Number(id);
  
  const { data: patient, isLoading, refetch } = useQuery(
    ['patient-detail', recordId],
    () => patientService.getPatient(recordId),
    { enabled: !!recordId }
  );

  const { data: aiSummary, isLoading: isLoadingAi } = useQuery(
    ['ai-summary', recordId],
    () => patientService.getAiSummary(patient),
    { enabled: !!patient && activeStep === 2, staleTime: Infinity }
  );
  
  if (isLoading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;
  if (!patient) return <div className="text-center py-12 h-full flex flex-col items-center justify-center"><p className="text-[#3e4949] text-lg font-bold">Patiente non trouvée</p><button onClick={() => navigate('/patients')} className="mt-4 text-[#006669] font-bold underline">Retour à la liste</button></div>;

  const handlePatientUpdated = () => { setShowEditForm(false); refetch(); };
  const handleFollowUpCreated = () => { setShowFollowUpForm(false); refetch(); };
  
  const handleValidate = async () => {
    try {
      await patientService.updatePatient(patient.record_id, { status: 'screened' });
      toast.success('Dépistage validé !');
      setActiveStep(3);
      refetch();
    } catch {
      toast.error('Erreur lors de la validation.');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in pb-12">
      {/* Header & Stepper */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-8 rounded-3xl shadow-sm border border-[#bec9c9]/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate('/patients')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#dcf1fb] text-[#006669] transition-all">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-3xl font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Analyse de Dépistage</h1>
          </div>
          <p className="flex items-center gap-2 text-[#3e4949] ml-10">
            <span className="font-bold text-[#006669] text-lg">{patient.full_name}</span>
            <span className="text-[#bec9c9]">|</span>
            <span className="font-mono text-sm">ID: {patient.id_patient}</span>
          </p>
        </div>

        <div className="flex items-center">
          {[
            { step: 1, label: 'Résultats', icon: 'lab_research' },
            { step: 2, label: 'Résumé IA', icon: 'smart_toy' },
            { step: 3, label: 'Validation', icon: 'verified' }
          ].map((s, i, arr) => (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activeStep > s.step 
                    ? 'bg-[#dcf1fb] text-[#006669]' 
                    : activeStep === s.step 
                      ? 'bg-[#006669] text-white shadow-lg shadow-[#006669]/20' 
                      : 'bg-white border border-[#bec9c9]/20 text-[#bec9c9]'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">{activeStep > s.step ? 'check' : s.icon}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase mt-2 tracking-tighter ${
                  activeStep === s.step ? 'text-[#006669]' : 'text-[#6f7979]'
                }`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-12 h-0.5 mb-6 ${activeStep > s.step ? 'bg-[#006669]' : 'bg-[#bec9c9]/20'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* AI Summary Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_2px_12px_rgba(42,127,130,0.06)] border border-[#bec9c9]/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#006669]/5 rounded-bl-full"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#dcf1fb] rounded-2xl flex items-center justify-center text-[#006669]">
                  <span className="material-symbols-outlined text-[32px]">biotech</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>Synthèse Clinique IA</h3>
                  <p className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest mt-1">Njariñu v2.1 • Analyse en temps réel</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                patient.dep_resultat_iva === 2 ? 'bg-[#ffdbcf] text-[#9a4523]' : 'bg-[#dcf1fb] text-[#006669]'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {patient.resultat_examen_display || 'Normal'}
              </div>
            </div>

            <div className="space-y-6 text-[#091e25] relative z-10">
              {isLoadingAi ? (
                <div className="flex items-center gap-3 py-6 bg-[#f2fbff] rounded-2xl px-6 border border-[#bec9c9]/10">
                  <LoadingSpinner size="sm" />
                  <p className="text-sm text-[#006669] font-bold animate-pulse">Analyse diagnostique en cours...</p>
                </div>
              ) : (
                <>
                  <p className="text-lg leading-relaxed">
                    Après analyse du profil de <span className="font-bold text-[#006669]">{patient.full_name}</span>, l'assistant Njariñu conclut à un <span className="font-bold text-[#9a4523]">{patient.dep_resultat_iva === 2 ? 'risque modéré nécessitant un suivi' : 'profil normal'}</span>. 
                  </p>
                  <div className="p-8 bg-[#f2fbff] rounded-3xl border border-[#006669]/10 text-[#3e4949] text-sm leading-relaxed italic relative">
                    <span className="material-symbols-outlined absolute top-4 left-4 text-[#006669]/20 text-[40px]">format_quote</span>
                    <div className="relative z-10 ml-6">
                      {aiSummary?.synthese || "La synthèse clinique est prête pour validation."}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-[#bec9c9]/10 flex justify-end gap-4 relative z-10">
              <button onClick={() => setShowEditForm(true)} className="px-6 py-3 rounded-xl border border-[#bec9c9] text-[#3e4949] font-bold hover:bg-[#f2fbff] transition-all">
                Modifier dossier
              </button>
              <button 
                onClick={handleValidate} 
                disabled={activeStep === 3}
                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                  activeStep === 3 ? 'bg-[#bec9c9] text-white cursor-not-allowed' : 'bg-[#006669] text-white shadow-[#006669]/20 hover:bg-[#2a7f82]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{activeStep === 3 ? 'verified' : 'task_alt'}</span>
                {activeStep === 3 ? 'Dépistage Validé' : 'Confirmer & Valider'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm">
              <h4 className="font-bold text-[#091e25] mb-6 flex items-center gap-2 border-b border-[#bec9c9]/10 pb-3">
                <span className="material-symbols-outlined text-[#006669]">security</span> Profil de Risque
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#6f7979]">Statut VIH</span>
                  <span className={`text-sm font-bold ${patient.ris_vih_statut === 2 ? 'text-[#ba1a1a]' : 'text-[#006669]'}`}>{patient.ris_vih_statut === 1 ? 'Négatif' : 'Positif'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#6f7979]">Dépistage Antérieur</span>
                  <span className="text-sm font-bold text-[#091e25]">{patient.ris_depistage_anterieur === 1 ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm">
              <h4 className="font-bold text-[#091e25] mb-6 flex items-center gap-2 border-b border-[#bec9c9]/10 pb-3">
                <span className="material-symbols-outlined text-[#2a7f82]">history_edu</span> Antécédents Gynéco
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#6f7979]">Grossesses / Accouch.</span>
                  <span className="text-sm font-bold text-[#091e25]">G{patient.gyn_nb_grossesses} P{patient.gyn_nb_accouchements}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#6f7979]">Dernières Règles (DDR)</span>
                  <span className="text-sm font-bold text-[#091e25]">{patient.gyn_ddr || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm">
            <h4 className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest mb-4">Cliché Colposcopie</h4>
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#dcf1fb] border border-[#bec9c9]/20 relative group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmKKcIcb5lgxSU4uG5AahCpWmpyngwAdS13uWj5u-_9cELCQnni8NHbi5hDxG6F_MZUKwyZVNr27tw8AbpmcL3_EQ9sNB-cbGRX2SgDNjFiSEB7c3OMuB5nU1lVuPW_1so9arNiARSNpg_0oHIJNL1w8_JXC2KU4KU1o3KFHEf1v7wfhs7TDU2hYDixvp5yH4z1M3yKhN7KNhv6r53gAK4dvXJAecNx4vtaF7Qo6GF8yZ-6qvCX2Ii8jAA2H9zpd468X3rutuILMU" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500" alt="Examen" />
              <button className="absolute inset-0 bg-[#006669]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white">
                <span className="material-symbols-outlined text-4xl">zoom_in</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm">
            <h4 className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest mb-6">Confiance Algorithmique</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-[#091e25]">Indice de précision</span><span className="text-sm font-bold text-[#006669]">94.2%</span></div>
              <div className="w-full h-2.5 bg-[#f2fbff] rounded-full overflow-hidden"><div className="h-full bg-[#006669] rounded-full w-[94.2%] transition-all duration-1000"></div></div>
            </div>
          </div>

          <div className="bg-[#e4f7ff] p-6 rounded-3xl border border-[#006669]/10 flex gap-4">
            <div className="w-10 h-10 bg-[#006669] rounded-xl text-white flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-[20px]">lightbulb</span></div>
            <p className="text-xs text-[#3e4949] leading-relaxed font-semibold">Le rapport complet sera archivé automatiquement dans le carnet digital de la patiente dès validation finale.</p>
          </div>
        </div>
      </div>

      <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)} title="Modifier la fiche" size="xl">
        <PatientForm patient={patient} onSubmit={handlePatientUpdated} onCancel={() => setShowEditForm(false)} />
      </Modal>

      <Modal isOpen={showFollowUpForm} onClose={() => setShowFollowUpForm(false)} title="Programmer un suivi">
        <FollowUpForm patientId={patient.record_id} onSubmit={handleFollowUpCreated} onCancel={() => setShowFollowUpForm(false)} />
      </Modal>
    </div>
  );
};

export default PatientDetail;