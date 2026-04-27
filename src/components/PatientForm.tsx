import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { patientService } from '../services/patientService.ts';
import type { PatientFormData } from '../types';

// ─── Option helpers ────────────────────────────────────────────────────────
const opt = (value: number | string, label: string) => ({ value, label });

const GEO_REGIONS = [
  opt(1,'Dakar'), opt(2,'Diourbel'), opt(3,'Fatick'), opt(4,'Kaffrine'),
  opt(5,'Kaolack'), opt(6,'Kédougou'), opt(7,'Kolda'), opt(8,'Louga'),
  opt(9,'Matam'), opt(10,'Saint-Louis'), opt(11,'Sédhiou'),
  opt(12,'Tambacounda'), opt(13,'Thiès'), opt(14,'Ziguinchor'),
];
const GEO_TYPE_STRUCTURE = [
  opt(1,'Poste de santé'), opt(2,'Centre de santé'), opt(3,'Hôpital de district'),
  opt(4,'EPS niveau 2'), opt(5,'EPS niveau 3'), opt(6,'Caravane mobile'),
];
const META_QUALIF = [
  opt(1,'Sage-femme'), opt(2,'Médecin'), opt(3,'Infirmier(ère)'),
  opt(4,'Gynécologue'), opt(5,'Autre'),
];
const SOC_PROF = [
  opt(1,'Ménagère'), opt(2,'Salariée'), opt(3,'Étudiante/Élève'),
  opt(4,'Commerçante'), opt(5,'Couturière/Coiffeuse/Restauratrice'),
  opt(6,'Paysanne/Éleveuse'), opt(7,'Sans emploi'), opt(8,'Autre (préciser)'),
];
const SOC_INSTRUCTION = [
  opt(0,'Aucun'), opt(1,'Primaire'), opt(2,'Secondaire'),
  opt(3,'Supérieur'), opt(4,'École coranique/Daara'), opt(5,'Alphabétisation'),
];
const SOC_STATUT_MATRIM = [
  opt(1,'Célibataire'), opt(2,'Mariée monogame'), opt(3,'Mariée polygame'),
  opt(4,'Veuve'), opt(5,'Divorcée/Séparée'), opt(6,'Union libre'),
];
const SOC_MODE_ENTREE = [
  opt(1,'Venue spontanée'), opt(2,'Mobilisation communautaire'),
  opt(3,'Orientation par agent de santé'), opt(4,'Référence inter-structure'),
  opt(5,'Caravane'),
];
const ETHNIE = [
  opt(1,'Wolof'), opt(2,'Sérère'), opt(3,'Peulh'), opt(4,'Toucouleur'),
  opt(5,'Mandingue'), opt(6,'Diola'), opt(7,'Autre'),
];
const GYN_CYCLE = [opt(1,'Réguliers'), opt(2,'Irréguliers'), opt(9,'Ne sait pas')];
const RIS_IST = [opt(1,'Oui'), opt(0,'Non'), opt(9,'Ne sait pas')];
const RIS_VIH = [
  opt(1,'Négatif'), opt(2,'Positif sous TARV'),
  opt(3,'Positif sans TARV'), opt(9,'Inconnu/Refus'),
];
const RIS_TABAC = [opt(0,'Non'), opt(1,'Actif'), opt(2,'Sevrée'), opt(3,'Passif')];
const RIS_DEPISTAGE = [opt(0,'Non'), opt(1,'Oui'), opt(9,'Ne sait pas')];
const RIS_RESULTAT_DEP = [
  opt(1,'Normal/Négatif'), opt(2,'Anormal/Positif'), opt(3,'Traitée'), opt(9,'Inconnu'),
];
const PHY_STATUT = [
  opt(1,'Non enceinte'), opt(2,'Enceinte'), opt(3,'Post-partum (≤6 sem.)'),
  opt(4,'Allaitement'), opt(5,'Ménopausée'),
];
const DEP_RESULTAT_IVA = [
  opt(1,'Négatif'), opt(2,'Positif'), opt(3,'Polype'),
  opt(4,'Suspicion de cancer'), opt(5,'Non concluant (ZT3)'),
];
const DEP_RESULTAT_HPV = [
  opt(0,'Négatif'), opt(1,'Positif HPV 16'), opt(2,'Positif HPV 18'),
  opt(3,'Positif autre HR-HPV'), opt(4,'Positif multi-types'),
];
const DEP_CYTOLOGIE = [
  opt(1,'NILM (normal)'), opt(2,'ASC-US'), opt(3,'ASC-H'), opt(4,'LSIL'),
  opt(5,'HSIL'), opt(6,'AGC'), opt(7,'Carcinome épidermoïde'),
  opt(8,'Adénocarcinome'), opt(9,'Insatisfaisant'),
];
const DEP_COLPO_ASPECT = [
  opt(1,'Normal'), opt(2,'Anormal mineur'), opt(3,'Anormal majeur'),
  opt(4,'Suspicion de cancer invasif'), opt(5,'Polype'), opt(6,'Non satisfaisante'),
];
const DEP_ZONE_TRANSFO = [
  opt(1,'ZT1 — entièrement exocervicale, visible'),
  opt(2,'ZT2 — partiellement endocervicale, visible'),
  opt(3,'ZT3 — endocervicale non visible'),
];
const TRT_NON_ELIG = [
  opt(1,'Suspicion de cancer invasif'), opt(2,'Lésion >75% ou extension endocervicale'),
  opt(3,'ZT3 non visualisable'), opt(4,'Grossesse en cours'),
  opt(5,'Refus de la patiente'), opt(6,'Contre-indication médicale'),
  opt(7,'Référence pour avis spécialisé'), opt(8,'Autre'),
];
const TRT_METHODE = [
  opt(1,'Cryothérapie'), opt(2,'Thermo-ablation'),
  opt(3,'LEEP/LLETZ'), opt(4,'Conisation bistouri froid (CKC)'),
  opt(5,'Hystérectomie'), opt(6,'Référence chimio/radiothérapie'),
];
const SUI_ANAPATH = [
  opt(1,'Cervicite / Métaplasie'), opt(2,'CIN1 / LSIL'), opt(3,'CIN2'),
  opt(4,'CIN3 / HSIL'), opt(5,'AIS (adénocarcinome in situ)'),
  opt(6,'Carcinome épidermoïde invasif'), opt(7,'Adénocarcinome invasif'),
  opt(8,'Autre'), opt(9,'Non concluant'),
];
const FIGO = ['IA1','IA2','IB1','IB2','IB3','IIA1','IIA2','IIB','IIIA','IIIB','IIIC1','IIIC2','IVA','IVB'];
const HPV_VACCIN = [
  opt(0,'Non vaccinée'), opt(1,'Vaccinée (1 dose)'),
  opt(2,'Vaccinée (2 doses)'), opt(3,'Vaccinée (3 doses)'), opt(9,'Ne sait pas'),
];

// ─── Reusable field components ─────────────────────────────────────────────
const cls = (err?: boolean) =>
  `mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    err ? 'border-red-400 ring-red-100' : 'border-gray-200 ring-indigo-100'
  }`;

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: number | string; label: string }[];
  err?: boolean;
};
const Sel: React.FC<SelectProps> = ({ options, err, ...rest }) => (
  <select className={cls(err)} {...rest}>
    <option value="">— Choisir —</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-sm font-medium text-gray-700">
    {text}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Err: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-xs text-red-600 mt-0.5">{msg}</p> : null;

const F: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode; col2?: boolean }> = ({
  label, required, error, children, col2
}) => (
  <div className={col2 ? 'md:col-span-2' : ''}>
    <Label text={label} required={required} />
    {children}
    <Err msg={error} />
  </div>
);

// Multi-checkbox helper
const MultiCheck: React.FC<{
  options: { value: number; label: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => {
  const selected = value ? value.split(',').map(Number) : [];
  const toggle = (v: number) => {
    const next = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v];
    onChange(next.join(','));
  };
  return (
    <div className="grid grid-cols-2 gap-1 mt-1">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded text-indigo-600"
            checked={selected.includes(o.value)}
            onChange={() => toggle(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
};

// ─── Step header ───────────────────────────────────────────────────────────
const StepHeader: React.FC<{ code: string; title: string; desc?: string }> = ({ code, title, desc }) => (
  <div className="mb-6 pb-3 border-b border-gray-100">
    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-mono font-bold">{code}</span>
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    </div>
    {desc && <p className="text-xs text-gray-500 mt-1">{desc}</p>}
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────
interface Props { patient?: any; onCancel: () => void; onSubmit?: (data?: any) => void; }

const TOTAL_STEPS = 10;

const STEP_LABELS = [
  'META + GEO', 'Identité (PAT)', 'Socio (SOC)', 'Gynéco (GYN)',
  'Risques (RIS)', 'Physiologie (PHY)', 'Dépistage (DEP)',
  'Traitement (TRT)', 'Suivi + HPV', 'Consentements (CON)',
];

const PatientFormWizard: React.FC<Props> = ({ patient, onCancel, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [multiValues, setMultiValues] = useState<Record<string, string>>({
    ris_ist_type: '', ris_contraception: '',
    dep_methode: '', trt_effets_immediats: '',
    hpv_source_info: '', hpv_raison_non_vaccination: '',
  });

  const { register, handleSubmit, watch, trigger, formState: { errors }, reset } =
    useForm<PatientFormData>({ mode: 'onChange', defaultValues: patient || {} });

  useEffect(() => { if (patient) { reset(patient); } }, [patient, reset]);

  // Watchers for conditionals
  const w = {
    depMethode: multiValues.dep_methode,
    dep_colpo: watch('dep_colposcopie_realisee'),
    dep_biopsie: watch('dep_biopsie_realisee'),
    ris_ist: watch('ris_ist_antecedent'),
    ris_dep: watch('ris_depistage_anterieur'),
    phy: watch('phy_statut'),
    trt_elig: watch('trt_eligible_immediat'),
    trt_meth: watch('trt_methode'),
    hpv_filles: watch('hpv_a_des_filles'),
    hpv_filles914: watch('hpv_nb_filles_9_14'),
    hpv_vacc: watch('hpv_nb_filles_vaccinees'),
    soc_prof: watch('soc_profession'),
    soc_matrim: watch('soc_statut_matrimonial'),
  };

  const methodSet = (code: string) => (multiValues.dep_methode || '').split(',').includes(code);

  const setMulti = (key: string, val: string) =>
    setMultiValues(prev => ({ ...prev, [key]: val }));

  const fieldsByStep: Record<number, (keyof PatientFormData)[]> = {
    1: ['id_patient', 'meta_agent_qualif', 'geo_region', 'geo_type_structure'],
    2: ['prenom', 'nom', 'age', 'num_phone', 'pat_adresse'],
    3: ['soc_statut_matrimonial', 'soc_profession', 'soc_niveau_instruction', 'soc_mode_entree'],
    4: ['gyn_nb_grossesses', 'gyn_nb_accouchements', 'gyn_age_premier_rapport'],
    5: ['ris_ist_antecedent', 'ris_vih_statut', 'ris_tabagisme'],
    6: ['phy_statut'],
    7: ['dep_date', 'con_depistage'],
    8: ['trt_eligible_immediat'],
    9: [],
    10: ['con_depistage', 'con_donnees_anonymisees', 'con_signature_presente'],
  };

  const goNext = async () => {
    const valid = await trigger(fieldsByStep[step] as any);
    if (!valid) { toast.error('Corrigez les erreurs avant de continuer'); return; }
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
  };
  const goPrev = () => setStep(s => Math.max(1, s - 1));

  const onSubmitForm: SubmitHandler<PatientFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        ...multiValues,
        id_patient: Number(data.id_patient) || 0,
        age: Number(data.age) || 0,
        // Legacy defaults
        statut_matrimoniale: Number(data.soc_statut_matrimonial) || 1,
        region: Number(data.geo_region) || 0,
        scolarisation: 1,
        niveau_scolarite: Number(data.soc_niveau_instruction) || 0,
        ethnie: Number(data.ethnie) || 1,
        gestite: 1, parite: 1,
        anteceden_chirurgi: 2, antecedents_medicale: 2,
        diabetique: 2, depistage_diabete: 2, statut_serologique: 2,
        age_menstrue: 13, dure_cycle: 2, cycle_mode: 1,
        age1_enceint: 0, nmbre_accouchee: 0, agepremier_accouchee: 0,
        etat_sante: 2, traitema_contraceptif: 2, contraceptif_sioui: 0,
        agepilule_contracepti: 0, temps_prispilule: 0,
        menopause: 2, age_menopause: 0, depistage_cancersein: 2,
        sioui_depistagedure: 0, symptom_recent: 2, siouisymptomrecan: 0,
        dat_examendepistag: 0, diagnostic_col: 2, siouidiagnostic_col: 0,
        membr_famillecancer: 2, mmbrfamill_qui: 0, mmbrfamill_site: 0,
        mmbrfamill_age: 0, fumeur: 2, debut_fumeur: 0, nbreannee_fumeur: 0,
        fumer_mode: 2, annee_arretfumer: 0, consommation_moyenntabac: 0,
        consommatio_alcool: 2, moyenn_semainealcool: 0,
        personnel_pec: 1, resultat_examen: 1,
        provenance: 1,
        examen_depistag: 'voir_section_dep',
        status: data.status || 'new',
      };
      if (patient?.record_id) {
        await patientService.updatePatient(patient.record_id, payload);
        toast.success('Patiente mise à jour');
      } else {
        await patientService.createPatient(payload as any);
        toast.success('Patiente enregistrée');
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
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fiche de collecte — Cancer du Col</h2>
          <p className="text-xs text-gray-500">Programme CerviCare+ / MSAS Sénégal — v1.0</p>
        </div>
        <span className="text-sm text-gray-500 font-medium">Étape {step} / {TOTAL_STEPS}</span>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }} />
      </div>
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {STEP_LABELS.map((l, i) => (
          <button key={i} type="button" onClick={() => setStep(i + 1)}
            className={`flex-shrink-0 text-xs px-2 py-1 rounded-full transition-colors ${
              i + 1 === step ? 'bg-indigo-600 text-white' :
              i + 1 < step ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
            {i + 1}. {l}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">

        {/* ═══════════════════════════════════════════════════
            STEP 1 — META + GEO
        ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <section>
            <StepHeader code="A" title="Métadonnées de saisie" desc="Information sur l'agent et la session de collecte" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <F label="ID Patient" required error={errors.id_patient?.message}>
                <input type="number" {...register('id_patient', {
                  required: 'ID Patient requis',
                  min: { value: 1, message: 'ID invalide' },
                })} disabled={!!patient} className={cls(!!errors.id_patient)} />
              </F>
              <F label="Qualification de l'agent" error={errors.meta_agent_qualif?.message}>
                <Sel options={META_QUALIF} err={!!errors.meta_agent_qualif}
                  {...register('meta_agent_qualif')} />
              </F>
            </div>

            <StepHeader code="B" title="Identification géographique (GEO)"
              desc="Codification MSAS — 14 régions médicales / DHIS2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Région médicale" required error={errors.geo_region?.message}>
                <Sel options={GEO_REGIONS} err={!!errors.geo_region}
                  {...register('geo_region', { required: 'Région requise' })} />
              </F>
              <F label="District sanitaire (DHIS2)">
                <input type="text" placeholder="Ex: Boucotte" className={cls()}
                  {...register('geo_district')} />
              </F>
              <F label="Structure de santé">
                <input type="text" placeholder="Nom de la structure" className={cls()}
                  {...register('geo_structure')} />
              </F>
              <F label="Type de structure">
                <Sel options={GEO_TYPE_STRUCTURE} {...register('geo_type_structure')} />
              </F>
              <F label="Latitude GPS (caravane mobile)">
                <input type="number" step="0.000001" placeholder="-90 à +90" className={cls()}
                  {...register('geo_gps_lat')} />
              </F>
              <F label="Longitude GPS (caravane mobile)">
                <input type="number" step="0.000001" placeholder="-180 à +180" className={cls()}
                  {...register('geo_gps_lon')} />
              </F>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 2 — IDENTITÉ (PAT)
        ═══════════════════════════════════════════════════ */}
        {step === 2 && (
          <section>
            <StepHeader code="C" title="Identité de la patiente (PAT)"
              desc="Critères OMS : dépistage organisé 30-49 ans, étendu 25-65 ans, VIH+ dès 25 ans" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Prénom(s)" required error={errors.prenom?.message}>
                <input type="text" {...register('prenom', { required: 'Prénom requis' })}
                  className={cls(!!errors.prenom)} />
              </F>
              <F label="Nom de famille" required error={errors.nom?.message}>
                <input type="text" {...register('nom', { required: 'Nom requis' })}
                  className={cls(!!errors.nom)} />
              </F>
              <F label="Date de naissance">
                <input type="date" {...register('date_naiss')} className={cls()} />
              </F>
              <F label="Âge (années révolues)" required error={errors.age?.message}>
                <input type="number" {...register('age', {
                  required: 'Âge requis',
                  min: { value: 15, message: '≥ 15 ans' },
                  max: { value: 99, message: '≤ 99 ans' },
                })} className={cls(!!errors.age)} />
              </F>
              <F label="Âge estimé ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600" {...register('pat_age_estime')} />
                  Oui, âge estimé
                </label>
              </F>
              <F label="Téléphone mobile" required error={errors.num_phone?.message}>
                <input type="tel" placeholder="7X XXX XX XX"
                  {...register('num_phone', {
                    required: 'Téléphone requis',
                    pattern: { value: /^(70|75|76|77|78)[0-9]{7}$/, message: 'Format SN invalide (7X + 7 chiffres)' },
                  })} className={cls(!!errors.num_phone)} />
              </F>
              <F label="Téléphone d'un proche">
                <input type="tel" {...register('pat_telephone_proche')} className={cls()} />
              </F>
              <F label="Adresse / Quartier" required error={errors.pat_adresse?.message} col2>
                <input type="text" {...register('pat_adresse', { required: 'Adresse requise' })}
                  className={cls(!!errors.pat_adresse)} />
              </F>
              <F label="Numéro d'identification national (CNI — confidentiel)" col2>
                <input type="text" {...register('pat_nin')} className={cls()} />
              </F>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 3 — SOCIODÉMOGRAPHIQUE (SOC)
        ═══════════════════════════════════════════════════ */}
        {step === 3 && (
          <section>
            <StepHeader code="D" title="Données sociodémographiques (SOC)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Profession" required error={errors.soc_profession?.message}>
                <Sel options={SOC_PROF} err={!!errors.soc_profession}
                  {...register('soc_profession', { required: 'Profession requise' })} />
              </F>
              {Number(w.soc_prof) === 8 && (
                <F label="Profession (préciser)">
                  <input type="text" {...register('soc_profession_autre')} className={cls()} />
                </F>
              )}
              <F label="Niveau d'instruction" required>
                <Sel options={SOC_INSTRUCTION} {...register('soc_niveau_instruction', { required: true })} />
              </F>
              <F label="Statut matrimonial" required error={errors.soc_statut_matrimonial?.message}>
                <Sel options={SOC_STATUT_MATRIM} err={!!errors.soc_statut_matrimonial}
                  {...register('soc_statut_matrimonial', { required: 'Statut requis' })} />
              </F>
              {Number(w.soc_matrim) === 3 && (
                <F label="Vie en ménage polygame">
                  <label className="flex items-center gap-2 mt-2 text-sm">
                    <input type="checkbox" className="rounded text-indigo-600" {...register('soc_menage_polygame')} />
                    Oui
                  </label>
                </F>
              )}
              <F label="Mode d'entrée dans le programme" required>
                <Sel options={SOC_MODE_ENTREE} {...register('soc_mode_entree', { required: true })} />
              </F>
              <F label="Groupe ethnolinguistique (optionnel)">
                <Sel options={ETHNIE} {...register('ethnie')} />
              </F>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 4 — GYNÉCO-OBSTÉTRICAUX (GYN)
        ═══════════════════════════════════════════════════ */}
        {step === 4 && (
          <section>
            <StepHeader code="E" title="Antécédents gynéco-obstétricaux (GYN)"
              desc="Multiparité et âge précoce au premier rapport sont des cofacteurs HPV reconnus" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Nombre total de grossesses (G)" required error={errors.gyn_nb_grossesses?.message}>
                <input type="number" min={0} max={20}
                  {...register('gyn_nb_grossesses', { required: 'Requis', min: 0, max: 20 })}
                  className={cls(!!errors.gyn_nb_grossesses)} />
              </F>
              <F label="Nombre d'accouchements ≥ 22 SA (P)" required error={errors.gyn_nb_accouchements?.message}>
                <input type="number" min={0} max={20}
                  {...register('gyn_nb_accouchements', { required: 'Requis', min: 0, max: 20 })}
                  className={cls(!!errors.gyn_nb_accouchements)} />
              </F>
              <F label="Âge au premier rapport sexuel (années)" required error={errors.gyn_age_premier_rapport?.message}>
                <input type="number" min={8} max={60}
                  {...register('gyn_age_premier_rapport', {
                    required: 'Requis',
                    min: { value: 8, message: '≥ 8' },
                    max: { value: 60, message: '≤ 60' },
                  })} className={cls(!!errors.gyn_age_premier_rapport)} />
              </F>
              <F label="Âge à la première grossesse">
                <input type="number" min={10} max={55}
                  {...register('gyn_age_premiere_grossesse')} className={cls()} />
              </F>
              <F label="Nombre de partenaires sexuels (vie entière)">
                <input type="number" min={0} {...register('gyn_nb_partenaires_vie')} className={cls()} />
              </F>
              <F label="Date des dernières règles (DDR)">
                <input type="date" {...register('gyn_ddr')} className={cls()} />
              </F>
              <F label="Cycles réguliers ?">
                <Sel options={GYN_CYCLE} {...register('gyn_cycle_regulier')} />
              </F>
              <F label="Âge à la première menstruation (années)">
                <input type="number" min={8} max={20}
                  {...register('age_menstrue')} className={cls()} />
              </F>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 5 — FACTEURS DE RISQUE (RIS)
        ═══════════════════════════════════════════════════ */}
        {step === 5 && (
          <section>
            <StepHeader code="F" title="Antécédents médicaux et facteurs de risque (RIS)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Antécédent d'IST" required>
                <Sel options={RIS_IST} {...register('ris_ist_antecedent', { required: true })} />
              </F>
              {Number(w.ris_ist) === 1 && (
                <F label="Type(s) d'IST" col2>
                  <MultiCheck
                    options={[
                      {value:1,label:'Syphilis'},{value:2,label:'Gonococcie'},
                      {value:3,label:'Chlamydiose'},{value:4,label:'Trichomonase'},
                      {value:5,label:'Herpès génital'},{value:6,label:'Condylomes'},{value:7,label:'Autre'},
                    ]}
                    value={multiValues.ris_ist_type}
                    onChange={v => setMulti('ris_ist_type', v)}
                  />
                </F>
              )}
              <F label="Statut VIH" required>
                <Sel options={RIS_VIH} {...register('ris_vih_statut', { required: true })} />
              </F>
              <F label="Tabagisme">
                <Sel options={RIS_TABAC} {...register('ris_tabagisme')} />
              </F>
              <F label="Méthode(s) contraceptive(s) en cours" col2>
                <MultiCheck
                  options={[
                    {value:0,label:'Aucune'},{value:1,label:'Pilule'},{value:2,label:'DIU'},
                    {value:3,label:'Implant'},{value:4,label:'Injectable'},{value:5,label:'Préservatif'},
                    {value:6,label:'Stérilisation'},{value:7,label:'Méthode naturelle'},{value:8,label:'Autre'},
                  ]}
                  value={multiValues.ris_contraception}
                  onChange={v => setMulti('ris_contraception', v)}
                />
              </F>
              <F label="Durée contraception orale (années)">
                <input type="number" min={0} placeholder="Facteur de risque si ≥5 ans"
                  {...register('ris_duree_contraception_horm')} className={cls()} />
              </F>
              <F label="Antécédent de dépistage du col ?">
                <Sel options={RIS_DEPISTAGE} {...register('ris_depistage_anterieur')} />
              </F>
              {Number(w.ris_dep) === 1 && (
                <>
                  <F label="Date du dernier dépistage">
                    <input type="date" {...register('ris_date_dern_depistage')} className={cls()} />
                  </F>
                  <F label="Résultat du dernier dépistage">
                    <Sel options={RIS_RESULTAT_DEP} {...register('ris_resultat_dern_depistage')} />
                  </F>
                </>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 6 — STATUT PHYSIOLOGIQUE (PHY)
        ═══════════════════════════════════════════════════ */}
        {step === 6 && (
          <section>
            <StepHeader code="G" title="Statut physiologique actuel (PHY)"
              desc="IVA et thermo-ablation possibles enceinte avec précaution ; LEEP différé au post-partum (OMS 2021)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Statut physiologique" required error={errors.phy_statut?.message}>
                <Sel options={PHY_STATUT} err={!!errors.phy_statut}
                  {...register('phy_statut', { required: 'Statut requis' })} />
              </F>
              {Number(w.phy) === 2 && (
                <F label="Âge gestationnel (semaines d'aménorrhée)">
                  <input type="number" min={4} max={42}
                    {...register('phy_age_gestationnel')} className={cls()} />
                </F>
              )}
              {Number(w.phy) === 5 && (
                <F label="Âge à la ménopause">
                  <input type="number" min={35} max={65}
                    {...register('phy_age_menopause')} className={cls()} />
                </F>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 7 — DÉPISTAGE (DEP)
        ═══════════════════════════════════════════════════ */}
        {step === 7 && (
          <section>
            <StepHeader code="H" title="Dépistage (DEP)"
              desc="OMS 2021 : test HPV-DNA comme test primaire (sensibilité ≈98%). Cible 70% femmes dépistées à 35 et 45 ans." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Date du dépistage" required error={errors.dep_date?.message}>
                <input type="date" {...register('dep_date', { required: 'Date requise' })}
                  className={cls(!!errors.dep_date)} />
              </F>
              <F label="Méthode(s) utilisée(s)" col2>
                <MultiCheck
                  options={[
                    {value:1,label:'IVA (Inspection Visuelle Acide acétique)'},
                    {value:2,label:'IVL (Inspection Visuelle au Lugol)'},
                    {value:3,label:'Test HPV-DNA'},
                    {value:4,label:'Cytologie (Pap)'},
                    {value:5,label:'Co-testing HPV + Cytologie'},
                  ]}
                  value={multiValues.dep_methode}
                  onChange={v => setMulti('dep_methode', v)}
                />
              </F>

              {/* Résultats conditionnels selon méthode */}
              {methodSet('1') && (
                <F label="Résultat IVA">
                  <Sel options={DEP_RESULTAT_IVA} {...register('dep_resultat_iva')} />
                </F>
              )}
              {methodSet('2') && (
                <F label="Résultat IVL">
                  <Sel options={[opt(1,'Négatif'), opt(2,'Positif'), opt(9,'Non concluant')]}
                    {...register('dep_resultat_ivl')} />
                </F>
              )}
              {methodSet('3') && (
                <F label="Résultat Test HPV">
                  <Sel options={DEP_RESULTAT_HPV} {...register('dep_resultat_hpv')} />
                </F>
              )}
              {(methodSet('4') || methodSet('5')) && (
                <F label="Résultat cytologique (Bethesda 2014)">
                  <Sel options={DEP_CYTOLOGIE} {...register('dep_resultat_cytologie')} />
                </F>
              )}

              {/* Colposcopie */}
              <F label="Colposcopie réalisée ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600"
                    {...register('dep_colposcopie_realisee')} />
                  Oui
                </label>
              </F>
              {w.dep_colpo && (
                <>
                  <F label="Aspect colposcopique">
                    <Sel options={DEP_COLPO_ASPECT} {...register('dep_colposcopie_aspect')} />
                  </F>
                  <F label="Zone de transformation (IFCPC)">
                    <Sel options={DEP_ZONE_TRANSFO} {...register('dep_zone_transformation')} />
                  </F>
                </>
              )}

              {/* Biopsie */}
              <F label="Biopsie indiquée ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600"
                    {...register('dep_biopsie_indiquee')} />
                  Oui
                </label>
              </F>
              <F label="Biopsie réalisée ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600"
                    {...register('dep_biopsie_realisee')} />
                  Oui
                </label>
              </F>
              {w.dep_biopsie && (
                <F label="Nombre de prélèvements (1-4)">
                  <input type="number" min={1} max={4}
                    {...register('dep_biopsie_sites')} className={cls()} />
                </F>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 8 — TRAITEMENT (TRT)
        ═══════════════════════════════════════════════════ */}
        {step === 8 && (
          <section>
            <StepHeader code="I" title="Traitement (TRT)"
              desc="Critères thermo-ablation OMS 2019/2021 : ZT1/ZT2, lésion <75% col, absence suspicion cancer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Éligible au traitement immédiat (screen-and-treat) ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600"
                    {...register('trt_eligible_immediat')} />
                  Oui
                </label>
              </F>

              {!w.trt_elig && (
                <>
                  <F label="Motif de non-éligibilité">
                    <Sel options={TRT_NON_ELIG} {...register('trt_non_eligible_motif')} />
                  </F>
                  <F label="Précision (si autre)" col2>
                    <input type="text" {...register('trt_non_eligible_autre')} className={cls()} />
                  </F>
                </>
              )}

              {w.trt_elig && (
                <>
                  <F label="Méthode de traitement">
                    <Sel options={TRT_METHODE} {...register('trt_methode')} />
                  </F>
                  <F label="Date du traitement">
                    <input type="date" {...register('trt_date')} className={cls()} />
                  </F>

                  {/* Thermo-ablation spécifique */}
                  {Number(w.trt_meth) === 2 && (
                    <>
                      <F label="Durée d'application (secondes — norme OMS: 20-40s)">
                        <input type="number" min={20} max={40}
                          {...register('trt_duree_application')} className={cls()} />
                      </F>
                      <F label="Nombre d'applications (1-3)">
                        <input type="number" min={1} max={3}
                          {...register('trt_nb_applications')} className={cls()} />
                      </F>
                      <F label="Température de la sonde (°C — ≈100°C)">
                        <input type="number" {...register('trt_temperature_sonde')} className={cls()} />
                      </F>
                    </>
                  )}

                  <F label="Effets secondaires immédiats" col2>
                    <MultiCheck
                      options={[
                        {value:0,label:'Aucun'},{value:1,label:'Douleur'},
                        {value:2,label:'Saignement léger'},{value:3,label:'Saignement abondant'},
                        {value:4,label:'Malaise vagal'},{value:5,label:'Crampes'},{value:6,label:'Autre'},
                      ]}
                      value={multiValues.trt_effets_immediats}
                      onChange={v => setMulti('trt_effets_immediats', v)}
                    />
                  </F>
                  <F label="Antalgique administré ?">
                    <label className="flex items-center gap-2 mt-2 text-sm">
                      <input type="checkbox" className="rounded text-indigo-600"
                        {...register('trt_antalgique_administre')} />
                      Oui
                    </label>
                  </F>
                </>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 9 — SUIVI + HPV
        ═══════════════════════════════════════════════════ */}
        {step === 9 && (
          <section>
            <StepHeader code="J" title="Suivi et résultats anatomopathologiques (SUI)"
              desc="Calendrier OMS : contrôle à 12 mois par test HPV post-traitement ablatif" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <F label="Date réception résultat anatomopathologique">
                <input type="date" {...register('sui_anapath_date_reception')} className={cls()} />
              </F>
              <F label="Résultat anatomopathologique">
                <Sel options={SUI_ANAPATH} {...register('sui_anapath_resultat')} />
              </F>
              <F label="Stade FIGO 2018 (si cancer)">
                <select className={cls()} {...register('sui_stade_figo')}>
                  <option value="">— Choisir —</option>
                  {FIGO.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>
              <div />

              {/* RDV de suivi */}
              {[
                ['sui_rdv_1mois', 'RDV à 1 mois (post-traitement)'],
                ['sui_rdv_3mois', 'RDV à 3 mois'],
                ['sui_rdv_6mois', 'RDV à 6 mois'],
                ['sui_rdv_12mois', 'RDV à 12 mois (test de guérison) *'],
                ['sui_rdv_24mois', 'RDV à 24 mois'],
                ['sui_rdv_36mois', 'RDV à 36 mois'],
              ].map(([field, label]) => (
                <F key={field} label={label}>
                  <input type="date" {...register(field as any)} className={cls()} />
                </F>
              ))}

              <F label="Référence vers structure supérieure ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600"
                    {...register('sui_reference')} />
                  Oui
                </label>
              </F>
              <F label="Structure de référence">
                <input type="text" {...register('sui_reference_structure')} className={cls()} />
              </F>
              <F label="Motif de référence" col2>
                <textarea rows={2} {...register('sui_reference_motif')}
                  className={cls()} />
              </F>
            </div>

            <StepHeader code="K" title="Vaccination HPV et connaissances (HPV)"
              desc="Cible OMS 90% : vaccination complète filles avant 15 ans. PEV Sénégal depuis octobre 2018 (filles 9 ans)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="A déjà entendu parler du cancer du col ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600"
                    {...register('hpv_connaissance_ccu')} />
                  Oui
                </label>
              </F>
              <F label="Source(s) d'information" col2>
                <MultiCheck
                  options={[
                    {value:1,label:'Radio'},{value:2,label:'Télévision'},
                    {value:3,label:'Internet/Réseaux sociaux'},{value:4,label:'Agent de santé'},
                    {value:5,label:'Proche/Famille'},{value:6,label:'Affiche/Brochure'},
                    {value:7,label:'Lieu de culte'},{value:8,label:'École'},{value:9,label:'Autre'},
                  ]}
                  value={multiValues.hpv_source_info}
                  onChange={v => setMulti('hpv_source_info', v)}
                />
              </F>
              <F label="Statut vaccinal HPV personnel">
                <Sel options={HPV_VACCIN} {...register('hpv_statut_vaccinal')} />
              </F>
              <F label="A des filles ?">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input type="checkbox" className="rounded text-indigo-600"
                    {...register('hpv_a_des_filles')} />
                  Oui
                </label>
              </F>
              {w.hpv_filles && (
                <>
                  <F label="Nombre total de filles">
                    <input type="number" min={0} {...register('hpv_nb_filles_total')} className={cls()} />
                  </F>
                  <F label="Nombre de filles âgées de 9 à 14 ans">
                    <input type="number" min={0} {...register('hpv_nb_filles_9_14')} className={cls()} />
                  </F>
                  <F label="Nombre de filles vaccinées contre HPV">
                    <input type="number" min={0} {...register('hpv_nb_filles_vaccinees')} className={cls()} />
                  </F>
                  {Number(w.hpv_vacc) < Number(w.hpv_filles914) && (
                    <F label="Raison(s) de non-vaccination des filles" col2>
                      <MultiCheck
                        options={[
                          {value:1,label:'Manque d\'information'},{value:2,label:'Refus parental'},
                          {value:3,label:'Pas accessible'},{value:4,label:'Crainte des effets secondaires'},
                          {value:5,label:'Opposition religieuse/communautaire'},
                          {value:6,label:'Coût perçu'},{value:7,label:'Pas concernées (âge)'},{value:8,label:'Autre'},
                        ]}
                        value={multiValues.hpv_raison_non_vaccination}
                        onChange={v => setMulti('hpv_raison_non_vaccination', v)}
                      />
                    </F>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 10 — CONSENTEMENTS (CON)
        ═══════════════════════════════════════════════════ */}
        {step === 10 && (
          <section>
            <StepHeader code="L" title="Consentements éclairés (CON)"
              desc="Loi n° 2008-12 du 25 janvier 2008 — Protection données personnelles (CDP Sénégal) — Consentement libre, éclairé et révocable" />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ Le consentement au dépistage est obligatoire avant toute procédure.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { field: 'con_depistage', label: 'Consentement éclairé au dépistage', required: true },
                { field: 'con_traitement', label: 'Consentement éclairé au traitement (si applicable)', required: false },
                { field: 'con_donnees_anonymisees', label: 'Consentement à l\'utilisation des données anonymisées (recherche, statistiques)', required: true },
                { field: 'con_rappels_sms', label: 'Consentement à recevoir des rappels SMS pour les rendez-vous', required: true },
                { field: 'con_signature_presente', label: 'Signature / empreinte recueillie sur formulaire papier (traçabilité)', required: true },
              ].map(({ field, label, required }) => (
                <label key={field} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded text-indigo-600 w-5 h-5 flex-shrink-0"
                    {...register(field as any, required ? { required: `${label} est obligatoire` } : {})} />
                  <div>
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                    {required && <span className="text-red-500 ml-1 text-xs">*</span>}
                    {errors[field as keyof typeof errors] && (
                      <p className="text-xs text-red-600 mt-0.5">
                        {(errors[field as keyof typeof errors] as any)?.message}
                      </p>
                    )}
                  </div>
                </label>
              ))}
              <F label="Date/heure du consentement dépistage">
                <input type="datetime-local" {...register('con_depistage_date')} className={cls()} />
              </F>
            </div>
          </section>
        )}

        {/* ─── Navigation ─────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
            Annuler
          </button>
          <div className="flex gap-3">
            {step > 1 && (
              <button type="button" onClick={goPrev}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ← Précédent
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button type="button" onClick={goNext}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                Suivant →
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {isSubmitting ? 'Enregistrement…' : '✓ Enregistrer la fiche'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientFormWizard;
