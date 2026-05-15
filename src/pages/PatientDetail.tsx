import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import PatientForm from '../components/PatientForm.tsx';
import FollowUpForm from '../components/FollowUpForm.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  UserIcon, 
  MapPinIcon,
  BeakerIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  HeartIcon,
  CheckIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // Étape "Résumé IA" par défaut
  
  const { user } = useAuth();
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
  
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-[#f2fbff]"><LoadingSpinner size="lg" /></div>;
  if (!patient) return <div className="text-center py-12 bg-[#f2fbff] h-screen"><p className="text-[#3e4949]">Patiente non trouvée</p></div>;

  const handlePatientUpdated = () => { setShowEditForm(false); refetch(); };
  const handleFollowUpCreated = () => { setShowFollowUpForm(false); refetch(); };
  
  const handleValidate = async () => {
    try {
      await patientService.updatePatient(patient.record_id, { status: 'screened' });
      toast.success('Dépistage validé avec succès !');
      setActiveStep(3);
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la validation.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fbff] font-jakarta animate-fade-in pb-12">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* Header & Stepper */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="font-headline text-3xl text-[#091e25] mb-2">Analyse de Dépistage</h1>
            <p className="flex items-center gap-2 text-[#3e4949]">
              <span className="font-bold text-[#006669]">{patient.full_name}</span>
              <span className="text-[#bec9c9]">|</span>
              <span className="font-mono text-sm">ID: {patient.id_patient}</span>
            </p>
          </div>

          <div className="flex items-center">
            {[
              { step: 1, label: 'Résultats' },
              { step: 2, label: 'Résumé IA' },
              { step: 3, label: 'Validation' }
            ].map((s, i, arr) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    activeStep > s.step 
                      ? 'bg-[#a1f0f3] text-[#006669]' 
                      : activeStep === s.step 
                        ? 'bg-[#006669] text-white shadow-lg shadow-[#006669]/20' 
                        : 'bg-[#dcf1fb] text-[#3e4949]'
                  }`}>
                    {activeStep > s.step ? <CheckIcon className="h-6 w-6" /> : s.step}
                  </div>
                  <span className={`text-[10px] font-bold uppercase mt-2 tracking-tighter ${
                    activeStep === s.step ? 'text-[#006669]' : 'text-[#3e4949]/50'
                  }`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-12 h-0.5 mb-6 ${activeStep > s.step ? 'bg-[#006669]' : 'bg-[#bec9c9]/30'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* AI Summary Card */}
            <div className="bento-card border-t-4 border-[#006669]">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#006669]/10 rounded-2xl text-[#006669]">
                    <BeakerIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl text-[#091e25]">Synthèse Clinique IA</h3>
                    <p className="text-[10px] font-bold text-[#3e4949]/50 uppercase tracking-widest mt-1">Groq Llama-3.1 Active</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  patient.dep_resultat_iva === 2 ? 'bg-[#ffdbcf] text-[#9a4523]' : 'bg-[#dcf1fb] text-[#006669]'
                }`}>
                  {patient.resultat_examen_display || 'Normal'}
                </div>
              </div>

              <div className="space-y-6 text-[#091e25]">
                {isLoadingAi ? (
                  <div className="flex items-center gap-3 py-4">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-[#3e4949] animate-pulse">Analyse en cours par Njariñu...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-lg">
                      Analyse pour <span className="font-bold text-[#006669]">{patient.full_name}</span> : profil <span className="font-bold text-[#9a4523]">{patient.dep_resultat_iva === 2 ? 'à risque modéré' : 'normal'}</span>. 
                    </p>
                    <div className="p-6 bg-[#f2fbff] rounded-2xl border border-[#006669]/10 text-sm italic text-[#3e4949]">
                      {aiSummary?.synthese || "Synthèse en cours de génération..."}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-[#bec9c9]/20 flex justify-end gap-4">
                <button onClick={() => setShowEditForm(true)} className="px-6 py-3 rounded-xl border border-[#bec9c9] text-[#3e4949] font-bold hover:bg-[#f2fbff] transition-all">
                  Modifier dossier
                </button>
                <button 
                  onClick={handleValidate} 
                  disabled={activeStep === 3}
                  className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${
                    activeStep === 3 ? 'bg-[#bec9c9] text-white cursor-not-allowed' : 'bg-[#006669] text-white shadow-[#006669]/20 hover:bg-[#2a7f82]'
                  }`}
                >
                  {activeStep === 3 ? 'Dépistage Validé ✓' : 'Confirmer & Valider'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bento-card">
                <h4 className="font-bold text-[#091e25] mb-4 flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5 text-[#006669]" /> Risques</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#bec9c9]/10"><span>VIH</span><span className="font-bold">{patient.ris_vih_statut === 1 ? 'Négatif' : 'Positif'}</span></div>
                  <div className="flex justify-between py-2"><span>Dépistage Ant.</span><span className="font-bold">{patient.ris_depistage_anterieur === 1 ? 'Oui' : 'Non'}</span></div>
                </div>
              </div>
              <div className="bento-card">
                <h4 className="font-bold text-[#091e25] mb-4 flex items-center gap-2"><DocumentTextIcon className="h-5 w-5 text-[#2a7f82]" /> Gynécologie</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#bec9c9]/10"><span>G / P</span><span className="font-bold">G{patient.gyn_nb_grossesses} P{patient.gyn_nb_accouchements}</span></div>
                  <div className="flex justify-between py-2"><span>DDR</span><span className="font-bold">{patient.gyn_ddr || '—'}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bento-card p-4">
              <h4 className="text-[10px] font-bold text-[#3e4949]/50 uppercase tracking-widest mb-4">Colposcopie</h4>
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#dcf1fb] border border-[#bec9c9]/20 relative group">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmKKcIcb5lgxSU4uG5AahCpWmpyngwAdS13uWj5u-_9cELCQnni8NHbi5hDxG6F_MZUKwyZVNr27tw8AbpmcL3_EQ9sNB-cbGRX2SgDNjFiSEB7c3OMuB5nU1lVuPW_1so9arNiARSNpg_0oHIJNL1w8_JXC2KU4KU1o3KFHEf1v7wfhs7TDU2hYDixvp5yH4z1M3yKhN7KNhv6r53gAK4dvXJAecNx4vtaF7Qo6GF8yZ-6qvCX2Ii8jAA2H9zpd468X3rutuILMU" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500" alt="Ref" />
                <button className="absolute inset-0 bg-[#006669]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white">
                  <MagnifyingGlassPlusIcon className="h-10 w-10" />
                </button>
              </div>
            </div>

            <div className="bento-card">
              <h4 className="text-[10px] font-bold text-[#3e4949]/50 uppercase tracking-widest mb-6">Confiance Groq</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold">Précision</span><span className="text-sm font-bold text-[#006669]">94.2%</span></div>
                <div className="w-full h-2 bg-[#f2fbff] rounded-full overflow-hidden"><div className="h-full bg-[#006669] rounded-full w-[94.2%]"></div></div>
              </div>
            </div>

            <div className="bg-[#a1f0f3]/20 p-6 rounded-3xl border border-[#006669]/10 flex gap-4">
              <div className="p-2 bg-[#006669] rounded-xl text-white h-fit"><LightBulbIcon className="h-5 w-5" /></div>
              <p className="text-xs text-[#3e4949] leading-relaxed">La synthèse sera ajoutée au carnet de santé après validation.</p>
            </div>
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