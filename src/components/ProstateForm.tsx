import React, { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { prostateService } from '../services/prostateService.ts';
import { patientService } from '../services/patientService.ts';
import ClinicalAiSummary from '../components/ClinicalAiSummary.tsx';
import type { ProstatePatient } from '../types';
import { CheckCard, ClinicalShell, F, NavigationActions, Notice, Sel, StepHeader, cls, opt } from './ClinicalFormUI.tsx';

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
  opt(1, 'Medecin generaliste'), opt(2, 'Urologue'), opt(3, 'Infirmier(ere)'),
  opt(4, 'Sage-femme'), opt(5, 'Autre'),
];
const SOC_PROF = [
  opt(1, 'Salarie'), opt(2, 'Commercant'), opt(3, 'Cultivateur/Eleveur'),
  opt(4, 'Pecheur'), opt(5, 'Retraite'), opt(6, 'Sans emploi'), opt(7, 'Autre (preciser)'),
];
const SOC_INSTRUCTION = [
  opt(0, 'Aucun'), opt(1, 'Primaire'), opt(2, 'Secondaire'),
  opt(3, 'Superieur'), opt(4, 'Ecole coranique/Daara'), opt(5, 'Alphabetisation'),
];
const SOC_STATUT_MATRIM = [
  opt(1, 'Celibataire'), opt(2, 'Marie monogame'), opt(3, 'Marie polygame'),
  opt(4, 'Veuf'), opt(5, 'Divorce/Separe'),
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
const TABAC = [opt(0, 'Non'), opt(1, 'Actif'), opt(2, 'Sevre'), opt(3, 'Passif')];
const TR_RESULT = [
  opt(1, 'Normal - lisse, elastique, symetrique'),
  opt(2, 'Augmente de volume - regulier (HBP probable)'),
  opt(3, 'Nodule suspect - dur, irregulier'),
  opt(4, 'Envahissement vesicule seminale suspect'),
  opt(5, 'Envahissement extra-prostatique suspect'),
  opt(9, 'Non realise / Non concluant'),
];
const PSA_INTERPRETATION = [
  opt(1, 'Normal (< 4 ng/mL)'),
  opt(2, 'Zone grise (4-10 ng/mL)'),
  opt(3, 'Eleve (10-20 ng/mL)'),
  opt(4, 'Tres eleve (> 20 ng/mL)'),
];
const ECHO_RESULT = [
  opt(1, 'Normale'), opt(2, 'HBP (hypertrophie benigne)'),
  opt(3, 'Lesion suspecte'), opt(4, 'Calcifications'), opt(9, 'Non concluant'),
];
const BIOPSIE_RESULT = [
  opt(1, 'Benin - tissu normal / HBP'), opt(2, 'Prostatite chronique'),
  opt(3, 'PIN (neoplasie intra-epitheliale)'),
  opt(4, 'Adenocarcinome - Gleason <=6'),
  opt(5, 'Adenocarcinome - Gleason 3+4=7'),
  opt(6, 'Adenocarcinome - Gleason 4+3=7'),
  opt(7, 'Adenocarcinome - Gleason 8'),
  opt(8, 'Adenocarcinome - Gleason 9-10'), opt(9, 'Non concluant'),
];
const RES_GLOBAL = [
  opt(1, 'Normal - pas de signe de malignite'),
  opt(2, 'Suspect - surveillance renforcee (PSA 6 mois)'),
  opt(3, 'Reference urologue - biopsie indiquee'),
  opt(4, 'Cancer confirme - prise en charge oncologique'),
  opt(5, 'HBP - traitement medical initie'),
];
const TRAITEMENT = [
  opt(1, 'Surveillance active (PSA + TR tous les 6 mois)'),
  opt(2, 'Traitement medical HBP'),
  opt(3, 'Prostatectomie radicale'), opt(4, 'Radiotherapie externe'),
  opt(5, 'Curietherapie'), opt(6, 'Hormonotherapie'),
  opt(7, 'Castration chirurgicale'), opt(8, 'Soins palliatifs'), opt(9, 'Autre'),
];

interface ProstateFormWizardProps {
  patient?: ProstatePatient | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 6;
const STEP_LABELS = [
  'Consentements (CON)', 'META + GEO', 'Identite + SOC',
  'Risques (RIS)', 'Symptomes (SYM)', 'Depistage + RES',
];

const numericFields: (keyof ProstatePatient)[] = [
  'id_patient', 'age', 'meta_agent_qualif', 'geo_region', 'geo_type_structure',
  'soc_profession', 'soc_niveau_instruction', 'soc_statut_matrimonial', 'soc_mode_entree',
  'ris_atcd_fam_prostate', 'ris_atcd_perso_prostate', 'ris_atcd_chir_urologique',
  'ris_vih_statut', 'ris_diabete', 'ris_hta', 'ris_tabagisme', 'ris_consommation_alcool',
  'ris_psa_anterieur', 'ris_psa_anterieur_valeur', 'ris_tr_anterieur',
  'ris_tr_anterieur_resultat', 'sym_pollakiurie', 'sym_nycturie', 'sym_nycturie_nb',
  'sym_urgence_mictionnelle', 'sym_jet_faible', 'sym_dysurie', 'sym_retention_urine',
  'sym_hematurie', 'sym_hemospermie', 'sym_douleur_pelvienne', 'sym_douleur_osseuse',
  'sym_score_ipss', 'dep_tr_resultat', 'dep_psa_valeur', 'dep_psa_libre_valeur',
  'dep_psa_rapport_libre_total', 'dep_psa_interpretation', 'dep_echo_resultat',
  'dep_echo_volume', 'dep_biopsie_resultat', 'dep_biopsie_nb_carottes',
  'dep_biopsie_nb_positives', 'res_resultat_global', 'res_traitement_propose',
];
const dateFields: (keyof ProstatePatient)[] = [
  'date_naiss', 'ris_psa_anterieur_date', 'dep_date', 'dep_psa_date',
  'res_rdv_suivi', 'con_depistage_date',
];

const sanitizePayload = (data: Partial<ProstatePatient>) => {
  const payload: Record<string, any> = { ...data };
  numericFields.forEach((field) => {
    const value = payload[field];
    if (value === '' || value === undefined || Number.isNaN(value)) payload[field] = null;
    else if (value !== null) payload[field] = Number(value);
  });
  dateFields.forEach((field) => {
    if (payload[field] === '') payload[field] = null;
  });
  if (payload.ris_atcd_fam_prostate !== 1) payload.ris_atcd_fam_prostate_lien = null;
  if (payload.ris_atcd_perso_prostate !== 1) payload.ris_atcd_perso_detail = null;
  if (payload.ris_atcd_chir_urologique !== 1) payload.ris_atcd_chir_detail = null;
  if (payload.ris_psa_anterieur !== 1) {
    payload.ris_psa_anterieur_valeur = null;
    payload.ris_psa_anterieur_date = null;
  }
  if (payload.ris_tr_anterieur !== 1) payload.ris_tr_anterieur_resultat = null;
  if (payload.sym_nycturie !== 1) payload.sym_nycturie_nb = null;
  if (!payload.dep_echo_realisee) {
    payload.dep_echo_resultat = null;
    payload.dep_echo_volume = null;
  }
  if (!payload.dep_biopsie_indiquee) payload.dep_biopsie_realisee = false;
  if (!payload.dep_biopsie_realisee) {
    payload.dep_biopsie_resultat = null;
    payload.dep_biopsie_gleason = null;
    payload.dep_biopsie_nb_carottes = null;
    payload.dep_biopsie_nb_positives = null;
  }
  if (payload.res_resultat_global !== 4) payload.res_stade_tnm = null;
  if (!payload.res_reference) {
    payload.res_reference_structure = null;
    payload.res_reference_motif = null;
  }
  return payload as Partial<ProstatePatient>;
};

const psaInterpretation = (value?: number | string | null) => {
  if (value === undefined || value === null || value === '') return null;
  const psa = Number(value);
  if (!Number.isFinite(psa)) return null;
  if (psa < 4) return 1;
  if (psa <= 10) return 2;
  if (psa <= 20) return 3;
  return 4;
};
const hasNumericValue = (value: number | string | undefined | null) =>
  value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value));

export const ProstateFormWizard: React.FC<ProstateFormWizardProps> = ({ patient, onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo<Partial<ProstatePatient>>(
    () => patient || {
      id_patient: Math.floor(1000000 + Math.random() * 9000000),
      age: 50,
      status: 'new',
      con_depistage: true,
      con_donnees_anonymisees: true,
      con_depistage_date: today(),
      dep_date: today(),
    },
    [patient]
  );

  const { register, handleSubmit, watch, trigger, formState: { errors }, reset, setValue } =
    useForm<Partial<ProstatePatient>>({ mode: 'onChange', defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // AI summary state
  const [aiSummary, setAiSummary] = useState<string>(patient?.ai_synthese || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [summaryMode, setSummaryMode] = useState<'preview' | 'edit'>('preview');

  useEffect(() => {
    if (patient) setAiSummary(patient.ai_synthese || '');
  }, [patient]);

  const generateAISummary = async () => {
    const data = watch();
    setAiLoading(true);
    try {
      const result = await patientService.getAiSummary(data);
      setAiSummary(result.synthese);
      setValue('ai_synthese', result.synthese);
      toast.success('Synthèse IA générée avec succès');
    } catch (err) {
      toast.error('Échec de la génération de la synthèse');
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const w = {
    metaQualif: watch('meta_agent_qualif'),
    profession: watch('soc_profession'),
    fam: watch('ris_atcd_fam_prostate'),
    perso: watch('ris_atcd_perso_prostate'),
    chir: watch('ris_atcd_chir_urologique'),
    psaAnte: watch('ris_psa_anterieur'),
    trAnte: watch('ris_tr_anterieur'),
    nycturie: watch('sym_nycturie'),
    depTr: watch('dep_tr_resultat'),
    depPsa: watch('dep_psa_valeur'),
    echo: watch('dep_echo_realisee'),
    biopsieIndiquee: watch('dep_biopsie_indiquee'),
    biopsieRealisee: watch('dep_biopsie_realisee'),
    biopsieResultat: watch('dep_biopsie_resultat'),
    resultat: watch('res_resultat_global'),
    reference: watch('res_reference'),
  };

  useEffect(() => {
    const interpretation = psaInterpretation(w.depPsa);
    if (interpretation) {
      setValue('dep_psa_realise', true);
      setValue('dep_psa_interpretation', interpretation);
      if (!watch('dep_psa_date')) setValue('dep_psa_date', watch('dep_date') || today());
    }
  }, [w.depPsa, setValue, watch]);

  useEffect(() => {
    if (w.depTr) setValue('dep_tr_realise', Number(w.depTr) !== 9);
  }, [w.depTr, setValue]);

  useEffect(() => {
    const hasPsa = hasNumericValue(w.depPsa);
    const psa = Number(w.depPsa);
    const tr = Number(w.depTr);
    const biopsy = Number(w.biopsieResultat);
    const score = Number(watch('sym_score_ipss'));
    let next: number | null = null;

    if (biopsy >= 4 && biopsy <= 8) next = 4;
    else if ([3, 4, 5].includes(tr) || (hasPsa && psa >= 10)) next = 3;
    else if ((hasPsa && psa >= 4 && psa < 10) || score >= 8) next = 2;
    else if (tr === 2) next = 5;
    else if (tr === 1 && hasPsa && psa < 4) next = 1;

    if (next) {
      setValue('res_resultat_global', next);
      if ([3, 4].includes(next)) {
        setValue('res_reference', true);
        setValue('dep_biopsie_indiquee', true);
      }
    }
  }, [w.depPsa, w.depTr, w.biopsieResultat, setValue, watch]);

  const fieldsByStep: Record<number, (keyof ProstatePatient)[]> = {
    1: ['con_depistage', 'con_donnees_anonymisees', 'con_signature_presente'],
    2: ['id_patient', 'meta_agent_qualif', 'geo_region', 'geo_type_structure'],
    3: ['prenom', 'nom', 'age', 'num_phone', 'pat_adresse', 'soc_profession', 'soc_niveau_instruction', 'soc_statut_matrimonial'],
    4: ['ris_vih_statut', 'ris_tabagisme'],
    5: [],
    6: ['dep_date', 'res_resultat_global'],
  };

  const goNext = async () => {
    if (step === 1 && !watch('con_depistage')) {
      toast.error('Le consentement au depistage est requis');
      return;
    }
    if (step === 6 && watch('dep_biopsie_realisee')) {
      const total = Number(watch('dep_biopsie_nb_carottes'));
      const positives = Number(watch('dep_biopsie_nb_positives'));
      if (Number.isFinite(total) && Number.isFinite(positives) && positives > total) {
        toast.error('Les carottes positives ne peuvent pas depasser le nombre total');
        return;
      }
    }
    const valid = await trigger(fieldsByStep[step] as any);
    if (!valid) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const handleFormSubmit: SubmitHandler<Partial<ProstatePatient>> = async (data) => {
    setLoading(true);
    try {
      if (data.dep_biopsie_realisee) {
        const total = Number(data.dep_biopsie_nb_carottes);
        const positives = Number(data.dep_biopsie_nb_positives);
        if (Number.isFinite(total) && Number.isFinite(positives) && positives > total) {
          toast.error('Les carottes positives ne peuvent pas depasser le nombre total');
          return;
        }
      }
      const payload = sanitizePayload({
        ...data,
        status: data.status || 'new',
      });
      if (patient?.record_id) {
        await prostateService.updatePatient(patient.record_id, payload);
        toast.success('Dossier prostate mis a jour avec succes !');
      } else {
        await prostateService.createPatient(payload);
        toast.success('Fiche depistage prostate creee avec succes !');
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
      title="Fiche de Collecte Patient"
      subtitle="Programme de depistage du Cancer de la Prostate"
      onStepClick={setStep}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-12 slide-up">
        {step === 1 && (
          <section className="fade-in">
            <StepHeader code="A" title="Consentements eclaires (CON)" desc="Consentement libre, eclaire et revocable avant tout depistage prostatique." />
            <Notice icon="warning" title="Important">
              Le patient doit etre informe de ses droits avant le toucher rectal, le dosage PSA, les examens complementaires ou la reference.
            </Notice>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CheckCard label="Consentement au depistage" icon="clinical_notes" checked={!!watch('con_depistage')} onChange={(v) => setValue('con_depistage', v)} sublabel="TR / PSA / Echographie" />
              <CheckCard label="Consentement au traitement" icon="medical_services" checked={!!watch('con_traitement')} onChange={(v) => setValue('con_traitement', v)} sublabel="HBP / Urologie / Oncologie" />
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
              <F label="ID Patient" required error={errors.id_patient?.message as string}>
                <input type="number" {...register('id_patient', { required: 'ID Patient requis', min: { value: 1, message: 'ID invalide' }, valueAsNumber: true })} disabled={!!patient} className={cls(!!errors.id_patient)} />
              </F>
              <F label="Qualification de l'agent" required>
                <Sel options={META_QUALIF} {...register('meta_agent_qualif', { required: true, valueAsNumber: true })} />
              </F>
              {Number(w.metaQualif) === 5 && (
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
            <StepHeader code="C" title="Identite et donnees sociodemographiques" desc="Profil du patient et criteres de ciblage du depistage prostate." />
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
                <input type="number" {...register('age', { required: 'Age requis', min: { value: 40, message: '>= 40 ans' }, max: { value: 99, message: '<= 99 ans' }, valueAsNumber: true })} className={cls(!!errors.age)} />
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
              {Number(w.profession) === 7 && (
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
            <StepHeader code="D" title="Antecedents et facteurs de risque" desc="Les champs de precision s'ouvrent automatiquement selon les reponses." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Antecedent familial de cancer prostate ?">
                <Sel options={OUI_NON} {...register('ris_atcd_fam_prostate', { valueAsNumber: true })} />
              </F>
              {Number(w.fam) === 1 && (
                <F label="Lien de parente">
                  <input type="text" placeholder="Pere, frere, oncle..." {...register('ris_atcd_fam_prostate_lien')} className={cls()} />
                </F>
              )}
              <F label="Antecedent personnel de pathologie prostatique ?">
                <Sel options={OUI_NON} {...register('ris_atcd_perso_prostate', { valueAsNumber: true })} />
              </F>
              {Number(w.perso) === 1 && (
                <F label="Detail antecedent prostatique">
                  <input type="text" placeholder="HBP, prostatite..." {...register('ris_atcd_perso_detail')} className={cls()} />
                </F>
              )}
              <F label="Antecedent chirurgical urologique ?">
                <Sel options={OUI_NON} {...register('ris_atcd_chir_urologique', { valueAsNumber: true })} />
              </F>
              {Number(w.chir) === 1 && (
                <F label="Detail chirurgie">
                  <input type="text" {...register('ris_atcd_chir_detail')} className={cls()} />
                </F>
              )}
              <F label="Statut VIH" required>
                <Sel options={VIH} {...register('ris_vih_statut', { required: true, valueAsNumber: true })} />
              </F>
              <F label="Tabagisme" required>
                <Sel options={TABAC} {...register('ris_tabagisme', { required: true, valueAsNumber: true })} />
              </F>
              <F label="Diabete">
                <Sel options={OUI_NON} {...register('ris_diabete', { valueAsNumber: true })} />
              </F>
              <F label="Hypertension arterielle">
                <Sel options={OUI_NON} {...register('ris_hta', { valueAsNumber: true })} />
              </F>
              <F label="Consommation d'alcool">
                <Sel options={OUI_NON} {...register('ris_consommation_alcool', { valueAsNumber: true })} />
              </F>
              <F label="PSA deja dose auparavant ?">
                <Sel options={OUI_NON} {...register('ris_psa_anterieur', { valueAsNumber: true })} />
              </F>
              {Number(w.psaAnte) === 1 && (
                <>
                  <F label="Derniere valeur PSA connue (ng/mL)">
                    <input type="number" step="0.01" {...register('ris_psa_anterieur_valeur', { valueAsNumber: true })} className={cls()} />
                  </F>
                  <F label="Date du PSA anterieur">
                    <input type="date" {...register('ris_psa_anterieur_date')} className={cls()} />
                  </F>
                </>
              )}
              <F label="Toucher rectal anterieur ?">
                <Sel options={OUI_NON} {...register('ris_tr_anterieur', { valueAsNumber: true })} />
              </F>
              {Number(w.trAnte) === 1 && (
                <F label="Resultat TR anterieur">
                  <Sel options={[opt(1, 'Normal'), opt(2, 'Anormal - suspect'), opt(3, 'Anormal - lesion benigne'), opt(9, 'Non concluant')]} {...register('ris_tr_anterieur_resultat', { valueAsNumber: true })} />
                </F>
              )}
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <StepHeader code="E" title="Symptomes urinaires (LUTS / IPSS)" desc="Le score IPSS simplifie aide a qualifier la surveillance." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Pollakiurie">
                <Sel options={OUI_NON} {...register('sym_pollakiurie', { valueAsNumber: true })} />
              </F>
              <F label="Nycturie">
                <Sel options={OUI_NON} {...register('sym_nycturie', { valueAsNumber: true })} />
              </F>
              {Number(w.nycturie) === 1 && (
                <F label="Nombre de levers nocturnes">
                  <input type="number" min={0} max={10} {...register('sym_nycturie_nb', { valueAsNumber: true })} className={cls()} />
                </F>
              )}
              <F label="Urgence mictionnelle">
                <Sel options={OUI_NON} {...register('sym_urgence_mictionnelle', { valueAsNumber: true })} />
              </F>
              <F label="Jet urinaire faible / intermittent">
                <Sel options={OUI_NON} {...register('sym_jet_faible', { valueAsNumber: true })} />
              </F>
              <F label="Dysurie">
                <Sel options={OUI_NON} {...register('sym_dysurie', { valueAsNumber: true })} />
              </F>
              <F label="Retention urinaire aigue">
                <Sel options={OUI_NON} {...register('sym_retention_urine', { valueAsNumber: true })} />
              </F>
              <F label="Hematurie">
                <Sel options={OUI_NON} {...register('sym_hematurie', { valueAsNumber: true })} />
              </F>
              <F label="Hemospermie">
                <Sel options={OUI_NON} {...register('sym_hemospermie', { valueAsNumber: true })} />
              </F>
              <F label="Douleurs pelviennes / perineales">
                <Sel options={OUI_NON} {...register('sym_douleur_pelvienne', { valueAsNumber: true })} />
              </F>
              <F label="Douleurs osseuses">
                <Sel options={OUI_NON} {...register('sym_douleur_osseuse', { valueAsNumber: true })} />
              </F>
              <F label="Score IPSS global (0-35)">
                <input type="number" min={0} max={35} {...register('sym_score_ipss', { valueAsNumber: true })} className={cls()} />
              </F>
            </div>
          </section>
        )}

        {step === 6 && (
          <section>
            <StepHeader code="F" title="Depistage, resultats et orientation" desc="PSA, toucher rectal, reference et resultat global sont pre-remplis selon les donnees saisies." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Date du depistage" required>
                <input type="date" {...register('dep_date', { required: true })} className={cls()} />
              </F>
              <F label="Toucher rectal realise ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_tr_realise')} /> Oui</label>
              </F>
              <F label="Resultat du toucher rectal">
                <Sel options={TR_RESULT} {...register('dep_tr_resultat', { valueAsNumber: true })} />
              </F>
              <F label="Volume prostate estime au TR">
                <input type="text" placeholder="Ex: 30cc" {...register('dep_tr_volume_estime')} className={cls()} />
              </F>
              <F label="Notes sur le toucher rectal" col2>
                <textarea rows={2} {...register('dep_tr_note')} className={cls()} />
              </F>
              <F label="PSA realise ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_psa_realise')} /> Oui</label>
              </F>
              <F label="Date du prelevement PSA">
                <input type="date" {...register('dep_psa_date')} className={cls()} />
              </F>
              <F label="Valeur PSA total (ng/mL)">
                <input type="number" step="0.001" {...register('dep_psa_valeur', { valueAsNumber: true })} className={cls()} />
              </F>
              <F label="Interpretation PSA auto">
                <Sel options={PSA_INTERPRETATION} {...register('dep_psa_interpretation', { valueAsNumber: true })} />
              </F>
              <F label="PSA libre (ng/mL)">
                <input type="number" step="0.001" {...register('dep_psa_libre_valeur', { valueAsNumber: true })} className={cls()} />
              </F>
              <F label="Rapport libre / total (%)">
                <input type="number" step="0.01" {...register('dep_psa_rapport_libre_total', { valueAsNumber: true })} className={cls()} />
              </F>
              <F label="Echographie prostatique realisee ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_echo_realisee')} /> Oui</label>
              </F>
              {w.echo && (
                <>
                  <F label="Resultat echographie">
                    <Sel options={ECHO_RESULT} {...register('dep_echo_resultat', { valueAsNumber: true })} />
                  </F>
                  <F label="Volume prostatique echo (cc)">
                    <input type="number" step="0.1" {...register('dep_echo_volume', { valueAsNumber: true })} className={cls()} />
                  </F>
                </>
              )}
              <F label="Biopsie indiquee ?">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_biopsie_indiquee')} /> Oui</label>
              </F>
              {w.biopsieIndiquee && (
                <F label="Biopsie realisee ?">
                  <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('dep_biopsie_realisee')} /> Oui</label>
                </F>
              )}
              {w.biopsieRealisee && (
                <>
                  <F label="Resultat anatomopathologique biopsie">
                    <Sel options={BIOPSIE_RESULT} {...register('dep_biopsie_resultat', { valueAsNumber: true })} />
                  </F>
                  <F label="Score de Gleason">
                    <input type="text" placeholder="Ex: 3+4" {...register('dep_biopsie_gleason')} className={cls()} />
                  </F>
                  <F label="Nombre de carottes biopsiques">
                    <input type="number" min={1} max={24} {...register('dep_biopsie_nb_carottes', { valueAsNumber: true })} className={cls()} />
                  </F>
                  <F label="Nombre de carottes positives">
                    <input type="number" min={0} max={24} {...register('dep_biopsie_nb_positives', { valueAsNumber: true })} className={cls()} />
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
                  {[4].includes(Number(w.resultat)) && (
                    <F label="Stade TNM">
                      <input type="text" placeholder="Ex: T2N0M0" {...register('res_stade_tnm')} className={cls()} />
                    </F>
                  )}
                  <F label="Reference vers structure superieure ?">
                    <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" className="rounded text-indigo-600" {...register('res_reference')} /> Oui</label>
                  </F>
                  {w.reference && (
                    <>
                      <F label="Structure de reference">
                        <input type="text" {...register('res_reference_structure')} className={cls()} />
                      </F>
                      <F label="Prochain RDV de suivi">
                        <input type="date" {...register('res_rdv_suivi')} className={cls()} />
                      </F>
                      <F label="Motif de reference" col2>
                        <textarea rows={2} {...register('res_reference_motif')} className={cls()} />
                      </F>
                    </>
                  )}
                  <F label="Notes sur le traitement" col2>
                    <textarea rows={3} {...register('res_traitement_note')} className={cls()} />
                  </F>
                  <F label="Synthese clinique" col2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={generateAISummary} disabled={aiLoading} className="px-4 py-2 bg-[#006669] text-white rounded-xl font-bold shadow-sm hover:bg-[#2a7f82] transition-all disabled:opacity-50">
                            {aiLoading ? 'Génération...' : 'Générer la synthèse IA'}
                          </button>
                          <button type="button" onClick={() => setSummaryMode('preview')} className={`px-3 py-2 rounded-lg border ${summaryMode === 'preview' ? 'bg-white text-[#006669] border-[#006669]' : 'bg-transparent text-[#3e4949]'}`}>Aperçu</button>
                          <button type="button" onClick={() => setSummaryMode('edit')} className={`px-3 py-2 rounded-lg border ${summaryMode === 'edit' ? 'bg-white text-[#006669] border-[#006669]' : 'bg-transparent text-[#3e4949]'}`}>Éditer</button>
                        </div>
                        <div className="text-xs text-[#6f7979]">Dernière mise à jour: {patient?.ai_synthese_date ? new Date(patient.ai_synthese_date).toLocaleString() : '—'}</div>
                      </div>

                      {summaryMode === 'preview' ? (
                        aiSummary ? (
                          <div className="p-4 bg-white rounded-2xl border border-[#bec9c9]/10 max-h-56 overflow-y-auto">
                            <ClinicalAiSummary text={watch('ai_synthese') || aiSummary} />
                          </div>
                        ) : (
                          <textarea rows={4} {...register('ai_synthese')} className={cls()} placeholder="Synthese ou decision clinique..." />
                        )
                      ) : (
                        <textarea rows={4} {...register('ai_synthese')} onChange={(e) => { setValue('ai_synthese', e.target.value); setAiSummary(e.target.value); }} className={cls()} placeholder="Synthese ou decision clinique..." />
                      )}
                    </div>
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

export default ProstateFormWizard;
