import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { patientService } from '../services/patientService.ts';
import type { PatientFormData } from '../types';

// ─── Option helpers ────────────────────────────────────────────────────────
const opt = (value: number | string, label: string) => ({ value, label });

const GEO_REGIONS = [
  opt(1, 'Dakar'), opt(2, 'Diourbel'), opt(3, 'Fatick'), opt(4, 'Kaffrine'),
  opt(5, 'Kaolack'), opt(6, 'Kédougou'), opt(7, 'Kolda'), opt(8, 'Louga'),
  opt(9, 'Matam'), opt(10, 'Saint-Louis'), opt(11, 'Sédhiou'),
  opt(12, 'Tambacounda'), opt(13, 'Thiès'), opt(14, 'Ziguinchor'),
];
const GEO_TYPE_STRUCTURE = [
  opt(1, 'Poste de santé'), opt(2, 'Centre de santé'), opt(3, 'Hôpital de district'),
  opt(4, 'EPS niveau 2'), opt(5, 'EPS niveau 3'), opt(6, 'Caravane mobile'),
];
const META_QUALIF = [
  opt(1, 'Sage-femme'), opt(2, 'Médecin'), opt(3, 'Infirmier(ère)'),
  opt(4, 'Gynécologue'), opt(5, 'Autre'),
];
const SOC_PROF = [
  opt(1, 'Ménagère'), opt(2, 'Salariée'), opt(3, 'Étudiante/Élève'),
  opt(4, 'Commerçante'), opt(5, 'Couturière/Coiffeuse/Restauratrice'),
  opt(6, 'Paysanne/Éleveuse'), opt(7, 'Sans emploi'), opt(8, 'Autre (préciser)'),
];
const SOC_INSTRUCTION = [
  opt(0, 'Aucun'), opt(1, 'Primaire'), opt(2, 'Secondaire'),
  opt(3, 'Supérieur'), opt(4, 'École coranique/Daara'), opt(5, 'Alphabétisation'),
];
const SOC_STATUT_MATRIM = [
  opt(1, 'Célibataire'), opt(2, 'Mariée monogame'), opt(3, 'Mariée polygame'),
  opt(4, 'Veuve'), opt(5, 'Divorcée/Séparée'), opt(6, 'Union libre'),
];
const SOC_MODE_ENTREE = [
  opt(1, 'Venue spontanée'), opt(2, 'Mobilisation communautaire'),
  opt(3, 'Orientation par agent de santé'), opt(4, 'Référence inter-structure'),
  opt(5, 'Caravane'),
];
const ETHNIE = [
  opt(1, 'Wolof'), opt(2, 'Sérère'), opt(3, 'Peulh'), opt(4, 'Toucouleur'),
  opt(5, 'Mandingue'), opt(6, 'Diola'), opt(7, 'Autre'),
];
const GYN_CYCLE = [opt(1, 'Réguliers'), opt(2, 'Irréguliers'), opt(9, 'Ne sait pas')];
const RIS_IST = [opt(1, 'Oui'), opt(0, 'Non'), opt(9, 'Ne sait pas')];
const RIS_VIH = [
  opt(1, 'Négatif'), opt(2, 'Positif sous TARV'),
  opt(3, 'Positif sans TARV'), opt(9, 'Inconnu/Refus'),
];
const RIS_TABAC = [opt(0, 'Non'), opt(1, 'Actif'), opt(2, 'Sevrée'), opt(3, 'Passif')];
const RIS_DEPISTAGE = [opt(0, 'Non'), opt(1, 'Oui'), opt(9, 'Ne sait pas')];
const RIS_RESULTAT_DEP = [
  opt(1, 'Normal/Négatif'), opt(2, 'Anormal/Positif'), opt(3, 'Traitée'), opt(9, 'Inconnu'),
];
const PHY_STATUT = [
  opt(1, 'Non enceinte'), opt(2, 'Enceinte'), opt(3, 'Post-partum (≤6 sem.)'),
  opt(4, 'Allaitement'), opt(5, 'Ménopausée'),
];
const DEP_RESULTAT_IVA = [
  opt(1, 'Négatif'), opt(2, 'Positif'), opt(3, 'Polype'),
  opt(4, 'Suspicion de cancer'), opt(5, 'Non concluant (ZT3)'),
];
const DEP_RESULTAT_HPV = [
  opt(0, 'Négatif'), opt(1, 'HPV 16'), opt(2, 'HPV 18'),
  opt(3, 'Autres HPV à haut risque'), opt(4, 'Multi-types'),
  opt(5, 'HPV 31'), opt(6, 'HPV 33'), opt(7, 'HPV 35'), opt(8, 'HPV 39'),
  opt(9, 'HPV 45'), opt(10, 'HPV 51'), opt(11, 'HPV 52'), opt(12, 'HPV 56'),
  opt(13, 'HPV 58'), opt(14, 'HPV 59'), opt(15, 'HPV 68'),
];
const DEP_CYTOLOGIE = [
  opt(1, 'NILM (normal)'), opt(2, 'ASC-US'), opt(3, 'ASC-H'), opt(4, 'LSIL'),
  opt(5, 'HSIL'), opt(6, 'AGC'), opt(7, 'Carcinome épidermoïde'),
  opt(8, 'Adénocarcinome'), opt(9, 'Insatisfaisant'),
];
const DEP_COLPO_ASPECT = [
  opt(1, 'Normal'), opt(2, 'Anormal mineur'), opt(3, 'Anormal majeur'),
  opt(4, 'Suspicion de cancer invasif'), opt(5, 'Polype'), opt(6, 'Non satisfaisante'),
];
const DEP_ZONE_TRANSFO = [
  opt(1, 'ZT1 — entièrement exocervicale, visible'),
  opt(2, 'ZT2 — partiellement endocervicale, visible'),
  opt(3, 'ZT3 — endocervicale non visible'),
];
const TRT_NON_ELIG = [
  opt(1, 'Suspicion de cancer invasif'), opt(2, 'Lésion >75% ou extension endocervicale'),
  opt(3, 'ZT3 non visualisable'), opt(4, 'Grossesse en cours'),
  opt(5, 'Refus de la patiente'), opt(6, 'Contre-indication médicale'),
  opt(7, 'Référence pour avis spécialisé'), opt(8, 'Autre'),
];
const TRT_METHODE = [
  opt(1, 'Cryothérapie'), opt(2, 'Thermo-ablation'),
  opt(3, 'LEEP/LLETZ'), opt(4, 'Conisation bistouri froid (CKC)'),
  opt(5, 'Hystérectomie'), opt(6, 'Référence chimio/radiothérapie'),
];
const SUI_ANAPATH = [
  opt(1, 'Cervicite / Métaplasie'), opt(2, 'CIN1 / LSIL'), opt(3, 'CIN2'),
  opt(4, 'CIN3 / HSIL'), opt(5, 'AIS (adénocarcinome in situ)'),
  opt(6, 'Carcinome épidermoïde invasif'), opt(7, 'Adénocarcinome invasif'),
  opt(8, 'Autre'), opt(9, 'Non concluant'),
];
const FIGO = ['IA1', 'IA2', 'IB1', 'IB2', 'IB3', 'IIA1', 'IIA2', 'IIB', 'IIIA', 'IIIB', 'IIIC1', 'IIIC2', 'IVA', 'IVB'];
const HPV_VACCIN = [
  opt(0, 'Non vaccinée'), opt(1, 'Vaccinée (1 dose)'),
  opt(2, 'Vaccinée (2 doses)'), opt(3, 'Vaccinée (3 doses)'), opt(9, 'Ne sait pas'),
];

const HPV_VACCIN_TYPE = [
  opt('Gardasil 4', 'Gardasil® 4 (Merck, bivalent HPV 6/11/16/18)'),
  opt('Gardasil 9', 'Gardasil® 9 (Merck, 9-valent)'),
  opt('Cervarix', 'Cervarix® (GSK, bivalent HPV 16/18)'),
  opt('Cecolin', 'Cecolin® (Innovax, bivalent HPV 16/18)'),
  opt('Autre', 'Autre / Inconnu'),
];

const REFERENCE_STRUCTURES = [
  'CHU de Dakar (CHNU de Fann)', 'CHU Aristide Le Dantec',
  'CHU A. Roume (enfants)', 'Hôpital Principal de Dakar',
  'Hôpital de Ziguinchor', 'Hôpital régional de Saint-Louis',
  'Hôpital régional de Kaolack', 'Hôpital régional de Thiès',
  'Institut Curie de Dakar (oncologie)', 'Centre de lutte anti-cancer (Dalal Jamm)',
  'Institut de cancérologie de Dakar', 'Hôpital de Touba',
  'Autre structure (préciser)',
];

// ─── Reusable field components ─────────────────────────────────────────────
// Helper for premium clinical input styles
const cls = (err?: boolean) =>
  `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-base ${err
    ? 'border-red-200 bg-red-50 focus:border-red-500'
    : 'border-slate-100 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'
  }`;

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: number | string; label: string }[];
  err?: boolean;
};
const Sel = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, err, ...rest }, ref: React.ForwardedRef<HTMLSelectElement>) => (
    <select className={cls(err)} ref={ref} {...rest}>
      <option value="">— Choisir —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
);
Sel.displayName = 'Sel';

const F = ({ label, required, children, col2, error }: { label: string; required?: boolean; children: React.ReactNode; col2?: boolean; error?: string }) => (
  <div className={col2 ? "md:col-span-2" : ""}>
    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight uppercase">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-error mt-1">{error}</p>}
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-4 py-4 text-sm font-bold rounded-2xl border-2 transition-all duration-300 text-left flex flex-col justify-between h-full ${active
              ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20 scale-[1.02]'
              : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
              }`}
          >
            <span className="mb-2 block">{opt.label}</span>
            <span className={`material-symbols-outlined text-xl ${active ? 'opacity-100' : 'opacity-20'}`}>
              {active ? 'check_circle' : 'circle'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Checkbox Card Component ────────────────────────────────────────────────────────
const CheckCard = ({ label, icon, checked, onChange, sublabel }: { label: string; icon: string; checked: boolean; onChange: (v: boolean) => void; sublabel?: string }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`p-6 rounded-[32px] border-2 text-left transition-all duration-300 flex items-center gap-6 group ${checked ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white border-slate-100 text-slate-700 hover:border-blue-200'}`}
  >
    <div className={`p-4 rounded-2xl transition-colors ${checked ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
      <span className="material-symbols-outlined text-3xl block">{icon}</span>
    </div>
    <div className="flex-1">
      <p className="font-black text-lg tracking-tight leading-tight">{label}</p>
      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${checked ? 'text-blue-200' : 'text-slate-400'}`}>
        {sublabel || (checked ? 'Accordé' : 'En attente')}
      </p>
    </div>
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'bg-white border-white' : 'border-slate-200 group-hover:border-blue-300'}`}>
      {checked && <span className="material-symbols-outlined text-blue-600 text-xl font-bold">check</span>}
    </div>
  </button>
);

const StepHeader = ({ code, title, desc }: { code: string; title: string, desc?: string }) => (
  <div className="mb-8 border-b border-slate-100 pb-6 fade-in">
    <div className="flex items-center gap-4 mb-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-500/30 text-xl">
        {code}
      </div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h3>
    </div>
    {desc && <p className="text-lg text-slate-500 leading-relaxed font-medium">{desc}</p>}
  </div>
);

// ─── Cervix Mapping Component (SVG) ──────────────────────────────────────────────────
const CervixMap: React.FC<{ value: any; onChange: (v: any) => void }> = ({ value, onChange }) => {
  const marked = value || { os: false, zones: [] };
  const toggleZone = (z: string) => {
    const zones = marked.zones || [];
    const newZones = zones.includes(z) ? zones.filter((i: string) => i !== z) : [...zones, z];
    onChange({ ...marked, zones: newZones });
  };
  const toggleOs = () => onChange({ ...marked, os: !marked.os });

  const R = [25, 60, 95, 130]; // Radii for Os, Z1, Z2, Z3
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const getPath = (h: number, rIn: number, rOut: number) => {
    const startAngle = (h - 1) * 30 - 105;
    const endAngle = h * 30 - 105;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = 150 + rIn * Math.cos(rad(startAngle));
    const y1 = 150 + rIn * Math.sin(rad(startAngle));
    const x2 = 150 + rOut * Math.cos(rad(startAngle));
    const y2 = 150 + rOut * Math.sin(rad(startAngle));
    const x3 = 150 + rOut * Math.cos(rad(endAngle));
    const y3 = 150 + rOut * Math.sin(rad(endAngle));
    const x4 = 150 + rIn * Math.cos(rad(endAngle));
    const y4 = 150 + rIn * Math.sin(rad(endAngle));
    return `M ${x1} ${y1} L ${x2} ${y2} A ${rOut} ${rOut} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rIn} ${rIn} 0 0 0 ${x1} ${y1} Z`;
  };

  return (
    <div className="flex flex-col items-center bg-slate-900/50 p-8 rounded-[40px] border border-white/10 backdrop-blur-md">
      <svg viewBox="0 0 300 300" className="w-[320px] h-[320px] drop-shadow-2xl">
        <defs>
          <radialGradient id="grad-cervix" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Hour markers */}
        {hours.map(h => {
          const angle = (h * 30 - 90) * Math.PI / 180;
          return <text key={h} x={150 + 142 * Math.cos(angle)} y={150 + 142 * Math.sin(angle)} 
            fill="#64748b" fontSize="10" fontWeight="900" textAnchor="middle" alignmentBaseline="middle">{h}h</text>
        })}

        {/* Zones (Rings x Hours) */}
        {[1, 2, 3].map(zIdx => hours.map(h => {
          const id = `H${h}-Z${zIdx}`;
          const active = (marked.zones || []).includes(id);
          return (
            <path key={id} d={getPath(h, R[zIdx - 1], R[zIdx])} 
              fill={active ? "#8b5cf6" : "transparent"} 
              stroke="#ffffff10" strokeWidth="1"
              className="cursor-pointer hover:fill-blue-500/30 transition-all duration-200"
              onClick={() => toggleZone(id)}
              filter={active ? "url(#glow)" : ""}
            />
          )
        }))}

        {/* Central Os */}
        <circle cx="150" cy="150" r={R[0]} 
          fill={marked.os ? "#ec4899" : "#334155"} 
          className="cursor-pointer hover:opacity-80 transition-all"
          onClick={toggleOs}
          stroke="#ffffff20" strokeWidth="2"
          filter={marked.os ? "url(#glow)" : ""}
        />
      </svg>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
         {(marked.zones || []).length > 0 && (
           <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/20">
             {(marked.zones || []).length} zones marquées
           </span>
         )}
         {marked.os && (
           <span className="px-4 py-1.5 bg-pink-500/20 text-pink-400 rounded-full text-xs font-black uppercase tracking-widest border border-pink-500/20">
             Orifice externe atteint
           </span>
         )}
      </div>
    </div>
  );
};

interface Props { patient?: any; onCancel: () => void; onSubmit?: (data?: any) => void; }

const TOTAL_STEPS = 11;

const STEP_LABELS = [
  'Consentements (CON)', 'META + GEO', 'Identité (PAT)', 'Socio (SOC)', 'Gynéco (GYN)',
  'Risques (RIS)', 'Physiologie (PHY)', 'Dépistage (DEP)',
  'Traitement (TRT)', 'Suivi + HPV', 'Synthèse IA',
];

const PatientFormWizard: React.FC<Props> = ({ patient, onCancel, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [multiValues, setMultiValues] = useState<Record<string, string>>({
    ris_ist_type: '', ris_contraception: '',
    dep_methode: '', trt_effets_immediats: '',
    hpv_source_info: '', hpv_raison_non_vaccination: '',
  });

  const { register, handleSubmit, watch, trigger, formState: { errors }, reset, setValue } =
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
    hpv_filles_total: watch('hpv_nb_filles_total'),
    hpv_filles914: watch('hpv_nb_filles_9_14'),
    hpv_vacc: watch('hpv_nb_filles_vaccinees'),
    hpv_statut_vacc: watch('hpv_statut_vaccinal'),
    soc_prof: watch('soc_profession'),
    soc_matrim: watch('soc_statut_matrimonial'),
    trt_non_elig_motif: watch('trt_non_eligible_motif'),
    sui_ref: watch('sui_reference'),
    sui_ref_structure: watch('sui_reference_structure'),
    gyn_1er_rapport: watch('gyn_age_premier_rapport'),
    gyn_1ere_grossesse: watch('gyn_age_premiere_grossesse'),
  };

  const methodSet = (code: string) => (multiValues.dep_methode || '').split(',').includes(code);

  const setMulti = (key: string, val: string) =>
    setMultiValues(prev => ({ ...prev, [key]: val }));

  const fieldsByStep: Record<number, (keyof PatientFormData)[]> = {
    1: ['con_depistage', 'con_donnees_anonymisees', 'con_signature_presente'],
    2: ['id_patient', 'meta_agent_qualif', 'geo_region', 'geo_type_structure'],
    3: ['prenom', 'nom', 'age', 'num_phone', 'pat_adresse'],
    4: ['soc_statut_matrimonial', 'soc_profession', 'soc_niveau_instruction', 'soc_mode_entree'],
    5: ['gyn_nb_grossesses', 'gyn_nb_accouchements', 'gyn_age_premier_rapport', 'gyn_nb_avortements', 'gyn_nb_morts_nes', 'gyn_parite_simple'],
    6: ['ris_ist_antecedent', 'ris_vih_statut', 'ris_tabagisme', 'ris_contraception'],
    7: ['phy_statut', 'phy_ddr', 'phy_age_gestationnel', 'phy_age_menopause'],
    8: ['dep_date', 'dep_methode', 'dep_resultat_iva', 'dep_resultat_ivl', 'dep_resultat_hpv', 'dep_resultat_cytologie', 'dep_biopsie_sites'],
    9: ['trt_eligible_immediat', 'trt_non_eligible_motif', 'trt_methode', 'trt_date', 'trt_duree_application', 'trt_nb_applications', 'trt_temperature_sonde'],
    10: ['sui_anapath_date_reception', 'sui_anapath_resultat', 'hpv_connaissance_ccu', 'hpv_statut_vaccinal', 'hpv_a_des_filles', 'hpv_nb_filles_total', 'hpv_nb_filles_9_14', 'hpv_nb_filles_vaccinees'],
    11: ['ai_synthese'],
  };

  const generateAISummary = async () => {
    const data = watch();
    setAiLoading(true);
    try {
      const response = await fetch('/api/patients/patients/ai-summary/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la génération');
      const result = await response.json();
      setAiSummary(result.synthese);
      setValue('ai_synthese', result.synthese);
      toast.success('Synthèse IA générée avec succès');
    } catch (error) {
      toast.error('Échec de la génération de la synthèse');
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const getGPS = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }
    const loadingToast = toast.loading("Activation du GPS temps réel...");
    navigator.geolocation.watchPosition(
      (pos) => {
        setValue('geo_gps_lat', Number(pos.coords.latitude.toFixed(6)));
        setValue('geo_gps_lon', Number(pos.coords.longitude.toFixed(6)));
        toast.dismiss(loadingToast);
        toast.success("Position GPS capturée !");
      },
      (err) => {
        toast.dismiss(loadingToast);
        toast.error("Échec : " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const goNext = async () => {
    // Validation personnalisée pour les champs complexes (MultiCheck)
    if (step === 6) {
      if (Number(w.ris_ist) === 1 && !multiValues.ris_ist_type) {
        toast.error("Veuillez préciser le(s) type(s) d'IST");
        return;
      }
    }
    if (step === 8) {
      if (!multiValues.dep_methode) {
        toast.error("Veuillez choisir au moins une méthode de dépistage");
        return;
      }
    }

    const valid = await trigger(fieldsByStep[step] as any);
    if (!valid) { toast.error('Veuillez remplir les champs obligatoires'); return; }
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
      
      const p = payload as any;

      // Clean Date Fields
      const dateFields = [
        'date_naiss', 'gyn_ddr', 'ris_date_dern_depistage', 'dep_date', 'trt_date',
        'sui_anapath_date_reception', 'sui_rdv_1mois', 'sui_rdv_3mois', 'sui_rdv_6mois',
        'sui_rdv_12mois', 'sui_rdv_24mois', 'sui_rdv_36mois'
      ];
      dateFields.forEach(f => { if (p[f] === '') p[f] = null; });

      // Format datetime-local
      if (p.con_depistage_date) {
        const dt = p.con_depistage_date;
        if (dt.length === 16) p.con_depistage_date = dt + ':00Z';
        else if (dt.length === 19) p.con_depistage_date = dt + 'Z';
      } else p.con_depistage_date = null;

      // Force Number Casting
      const numFields = [
        'id_patient', 'age', 'meta_agent_qualif', 'geo_region', 'geo_type_structure',
        'soc_statut_matrimonial', 'soc_profession', 'soc_niveau_instruction', 'soc_mode_entree', 'ethnie',
        'gyn_nb_grossesses', 'gyn_nb_accouchements', 'gyn_age_premier_rapport', 'gyn_age_premiere_grossesse',
        'gyn_nb_partenaires_vie', 'gyn_cycle_regulier', 'age_menstrue',
        'ris_ist_antecedent', 'ris_vih_statut', 'ris_tabagisme', 'ris_duree_contraception_horm', 'ris_depistage_anterieur', 'ris_resultat_dern_depistage',
        'phy_statut', 'phy_age_gestationnel', 'phy_age_menopause',
        'dep_resultat_iva', 'dep_resultat_ivl', 'dep_resultat_cytologie', 'dep_colposcopie_aspect', 'dep_zone_transformation', 'dep_biopsie_sites',
        'trt_non_eligible_motif', 'trt_methode', 'trt_duree_application', 'trt_nb_applications', 'trt_temperature_sonde',
        'sui_anapath_resultat',
        'hpv_statut_vaccinal', 'hpv_nb_filles_total', 'hpv_nb_filles_9_14', 'hpv_nb_filles_vaccinees'
      ];
      numFields.forEach(f => {
        if (p[f] !== undefined && p[f] !== null && p[f] !== '') p[f] = Number(p[f]);
        else p[f] = null;
      });
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

  return (
    <div className="max-w-[1400px] mx-auto py-4 px-2 fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        {/* Superior Clinical Header */}
        <div className="bg-slate-900 px-12 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Clinical Data Hub</span>
                <span className="text-slate-400 text-xs font-bold">CerviCare+ v2.0</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter">Fiche de Collecte Patient</h1>
              <p className="text-slate-400 mt-3 text-lg font-medium">Caravane Nationale d'Élimination du Cancer du Col de l'Utérus</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-black text-blue-500 mb-1 leading-none">{step}</div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">ÉTAPE SUR {TOTAL_STEPS}</div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Enhanced Progress Indicator */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
              <div
                className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-1000 ease-out"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <span className="text-lg font-black text-slate-900 min-w-[60px]">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>

          <nav className="flex flex-wrap gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide">
            {STEP_LABELS.map((label, i) => {
              const isActive = i + 1 === step;
              const isPast = i + 1 < step;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={i + 1 > step && !isSubmitting}
                  onClick={() => setStep(i + 1)}
                  className={`flex flex-col gap-2 min-w-[120px] transition-all duration-500 text-left ${isActive ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
                >
                  <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${isActive ? 'bg-blue-600' : isPast ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  <div className="px-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section {i + 1}</div>
                    <div className={`text-sm font-black truncate ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{label}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-12 slide-up">

            {/* ══════════════════════════════════════════════════
            STEP 1 — CONSENTEMENTS (CON)
        ══════════════════════════════════════════════════ */}
            {step === 1 && (
              <section className="fade-in">
                <StepHeader code="L" title="Consentements éclairés (CON)"
                  desc="Loi n° 2008-12 du 25 janvier 2008 — Protection données personnelles (CDP Sénégal) — Consentement libre, éclairé et révocable" />

                <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-8 mb-10 flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                  </div>
                  <div>
                    <p className="text-amber-800 font-bold text-sm mb-1">Important</p>
                    <p className="text-amber-700 text-sm">La patiente doit être informée de ses droits avant tout acte de dépistage ou de traitement. Ce consentement peut être retiré à tout moment.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CheckCard 
                    label="Consentement au dépistage"
                    icon="clinical_notes"
                    checked={!!watch('con_depistage')}
                    onChange={v => setValue('con_depistage', v)}
                    sublabel="IVA / IVL / HPV / Cytologie"
                  />
                  <CheckCard 
                    label="Consentement au traitement"
                    icon="medical_services"
                    checked={!!watch('con_traitement')}
                    onChange={v => setValue('con_traitement', v)}
                    sublabel="Cryo / Thermo / LEEP"
                  />
                  <CheckCard 
                    label="Données anonymisées"
                    icon="database"
                    checked={!!watch('con_donnees_anonymisees')}
                    onChange={v => setValue('con_donnees_anonymisees', v)}
                    sublabel="Utilisation pour la recherche médicale"
                  />
                  <CheckCard 
                    label="Rappels par SMS"
                    icon="sms"
                    checked={!!watch('con_rappels_sms')}
                    onChange={v => setValue('con_rappels_sms', v)}
                    sublabel="Notifications de suivi automatique"
                  />
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-slate-50 rounded-[40px] border border-slate-100 items-center">
                  <F label="Date du consentement">
                    <input type="date" {...register('con_depistage_date')} className={cls()} />
                  </F>
                  <F label="Validation Physique" col2>
                    <CheckCard 
                      label="Signature / Empreinte Recueillie"
                      icon="draw"
                      checked={!!watch('con_signature_presente')}
                      onChange={v => setValue('con_signature_presente', v)}
                      sublabel="Signé sur fiche papier"
                    />
                  </F>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 2 — META + GEO
        ══════════════════════════════════════════════════ */}
            {step === 2 && (
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
                      {...register('meta_agent_qualif', { valueAsNumber: true })} />
                  </F>
                  {Number(watch('meta_agent_qualif')) === 5 && (
                    <F label="Qualification (préciser)">
                      <input type="text" {...register('meta_agent_qualif_autre')} className={cls()} />
                    </F>
                  )}
                </div>

                <StepHeader code="B" title="Identification géographique (GEO)"
                  desc="Codification MSAS — 14 régions médicales / DHIS2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <F label="Région médicale" required error={errors.geo_region?.message}>
                    <Sel options={GEO_REGIONS} err={!!errors.geo_region}
                      {...register('geo_region', { required: 'Région requise', valueAsNumber: true })} />
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
                    <Sel options={GEO_TYPE_STRUCTURE} {...register('geo_type_structure', { valueAsNumber: true })} />
                  </F>
                  <F label="Latitude GPS (caravane mobile)">
                    <input type="number" step="0.000001" placeholder="-90 à +90" className={cls()}
                      {...register('geo_gps_lat')} />
                  </F>
                  <F label="Longitude GPS (caravane mobile)">
                    <input type="number" step="0.000001" placeholder="-180 à +180" className={cls()}
                      {...register('geo_gps_lon')} />
                  </F>
                  <div className="md:col-span-2">
                    <button type="button" onClick={getGPS}
                      className="w-full py-4 rounded-2xl bg-slate-800 text-white font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Capturer ma position GPS
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 3 — IDENTITÉ (PAT)
        ══════════════════════════════════════════════════ */}
            {step === 3 && (
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
                  <F label="Téléphone d'un proche (1)">
                    <input type="tel" {...register('pat_telephone_proche')} className={cls()} />
                  </F>
                  <F label="Téléphone d'un proche (2)">
                    <input type="tel" {...register('pat_telephone_proche_2')} className={cls()} />
                  </F>
                  <F label="Téléphone d'un proche (3)">
                    <input type="tel" {...register('pat_telephone_proche_3')} className={cls()} />
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

            {/* ══════════════════════════════════════════════════
            STEP 4 — SOCIODÉMOGRAPHIQUE (SOC)
        ══════════════════════════════════════════════════ */}
            {step === 4 && (
              <section>
                <StepHeader code="D" title="Données sociodémographiques (SOC)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <F label="Profession" required error={errors.soc_profession?.message}>
                    <Sel options={SOC_PROF} err={!!errors.soc_profession}
                      {...register('soc_profession', { required: 'Profession requise', valueAsNumber: true })} />
                  </F>
                  {Number(w.soc_prof) === 8 && (
                    <F label="Profession (préciser)">
                      <input type="text" {...register('soc_profession_autre')} className={cls()} />
                    </F>
                  )}
                  <F label="Niveau d'instruction" required>
                    <Sel options={SOC_INSTRUCTION} {...register('soc_niveau_instruction', { required: true, valueAsNumber: true })} />
                  </F>
                  <F label="Statut matrimonial" required error={errors.soc_statut_matrimonial?.message}>
                    <Sel options={SOC_STATUT_MATRIM} err={!!errors.soc_statut_matrimonial}
                      {...register('soc_statut_matrimonial', { required: 'Statut requis', valueAsNumber: true })} />
                  </F>
                  {Number(w.soc_matrim) === 3 && (
                    <F label="Vie en ménage polygame">
                      <label className="flex items-center gap-2 mt-2 text-sm">
                        <input type="checkbox" className="rounded text-indigo-600" {...register('soc_menage_polygame')} />
                        Oui
                      </label>
                    </F>
                  )}
                  <F label="Appartenance ethnique">
                    <Sel options={ETHNIE} {...register('ethnie', { valueAsNumber: true })} />
                  </F>
                  {Number(watch('ethnie')) === 7 && (
                    <F label="Ethnie (préciser)">
                      <input type="text" {...register('ethnie_autre')} className={cls()} />
                    </F>
                  )}
                  <F label="Mode d'entrée dans le programme">
                    <Sel options={SOC_MODE_ENTREE} {...register('soc_mode_entree', { valueAsNumber: true })} />
                  </F>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 5 — GYNÉCO-OBSTÉTRICAUX (GYN)
        ══════════════════════════════════════════════════ */}
            {step === 5 && (
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
                  <F label="Nombre d'avortements">
                    <input type="number" min={0} max={20} {...register('gyn_nb_avortements')} className={cls()} />
                  </F>
                  <F label="Nombre de morts-nés">
                    <input type="number" min={0} max={20} {...register('gyn_nb_morts_nes')} className={cls()} />
                  </F>
                  <F label="Parité (Nb enfants nés vivants)">
                    <input type="number" min={0} max={20} {...register('gyn_parite_simple')} className={cls()} />
                  </F>

                  <F label="Âge au premier rapport sexuel (années)" required error={errors.gyn_age_premier_rapport?.message}>
                    <input type="number" min={8} max={60}
                      {...register('gyn_age_premier_rapport', {
                        required: 'Requis',
                        min: { value: 8, message: '≥ 8' },
                        max: { value: 60, message: '≤ 60' },
                        valueAsNumber: true,
                      })} className={cls(!!errors.gyn_age_premier_rapport)} />
                  </F>
                  <F label="Âge à la première grossesse" error={errors.gyn_age_premiere_grossesse?.message}>
                    <input type="number" min={10} max={55}
                      {...register('gyn_age_premiere_grossesse', {
                        valueAsNumber: true,
                        validate: v => !v || !watch('gyn_age_premier_rapport') || v >= watch('gyn_age_premier_rapport') || "Doit être ≥ à l'âge au 1er rapport"
                      })} className={cls(!!errors.gyn_age_premiere_grossesse)} />
                  </F>
                  <F label="Nombre de partenaires sexuels (vie entière)">
                    <input type="number" min={0} {...register('gyn_nb_partenaires_vie', { valueAsNumber: true })} className={cls()} />
                  </F>
                  <F label="Âge à la première menstruation (années)">
                    <input type="number" min={8} max={20}
                      {...register('age_menstrue')} className={cls()} />
                  </F>
                  <F label="Cycles réguliers ?">
                    <Sel options={GYN_CYCLE} {...register('gyn_cycle_regulier', { valueAsNumber: true })} />
                  </F>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 6 — FACTEURS DE RISQUE (RIS)
        ══════════════════════════════════════════════════ */}
            {step === 6 && (
              <section>
                <StepHeader code="F" title="Antécédents médicaux et facteurs de risque (RIS)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <F label="Antécédent d'IST" required>
                    <Sel options={RIS_IST} {...register('ris_ist_antecedent', { required: true, valueAsNumber: true })} />
                  </F>
                  {Number(w.ris_ist) === 1 && (
                    <F label="Type(s) d'IST" col2>
                      <MultiCheck
                        options={[
                          { value: 1, label: 'Syphilis' }, { value: 2, label: 'Gonococcie' },
                          { value: 3, label: 'Chlamydiose' }, { value: 4, label: 'Trichomonase' },
                          { value: 5, label: 'Herpès génital' }, { value: 6, label: 'Condylomes' }, { value: 7, label: 'Autre' },
                        ]}
                        value={multiValues.ris_ist_type}
                        onChange={v => setMulti('ris_ist_type', v)}
                      />
                      {(multiValues.ris_ist_type || '').split(',').includes('7') && (
                        <div className="mt-4">
                          <input type="text" placeholder="Précisez le ou les type(s) d'IST..." {...register('ris_ist_type_autre')} className={cls()} />
                        </div>
                      )}
                    </F>
                  )}
                  <F label="Statut VIH" required>
                    <Sel options={RIS_VIH} {...register('ris_vih_statut', { required: true, valueAsNumber: true })} />
                  </F>
                  <F label="Tabagisme">
                    <Sel options={RIS_TABAC} {...register('ris_tabagisme', { valueAsNumber: true })} />
                  </F>
                  <F label="Méthode(s) contraceptive(s) en cours" col2>
                    <MultiCheck
                      options={[
                        { value: 0, label: 'Aucune' }, { value: 1, label: 'Pilule' }, { value: 2, label: 'DIU' },
                        { value: 3, label: 'Implant' }, { value: 4, label: 'Injectable' }, { value: 5, label: 'Préservatif' },
                        { value: 6, label: 'Stérilisation' }, { value: 7, label: 'Méthode naturelle' }, { value: 8, label: 'Autre' },
                      ]}
                      value={multiValues.ris_contraception}
                      onChange={v => setMulti('ris_contraception', v)}
                    />
                    {(multiValues.ris_contraception || '').split(',').includes('8') && (
                      <div className="mt-4">
                        <input type="text" placeholder="Précisez la méthode contraceptive..." {...register('ris_contraception_autre')} className={cls()} />
                      </div>
                    )}
                  </F>
                  <F label="Durée contraception orale (années)">
                    <input type="number" min={0} placeholder="Facteur de risque si ≥5 ans"
                      {...register('ris_duree_contraception_horm')} className={cls()} />
                  </F>
                  <F label="Antécédent de dépistage du col ?">
                    <Sel options={RIS_DEPISTAGE} {...register('ris_depistage_anterieur', { valueAsNumber: true })} />
                  </F>
                  {Number(w.ris_dep) === 1 && (
                    <>
                      <F label="Date du dernier dépistage">
                        <input type="date" {...register('ris_date_dern_depistage')} className={cls()} />
                      </F>
                      <F label="Résultat du dernier dépistage">
                        <Sel options={RIS_RESULTAT_DEP} {...register('ris_resultat_dern_depistage', { valueAsNumber: true })} />
                      </F>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 7 — STATUT PHYSIOLOGIQUE (PHY)
        ══════════════════════════════════════════════════ */}
            {step === 7 && (
              <section>
                <StepHeader code="G" title="Statut physiologique actuel (PHY)"
                  desc="IVA et thermo-ablation possibles enceinte avec précaution ; LEEP différé au post-partum (OMS 2021)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <F label="Statut physiologique" required error={errors.phy_statut?.message}>
                    <Sel options={PHY_STATUT} err={!!errors.phy_statut}
                      {...register('phy_statut', { required: 'Statut requis', valueAsNumber: true })} />
                  </F>
                  {Number(watch('phy_statut')) === 2 && (
                    <F label="Âge gestationnel (semaines d'aménorrhée)">
                      <input type="number" min={4} max={42}
                        {...register('phy_age_gestationnel')} className={cls()} />
                    </F>
                  )}
                  {Number(watch('phy_statut')) === 5 && (
                    <F label="Âge à la ménopause">
                      <input type="number" min={35} max={65}
                        {...register('phy_age_menopause')} className={cls()} />
                    </F>
                  )}
                  {Number(watch('phy_statut')) !== 5 && (
                    <F label="Date des dernières règles (DDR)">
                      <input type="date" {...register('phy_ddr')} className={cls()} />
                    </F>
                  )}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 8 — DÉPISTAGE (DEP)
        ══════════════════════════════════════════════════ */}
            {step === 8 && (
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
                        { value: 1, label: 'IVA (Inspection Visuelle Acide acétique)' },
                        { value: 2, label: 'IVL (Inspection Visuelle au Lugol)' },
                        { value: 3, label: 'Test HPV-DNA' },
                        { value: 4, label: 'Cytologie (Pap)' },
                        { value: 5, label: 'Co-testing HPV + Cytologie' },
                        { value: 6, label: 'Colposcopie' },
                        { value: 7, label: 'IVA + HPV (co-testing)' },
                        { value: 8, label: 'Autre' },
                      ]}
                      value={multiValues.dep_methode}
                      onChange={v => setMulti('dep_methode', v)}
                    />
                    {methodSet('8') && (
                      <div className="mt-4">
                        <input type="text" placeholder="Précisez l'autre méthode..." {...register('dep_methode_autre')} className={cls()} />
                      </div>
                    )}
                  </F>

                  {/* Résultats conditionnels selon méthode */}
                  {methodSet('1') && (
                    <F label="Résultat IVA">
                      <Sel options={DEP_RESULTAT_IVA} {...register('dep_resultat_iva', { valueAsNumber: true })} />
                    </F>
                  )}
                  {methodSet('2') && (
                    <F label="Résultat IVL">
                      <Sel options={[opt(1, 'Négatif'), opt(2, 'Positif'), opt(9, 'Non concluant')]}
                        {...register('dep_resultat_ivl')} />
                    </F>
                  )}
                  {methodSet('3') && (
                    <div className="md:col-span-2 space-y-6 bg-blue-50/50 p-8 rounded-[32px] border-2 border-blue-100/50">
                      <F label="Résultat Test HPV (sélectionnez tous les types positifs)" col2>
                        <MultiCheck
                          options={DEP_RESULTAT_HPV}
                          value={multiValues.dep_resultat_hpv}
                          onChange={v => setMulti('dep_resultat_hpv', v)}
                        />
                      </F>
                      
                      {/* Precision fields for each selected type */}
                      {multiValues.dep_resultat_hpv && multiValues.dep_resultat_hpv.split(',').filter(id => id !== '0').length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <p className="md:col-span-2 text-sm font-bold text-blue-900 uppercase tracking-tight">Précisions par type (ex: CT values)</p>
                          {multiValues.dep_resultat_hpv.split(',').filter((id: string) => id !== '0').map((id: string) => {
                            const label = DEP_RESULTAT_HPV.find((o: any) => String(o.value) === id)?.label;
                            return (
                              <div key={id}>
                                <F label={`Détails pour ${label}`}>
                                  <input
                                    type="text"
                                    placeholder="Valeur CT ou observation..."
                                    className={cls()}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      const current = watch('dep_hpv_details') || {};
                                      setValue('dep_hpv_details', { ...current, [id]: e.target.value });
                                    }}
                                  />
                                </F>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {(methodSet('4') || methodSet('5')) && (
                    <F label="Résultat cytologique (Bethesda 2014)">
                      <Sel options={DEP_CYTOLOGIE} {...register('dep_resultat_cytologie', { valueAsNumber: true })} />
                    </F>
                  )}

                  {/* Colposcopie si sélectionnée comme méthode OU si cochée à part */}
                  {(methodSet('6') || watch('dep_colposcopie_realisee')) && (
                    <>
                      <F label="Aspect colposcopique">
                        <Sel options={DEP_COLPO_ASPECT} {...register('dep_colposcopie_aspect', { valueAsNumber: true })} />
                      </F>
                      <F label="Zone de transformation (IFCPC)">
                        <Sel options={DEP_ZONE_TRANSFO} {...register('dep_zone_transformation', { valueAsNumber: true })} />
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
                  {watch('dep_biopsie_realisee') && (
                    <F label="Nombre de prélèvements (1-4)">
                      <input type="number" min={1} max={4}
                        {...register('dep_biopsie_sites')} className={cls()} />
                    </F>
                  )}

                  {/* ──────────────────────────────────────────────────────────────────
                      CARTO / MAPPING DU COL
                  ────────────────────────────────────────────────────────────────── */}
                  <div className="md:col-span-2 mt-12 p-10 bg-[#0f172a] rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-[160px]">biometrics</span>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] shadow-2xl shadow-blue-500/20">
                          <span className="material-symbols-outlined text-4xl block">clinical_notes</span>
                        </div>
                        <div>
                          <h4 className="text-3xl font-black uppercase tracking-tight leading-tight">Cartographie Cervicale</h4>
                          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-1">Localisation interactive des lésions (Schéma horaire)</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="flex justify-center">
                           <CervixMap 
                             value={watch('dep_mapping_json')} 
                             onChange={(v) => setValue('dep_mapping_json', v)} 
                           />
                        </div>

                        <div className="space-y-8">
                          <F label="Distance de travail / capture (cm)">
                            <div className="relative">
                              <input type="number" step="0.1" placeholder="Distance..." {...register('dep_distance_capture')}
                                className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] px-6 py-5 text-xl font-black text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600" />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black uppercase tracking-widest text-sm">cm</span>
                            </div>
                          </F>

                          <div className="bg-gradient-to-b from-white/10 to-transparent rounded-[40px] p-10 border border-white/10 flex flex-col justify-center items-center text-center backdrop-blur-xl">
                            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-3xl">
                              <span className="material-symbols-outlined text-blue-400 text-5xl animate-pulse">analytics</span>
                            </div>
                            <h5 className="font-black uppercase tracking-[0.2em] text-xs text-blue-400 mb-4">Diagnostic Probabiliste IA</h5>
                            <div className="text-slate-300 font-medium leading-relaxed px-4">
                              <textarea
                                {...register('dep_ia_deep_learning_result')}
                                className="w-full bg-transparent border-none focus:ring-0 text-center italic text-lg resize-none min-h-[100px]"
                                placeholder="Analyse automatique du pattern cartographique..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 9 — TRAITEMENT (TRT)
        ══════════════════════════════════════════════════ */}
            {step === 9 && (
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

                  {!watch('trt_eligible_immediat') && (
                    <>
                      <F label="Motif de non-éligibilité">
                        <Sel options={TRT_NON_ELIG} {...register('trt_non_eligible_motif', { valueAsNumber: true })} />
                      </F>
                      {Number(watch('trt_non_eligible_motif')) === 8 && (
                        <F label="Précision (si autre)" col2>
                          <input type="text" {...register('trt_non_eligible_autre')} className={cls()} />
                        </F>
                      )}
                    </>
                  )}

                  {watch('trt_eligible_immediat') && (
                    <>
                      <F label="Méthode de traitement">
                        <Sel options={TRT_METHODE} {...register('trt_methode', { valueAsNumber: true })} />
                      </F>
                      <F label="Date du traitement">
                        <input type="date" {...register('trt_date')} className={cls()} />
                      </F>

                      {/* Thermo-ablation spécifique */}
                      {Number(watch('trt_methode')) === 2 && (
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
                            { value: 0, label: 'Aucun' }, { value: 1, label: 'Douleur' },
                            { value: 2, label: 'Saignement léger' }, { value: 3, label: 'Saignement abondant' },
                            { value: 4, label: 'Malaise vagal' }, { value: 5, label: 'Crampes' }, { value: 6, label: 'Autre' },
                          ]}
                          value={multiValues.trt_effets_immediats}
                          onChange={v => setMulti('trt_effets_immediats', v)}
                        />
                        {(multiValues.trt_effets_immediats || '').split(',').includes('6') && (
                          <div className="mt-4">
                            <input type="text" placeholder="Autre effet immédiat..." {...register('trt_effets_immediats_autre')} className={cls()} />
                          </div>
                        )}
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

            {/* ══════════════════════════════════════════════════
            STEP 10 — SUIVI + HPV
        ══════════════════════════════════════════════════ */}
            {step === 10 && (
              <section>
                <StepHeader code="J" title="Suivi et résultats anatomopathologiques (SUI)"
                  desc="Calendrier OMS : contrôle à 12 mois par test HPV post-traitement ablatif" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <F label="Date réception résultat anatomopathologique">
                    <input type="date" {...register('sui_anapath_date_reception')} className={cls()} />
                  </F>
                  <F label="Résultat anatomopathologique">
                    <Sel options={SUI_ANAPATH} {...register('sui_anapath_resultat', { valueAsNumber: true })} />
                  </F>
                  {Number(watch('sui_anapath_resultat')) === 8 && (
                    <F label="Résultat anapath (préciser)" col2>
                      <input type="text" {...register('sui_anapath_resultat_autre')} className={cls()} />
                    </F>
                  )}
                  <F label="Stade FIGO 2018 (si cancer)">
                    <select className={cls()} {...register('sui_stade_figo')}>
                      <option value="">— Choisir —</option>
                      {FIGO.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </F>
                  <div />

                  <F label="Référence vers structure supérieure ?">
                    <label className="flex items-center gap-2 mt-2 text-sm">
                      <input type="checkbox" className="rounded text-indigo-600"
                        {...register('sui_reference')} />
                      Oui
                    </label>
                  </F>
                  {watch('sui_reference') && (
                    <>
                      <F label="Structure de référence">
                        <select className={cls()} {...register('sui_reference_structure')}>
                          <option value="">— Choisir —</option>
                          {REFERENCE_STRUCTURES.map(s => <option key={s} value={s}>{s}</option>)}
                          <option value="Autre">Autre (préciser)</option>
                        </select>
                      </F>
                      {watch('sui_reference_structure') === 'Autre' && (
                        <F label="Préciser la structure">
                          <input type="text" {...register('sui_reference_structure_autre')} className={cls()} />
                        </F>
                      )}
                      <F label="Motif de référence" col2>
                        <textarea rows={2} {...register('sui_reference_motif')}
                          className={cls()} />
                      </F>
                    </>
                  )}
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
                        { value: 1, label: 'Radio' }, { value: 2, label: 'Télévision' },
                        { value: 3, label: 'Internet/Réseaux sociaux' }, { value: 4, label: 'Agent de santé' },
                        { value: 5, label: 'Proche/Famille' }, { value: 6, label: 'Affiche/Brochure' },
                        { value: 7, label: 'Lieu de culte' }, { value: 8, label: 'École' }, { value: 9, label: 'Autre' },
                      ]}
                      value={multiValues.hpv_source_info}
                      onChange={v => setMulti('hpv_source_info', v)}
                    />
                    {(multiValues.hpv_source_info || '').split(',').includes('9') && (
                      <div className="mt-4">
                        <input type="text" placeholder="Autre source..." {...register('hpv_source_info_autre')} className={cls()} />
                      </div>
                    )}
                  </F>
                  <F label="Statut vaccinal HPV personnel">
                    <Sel options={HPV_VACCIN} {...register('hpv_statut_vaccinal', { valueAsNumber: true })} />
                  </F>
                  {Number(watch('hpv_statut_vaccinal')) >= 1 && (
                    <>
                      <F label="Type de vaccin reçu">
                        <Sel options={HPV_VACCIN_TYPE} {...register('hpv_vaccin_type')} />
                      </F>
                      <F label="Nombre de doses reçues">
                        <input type="number" min={1} max={3} {...register('hpv_vaccin_nb_doses', { valueAsNumber: true })} className={cls()} />
                      </F>
                    </>
                  )}
                  <F label="A des filles ?">
                    <label className="flex items-center gap-2 mt-2 text-sm">
                      <input type="checkbox" className="rounded text-indigo-600"
                        {...register('hpv_a_des_filles')} />
                      Oui
                    </label>
                  </F>
                  {watch('hpv_a_des_filles') && (
                    <>
                      <F label="Nombre total de filles">
                        <input type="number" min={0} {...register('hpv_nb_filles_total', { valueAsNumber: true })} className={cls()} />
                      </F>
                      <F label="Nombre de filles âgées de 9 à 14 ans">
                        <input type="number" min={0} {...register('hpv_nb_filles_9_14', { valueAsNumber: true })} className={cls()} />
                      </F>
                      {Number(watch('hpv_nb_filles_total')) > 0 && (
                        <F label="Nombre de filles vaccinées contre HPV">
                          <input type="number" min={0} {...register('hpv_nb_filles_vaccinees', { valueAsNumber: true })} className={cls()} />
                        </F>
                      )}
                      {Number(watch('hpv_nb_filles_vaccinees')) < Number(watch('hpv_nb_filles_9_14')) && watch('hpv_nb_filles_9_14') > 0 && (
                        <F label="Raison(s) de non-vaccination des filles" col2>
                          <MultiCheck
                            options={[
                              { value: 1, label: 'Manque d\'information' }, { value: 2, label: 'Refus parental' },
                              { value: 3, label: 'Pas accessible' }, { value: 4, label: 'Crainte des effets secondaires' },
                              { value: 5, label: 'Opposition religieuse/communautaire' },
                              { value: 6, label: 'Coût perçu' }, { value: 7, label: 'Pas concernées (âge)' }, { value: 8, label: 'Autre' },
                            ]}
                            value={multiValues.hpv_raison_non_vaccination}
                            onChange={v => setMulti('hpv_raison_non_vaccination', v)}
                          />
                          {(multiValues.hpv_raison_non_vaccination || '').split(',').includes('8') && (
                            <div className="mt-4">
                              <input type="text" placeholder="Précisez la raison..." {...register('hpv_raison_non_vaccination_autre')} className={cls()} />
                            </div>
                          )}
                        </F>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════
            STEP 11 — SYNTHÈSE IA
        ══════════════════════════════════════════════════ */}
            {step === 11 && (
              <section className="fade-in">
                <StepHeader code="M" title="Synthèse Clinique assistée par IA"
                  desc="Générez un résumé structuré des données saisies pour faciliter la validation médicale et la prise de décision." />
                
                <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-8 mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-200 flex items-center justify-center text-blue-700">
                        <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-blue-900 uppercase tracking-tight">Analyse en temps réel</h4>
                        <p className="text-blue-700 font-medium">Mistral-7B analyse les antécédents et les résultats cliniques.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={generateAISummary}
                      disabled={aiLoading}
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">psychology</span>
                          Générer la synthèse
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 min-h-[300px] relative overflow-hidden">
                    {aiLoading && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="inline-flex gap-1 mb-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          </div>
                          <p className="text-blue-900 font-black text-sm uppercase tracking-widest">Calcul clinique en cours</p>
                        </div>
                      </div>
                    )}
                    
                    {aiSummary ? (
                      <div className="prose prose-blue max-w-none">
                        <textarea
                          {...register('ai_synthese')}
                          className="w-full h-[400px] border-none focus:ring-0 text-slate-800 font-medium text-lg leading-relaxed resize-none p-0"
                          placeholder="La synthèse apparaîtra ici..."
                        />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">clinical_notes</span>
                        <p className="font-bold uppercase tracking-widest text-sm text-center">
                          Cliquez sur le bouton ci-dessus pour<br />analyser le dossier patiente
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ─── Navigation ─────────────────────────────────── */}
            <div className="flex items-center justify-between pt-8 border-t-2 border-slate-100 mt-8">
              <button type="button" onClick={onCancel}
                className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-[0.2em] text-sm px-8 py-4 transition-colors">
                Abandonner
              </button>
              <div className="flex gap-6">
                {step > 1 && (
                  <button type="button" onClick={goPrev} className="px-10 py-5 rounded-3xl border-2 border-slate-200 font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Précédent
                  </button>
                )}
                {step < TOTAL_STEPS && (
                  <button type="button" onClick={goNext} className="px-12 py-5 rounded-3xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm">
                    Suivant / Continuer
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 12h14" /></svg>
                  </button>
                )}
                {step === TOTAL_STEPS && (
                  <button type="submit" disabled={isSubmitting} className="px-12 py-5 rounded-3xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-2xl shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm">
                    <svg className="w-6 h-6 animate-spin" style={{ display: isSubmitting ? 'block' : 'none' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <svg className="w-6 h-6" style={{ display: isSubmitting ? 'none' : 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    {isSubmitting ? 'Traitement…' : 'Finaliser la Fiche'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientFormWizard;
