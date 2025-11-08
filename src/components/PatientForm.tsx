import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { patientService } from '../services/patientService.ts';
import type { Patient, PatientFormData } from '../types';

// --- Helper: options aligned with Django model choices ---
const REGIONS = [
  { value: 0, label: 'Aucune' },
  { value: 1, label: 'Thiès' },
  { value: 2, label: 'Diourbel' },
  { value: 3, label: 'Fatick' },
  { value: 4, label: 'Kaolack' },
  { value: 5, label: 'Louga' },
  { value: 6, label: 'Saint-Louis' },
  { value: 7, label: 'Matam' },
  { value: 8, label: 'Tambacounda' },
  { value: 9, label: 'Kolda' },
  { value: 10, label: 'Ziguinchor' },
  { value: 11, label: 'Kédougou' },
  { value: 12, label: 'Sédhiou' },
];

const STATUT_MATRIM = [
  { value: 1, label: 'Mariée' },
  { value: 2, label: 'Célibataire' },
  { value: 3, label: 'Divorcée' },
  { value: 4, label: 'Veuve' },
];

const SCOLARISATION = [
  { value: 1, label: 'Oui' },
  { value: 2, label: 'Non' },
];

const NIVEAU_SCOLARITE = [
  { value: 0, label: 'Non scolarisée' },
  { value: 1, label: 'Primaire' },
  { value: 2, label: 'Secondaire' },
  { value: 3, label: 'Supérieur' },
  { value: 4, label: 'Coranique' },
];

const GESTITE = [
  { value: 1, label: 'Nulligeste' },
  { value: 2, label: 'Primigeste' },
  { value: 3, label: 'Paucigeste' },
  { value: 4, label: 'Multigeste' },
];

const PARITE = [
  { value: 1, label: 'Nullipare' },
  { value: 2, label: 'Primipare' },
  { value: 3, label: 'Paucipare' },
  { value: 4, label: 'Multipare' },
];

const BINARY_YES_NO = [
  { value: 1, label: 'Oui' },
  { value: 2, label: 'Non' },
];

const RESULTAT_EXAMEN = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Anormal' },
];

const OUI_ANTC_CHIR = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'Césarienne' },
  { value: 2, label: 'Fibrome' },
  { value: 3, label: 'Kyste ovarien' },
  { value: 4, label: 'Appendicectomie' },
  { value: 5, label: 'Cholécystectomie' },
  { value: 6, label: 'Hystérectomie' },
  { value: 7, label: 'Mastectomie' },
];

const DUREE_ANTECEDENT_CHIR = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'Inf 1 an' },
  { value: 2, label: '1-5 ans' },
  { value: 3, label: 'Plus 5 ans' },
];

const CONTRACEPTIFS = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'Pilule' },
  { value: 2, label: 'Implant' },
  { value: 3, label: 'DIU' },
  { value: 4, label: 'Injectable' },
  { value: 5, label: 'Préservatif' },
  { value: 6, label: 'Méthode naturelle' },
];

const SYMPTOMS = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'Douleurs pelviennes' },
  { value: 2, label: 'Saignements irréguliers' },
  { value: 3, label: 'Leucorrhées' },
  { value: 4, label: 'Douleurs mammaires' },
  { value: 5, label: 'Ecoulement mamelonnaire' },
  { value: 6, label: 'Masse palpable' },
];

const DIAGN_COL = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'Cancer sein stade I' },
  { value: 2, label: 'Cancer col stade II' },
  { value: 3, label: 'Cancer ovaire' },
  { value: 4, label: 'Lésion précancéreuse' },
  { value: 5, label: 'Fibrome' },
];

const MEMBER_FAMILY_WHO = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'Mère' },
  { value: 2, label: 'Sœur' },
  { value: 3, label: 'Tante' },
  { value: 4, label: 'Grand-mère' },
  { value: 5, label: 'Cousine' },
  { value: 6, label: 'Fille' },
];

const MEMBER_SITE = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'Sein' },
  { value: 2, label: 'Col utérus' },
  { value: 3, label: 'Ovaire' },
  { value: 4, label: 'Endomètre' },
  { value: 5, label: 'Poumon' },
];

const PERSONNEL_PEC = [
  { value: 1, label: 'Médecin Gynéco' },
  { value: 2, label: 'Sage Femme' },
  { value: 3, label: 'Infirmière' },
];

const PROVENANCE = [
  { value: 1, label: 'Dakar' },
  { value: 2, label: 'Rufisque' },
  { value: 3, label: 'Pikine' },
  { value: 4, label: 'Keur Massar' },
  { value: 5, label: 'Guédiawaye' },
  { value: 6, label: 'Région' },
];

const ETHNIE = [
  { value: 1, label: 'Wolof' },
  { value: 2, label: 'Sérère' },
  { value: 3, label: 'Peulh' },
  { value: 4, label: 'Toucouleur' },
  { value: 5, label: 'Mandingue' },
  { value: 6, label: 'Diola' },
];

const ANTECEDENTS_MEDICAUX = [
  { value: 0, label: 'Aucun' },
  { value: 1, label: 'HTA' },
  { value: 2, label: 'Asthme' },
  { value: 3, label: 'Insuffisance rénale' },
  { value: 4, label: 'Troubles thyroïdiens' },
  { value: 5, label: 'Anémie chronique' },
];

const DURE_CYCLE = [
  { value: 1, label: '24j ou moins' },
  { value: 2, label: '25-31j' },
  { value: 3, label: '32j ou plus' },
];

const CYCLE_MODE = [
  { value: 1, label: 'Réguliers' },
  { value: 2, label: 'Irréguliers' },
  { value: 3, label: 'Ne sais pas' },
];

const FUMER_MODE = [
  { value: 1, label: 'Cigarettes' },
  { value: 2, label: 'Pipe' },
  { value: 3, label: 'Chicha' },
  { value: 4, label: 'Autre' },
];

// --- Component ---
interface Props {
  patient?: any;
  onCancel: () => void;
  onSubmit?: (data?: any) => void;
}

const TOTAL_STEPS = 7;

const PatientFormWizard: React.FC<Props> = ({ patient, onCancel, onSubmit }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    mode: 'onChange',
    defaultValues: (patient as Partial<PatientFormData>) || {},
  });

  // watchers for conditionals
  const anteceden_chirurgi = watch('anteceden_chirurgi');
  const traitema_contraceptif = watch('traitema_contraceptif');
  const symptom_recent = watch('symptom_recent');
  const membr_famillecancer = watch('membr_famillecancer');
  const fumeur = watch('fumeur');
  const menopause = watch('menopause');
  const depistage_cancersein = watch('depistage_cancersein');
  const diagnostic_col = watch('diagnostic_col');
  const consommatio_alcool = watch('consommatio_alcool');

  useEffect(() => {
    if (patient) {
      reset(patient);
    }
  }, [patient, reset]);

  const goNext = async () => {
    const valid = await validateStep(step);
    if (!valid) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const validateStep = async (stepToValidate: number): Promise<boolean> => {
    const fieldsByStep: Record<number, (keyof PatientFormData)[]> = {
      1: ['id_patient', 'prenom', 'nom', 'date_naiss', 'age', 'num_phone', 'region'],
      2: ['statut_matrimoniale', 'scolarisation', 'niveau_scolarite', 'provenance', 'ethnie'],
      3: ['gestite', 'parite', 'anteceden_chirurgi', 'antecedents_medicale', 'diabetique', 'depistage_diabete'],
      4: ['age_menstrue', 'dure_cycle', 'cycle_mode'],
      5: ['traitema_contraceptif', 'menopause', 'fumeur', 'consommatio_alcool'],
      6: ['depistage_cancersein', 'symptom_recent', 'diagnostic_col', 'membr_famillecancer'],
      7: ['personnel_pec', 'resultat_examen'],
    };

    const fields = fieldsByStep[stepToValidate] || [];

    if (stepToValidate === 3 && Number(anteceden_chirurgi) === 1) {
      fields.push('ouianteceden_chirurgi', 'anteceden_chirurgic');
    }
    if (stepToValidate === 5 && Number(traitema_contraceptif) === 1) {
      fields.push('contraceptif_sioui', 'agepilule_contracepti', 'temps_prispilule');
    }
    if (stepToValidate === 5 && Number(menopause) === 1) {
      fields.push('age_menopause');
    }
    if (stepToValidate === 5 && Number(fumeur) === 1) {
      fields.push('debut_fumeur', 'nbreannee_fumeur', 'consommation_moyenntabac', 'fumer_mode');
    }
    if (stepToValidate === 5 && Number(consommatio_alcool) === 1) {
      fields.push('moyenn_semainealcool');
    }
    if (stepToValidate === 6 && Number(symptom_recent) === 1) {
      fields.push('siouisymptomrecan');
    }
    if (stepToValidate === 6 && Number(membr_famillecancer) === 1) {
      fields.push('mmbrfamill_qui', 'mmbrfamill_site', 'mmbrfamill_age');
    }
    if (stepToValidate === 6 && Number(depistage_cancersein) === 1) {
      fields.push('sioui_depistagedure');
    }
    if (stepToValidate === 6 && Number(diagnostic_col) === 1) {
      fields.push('siouidiagnostic_col');
    }

    const result = await trigger(fields as any);
    return result;
  };

  function preparePatientPayload(formData: any): Patient {
    return {
      ...formData,
      id_patient: Number(formData.id_patient) || 0,
      age: Number(formData.age) || 0,
      statut_matrimoniale: Number(formData.statut_matrimoniale) || 1,  // par défaut 1 (Mariée)
      scolarisation: Number(formData.scolarisation) || 2,              // 1=Oui, 2=Non
      niveau_scolarite: Number(formData.niveau_scolarite) || 0,
      provenance: Number(formData.provenance) || 1,
      region: Number(formData.region) || 0,
      ethnie: Number(formData.ethnie) || 1,
      gestite: Number(formData.gestite) || 1,
      parite: Number(formData.parite) || 1,
      anteceden_chirurgi: Number(formData.anteceden_chirurgi) || 2,
      ouianteceden_chirurgi: Number(formData.ouianteceden_chirurgi) || 0,
      anteceden_chirurgic: Number(formData.anteceden_chirurgic) || 0,
      antecedents_medicale: Number(formData.antecedents_medicale) || 2,
      antecedents_medicaux: Number(formData.antecedents_medicaux) || 0,
      diabetique: Number(formData.diabetique) || 2,
      depistage_diabete: Number(formData.depistage_diabete) || 2,
      statut_serologique: Number(formData.statut_serologique) || 2,
      age_menstrue: Number(formData.age_menstrue) || 15,
      dure_cycle: Number(formData.dure_cycle) || 2,
      cycle_mode: Number(formData.cycle_mode) || 1,
      age1_enceint: Number(formData.age1_enceint) || 18,
      nmbre_accouchee: Number(formData.nmbre_accouchee) || 0,
      agepremier_accouchee: Number(formData.agepremier_accouchee) || 18,
      etat_sante: Number(formData.etat_sante) || 1,
      traitema_contraceptif: Number(formData.traitema_contraceptif) || 2,
      contraceptif_sioui: Number(formData.contraceptif_sioui) || 0,
      agepilule_contracepti: Number(formData.agepilule_contracepti) || 18,
      temps_prispilule: Number(formData.temps_prispilule) || 0,
      menopause: Number(formData.menopause) || 2,
      age_menopause: Number(formData.age_menopause) || 47,
      depistage_cancersein: Number(formData.depistage_cancersein) || 2,
      sioui_depistagedure: Number(formData.sioui_depistagedure) || 0,
      symptom_recent: Number(formData.symptom_recent) || 2,
      siouisymptomrecan: Number(formData.siouisymptomrecan) || 0,
      dat_examendepistag: Number(formData.dat_examendepistag) || 0,
      diagnostic_col: Number(formData.diagnostic_col) || 2,
      siouidiagnostic_col: Number(formData.siouidiagnostic_col) || 0,
      membr_famillecancer: Number(formData.membr_famillecancer) || 2,
      mmbrfamill_qui: Number(formData.mmbrfamill_qui) || 0,
      mmbrfamill_site: Number(formData.mmbrfamill_site) || 0,
      mmbrfamill_age: Number(formData.mmbrfamill_age) || 36,
      fumeur: Number(formData.fumeur) || 2,
      debut_fumeur: Number(formData.debut_fumeur) || 0,
      nbreannee_fumeur: Number(formData.nbreannee_fumeur) || 0,
      fumer_mode: Number(formData.fumer_mode) || 2,
      annee_arretfumer: Number(formData.annee_arretfumer) || 0,
      consommation_moyenntabac: Number(formData.consommation_moyenntabac) || 0,
      consommatio_alcool: Number(formData.consommatio_alcool) || 2,
      moyenn_semainealcool: Number(formData.moyenn_semainealcool) || 0,
      personnel_pec: Number(formData.personnel_pec) || 1,
      resultat_examen: Number(formData.resultat_examen) || 1,
      status: formData.status || 'new',  // doit être une des clés de STATUS_CHOICES
      next_appointment_date: formData.next_appointment_date || null, // null si vide
      created_by: formData.created_by || 2,
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      examen_depistag: formData.examen_depistag || '',
    } as Patient;
  }


  const onSubmitForm: SubmitHandler<PatientFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      if (patient?.record_id) {
        await patientService.updatePatient(patient.record_id, data);
        toast.success('Patiente mise à jour avec succès');
      } else {
        const patientPayload = preparePatientPayload(data);
        console.log('Creating patient with payload:', patientPayload);
        await patientService.createPatient(patientPayload);
        toast.success('Patiente enregistrée avec succès');
      }
      onSubmit && onSubmit(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Formulaire Patiente — CerviCare+</h2>
        <div className="text-sm text-gray-500">Étape {step} / {TOTAL_STEPS}</div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
        <div 
          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* STEP 1: Informations générales */}
        {step === 1 && (
          <section>
            <h3 className="text-lg font-medium mb-4">1 — Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">ID Patient *</label>
                <input
                  type="number"
                  {...register('id_patient', {
                    required: 'ID Patient requis',
                    min: { value: 1, message: 'ID invalide' },
                    max: { value: 1000002, message: 'ID trop grand' },
                  })}
                  disabled={!!patient}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                    errors.id_patient ? 'border-red-400 ring-red-200' : 'border-gray-200 ring-indigo-100'
                  }`}
                />
                {errors.id_patient && <p className="text-sm text-red-600 mt-1">{errors.id_patient.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Prénom *</label>
                <input
                  type="text"
                  {...register('prenom', { required: 'Prénom requis' })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                    errors.prenom ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.prenom && <p className="text-sm text-red-600 mt-1">{errors.prenom.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Nom *</label>
                <input
                  type="text"
                  {...register('nom', { required: 'Nom requis' })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                    errors.nom ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.nom && <p className="text-sm text-red-600 mt-1">{errors.nom.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Date de naissance *</label>
                <input
                  type="date"
                  {...register('date_naiss', { required: 'Date de naissance requise' })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                    errors.date_naiss ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.date_naiss && <p className="text-sm text-red-600 mt-1">{errors.date_naiss.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Âge *</label>
                <input
                  type="number"
                  {...register('age', {
                    required: 'Âge requis',
                    min: { value: 15, message: 'Âge minimum 15 ans' },
                    max: { value: 80, message: 'Âge maximum 80 ans' },
                  })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                    errors.age ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Téléphone *</label>
                <input
                  type="tel"
                  {...register('num_phone', {
                    required: 'Numéro requis',
                    pattern: { value: /^[0-9+()\- ]{6,20}$/, message: 'Numéro invalide' },
                  })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                    errors.num_phone ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.num_phone && <p className="text-sm text-red-600 mt-1">{errors.num_phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Région *</label>
                <select
                  {...register('region', { required: 'Région requise' })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                    errors.region ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value="">Sélectionner une région</option>
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {errors.region && <p className="text-sm text-red-600 mt-1">{errors.region.message}</p>}
              </div>
            </div>
          </section>
        )}

        {/* STEP 2: Socio-démographique */}
        {step === 2 && (
          <section>
            <h3 className="text-lg font-medium mb-4">2 — Informations socio-démographiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Statut matrimonial</label>
                <select
                  {...register('statut_matrimoniale')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {STATUT_MATRIM.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Scolarisation</label>
                <select
                  {...register('scolarisation')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {SCOLARISATION.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Niveau de scolarité</label>
                <select
                  {...register('niveau_scolarite')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {NIVEAU_SCOLARITE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Provenance</label>
                <select
                  {...register('provenance')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {PROVENANCE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Ethnie</label>
                <select
                  {...register('ethnie')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {ETHNIE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Motifs de visite</label>
                <input
                  type="text"
                  {...register('motifs_visite')}
                  placeholder="Séparer par des virgules"
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 3: Antécédents gynécologiques et médicaux */}
        {step === 3 && (
          <section>
            <h3 className="text-lg font-medium mb-4">3 — Antécédents gynécologiques & médicaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Gestité</label>
                <select
                  {...register('gestite')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {GESTITE.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Parité</label>
                <select
                  {...register('parite')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {PARITE.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Antécédent chirurgical *</label>
                <select
                  {...register('anteceden_chirurgi')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(anteceden_chirurgi) === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Type d’antécédent</label>
                    <select
                      {...register('ouianteceden_chirurgi')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    >
                      <option value="">Choisir</option>
                      {OUI_ANTC_CHIR.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Durée depuis chirurgie</label>
                    <select
                      {...register('anteceden_chirurgic')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    >
                      <option value="">Choisir</option>
                      {DUREE_ANTECEDENT_CHIR.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium">Antécédents médicaux</label>
                <select
                  {...register('antecedents_medicale')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {ANTECEDENTS_MEDICAUX.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Diabétique ?</label>
                <select
                  {...register('diabetique')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Dépistage diabète ?</label>
                <select
                  {...register('depistage_diabete')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: Cycle menstruel */}
        {step === 4 && (
          <section>
            <h3 className="text-lg font-medium mb-4">4 — Cycle menstruel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Âge à la première menstruation</label>
                <input
                  type="number"
                  {...register('age_menstrue')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Durée du cycle</label>
                <select
                  {...register('dure_cycle')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {DURE_CYCLE.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Mode du cycle</label>
                <select
                  {...register('cycle_mode')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {CYCLE_MODE.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* STEP 5: Contraception, ménopause, tabac et alcool */}
        {step === 5 && (
          <section>
            <h3 className="text-lg font-medium mb-4">5 — Contraception & habitudes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Traitement contraceptif</label>
                <select
                  {...register('traitema_contraceptif')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(traitema_contraceptif) === 1 && (
                <div>
                  <label className="block text-sm font-medium">Type de contraceptif</label>
                  <select
                    {...register('contraceptif_sioui')}
                    className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                  >
                    <option value="">Choisir</option>
                    {CONTRACEPTIFS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Ménopause</label>
                <select
                  {...register('menopause')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(menopause) === 1 && (
                <div>
                  <label className="block text-sm font-medium">Âge de la ménopause</label>
                  <input
                    type="number"
                    {...register('age_menopause')}
                    className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Fumeur ?</label>
                <select
                  {...register('fumeur')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(fumeur) === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Année début fumeur</label>
                    <input
                      type="number"
                      {...register('debut_fumeur')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Nombre d’années fumées</label>
                    <input
                      type="number"
                      {...register('nbreannee_fumeur')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Mode de consommation</label>
                    <select
                      {...register('fumer_mode')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    >
                      <option value="">Choisir</option>
                      {FUMER_MODE.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium">Consommation alcool</label>
                <select
                  {...register('consommatio_alcool')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(consommatio_alcool) === 1 && (
                <div>
                  <label className="block text-sm font-medium">Moyenne semaine alcool</label>
                  <input
                    type="number"
                    {...register('moyenn_semainealcool')}
                    className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* STEP 6: Symptômes récents & antécédents familiaux */}
        {step === 6 && (
          <section>
            <h3 className="text-lg font-medium mb-4">6 — Symptômes & antécédents familiaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Dépistage cancer du sein</label>
                <select
                  {...register('depistage_cancersein')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Symptômes récents</label>
                <select
                  {...register('symptom_recent')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(symptom_recent) === 1 && (
                <div>
                  <label className="block text-sm font-medium">Préciser symptômes</label>
                  <select
                    {...register('siouisymptomrecan')}
                    className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                  >
                    <option value="">Choisir</option>
                    {SYMPTOMS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Diagnostic col utérin</label>
                <select
                  {...register('diagnostic_col')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {RESULTAT_EXAMEN.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(diagnostic_col) === 1 && (
                <div>
                  <label className="block text-sm font-medium">Préciser diagnostic</label>
                  <select
                    {...register('siouidiagnostic_col')}
                    className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                  >
                    <option value="">Choisir</option>
                    {DIAGN_COL.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Membres famille atteints de cancer</label>
                <select
                  {...register('membr_famillecancer')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {BINARY_YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {Number(membr_famillecancer) === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Qui ?</label>
                    <select
                      {...register('mmbrfamill_qui')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    >
                      <option value="">Choisir</option>
                      {MEMBER_FAMILY_WHO.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Site touché</label>
                    <select
                      {...register('mmbrfamill_site')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    >
                      <option value="">Choisir</option>
                      {MEMBER_SITE.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Âge au diagnostic</label>
                    <input
                      type="number"
                      {...register('mmbrfamill_age')}
                      className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* STEP 7: Prise en charge & résultat examen */}
        {step === 7 && (
          <section>
            <h3 className="text-lg font-medium mb-4">7 — Prise en charge & résultat examen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Personnel en charge</label>
                <select
                  {...register('personnel_pec')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {PERSONNEL_PEC.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Résultat examen</label>
                <select
                  {...register('resultat_examen')}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 border-gray-200"
                >
                  <option value="">Choisir</option>
                  {RESULTAT_EXAMEN.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Précédent
          </button>

          {step < TOTAL_STEPS && (
            <button
              type="button"
              onClick={goNext}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Suivant
            </button>
          )}

          {step === TOTAL_STEPS && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientFormWizard;
