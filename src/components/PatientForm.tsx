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
const HPV_VACCIN = [
  opt(0,'Non vaccinée'), opt(1,'Vaccinée (1 dose)'),
  opt(2,'Vaccinée (2 doses)'), opt(3,'Vaccinée (3 doses)'), opt(9,'Ne sait pas'),
];

// ─── Reusable field components ─────────────────────────────────────────────
const cls = (err?: boolean) =>
  `w-full border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all py-3 px-4 text-body-md bg-white ${
    err ? 'border-error ring-error/10' : ''
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
  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
    {text}{required && <span className="text-secondary ml-1">*</span>}
  </label>
);

const Err: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-[10px] text-error mt-1 italic font-medium">{msg}</p> : null;

const F: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode; col2?: boolean; className?: string }> = ({
  label, required, error, children, col2, className
}) => (
  <div className={`space-y-2 ${col2 ? 'md:col-span-2' : ''} ${className || ''}`}>
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
const StepHeader: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <h4 className="text-body-lg font-bold text-on-surface">{title}</h4>
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

  const progressPercent = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className="pt-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs & Status */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-h2 font-h2 text-primary font-bold">{STEP_LABELS[step - 1]}</h1>
            <p className="text-slate-500 font-body-md mt-1">Étape {step} sur {TOTAL_STEPS} : Collecte des données du dossier.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Progression du Dossier</span>
              <div className="w-48 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-secondary rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
            <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold">{progressPercent}%</div>
          </div>
        </div>

        {/* Hero/Context Image */}
        <div className="w-full h-48 rounded-2xl overflow-hidden mb-12 relative group shadow-xl">
          <img 
            alt="Clinic Context" 
            className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAauNyec2XIvhshiiV0nqvRno1Yhna8o7BZ-PcSzp3uF4Fpb_hHNF2_x3fbDydqmNP9OwxbwfCrxS2TlQRtMShch2JZBVF1ZGCW1loRwV1vH-Ybc78NKD8DXtC1TQlhstPyLG82hDSroFarQ8ecMAJGMr0O7K6VzW7k7ixenjOjpknpToosKpbKY3ySLf-4udRr7G2FS-f60K9PHeNeAhpc-MpwlAkEqEe-q0jp1391te9MEr7o8ofCiWWY_DdMHhGdnmJ3aoDvJKKb"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
          <div className="absolute bottom-6 left-8 text-white">
            <span className="text-xs uppercase tracking-widest font-bold bg-secondary px-3 py-1 rounded-full mb-2 inline-block">Priorité Clinique</span>
            <h3 className="text-white text-h3 font-h3">Caravane d'élimination CerviCare</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-10">

        {/* ═══════════════════════════════════════════════════
            STEP 1 — META + GEO
        ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <section className="space-y-8">
            <div>
              <StepHeader icon="assignment" title="Métadonnées de saisie" />
              <div className="glass-card rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div>
              <StepHeader icon="location_on" title="Identification géographique (GEO)" />
              <div className="glass-card rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <F label="Latitude GPS">
                  <input type="number" step="0.000001" placeholder="-90 à +90" className={cls()}
                    {...register('geo_gps_lat')} />
                </F>
                <F label="Longitude GPS">
                  <input type="number" step="0.000001" placeholder="-180 à +180" className={cls()}
                    {...register('geo_gps_lon')} />
                </F>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 3 — SOCIO (SOC)
        ═══════════════════════════════════════════════════ */}
        {step === 3 && (
          <section className="space-y-8">
            <StepHeader icon="diversity_3" title="Données sociodémographiques (SOC)" />
            <div className="glass-card rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <F label="Statut matrimonial" required error={errors.soc_statut_matrimonial?.message}>
                <Sel options={SOC_STATUT_MATRIM} err={!!errors.soc_statut_matrimonial}
                  {...register('soc_statut_matrimonial', { required: 'Champ requis' })} />
              </F>
              <F label="Profession" required error={errors.soc_profession?.message}>
                <Sel options={SOC_PROF} err={!!errors.soc_profession}
                  {...register('soc_profession', { required: 'Champ requis' })} />
              </F>
              {w.soc_prof === '8' && (
                <F label="Préciser profession" col2>
                  <input type="text" {...register('soc_profession_autre')} className={cls()} placeholder="Précisez..." />
                </F>
              )}
              <F label="Niveau d'instruction" required error={errors.soc_niveau_instruction?.message}>
                <Sel options={SOC_INSTRUCTION} err={!!errors.soc_niveau_instruction}
                  {...register('soc_niveau_instruction', { required: 'Champ requis' })} />
              </F>
              <F label="Mode d'entrée" required error={errors.soc_mode_entree?.message}>
                <Sel options={SOC_MODE_ENTREE} err={!!errors.soc_mode_entree}
                  {...register('soc_mode_entree', { required: 'Champ requis' })} />
              </F>
              <F label="Ethnie">
                <Sel options={ETHNIE} {...register('ethnie')} />
              </F>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 4 — GYNÉCO (GYN)
        ═══════════════════════════════════════════════════ */}
        {step === 4 && (
          <section className="space-y-8">
            <StepHeader icon="female" title="Antécédents gynécologiques (GYN)" />
            <div className="glass-card rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <F label="Nombre de grossesses" error={errors.gyn_nb_grossesses?.message}>
                <input type="number" {...register('gyn_nb_grossesses')} className={cls()} placeholder="0" />
              </F>
              <F label="Nombre d'accouchements" error={errors.gyn_nb_accouchements?.message}>
                <input type="number" {...register('gyn_nb_accouchements')} className={cls()} placeholder="0" />
              </F>
              <F label="Nombre d'enfants vivants">
                <input type="number" {...register('gyn_nb_enfants_vivants')} className={cls()} placeholder="0" />
              </F>
              <F label="Âge 1er rapport sexuel" error={errors.gyn_age_premier_rapport?.message}>
                <input type="number" {...register('gyn_age_premier_rapport')} className={cls()} placeholder="Âge" />
              </F>
              <F label="Régularité du cycle">
                <Sel options={GYN_CYCLE} {...register('gyn_cycle_regulier')} />
              </F>
              <F label="Ménopause">
                <Sel options={[{value:1,label:'Oui'},{value:0,label:'Non'}]} {...register('gyn_menopause')} />
              </F>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 5 — RISQUES (RIS)
        ═══════════════════════════════════════════════════ */}
        {step === 5 && (
          <section className="space-y-8">
            <StepHeader icon="warning" title="Risques et antécédents (RIS)" />
            <div className="glass-card rounded-2xl p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <F label="Antécédents d'IST">
                  <Sel options={RIS_IST} {...register('ris_ist_antecedent')} />
                </F>
                {w.ris_ist === '1' && (
                  <F label="Types d'IST (Multi)" col2>
                    <MultiCheck
                      options={[opt(1,'Pertes V/U'), opt(2,'Ulcérations'), opt(3,'Balanites'), opt(4,'Végétations'), opt(5,'Autre')]}
                      value={multiValues.ris_ist_type}
                      onChange={(v: string) => setMulti('ris_ist_type', v)}
                    />
                  </F>
                )}
                <F label="Statut VIH">
                  <Sel options={RIS_VIH} {...register('ris_vih_statut')} />
                </F>
                <F label="Tabagisme">
                  <Sel options={RIS_TABAC} {...register('ris_tabagisme')} />
                </F>
              </div>

              <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <F label="Contraception moderne (Multi)">
                  <MultiCheck
                    options={[opt(1,'Pilule'), opt(2,'Injectable'), opt(3,'Implant'), opt(4,'DIU'), opt(5,'Autre')]}
                    value={multiValues.ris_contraception}
                    onChange={(v: string) => setMulti('ris_contraception', v)}
                  />
                </F>
                <F label="Dépistage antérieur">
                  <Sel options={RIS_DEPISTAGE} {...register('ris_depistage_anterieur')} />
                </F>
                {w.ris_dep === '1' && (
                  <>
                    <F label="Dernier résultat">
                      <Sel options={RIS_RESULTAT_DEP} {...register('ris_resultat_depistage_anterieur')} />
                    </F>
                    <F label="Date du dépistage">
                      <input type="date" {...register('ris_date_depistage_anterieur')} className={cls()} />
                    </F>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 6 — PHYSIOLOGIE (PHY)
        ═══════════════════════════════════════════════════ */}
        {step === 6 && (
          <section>
            <StepHeader icon="monitor_heart" title="Données physiologiques (PHY)" />
            <div className="glass-card rounded-2xl p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <F label="Poids actuel">
                  <div className="relative">
                    <input type="number" step="0.1" {...register('phy_poids')} className={cls()} placeholder="00.0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">KG</span>
                  </div>
                </F>
                <F label="Taille">
                  <div className="relative">
                    <input type="number" {...register('phy_taille')} className={cls()} placeholder="000" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">CM</span>
                  </div>
                </F>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                <F label="Statut physiologique" required error={errors.phy_statut?.message}>
                  <Sel options={PHY_STATUT} err={!!errors.phy_statut}
                    {...register('phy_statut', { required: 'Statut requis' })} />
                </F>
                {w.phy === '2' && (
                  <F label="Âge de la grossesse (SA)">
                    <input type="number" {...register('phy_age_grossesse')} className={cls()} placeholder="Semaines" />
                  </F>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <F label="Pression Systolique">
                   <input type="number" {...register('phy_tension_sys')} className={cls()} placeholder="Sys" />
                 </F>
                 <F label="Pression Diastolique">
                   <input type="number" {...register('phy_tension_dia')} className={cls()} placeholder="Dia" />
                 </F>
                 <F label="Glycémie (si faite)">
                   <input type="number" step="0.01" {...register('phy_glycemie')} className={cls()} placeholder="g/L" />
                 </F>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 7 — DÉPISTAGE (DEP)
        ═══════════════════════════════════════════════════ */}
        {step === 7 && (
          <section className="space-y-8">
            <StepHeader icon="biotech" title="Dépistage Cervical (DEP)" />
            <div className="glass-card rounded-2xl p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <F label="Date du dépistage" required error={errors.dep_date?.message}>
                  <input type="date" {...register('dep_date', { required: 'Date requise' })} className={cls(!!errors.dep_date)} />
                </F>
                <div />
                <F label="Méthode(s) de dépistage (Multi)" col2>
                  <MultiCheck
                    options={[
                      opt(1,'IVA (Acide Acétique)'), opt(2,'IVL (Lugol)'),
                      opt(3,'HPV DNA (Test Primaire)'), opt(4,'Cytologie (Frottis)'),
                    ]}
                    value={multiValues.dep_methode}
                    onChange={(v) => setMulti('dep_methode', v)}
                  />
                </F>
              </div>

              {/* Conditional Results based on MultiCheck */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {methodSet('1') && <F label="Résultat IVA"><Sel options={DEP_RESULTAT_IVA} {...register('dep_resultat_iva')} /></F>}
                {methodSet('2') && <F label="Résultat IVL"><Sel options={[opt(1,'Normal'), opt(2,'Anormal')]} {...register('dep_resultat_ivl')} /></F>}
                {methodSet('3') && <F label="Résultat HPV"><Sel options={DEP_RESULTAT_HPV} {...register('dep_resultat_hpv')} /></F>}
                {methodSet('4') && <F label="Résultat Cytologie"><Sel options={DEP_CYTOLOGIE} {...register('dep_resultat_cytologie')} /></F>}
              </div>

              <div className="bg-primary/5 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <F label="Colposcopie">
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary w-5 h-5" {...register('dep_colposcopie_realisee')} />
                    <span className="text-sm font-medium">Réalisée</span>
                  </label>
                </F>
                {w.dep_colpo && (
                  <F label="Aspect">
                    <Sel options={DEP_COLPO_ASPECT} {...register('dep_colposcopie_aspect')} />
                  </F>
                )}
                <F label="Biopsie">
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary w-5 h-5" {...register('dep_biopsie_realisee')} />
                    <span className="text-sm font-medium">Réalisée</span>
                  </label>
                </F>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 8 — TRAITEMENT (TRT)
        ═══════════════════════════════════════════════════ */}
        {step === 8 && (
          <section className="space-y-8">
            <StepHeader icon="medical_services" title="Prise en charge et traitement (TRT)" />
            <div className="glass-card rounded-2xl p-8 space-y-8">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <span className="text-emerald-800 font-bold text-sm uppercase">Dossier éligible au traitement immédiat</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('trt_eligible_immediat')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {w.trt_elig ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                  <F label="Méthode de traitement">
                    <Sel options={TRT_METHODE} {...register('trt_methode')} />
                  </F>
                  <F label="Date du traitement">
                    <input type="date" {...register('trt_date')} className={cls()} />
                  </F>
                  <F label="Effets secondaires (Multi)" col2>
                    <MultiCheck
                      options={[opt(0,'Aucun'), opt(1,'Douleur'), opt(2,'Saignement'), opt(3,'Malaise')]}
                      value={multiValues.trt_effets_immediats}
                      onChange={(v) => setMulti('trt_effets_immediats', v)}
                    />
                  </F>
                </div>
              ) : (
                <F label="Motif de non-éligibilité" col2>
                  <Sel options={TRT_NON_ELIG} {...register('trt_non_eligible_motif')} />
                </F>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 9 — SUIVI + HPV
        ═══════════════════════════════════════════════════ */}
        {step === 9 && (
          <section className="space-y-8">
            <StepHeader icon="event_repeat" title="Suivi thérapeutique et HPV" />
            <div className="glass-card rounded-2xl p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <F label="Résultat Anapath">
                  <Sel options={SUI_ANAPATH} {...register('sui_anapath_resultat')} />
                </F>
                <F label="Contrôle à 12 mois">
                  <input type="date" {...register('sui_rdv_12mois')} className={cls()} />
                </F>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Connaissances & Vaccination HPV</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <F label="Statut vaccinal HPV">
                    <Sel options={HPV_VACCIN} {...register('hpv_statut_vaccinal')} />
                  </F>
                  <F label="Source d'information (Multi)">
                    <MultiCheck
                      options={[opt(1,'Radio'), opt(2,'TV'), opt(3,'Agent de santé'), opt(4,'Réseaux sociaux')]}
                      value={multiValues.hpv_source_info}
                      onChange={(v) => setMulti('hpv_source_info', v)}
                    />
                  </F>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 10 — CONSENTEMENTS (CON)
        ═══════════════════════════════════════════════════ */}
        {step === TOTAL_STEPS && (
          <section className="space-y-8">
            <StepHeader icon="verified_user" title="Validation et Consentements (CON)" />
            <div className="glass-card rounded-2xl p-8 space-y-6">
              <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/20">
                <p className="text-sm text-secondary font-medium italic">
                  "Je confirme avoir reçu une information claire sur le dépistage par IVA/HPV et j'accepte d'être contactée pour les résultats."
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { field: 'con_depistage', label: 'Consentement au dépistage' },
                  { field: 'con_signature_presente', label: 'Feuille de consentement signée (Papier)' },
                  { field: 'con_donnees_anonymisees', label: 'Utilisation des données pour la recherche' },
                ].map((c) => (
                  <label key={c.field} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer bg-white">
                    <input type="checkbox" className="rounded text-primary w-6 h-6" 
                      {...register(c.field as any, { required: true })} />
                    <span className="text-body-md font-medium text-slate-700">{c.label}</span>
                    {errors[c.field as keyof PatientFormData] && <span className="ml-auto text-error text-[10px] font-bold uppercase">Requis</span>}
                  </label>
                ))}
              </div>

              <div className="pt-6">
                <F label="Pris en charge par (Qualification)">
                  <Sel options={META_QUALIF} {...register('meta_agent_qualif')} />
                </F>
              </div>
            </div>
          </section>
        )}

        {/* ─── Navigation ─────────────────────────────────── */}
        </form>
      </div>

      {/* Footer Action Bar */}
      <footer className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-10 py-4">
          <div className="flex items-center gap-8">
            <span className="font-sans text-[10px] uppercase tracking-widest text-slate-400">© 2024 CerviCare Medical. HIPAA Compliant.</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-button border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Annuler
            </button>
            <div className="flex gap-3">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={goPrev}
                  className="px-6 py-2.5 text-button border border-primary text-primary rounded-xl hover:bg-primary/5 transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Précédent
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button 
                  type="button" 
                  onClick={goNext}
                  className="px-8 py-2.5 text-button bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2"
                >
                  Suivant
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmitForm)}
                  className="px-8 py-2.5 text-button bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20 hover:bg-secondary-container transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? 'Enregistrement…' : (
                    <>
                      Enregistrer le Dossier
                      <span className="material-symbols-outlined text-sm">check</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientFormWizard;
