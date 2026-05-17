// src/pages/PatientDetail.tsx — Design "Clinical Precision" Bento with complete clinical data
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import PatientForm from '../components/PatientForm.tsx';
import FollowUpForm from '../components/FollowUpForm.tsx';
import { toast } from 'react-hot-toast';
import { ClinicalAiSummary } from './Patients.tsx';

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

  // Fetch follow-ups for selected patient
  const { data: followUpsData, refetch: refetchFollowUps } = useQuery(
    ['followUps', recordId],
    () => recordId ? patientService.getFollowUps({ patient: recordId }) : Promise.resolve(null),
    { enabled: !!recordId }
  );

  const { data: aiSummary, isLoading: isLoadingAi } = useQuery(
    ['ai-summary', recordId],
    () => patientService.getAiSummary(patient),
    { enabled: !!patient && activeStep === 2 && !patient.ai_synthese, staleTime: Infinity }
  );
  
  if (isLoading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;
  if (!patient) return <div className="text-center py-12 h-full flex flex-col items-center justify-center"><p className="text-[#3e4949] text-lg font-bold">Patiente non trouvée</p><button onClick={() => navigate('/patients')} className="mt-4 text-[#006669] font-bold underline">Retour à la liste</button></div>;

  const handlePatientUpdated = () => { setShowEditForm(false); refetch(); };
  const handleFollowUpCreated = () => { setShowFollowUpForm(false); refetchFollowUps(); };
  
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

  // --- Helper mapping functions ---
  const getRegion = (val?: number) => {
    const regions: Record<number, string> = {
      1: 'Dakar', 2: 'Diourbel', 3: 'Fatick', 4: 'Kaffrine', 5: 'Kaolack',
      6: 'Kédougou', 7: 'Kolda', 8: 'Louga', 9: 'Matam', 10: 'Saint-Louis',
      11: 'Sédhiou', 12: 'Tambacounda', 13: 'Thiès', 14: 'Ziguinchor'
    };
    return val ? regions[val] : '—';
  };

  const getProfession = (val?: number) => {
    const profs: Record<number, string> = {
      1: 'Ménagère', 2: 'Salariée', 3: 'Étudiante/Élève', 4: 'Commerçante',
      5: 'Couturière/Coiffeuse/Restauratrice', 6: 'Paysanne/Éleveuse', 7: 'Sans emploi', 8: 'Autre'
    };
    return val ? profs[val] : '—';
  };

  const getInstruction = (val?: number) => {
    const map: Record<number, string> = { 0: 'Aucun', 1: 'Primaire', 2: 'Secondaire', 3: 'Supérieur', 4: 'École coranique/Daara', 5: 'Alphabétisation' };
    return val !== undefined ? map[val] : '—';
  };

  const getMatrimonial = (val?: number) => {
    const map: Record<number, string> = { 1: 'Célibataire', 2: 'Mariée monogame', 3: 'Mariée polygame', 4: 'Veuve', 5: 'Divorcée/Séparée', 6: 'Union libre' };
    return val ? map[val] : '—';
  };

  const getIvaResult = (val?: number) => {
    const map: Record<number, string> = { 1: 'Négatif', 2: 'Positif', 3: 'Polype', 4: 'Suspicion cancer', 5: 'Non concluant' };
    return val ? map[val] : '—';
  };

  const getVihStatut = (val?: number) => {
    const map: Record<number, string> = { 1: 'Négatif', 2: 'Positif (TARV+)', 3: 'Positif (TARV-)', 9: 'Inconnu/Refus' };
    return val ? map[val] : '—';
  };

  const getCytologie = (val?: number) => {
    const map: Record<number, string> = {
      1: 'NILM (normal)', 2: 'ASC-US', 3: 'ASC-H', 4: 'LSIL', 5: 'HSIL',
      6: 'AGC', 7: 'Carcinome épidermoïde', 8: 'Adénocarcinome', 9: 'Insatisfaisant'
    };
    return val ? map[val] : '—';
  };

  const clinicalSummaryText = patient.ai_synthese || aiSummary?.synthese;

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
            <span className="text-[#bec9c9]">|</span>
            <span className="px-3 py-0.5 bg-[#ffdbcf] text-[#9a4523] rounded-full text-[10px] font-bold tracking-wider uppercase">{patient.status}</span>
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
        {/* Main Content (Bento Grid) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
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
                IVA: {getIvaResult(patient.dep_resultat_iva)}
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
                  <p className="text-base leading-relaxed">
                    Après analyse du profil clinique complet de <span className="font-bold text-[#006669]">{patient.full_name}</span> (âge: {patient.age} ans), l'assistant intelligent Njariñu propose la synthèse clinique suivante :
                  </p>
                  {clinicalSummaryText ? (
                    <ClinicalAiSummary text={clinicalSummaryText} />
                  ) : (
                    <div className="p-8 bg-[#f2fbff] rounded-3xl border border-[#006669]/10 text-[#3e4949] text-sm leading-relaxed italic relative whitespace-pre-wrap">
                      <span className="material-symbols-outlined absolute top-4 left-4 text-[#006669]/20 text-[40px]">format_quote</span>
                      <div className="relative z-10 ml-6">
                        La synthèse clinique automatique est disponible lors du premier enregistrement de la fiche ou peut être éditée manuellement.
                      </div>
                    </div>
                  )}
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

          {/* Clinical Data grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Socio-demographic Bento */}
            <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#091e25] mb-6 flex items-center gap-2 border-b border-[#bec9c9]/10 pb-3">
                  <span className="material-symbols-outlined text-[#006669]">badge</span> Sociodémographique
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Région</span>
                    <span className="font-bold text-[#091e25]">{getRegion(patient.geo_region)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Profession</span>
                    <span className="font-bold text-[#091e25]">{getProfession(patient.soc_profession)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Niveau d'instruction</span>
                    <span className="font-bold text-[#091e25]">{getInstruction(patient.soc_niveau_instruction)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Statut Matrimonial</span>
                    <span className="font-bold text-[#091e25]">{getMatrimonial(patient.soc_statut_matrimonial)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6f7979]">NIN (Identifiant National)</span>
                    <span className="font-bold text-[#091e25] font-mono">{patient.pat_nin || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Records Bento */}
            <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#091e25] mb-6 flex items-center gap-2 border-b border-[#bec9c9]/10 pb-3">
                  <span className="material-symbols-outlined text-[#006669]">clinical_notes</span> Facteurs Cliniques & Gynéco
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Grossesses / Accouchements</span>
                    <span className="font-bold text-[#091e25]">G{patient.gyn_nb_grossesses ?? 0} P{patient.gyn_nb_accouchements ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Statut VIH</span>
                    <span className={`font-bold ${patient.ris_vih_statut === 2 || patient.ris_vih_statut === 3 ? 'text-[#ba1a1a]' : 'text-[#006669]'}`}>
                      {getVihStatut(patient.ris_vih_statut)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Contraception</span>
                    <span className="font-bold text-[#091e25]">
                      {(patient.ris_contraception && patient.ris_contraception !== '0') || patient.traitema_contraceptif === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Antécédents Familiaux Cancer</span>
                    <span className="font-bold text-[#091e25]">{patient.membr_famillecancer === 1 ? 'Oui (Signalé)' : 'Aucun'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6f7979]">Dernières Règles (DDR)</span>
                    <span className="font-bold text-[#091e25]">{patient.gyn_ddr || patient.phy_ddr || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Details Bento */}
            <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm md:col-span-2">
              <h4 className="font-bold text-[#091e25] mb-6 flex items-center gap-2 border-b border-[#bec9c9]/10 pb-3">
                <span className="material-symbols-outlined text-[#006669]">biotech</span> Résultats Cliniques & Diagnostic
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Méthode de dépistage</span>
                    <span className="font-bold text-[#091e25]">IVA / IVL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Résultat IVL</span>
                    <span className="font-bold text-[#091e25]">{patient.dep_resultat_ivl ? { 1: 'Négatif', 2: 'Positif', 3: 'Non concluant' }[patient.dep_resultat_ivl] || '—' : '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 pb-2">
                    <span className="text-[#6f7979]">Résultat Cytologie</span>
                    <span className="font-bold text-[#091e25]">{getCytologie(patient.dep_resultat_cytologie)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Biopsie Réalisée</span>
                    <span className="font-bold text-[#091e25]">{patient.dep_biopsie_realisee ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Anatomopathologie</span>
                    <span className="font-bold text-[#091e25]">
                      {patient.sui_anapath_resultat ? { 1: 'Cervicite', 2: 'CIN1/LSIL', 3: 'CIN2', 4: 'CIN3/HSIL', 5: 'AIS', 6: 'Carcinome', 7: 'Adénocarcinome' }[patient.sui_anapath_resultat] || '—' : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pb-2">
                    <span className="text-[#6f7979]">Stade FIGO</span>
                    <span className="font-bold text-[#091e25]">{patient.sui_stade_figo || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment & Reference Bento */}
            <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm md:col-span-2">
              <h4 className="font-bold text-[#091e25] mb-6 flex items-center gap-2 border-b border-[#bec9c9]/10 pb-3">
                <span className="material-symbols-outlined text-[#006669]">medical_services</span> Prise en Charge & Suivi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Méthode de Traitement</span>
                    <span className="font-bold text-[#091e25]">
                      {patient.trt_methode ? { 1: 'Cryothérapie', 2: 'Thermo-ablation', 3: 'LEEP/LLETZ', 4: 'CKC', 5: 'Hystérectomie', 6: 'Chimio/Radio' }[patient.trt_methode] || 'Aucun' : 'Aucun'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pb-2">
                    <span className="text-[#6f7979]">Date du traitement</span>
                    <span className="font-bold text-[#091e25]">{patient.trt_date || '—'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-1 border-b border-[#bec9c9]/10 pb-2">
                    <span className="text-[#6f7979]">Référence Structure</span>
                    <span className="font-bold text-[#091e25]">{patient.sui_reference_structure || 'Aucune'}</span>
                  </div>
                  <div className="flex justify-between py-1 pb-2">
                    <span className="text-[#6f7979]">Motif de Référence</span>
                    <span className="font-bold text-[#091e25]">{patient.sui_reference_motif || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-ups Timeline Bento */}
            <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm md:col-span-2">
              <div className="flex justify-between items-center mb-6 border-b border-[#bec9c9]/10 pb-3">
                <h4 className="font-bold text-[#091e25] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006669]">event_note</span> Calendrier des rendez-vous
                </h4>
                <button 
                  onClick={() => setShowFollowUpForm(true)}
                  className="px-4 py-2 bg-[#dcf1fb] text-[#006669] rounded-xl text-xs font-bold hover:bg-[#006669] hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add_event</span> Planifier un RDV
                </button>
              </div>

              {followUpsData?.results && followUpsData.results.length > 0 ? (
                <div className="relative border-l-2 border-[#006669]/20 ml-2 pl-6 space-y-6">
                  {followUpsData.results.map((f: any) => (
                    <div key={f.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#006669] z-10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#006669]"></div>
                      </div>
                      <div className="bg-[#f2fbff]/40 p-4 rounded-2xl border border-[#bec9c9]/10 flex flex-col md:flex-row justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-[#091e25] text-sm">{f.follow_up_type_display}</h5>
                            <span className="px-2 py-0.5 bg-[#f2fbff] text-[#006669] rounded font-bold text-[9px] uppercase tracking-wider">
                              {f.status_display || f.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#6f7979] font-mono mt-0.5">
                            Planifié le: {new Date(f.scheduled_date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-[#3e4949] mt-2 leading-relaxed italic">
                            {f.notes || 'Pas de note additionnelle.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#f2fbff]/30 rounded-2xl border border-[#bec9c9]/10">
                  <span className="material-symbols-outlined text-[32px] text-[#6f7979] mb-2">event_busy</span>
                  <p className="text-xs text-[#3e4949] font-bold">Aucun rendez-vous de suivi enregistré.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Sidebar Info Panels */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-sm">
            <h4 className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest mb-4">Cliché Colposcopie / Lésion</h4>
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#dcf1fb] border border-[#bec9c9]/20 relative group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmKKcIcb5lgxSU4uG5AahCpWmpyngwAdS13uWj5u-_9cELCQnni8NHbi5hDxG6F_MZUKwyZVNr27tw8AbpmcL3_EQ9sNB-cbGRX2SgDNjFiSEB7c3OMuB5nU1lVuPW_1so9arNiARSNpg_0oHIJNL1w8_JXC2KU4KU1o3KFHEf1v7wfhs7TDU2hYDixvp5yH4z1M3yKhN7KNhv6r53gAK4dvXJAecNx4vtaF7Qo6GF8yZ-6qvCX2Ii8jAA2H9zpd468X3rutuILMU" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500" alt="Examen" />
              <button className="absolute inset-0 bg-[#006669]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white">
                <span className="material-symbols-outlined text-4xl">zoom_in</span>
              </button>
            </div>
            
            {patient.dep_mapping_json && (
              <div className="mt-4 p-4 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10 text-xs">
                <h5 className="font-bold text-[#006669] mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  Cartographie des lésions
                </h5>
                <p className="text-[#3e4949] leading-relaxed">
                  Zones détectées : <span className="font-bold font-mono">{Array.isArray(patient.dep_mapping_json.zones) ? patient.dep_mapping_json.zones.join(', ') : 'Aucune'}</span>
                </p>
                <p className="text-[#3e4949] leading-relaxed mt-1">
                  Atteinte de l'orifice interne (OS) : <span className="font-bold">{patient.dep_mapping_json.os ? 'Oui' : 'Non'}</span>
                </p>
              </div>
            )}
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

      <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)} title="Modifier la fiche patiente" size="6xl">
        <PatientForm patient={patient} onSubmit={handlePatientUpdated} onCancel={() => setShowEditForm(false)} />
      </Modal>

      <Modal isOpen={showFollowUpForm} onClose={() => setShowFollowUpForm(false)} title="Programmer un rendez-vous de suivi">
        <FollowUpForm patientId={patient.record_id} onSubmit={handleFollowUpCreated} onCancel={() => setShowFollowUpForm(false)} />
      </Modal>
    </div>
  );
};

export default PatientDetail;