import React, { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { seinService } from '../services/seinService.ts';
import type { SeinPatient } from '../types';
import { CheckCard, ClinicalShell, F, NavigationActions, Notice, Sel, cls, opt } from './ClinicalFormUI';

const today = () => new Date().toISOString().slice(0, 10);

const GEO_REGIONS = [
  opt(1, 'Dakar'), opt(2, 'Diourbel'), opt(3, 'Fatick'), opt(4, 'Kaffrine'),
  opt(5, 'Kaolack'), opt(6, 'Kedougou'), opt(7, 'Kolda'), opt(8, 'Louga'),
  opt(9, 'Matam'), opt(10, 'Saint-Louis'), opt(11, 'Sedhiou'),
  opt(12, 'Tambacounda'), opt(13, 'Thies'), opt(14, 'Ziguinchor'),
];
const GEO_TYPE_STRUCTURE = [
  opt(1, 'Poste de sante'), opt(2, 'Centre de sante'), opt(3, 'Hopital de district'),
  opt(4, 'EPS niveau 2'), opt(5, 'EPS niveau 3'), opt(6, 'Caravane mobile'),
];
const META_QUALIF = [
  opt(1, 'Sage-femme'), opt(2, 'Medecin generaliste'), opt(3, 'Gynecologue'),
  opt(4, 'Infirmier(ere)'), opt(5, 'Senologue'), opt(6, 'Autre'),
];
const SOC_PROF = [
  opt(1, 'Menagere'), opt(2, 'Salariee'), opt(3, 'Etudiante/Eleve'),
  opt(4, 'Commercante'), opt(5, 'Couturiere/Coiffeuse/Restauratrice'),
  opt(6, 'Paysanne/Eleveuse'), opt(7, 'Sans emploi'), opt(8, 'Autre (preciser)'),
];
const SOC_INSTRUCTION = [
  opt(0, 'Aucun'), opt(1, 'Primaire'), opt(2, 'Secondaire'),
  opt(3, 'Superieur'), opt(4, 'Ecole coranique/Daara'), opt(5, 'Alphabetisation'),
];
const SOC_STATUT_MATRIM = [
  opt(1, 'Celibataire'), opt(2, 'Mariee monogame'), opt(3, 'Mariee polygame'),
  opt(4, 'Veuve'), opt(5, 'Divorcee/Separee'), opt(6, 'Union libre'),
];
const SOC_MODE_ENTREE = [
  opt(1, 'Venue spontanee'), opt(2, 'Mobilisation communautaire'),
  opt(3, 'Orientation par agent de sante'), opt(4, 'Reference inter-structure'),
  opt(5, 'Caravane'),
];
const OUI_NON = [opt(1, 'Oui'), opt(0, 'Non'), opt(9, 'Ne sait pas')];
const VIH = [
  opt(1, 'Negatif'), opt(2, 'Positif sous TARV'),
  opt(3, 'Positif sans TARV'), opt(9, 'Inconnu/Refus'),
];
const MENOPAUSE = [
  opt(1, 'Non menopausee'), opt(2, 'Menopausee naturellement'),
  opt(3, 'Menopause chirurgicale'), opt(9, 'Ne sait pas'),
];
const CONTRACEPTION = [
  opt(0, 'Aucune'), opt(1, 'Pilule combinee'), opt(2, 'Pilule progestative'),
  opt(3, 'DIU hormonal'), opt(4, 'Implant'), opt(5, 'Injectable'),
  opt(6, 'Preservatif'), opt(7, 'Sterilisation'), opt(8, 'Naturelle'), opt(9, 'Autre'),
];
const ACTIVITE = [
  opt(1, 'Sedentaire (< 150 min/semaine)'),
  opt(2, 'Moderement active (150-300 min/semaine)'),
  opt(3, 'Active (> 300 min/semaine)'),
];
const SEIN = [opt('D', 'Sein droit'), opt('G', 'Sein gauche'), opt('B', 'Bilateral')];
const QUADRANT = [
  opt('QSE', 'Supero-externe (QSE)'), opt('QSI', 'Supero-interne (QSI)'),
  opt('QIE', 'Infero-externe (QIE)'), opt('QII', 'Infero-interne (QII)'),
  opt('RC', 'Region centrale / areolaire'), opt('UE', 'Union quadrants externes'),
  opt('UI', 'Union quadrants internes'), opt('US', 'Union quadrants superieurs'),
  opt('UI2', 'Union quadrants inferieurs'),
];
const INSPECTION = [
  opt(1, 'Normal'), opt(2, 'Asymetrie'), opt(3, 'Retraction cutanee'),
  opt(4, "Peau d'orange"), opt(5, 'Erytheme / Inflammation'),
  opt(6, 'Ulceration'), opt(7, 'Autre'),
];
const CONSISTANCE = [
  opt(1, 'Molle / Renitente'), opt(2, 'Ferme / Elastique'), opt(3, 'Dure / Pierreuse'),
];
const DENSITE = [
  opt(1, 'Type A - essentiellement graisseux'),
  opt(2, 'Type B - densite fibroglandulaire disseminee'),
  opt(3, 'Type C - heterogene dense'),
  opt(4, 'Type D - extremement dense'),
];
const BIRADS_CHOICES = [
  opt(0, 'BIRADS 0 - Incomplet'),
  opt(1, 'BIRADS 1 - Normal'),
  opt(2, 'BIRADS 2 - Benin'),
  opt(3, 'BIRADS 3 - Probablement benin'),
  opt(4, 'BIRADS 4 - Suspect'),
  opt(5, 'BIRADS 5 - Tres suspect'),
  opt(6, 'BIRADS 6 - Cancer prouve'),
];
const BIOPSIE_TYPE = [
  opt(1, 'Microbiopsie (Tru-cut)'), opt(2, 'Macrobiopsie (VABB)'),
  opt(3, 'Biopsie chirurgicale (exerese)'),
];
const ANAPATH = [
  opt(1, 'Tissu normal / Mastose fibrokystique'),
  opt(2, 'Adenofibrome / Fibroadenome'),
  opt(3, 'Lesion proliferative sans atypie'),
  opt(4, 'Lesion proliferative avec atypie'),
  opt(5, 'Carcinome in situ (CCIS / CLIS)'),
  opt(6, 'Carcinome canalaire invasif - Grade SBR 1'),
  opt(7, 'Carcinome canalaire invasif - Grade SBR 2'),
  opt(8, 'Carcinome canalaire invasif - Grade SBR 3'),
  opt(9, 'Carcinome lobulaire invasif'),
  opt(10, 'Autre carcinome invasif'),
  opt(11, 'Non concluant'),
];
const RES_GLOBAL = [
  opt(1, 'Normal - pas de signe de malignite'),
  opt(2, 'Surveillance rapprochee - probablement benin (BIRADS 3)'),
  opt(3, 'Reference pour examens complementaires (BIRADS 4)'),
  opt(4, 'Reference urgente - forte suspicion (BIRADS 5)'),
  opt(5, 'Cancer confirme - prise en charge oncologique'),
  opt(6, 'Lesion benigne traitee'),
];
const TRAITEMENT = [
  opt(1, 'Surveillance active (controle 6 mois)'),
  opt(2, 'Chirurgie conservatrice (tumorectomie)'),
  opt(3, 'Mastectomie'), opt(4, 'Radiotherapie'),
  opt(5, 'Chimiotherapie neoadjuvante'), opt(6, 'Chimiotherapie adjuvante'),
  opt(7, 'Hormonotherapie'), opt(8, 'Therapie ciblee HER2'),
  opt(9, 'Soins palliatifs'), opt(10, 'Autre'),
];

interface SeinFormWizardProps {
  patient?: SeinPatient | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 7;
const STEP_LABELS = [
  'Consentements (CON)', 'META + GEO', 'Identite + SOC',
  'Risques (RIS)', 'Symptomes (SYM)', 'Examen (EXAM)', 'Examens + RES',
];

const numericFields: (keyof SeinPatient)[] = [
  'id_patient', 'age', 'meta_agent_qualif', 'geo_region', 'geo_type_structure',
  'soc_profession', 'soc_niveau_instruction', 'soc_statut_matrimonial', 'soc_mode_entree',
  'ris_atcd_perso_sein', 'ris_atcd_perso_sein_annee', 'ris_atcd_lesion_benigne',
  'ris_atcd_fam_sein', 'ris_atcd_fam_ovaire', 'ris_mutation_brca', 'ris_menopause',
  'ris_age_menopause', 'ris_age_menarche', 'ris_age_premiere_grossesse',
  'ris_nb_enfants', 'ris_allaitement', 'ris_allaitement_duree_mois',
  'ris_contraception', 'ris_contraception_duree_ans', 'ris_thm', 'ris_thm_duree_ans',
  'ris_obesite', 'ris_imc', 'ris_activite_physique', 'ris_consommation_alcool',
  'ris_vih_statut', 'ris_irradiation_thoracique', 'ris_mammographie_anterieure',
  'ris_mammographie_anterieure_annee', 'ris_mammographie_anterieure_birads',
  'ris_auto_examen_pratique', 'sym_masse_palpable', 'sym_ecoulement_mamelonnaire',
  'sym_douleur_sein', 'sym_retraction_mamelon', 'sym_modification_peau',
  'sym_adenopathie_axillaire', 'sym_duree_symptomes_mois', 'exam_inspection_droit',
  'exam_inspection_gauche', 'exam_masse_taille_cm', 'exam_masse_consistance',
  'dep_mammo_birads_droit', 'dep_mammo_birads_gauche', 'dep_mammo_densite',
  'dep_echo_birads_droit', 'dep_echo_birads_gauche', 'dep_echo_masse_taille_cm',
  'dep_biopsie_type', 'dep_anapath_resultat', 'dep_anapath_ki67',
  'res_resultat_global', 'res_traitement_propose',
];
const dateFields: (keyof SeinPatient)[] = [
  'date_naiss', 'exam_date', 'dep_mammo_date', 'dep_echo_date',
  'res_rdv_suivi', 'res_rdv_1mois', 'res_rdv_3mois',
  'res_rdv_6mois', 'res_rdv_1an', 'con_depistage_date',
];

const sanitizePayload = (data: Partial<SeinPatient>) => {
  const payload: Record<string, any> = { ...data };
  numericFields.forEach((field) => {
    const value = payload[field];
    if (value === '' || value === undefined || Number.isNaN(value)) payload[field] = null;
    else if (value !== null) payload[field] = Number(value);
  });
  dateFields.forEach((field) => {
    if (payload[field] === '') payload[field] = null;
  });
  if (payload.ris_atcd_perso_sein !== 1) payload.ris_atcd_perso_sein_annee = null;
  if (payload.ris_atcd_fam_sein !== 1) payload.ris_atcd_fam_sein_lien = null;
  if (![2, 3].includes(payload.ris_menopause)) payload.ris_age_menopause = null;
  if (payload.ris_nullipare) {
    payload.ris_nb_enfants = null;
    payload.ris_age_premiere_grossesse = null;
  }
  if (payload.ris_allaitement !== 1) payload.ris_allaitement_duree_mois = null;
  if (![1, 2, 3, 4, 5].includes(payload.ris_contraception)) payload.ris_contraception_duree_ans = null;
  if (payload.ris_thm !== 1) payload.ris_thm_duree_ans = null;
  if (payload.ris_mammographie_anterieure !== 1) {
    payload.ris_mammographie_anterieure_annee = null;
    payload.ris_mammographie_anterieure_birads = null;
  }
  if (payload.sym_masse_palpable !== 1) payload.sym_masse_sein = null;
  if (payload.sym_ecoulement_mamelonnaire !== 1) payload.sym_ecoulement_type = null;
  if (!payload.exam_masse_palpee) {
    payload.exam_masse_sein = null;
    payload.exam_masse_quadrant = null;
    payload.exam_masse_taille_cm = null;
    payload.exam_masse_consistance = null;
    payload.exam_masse_contours = null;
    payload.exam_masse_mobile = null;
  }
  if (!payload.exam_ganglion_axillaire) payload.exam_ganglion_axillaire_sein = null;
  if (!payload.dep_mammo_realisee) {
    payload.dep_mammo_date = null;
    payload.dep_mammo_birads_droit = null;
    payload.dep_mammo_birads_gauche = null;
    payload.dep_mammo_densite = null;
    payload.dep_mammo_anomalie = false;
    payload.dep_mammo_anomalie_detail = null;
  }
  if (!payload.dep_mammo_anomalie) payload.dep_mammo_anomalie_detail = null;
  if (!payload.dep_echo_realisee) {
    payload.dep_echo_date = null;
    payload.dep_echo_birads_droit = null;
    payload.dep_echo_birads_gauche = null;
    payload.dep_echo_masse = false;
    payload.dep_echo_masse_taille_cm = null;
    payload.dep_echo_note = null;
  }
  if (!payload.dep_echo_masse) payload.dep_echo_masse_taille_cm = null;
  if (!payload.dep_biopsie_realisee) {
    payload.dep_biopsie_type = null;
    payload.dep_anapath_resultat = null;
    payload.dep_anapath_recepteurs = null;
    payload.dep_anapath_ki67 = null;
  }
  if (payload.res_resultat_global !== 5) {
    payload.res_stade_tnm = null;
    payload.res_stade_clinical = null;
  }
  if (!payload.res_reference) {
    payload.res_reference_structure = null;
    payload.res_reference_motif = null;
  }
  return payload as Partial<SeinPatient>;
};

const maxBirads = (...values: Array<number | string | undefined | null>) => {
  const nums = values.map(Number).filter((v) => Number.isFinite(v));
  return nums.length ? Math.max(...nums) : null;
};
const hasNumericValue = (value: number | string | undefined | null) =>
  value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value));

export const SeinFormWizard: React.FC<SeinFormWizardProps> = ({ patient, onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo<Partial<SeinPatient>>(
    () => patient || {
      id_patient: Math.floor(1000000 + Math.random() * 9000000),
      age: 40,
      status: 'new',
      con_depistage: true,
      con_donnees_anonymisees: true,
      con_depistage_date: today(),
      exam_date: today(),
    },
    [patient]
  );

  const { register, handleSubmit, watch, trigger, formState: { errors }, reset, setValue } =
    useForm<Partial<SeinPatient>>({ mode: 'onChange', defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const w = {
    metaQualif: watch('meta_agent_qualif'),
    profession: watch('soc_profession'),
    persoSein: watch('ris_atcd_perso_sein'),
    famSein: watch('ris_atcd_fam_sein'),
    menopause: watch('ris_menopause'),
    nullipare: watch('ris_nullipare'),
    allaitement: watch('ris_allaitement'),
    contraception: watch('ris_contraception'),
    thm: watch('ris_thm'),
    mammoAnte: watch('ris_mammographie_anterieure'),
    symMasse: watch('sym_masse_palpable'),
    symEcoulement: watch('sym_ecoulement_mamelonnaire'),
    examMasse: watch('exam_masse_palpee'),
    ganglion: watch('exam_ganglion_axillaire'),
    mammo: watch('dep_mammo_realisee'),
    echo: watch('dep_echo_realisee'),
    echoMasse: watch('dep_echo_masse'),
    biopsie: watch('dep_biopsie_realisee'),
    anapath: watch('dep_anapath_resultat'),
    resultat: watch('res_resultat_global'),
    reference: watch('res_reference'),
    biradsD: watch('dep_mammo_birads_droit'),
    biradsG: watch('dep_mammo_birads_gauche'),
    echoBiradsD: watch('dep_echo_birads_droit'),
    echoBiradsG: watch('dep_echo_birads_gauche'),
  };

  useEffect(() => {
    if (hasNumericValue(w.biradsD) || hasNumericValue(w.biradsG)) {
      setValue('dep_mammo_realisee', true);
      if (!watch('dep_mammo_date')) setValue('dep_mammo_date', today());
    }
  }, [w.biradsD, w.biradsG, setValue, watch]);

  useEffect(() => {
    if (hasNumericValue(w.echoBiradsD) || hasNumericValue(w.echoBiradsG)) {
      setValue('dep_echo_realisee', true);
      if (!watch('dep_echo_date')) setValue('dep_echo_date', today());
    }
  }, [w.echoBiradsD, w.echoBiradsG, setValue, watch]);

  useEffect(() => {
    const birads = maxBirads(w.biradsD, w.biradsG, w.echoBiradsD, w.echoBiradsG);
    const anapath = Number(w.anapath);
    let next: number | null = null;

    if (anapath >= 5 && anapath <= 10) next = 5;
    else if (anapath >= 1 && anapath <= 4) next = 6;
    else if (birads === 6) next = 5;
    else if (birads === 5) next = 4;
    else if (birads === 4) next = 3;
    else if (birads === 3) next = 2;
    else if (birads === 1 || birads === 2) next = 1;

    if (next) {
      setValue('res_resultat_global', next);
      if ([3, 4, 5].includes(next)) {
        setValue('res_reference', true);
      }
    }
  }, [w.biradsD, w.biradsG, w.echoBiradsD, w.echoBiradsG, w.anapath, setValue]);

  const fieldsByStep: Record<number, (keyof SeinPatient)[]> = {
    1: ['con_depistage', 'con_donnees_anonymisees', 'con_signature_presente'],
    2: ['id_patient', 'meta_agent_qualif', 'geo_region', 'geo_type_structure'],
    3: ['prenom', 'nom', 'age', 'num_phone', 'pat_adresse', 'soc_profession', 'soc_niveau_instruction', 'soc_statut_matrimonial'],
    4: [],
    5: [],
    6: ['exam_date'],
    7: ['res_resultat_global'],
  };

  const goNext = async () => {
    if (step === 1 && !watch('con_depistage')) {
      toast.error('Le consentement au depistage est requis');
      return;
    }
    const valid = await trigger(fieldsByStep[step] as any);
    if (!valid) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const handleFormSubmit: SubmitHandler<Partial<SeinPatient>> = async (data) => {
    setLoading(true);
    try {
      const payload = sanitizePayload({
        ...data,
        status: data.status || 'new',
      });
      if (patient?.record_id) {
        await seinService.updatePatient(patient.record_id, payload);
        toast.success('Dossier cancer du sein mis a jour !');
      } else {
        await seinService.createPatient(payload);
        toast.success('Fiche depistage cancer du sein creee !');
      }
      onSubmit();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClinicalShell
      step={step}
      totalSteps={TOTAL_STEPS}
      labels={STEP_LABELS}
      title="Fiche de Collecte Patiente"
      subtitle="Programme de depistage du Cancer du Sein"
      onStepClick={setStep}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-12 slide-up">
        {step === 1 && (
          <section className="fade-in">
            <StepHeader code="A" title="Consentements eclaires (CON)" desc="Consentement libre, eclaire et revocable avant tout examen clinique ou imagerie mammaire." />
            <Notice icon="warning" title="Important">
              La patiente doit etre informee de ses droits avant l'examen clinique, la mammographie, l'echographie, la biopsie ou la reference.
            </Notice>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CheckCard label="Consentement au depistage" icon="clinical_notes" checked={!!watch('con_depistage')} onChange={(v) => setValue('con_depistage', v)} sublabel="Examen / Mammo / Echo" />
              <CheckCard label="Consentement au traitement" icon="medical_services" checked={!!watch('con_traitement')} onChange={(v) => setValue('con_traitement', v)} sublabel="Chirurgie / Oncologie" />
              <CheckCard label="Donnees anonymisees" icon="database" checked={!!watch('con_donnees_anonymisees')} onChange={(v) => setValue('con_donnees_anonymisees', v)} sublabel="Utilisation pour la recherche medicale" />
              <CheckCard label="Rappels par SMS" icon="sms" checked={!!watch('con_rappels_sms')} onChange={(v) => setValue('con_rappels_sms', v)} sublabel="Notifications de suivi automatique" />
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-slate-50 rounded-[40px] border border-slate-100 items-center">
              <F label="Date du consentement">
                <input type="date" {...register('con_depistage_date')} className={cls()} />
              </F>
              <F label="Validation physique" col2>
                <CheckCard label="Signature / Empreinte recueillie" icon="draw" checked={!!watch('con_signature_presente')} onChange={(v) => setValue('con_signature_presente', v)} sublabel="Signe sur fiche papier" />
              </F>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <StepHeader code="B" title="Metadonnees et identification geographique" desc="Information sur l'agent, la structure et la session de collecte." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="ID Patiente" required error={errors.id_patient?.message as string}>
                <input type="number" {...register('id_patient', { required: 'ID Patient requis', min: { value: 1, message: 'ID invalide' }, valueAsNumber: true })} disabled={!!patient} className={cls(!!errors.id_patient)} />
              </F>
              <F label="Qualification de l'agent" required>
                <Sel options={META_QUALIF} {...register('meta_agent_qualif', { required: true, valueAsNumber: true })} />
              </F>
              {Number(w.metaQualif) === 6 && (
                <F label="Qualification (preciser)">
                  <input type="text" {...register('meta_agent_qualif_autre')} className={cls()} />
                </F>
              )}
              <F label="Region medicale" required>
                <Sel options={GEO_REGIONS} {...register('geo_region', { required: true, valueAsNumber: true })} />
              </F>
              <F label="District sanitaire">
                <input type="text" {...register('geo_district')} className={cls()} />
              </F>
              <F label="Structure de sante">
                <input type="text" {...register('geo_structure')} className={cls()} />
              </F>
              <F label="Type de structure">
                <Sel options={GEO_TYPE_STRUCTURE} {...register('geo_type_structure', { valueAsNumber: true })} />
              </F>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <StepHeader code="C" title="Identite et donnees sociodemographiques" desc="Profil de la patiente et criteres de ciblage du depistage sein." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Prenom(s)" required error={errors.prenom?.message as string}>
                <input type="text" {...register('prenom', { required: 'Prenom requis' })} className={cls(!!errors.prenom)} />
              </F>
              <F label="Nom de famille" required error={errors.nom?.message as string}>
                <input type="text" {...register('nom', { required: 'Nom requis' })} className={cls(!!errors.nom)} />
              </F>
              <F label="Date de naissance">
                <input type="date" {...register('date_naiss')} className={cls()} />
              </F>
              <F label="Age (annees revolues)" required error={errors.age?.message as string}>
                <input type="number" {...register('age', { required: 'Age requis', min: { value: 18, message: '>= 18 ans' }, max: { value: 99, message: '<= 99 ans' }, valueAsNumber: true })} className={cls(!!errors.age)} />
              </F>
              <F label="Age estime ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('pat_age_estime')} /> Oui</label>
              </F>
              <F label="Telephone mobile" required error={errors.num_phone?.message as string}>
                <input type="tel" placeholder="7X XXX XX XX" {...register('num_phone', { required: 'Telephone requis', pattern: { value: /^(70|75|76|77|78)[0-9]{7}$/, message: 'Format SN invalide' } })} className={cls(!!errors.num_phone)} />
              </F>
              <F label="Telephone d'un proche">
                <input type="tel" {...register('pat_telephone_proche')} className={cls()} />
              </F>
              <F label="Adresse / Quartier" required error={errors.pat_adresse?.message as string}>
                <input type="text" {...register('pat_adresse', { required: 'Adresse requise' })} className={cls(!!errors.pat_adresse)} />
              </F>
              <F label="CNI / NIN confidentiel" col2>
                <input type="text" {...register('pat_nin')} className={cls()} />
              </F>
              <F label="Profession" required>
                <Sel options={SOC_PROF} {...register('soc_profession', { required: true, valueAsNumber: true })} />
              </F>
              {Number(w.profession) === 8 && (
                <F label="Profession (preciser)">
                  <input type="text" {...register('soc_profession_autre')} className={cls()} />
                </F>
              )}
              <F label="Niveau d'instruction" required>
                <Sel options={SOC_INSTRUCTION} {...register('soc_niveau_instruction', { required: true, valueAsNumber: true })} />
              </F>
              <F label="Statut matrimonial" required>
                <Sel options={SOC_STATUT_MATRIM} {...register('soc_statut_matrimonial', { required: true, valueAsNumber: true })} />
              </F>
              <F label="Mode d'entree dans le programme">
                <Sel options={SOC_MODE_ENTREE} {...register('soc_mode_entree', { valueAsNumber: true })} />
              </F>
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <StepHeader code="D" title="Antecedents et facteurs hormonaux" desc="Les precisions se deploient selon les reponses et reduisent la saisie inutile." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Antecedent personnel de cancer du sein">
                <Sel options={OUI_NON} {...register('ris_atcd_perso_sein', { valueAsNumber: true })} />
              </F>
              {Number(w.persoSein) === 1 && (
                <F label="Annee du cancer personnel">
                  <input type="number" min={1950} max={2030} {...register('ris_atcd_perso_sein_annee', { valueAsNumber: true })} className={cls()} />
                </F>
              )}
              <F label="Lesion benigne du sein biopsiee ?">
                <Sel options={OUI_NON} {...register('ris_atcd_lesion_benigne', { valueAsNumber: true })} />
              </F>
              <F label="Antecedent familial de cancer du sein (1er degre)">
                <Sel options={OUI_NON} {...register('ris_atcd_fam_sein', { valueAsNumber: true })} />
              </F>
              {Number(w.famSein) === 1 && (
                <F label="Lien de parente">
                  <input type="text" placeholder="Mere, soeur, fille..." {...register('ris_atcd_fam_sein_lien')} className={cls()} />
                </F>
              )}
              <F label="Antecedent familial de cancer de l'ovaire">
                <Sel options={OUI_NON} {...register('ris_atcd_fam_ovaire', { valueAsNumber: true })} />
              </F>
              <F label="Mutation BRCA connue ?">
                <Sel options={OUI_NON} {...register('ris_mutation_brca', { valueAsNumber: true })} />
              </F>
              <F label="Statut menopausique">
                <Sel options={MENOPAUSE} {...register('ris_menopause', { valueAsNumber: true })} />
              </F>
              {[2, 3].includes(Number(w.menopause)) && (
                <F label="Age a la menopause">
                  <input type="number" min={35} max={65} {...register('ris_age_menopause', { valueAsNumber: true })} className={cls()} />
                </F>
              )}
              <F label="Age aux premieres regles">
                <input type="number" min={8} max={20} {...register('ris_age_menarche', { valueAsNumber: true })} className={cls()} />
              </F>
              <F label="Nullipare ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('ris_nullipare')} /> Oui</label>
              </F>
              {!w.nullipare && (
                <>
                  <F label="Nombre d'enfants">
                    <input type="number" min={0} max={20} {...register('ris_nb_enfants', { valueAsNumber: true })} className={cls()} />
                  </F>
                  <F label="Age a la premiere grossesse">
                    <input type="number" min={10} max={55} {...register('ris_age_premiere_grossesse', { valueAsNumber: true })} className={cls()} />
                  </F>
                </>
              )}
              <F label="Allaitement au moins un enfant ?">
                <Sel options={OUI_NON} {...register('ris_allaitement', { valueAsNumber: true })} />
              </F>
              {Number(w.allaitement) === 1 && (
                <F label="Duree totale allaitement (mois)">
                  <input type="number" min={0} max={120} {...register('ris_allaitement_duree_mois', { valueAsNumber: true })} className={cls()} />
                </F>
              )}
              <F label="Contraception actuelle">
                <Sel options={CONTRACEPTION} {...register('ris_contraception', { valueAsNumber: true })} />
              </F>
              {[1, 2, 3, 4, 5].includes(Number(w.contraception)) && (
                <F label="Duree contraception hormonale (ans)">
                  <input type="number" min={0} max={40} {...register('ris_contraception_duree_ans', { valueAsNumber: true })} className={cls()} />
                </F>
              )}
              <F label="Traitement hormonal menopause (THM)">
                <Sel options={OUI_NON} {...register('ris_thm', { valueAsNumber: true })} />
              </F>
              {Number(w.thm) === 1 && (
                <F label="Duree du THM (ans)">
                  <input type="number" min={0} max={30} {...register('ris_thm_duree_ans', { valueAsNumber: true })} className={cls()} />
                </F>
              )}
              <F label="Obesite / IMC >= 30">
                <Sel options={OUI_NON} {...register('ris_obesite', { valueAsNumber: true })} />
              </F>
              <F label="IMC">
                <input type="number" step="0.1" {...register('ris_imc', { valueAsNumber: true })} className={cls()} />
              </F>
              <F label="Activite physique">
                <Sel options={ACTIVITE} {...register('ris_activite_physique', { valueAsNumber: true })} />
              </F>
              <F label="Consommation reguliere d'alcool">
                <Sel options={OUI_NON} {...register('ris_consommation_alcool', { valueAsNumber: true })} />
              </F>
              <F label="Statut VIH">
                <Sel options={VIH} {...register('ris_vih_statut', { valueAsNumber: true })} />
              </F>
              <F label="Irradiation thoracique anterieure">
                <Sel options={OUI_NON} {...register('ris_irradiation_thoracique', { valueAsNumber: true })} />
              </F>
              <F label="Mammographie anterieure ?">
                <Sel options={OUI_NON} {...register('ris_mammographie_anterieure', { valueAsNumber: true })} />
              </F>
              {Number(w.mammoAnte) === 1 && (
                <>
                  <F label="Annee derniere mammographie">
                    <input type="number" min={1990} max={2030} {...register('ris_mammographie_anterieure_annee', { valueAsNumber: true })} className={cls()} />
                  </F>
                  <F label="Dernier BIRADS connu">
                    <Sel options={BIRADS_CHOICES} {...register('ris_mammographie_anterieure_birads', { valueAsNumber: true })} />
                  </F>
                </>
              )}
              <F label="Pratique l'auto-examen ?">
                <Sel options={OUI_NON} {...register('ris_auto_examen_pratique', { valueAsNumber: true })} />
              </F>
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <StepHeader code="E" title="Symptomes actuels (SYM)" desc="La localisation et les details s'affichent seulement pour les symptomes presents." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Masse palpable declaree">
                <Sel options={OUI_NON} {...register('sym_masse_palpable', { valueAsNumber: true })} />
              </F>
              {Number(w.symMasse) === 1 && (
                <F label="Sein concerne par la masse">
                  <Sel options={SEIN} {...register('sym_masse_sein')} />
                </F>
              )}
              <F label="Ecoulement mamelonnaire">
                <Sel options={OUI_NON} {...register('sym_ecoulement_mamelonnaire', { valueAsNumber: true })} />
              </F>
              {Number(w.symEcoulement) === 1 && (
                <F label="Type d'ecoulement">
                  <input type="text" placeholder="Sereux, sanglant, laiteux..." {...register('sym_ecoulement_type')} className={cls()} />
                </F>
              )}
              <F label="Douleur mammaire">
                <Sel options={OUI_NON} {...register('sym_douleur_sein', { valueAsNumber: true })} />
              </F>
              <F label="Retraction / invagination mamelon">
                <Sel options={OUI_NON} {...register('sym_retraction_mamelon', { valueAsNumber: true })} />
              </F>
              <F label="Modification cutanee">
                <Sel options={OUI_NON} {...register('sym_modification_peau', { valueAsNumber: true })} />
              </F>
              <F label="Adenopathie axillaire palpable">
                <Sel options={OUI_NON} {...register('sym_adenopathie_axillaire', { valueAsNumber: true })} />
              </F>
              <F label="Duree des symptomes (mois)">
                <input type="number" min={0} max={120} {...register('sym_duree_symptomes_mois', { valueAsNumber: true })} className={cls()} />
              </F>
            </div>
          </section>
        )}

        {step === 6 && (
          <section>
            <StepHeader code="F" title="Examen clinique des seins (EXAM)" desc="Inspection, palpation, masse, ganglions et notes cliniques." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Date de l'examen clinique" required>
                <input type="date" {...register('exam_date', { required: true })} className={cls()} />
              </F>
              <div />
              <F label="Inspection sein droit">
                <Sel options={INSPECTION} {...register('exam_inspection_droit', { valueAsNumber: true })} />
              </F>
              <F label="Inspection sein gauche">
                <Sel options={INSPECTION} {...register('exam_inspection_gauche', { valueAsNumber: true })} />
              </F>
              <F label="Etat mamelon droit">
                <input type="text" {...register('exam_mamelon_droit')} className={cls()} />
              </F>
              <F label="Etat mamelon gauche">
                <input type="text" {...register('exam_mamelon_gauche')} className={cls()} />
              </F>
              <F label="Masse palpee a l'examen ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('exam_masse_palpee')} /> Oui</label>
              </F>
              {w.examMasse && (
                <>
                  <F label="Sein concerne">
                    <Sel options={SEIN} {...register('exam_masse_sein')} />
                  </F>
                  <F label="Quadrant">
                    <Sel options={QUADRANT} {...register('exam_masse_quadrant')} />
                  </F>
                  <F label="Taille estimee (cm)">
                    <input type="number" step="0.1" {...register('exam_masse_taille_cm', { valueAsNumber: true })} className={cls()} />
                  </F>
                  <F label="Consistance">
                    <Sel options={CONSISTANCE} {...register('exam_masse_consistance', { valueAsNumber: true })} />
                  </F>
                  <F label="Contours">
                    <input type="text" placeholder="Reguliers, irreguliers, spicules..." {...register('exam_masse_contours')} className={cls()} />
                  </F>
                  <F label="Masse mobile ?">
                    <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('exam_masse_mobile')} /> Oui</label>
                  </F>
                </>
              )}
              <F label="Ganglion axillaire palpe ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('exam_ganglion_axillaire')} /> Oui</label>
              </F>
              {w.ganglion && (
                <F label="Cote du ganglion axillaire">
                  <Sel options={SEIN} {...register('exam_ganglion_axillaire_sein')} />
                </F>
              )}
              <F label="Ganglion sus-claviculaire ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('exam_ganglion_sus_claviculaire')} /> Oui</label>
              </F>
              <F label="Notes sur l'examen clinique" col2>
                <textarea rows={3} {...register('exam_note')} className={cls()} />
              </F>
            </div>
          </section>
        )}

        {step === 7 && (
          <section>
            <StepHeader code="G" title="Examens complementaires, resultats et orientation" desc="Le BIRADS le plus eleve et l'anapath alimentent automatiquement le resultat global." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Mammographie realisee ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_mammo_realisee')} /> Oui</label>
              </F>
              {w.mammo && (
                <>
                  <F label="Date mammographie">
                    <input type="date" {...register('dep_mammo_date')} className={cls()} />
                  </F>
                  <F label="BIRADS mammographie sein droit">
                    <Sel options={BIRADS_CHOICES} {...register('dep_mammo_birads_droit', { valueAsNumber: true })} />
                  </F>
                  <F label="BIRADS mammographie sein gauche">
                    <Sel options={BIRADS_CHOICES} {...register('dep_mammo_birads_gauche', { valueAsNumber: true })} />
                  </F>
                  <F label="Densite mammaire ACR">
                    <Sel options={DENSITE} {...register('dep_mammo_densite', { valueAsNumber: true })} />
                  </F>
                  <F label="Anomalie detectee ?">
                    <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_mammo_anomalie')} /> Oui</label>
                  </F>
                  {watch('dep_mammo_anomalie') && (
                    <F label="Description anomalie mammographique" col2>
                      <textarea rows={2} {...register('dep_mammo_anomalie_detail')} className={cls()} />
                    </F>
                  )}
                </>
              )}
              <F label="Echographie mammaire realisee ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_echo_realisee')} /> Oui</label>
              </F>
              {w.echo && (
                <>
                  <F label="Date echographie">
                    <input type="date" {...register('dep_echo_date')} className={cls()} />
                  </F>
                  <F label="BIRADS echo sein droit">
                    <Sel options={BIRADS_CHOICES} {...register('dep_echo_birads_droit', { valueAsNumber: true })} />
                  </F>
                  <F label="BIRADS echo sein gauche">
                    <Sel options={BIRADS_CHOICES} {...register('dep_echo_birads_gauche', { valueAsNumber: true })} />
                  </F>
                  <F label="Masse visualisee a l'echographie ?">
                    <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_echo_masse')} /> Oui</label>
                  </F>
                  {w.echoMasse && (
                    <F label="Taille masse echo (cm)">
                      <input type="number" step="0.1" {...register('dep_echo_masse_taille_cm', { valueAsNumber: true })} className={cls()} />
                    </F>
                  )}
                  <F label="Notes sur l'echographie" col2>
                    <textarea rows={2} {...register('dep_echo_note')} className={cls()} />
                  </F>
                </>
              )}
              <F label="Cytoponction realisee ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_cytoponction_realisee')} /> Oui</label>
              </F>
              <F label="Biopsie mammaire realisee ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_biopsie_realisee')} /> Oui</label>
              </F>
              {w.biopsie && (
                <>
                  <F label="Type de biopsie">
                    <Sel options={BIOPSIE_TYPE} {...register('dep_biopsie_type', { valueAsNumber: true })} />
                  </F>
                  <F label="Resultat anatomopathologique">
                    <Sel options={ANAPATH} {...register('dep_anapath_resultat', { valueAsNumber: true })} />
                  </F>
                  <F label="Recepteurs hormonaux & HER2">
                    <input type="text" placeholder="Ex: RH+/HER2-" {...register('dep_anapath_recepteurs')} className={cls()} />
                  </F>
                  <F label="Ki67 (%)">
                    <input type="number" min={0} max={100} {...register('dep_anapath_ki67', { valueAsNumber: true })} className={cls()} />
                  </F>
                </>
              )}
              <div className="md:col-span-2 bg-blue-50/50 p-8 rounded-[32px] border-2 border-blue-100/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <F label="Resultat global du depistage" required>
                    <Sel options={RES_GLOBAL} {...register('res_resultat_global', { required: true, valueAsNumber: true })} />
                  </F>
                  <F label="Traitement propose">
                    <Sel options={TRAITEMENT} {...register('res_traitement_propose', { valueAsNumber: true })} />
                  </F>
                  {[5].includes(Number(w.resultat)) && (
                    <>
                      <F label="Stade TNM">
                        <input type="text" placeholder="Ex: T2N0M0" {...register('res_stade_tnm')} className={cls()} />
                      </F>
                      <F label="Stade clinique">
                        <input type="text" placeholder="I, IIA, IIB, IIIA..." {...register('res_stade_clinical')} className={cls()} />
                      </F>
                    </>
                  )}
                  <F label="Reference vers structure superieure ?">
                    <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('res_reference')} /> Oui</label>
                  </F>
                  {w.reference && (
                    <>
                      <F label="Structure de reference">
                        <input type="text" {...register('res_reference_structure')} className={cls()} />
                      </F>
                      <F label="Motif de reference" col2>
                        <textarea rows={2} {...register('res_reference_motif')} className={cls()} />
                      </F>
                    </>
                  )}
                  <F label="Prochain RDV de suivi">
                    <input type="date" {...register('res_rdv_suivi')} className={cls()} />
                  </F>
                  <F label="RDV a 1 mois">
                    <input type="date" {...register('res_rdv_1mois')} className={cls()} />
                  </F>
                  <F label="RDV a 3 mois">
                    <input type="date" {...register('res_rdv_3mois')} className={cls()} />
                  </F>
                  <F label="RDV a 6 mois">
                    <input type="date" {...register('res_rdv_6mois')} className={cls()} />
                  </F>
                  <F label="RDV a 1 an">
                    <input type="date" {...register('res_rdv_1an')} className={cls()} />
                  </F>
                  <F label="Notes sur le traitement" col2>
                    <textarea rows={3} {...register('res_traitement_note')} className={cls()} />
                  </F>
                  <F label="Synthese clinique" col2>
                    <textarea rows={4} {...register('ai_synthese')} className={cls()} placeholder="Synthese ou decision clinique..." />
                  </F>
                </div>
              </div>
            </div>
          </section>
        )}

        <NavigationActions step={step} totalSteps={TOTAL_STEPS} loading={loading} onCancel={onCancel} onPrev={() => setStep((s) => Math.max(1, s - 1))} onNext={goNext} />
      </form>
    </ClinicalShell>
  );
};

export default SeinFormWizard;
