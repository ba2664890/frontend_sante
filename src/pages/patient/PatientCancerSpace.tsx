import React from 'react';
import { useQuery } from 'react-query';
import PatientLayout from '../../components/PatientLayout.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { patientService } from '../../services/patientService.ts';
import { prostateService } from '../../services/prostateService.ts';
import { seinService } from '../../services/seinService.ts';

type ModuleKey = 'col' | 'prostate' | 'sein';

type Palette = {
  primary: string;
  primaryDark: string;
  soft: string;
  soft2: string;
  accent: string;
  accentSoft: string;
  title: string;
  icon: string;
};

type InfoCard = {
  label: string;
  value: React.ReactNode;
  icon: string;
  tone?: 'primary' | 'accent' | 'warning' | 'danger';
};

const palettes: Record<ModuleKey, Palette> = {
  col: {
    primary: '#8f464c',
    primaryDark: '#753138',
    soft: '#fff3f4',
    soft2: '#fcf9f6',
    accent: '#066a5f',
    accentSoft: '#e8f5f2',
    title: '#1b1c1a',
    icon: 'female',
  },
  prostate: {
    primary: '#006669',
    primaryDark: '#005255',
    soft: '#dcf1fb',
    soft2: '#f2fbff',
    accent: '#9a4523',
    accentSoft: '#ffdbcf',
    title: '#091e25',
    icon: 'male',
  },
  sein: {
    primary: '#be185d',
    primaryDark: '#9d174d',
    soft: '#fff5f7',
    soft2: '#fdf2f8',
    accent: '#6d28d9',
    accentSoft: '#f3e8ff',
    title: '#831843',
    icon: 'female',
  },
};

const moduleTitle: Record<ModuleKey, string> = {
  col: "Cancer du col de l'uterus",
  prostate: 'Cancer de la prostate',
  sein: 'Cancer du sein',
};

const fmtDate = (value?: string) => {
  if (!value) return '--';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '--' : d.toLocaleDateString('fr-FR');
};

const yesNo = (value?: boolean | number | null) => {
  if (value === true || value === 1) return 'Oui';
  if (value === false || value === 0) return 'Non';
  if (value === 9) return 'Ne sait pas';
  return '--';
};

const mapValue = (value: number | undefined, map: Record<number, string>) =>
  value !== undefined && value !== null ? map[value] || '--' : '--';

const services = {
  col: {
    getPatientByUserId: (userId: number) => patientService.getPatientByUserId(userId),
    getFollowUps: (recordId: number) => patientService.getFollowUps({ patient: recordId }),
  },
  prostate: {
    getPatientByUserId: (userId: number) => prostateService.getPatientByUserId(userId),
    getFollowUps: (recordId: number) => prostateService.getFollowUps({ patient: recordId }),
  },
  sein: {
    getPatientByUserId: (userId: number) => seinService.getPatientByUserId(userId),
    getFollowUps: (recordId: number) => seinService.getFollowUps({ patient: recordId }),
  },
};

const getModuleCards = (module: ModuleKey, patient: any): InfoCard[] => {
  if (module === 'prostate') {
    const psa = Number(patient.dep_psa_valeur);
    return [
      { label: 'PSA total', value: patient.dep_psa_valeur ? `${patient.dep_psa_valeur} ng/mL` : '--', icon: 'biotech', tone: psa >= 10 ? 'warning' : 'primary' },
      { label: 'Toucher rectal', value: mapValue(patient.dep_tr_resultat, { 1: 'Normal', 2: 'HBP probable', 3: 'Nodule suspect', 4: 'Suspect', 5: 'Suspect', 9: 'Non realise' }), icon: 'health_and_safety', tone: [3, 4, 5].includes(Number(patient.dep_tr_resultat)) ? 'warning' : 'accent' },
      { label: 'Biopsie', value: yesNo(patient.dep_biopsie_realisee), icon: 'science', tone: patient.dep_biopsie_realisee ? 'accent' : 'primary' },
      { label: 'Resultat global', value: patient.resultat_display || mapValue(patient.res_resultat_global, { 1: 'Normal', 2: 'Surveillance', 3: 'Reference urologue', 4: 'Cancer confirme', 5: 'HBP' }), icon: 'assignment_turned_in', tone: [3, 4].includes(Number(patient.res_resultat_global)) ? 'warning' : 'primary' },
    ];
  }

  if (module === 'sein') {
    const maxBirads = Math.max(
      ...[patient.dep_mammo_birads_droit, patient.dep_mammo_birads_gauche, patient.dep_echo_birads_droit, patient.dep_echo_birads_gauche]
        .filter((v) => v !== undefined && v !== null)
        .map(Number),
      0
    );
    return [
      { label: 'BIRADS max', value: maxBirads ? `BIRADS ${maxBirads}` : '--', icon: 'mammography', tone: maxBirads >= 4 ? 'warning' : 'primary' },
      { label: 'Mammographie', value: yesNo(patient.dep_mammo_realisee), icon: 'radiology', tone: 'accent' },
      { label: 'Masse palpee', value: yesNo(patient.exam_masse_palpee), icon: 'touch_app', tone: patient.exam_masse_palpee ? 'warning' : 'primary' },
      { label: 'Resultat global', value: patient.resultat_display || mapValue(patient.res_resultat_global, { 1: 'Normal', 2: 'Surveillance', 3: 'Reference', 4: 'Reference urgente', 5: 'Cancer confirme', 6: 'Benin' }), icon: 'assignment_turned_in', tone: [3, 4, 5].includes(Number(patient.res_resultat_global)) ? 'warning' : 'primary' },
    ];
  }

  return [
    { label: 'IVA', value: mapValue(patient.dep_resultat_iva, { 1: 'Negatif', 2: 'Positif', 3: 'Polype', 4: 'Suspicion cancer', 5: 'Non concluant' }), icon: 'biotech', tone: [2, 4].includes(Number(patient.dep_resultat_iva)) ? 'warning' : 'primary' },
    { label: 'HPV', value: patient.dep_resultat_hpv || 'Non realise', icon: 'science', tone: patient.dep_resultat_hpv && patient.dep_resultat_hpv !== '0' ? 'warning' : 'accent' },
    { label: 'Traitement', value: patient.trt_methode ? 'Initie' : 'Aucun', icon: 'healing', tone: patient.trt_methode ? 'accent' : 'primary' },
    { label: 'Suivi', value: fmtDate(patient.next_appointment_date || patient.sui_rdv_12mois), icon: 'event_available', tone: 'primary' },
  ];
};

const getTimelineRows = (module: ModuleKey, patient: any) => {
  if (module === 'prostate') {
    return [
      ['Date depistage', fmtDate(patient.dep_date)],
      ['PSA', patient.dep_psa_valeur ? `${patient.dep_psa_valeur} ng/mL` : '--'],
      ['TR', mapValue(patient.dep_tr_resultat, { 1: 'Normal', 2: 'HBP probable', 3: 'Nodule suspect', 4: 'Suspect', 5: 'Suspect', 9: 'Non realise' })],
      ['Reference', yesNo(patient.res_reference)],
      ['Prochain RDV', fmtDate(patient.next_appointment_date || patient.res_rdv_suivi)],
    ];
  }

  if (module === 'sein') {
    return [
      ['Date examen clinique', fmtDate(patient.exam_date)],
      ['Mammographie', yesNo(patient.dep_mammo_realisee)],
      ['Echographie', yesNo(patient.dep_echo_realisee)],
      ['Biopsie', yesNo(patient.dep_biopsie_realisee)],
      ['Reference', yesNo(patient.res_reference)],
      ['Prochain RDV', fmtDate(patient.next_appointment_date || patient.res_rdv_suivi)],
    ];
  }

  return [
    ['Date depistage', fmtDate(patient.dep_date)],
    ['Methode', patient.dep_methode || 'IVA / IVL / HPV'],
    ['Colposcopie', yesNo(patient.dep_colposcopie_realisee)],
    ['Biopsie', yesNo(patient.dep_biopsie_realisee)],
    ['Reference', yesNo(patient.sui_reference)],
    ['Prochain RDV', fmtDate(patient.next_appointment_date || patient.sui_rdv_12mois)],
  ];
};

const PatientCancerSpace: React.FC<{ module: ModuleKey }> = ({ module }) => {
  const { user } = useAuth();
  const palette = palettes[module];
  const service = services[module];

  const { data: patient, isLoading: patientLoading } = useQuery(
    ['patient-space-record', module, user?.id],
    () => service.getPatientByUserId(user!.id),
    { enabled: !!user }
  );

  const { data: followUps, isLoading: followUpsLoading } = useQuery(
    ['patient-space-followups', module, patient?.record_id],
    () => service.getFollowUps(patient!.record_id),
    { enabled: !!patient?.record_id }
  );

  if (patientLoading || followUpsLoading || !user) {
    return <LoadingSpinner fullPage size="xl" message="Chargement de votre espace personnel..." />;
  }

  const cards = getModuleCards(module, patient);
  const timelineRows = getTimelineRows(module, patient);
  const nextAppt = patient?.next_appointment_date || patient?.res_rdv_suivi || patient?.sui_rdv_12mois;

  return (
    <PatientLayout>
      <section className="relative overflow-hidden bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border mb-10" style={{ borderColor: palette.soft }}>
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${palette.soft})` }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border" style={{ backgroundColor: palette.soft, color: palette.primary, borderColor: palette.soft }}>
                Espace patient dedie
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ backgroundColor: palette.accentSoft, color: palette.accent }}>
                {moduleTitle[module]}
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-6xl leading-tight tracking-tighter" style={{ color: palette.title }}>
              Bonjour, <span style={{ color: palette.primary }}>{user.first_name || patient?.prenom || 'Bienvenue'}</span>
            </h1>
            <p className="font-body text-xl text-on-surface-variant leading-relaxed mt-5">
              Retrouvez votre dossier, vos resultats, vos rendez-vous et les messages importants de votre parcours de soins.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="/chatbot"
                className="px-8 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95"
                style={{ backgroundColor: palette.primary }}
              >
                Poser une question
              </a>
              <a
                href="/patient/appointments"
                className="px-8 py-4 bg-white rounded-2xl font-black uppercase tracking-widest text-sm border-2 transition-all active:scale-95"
                style={{ color: palette.primary, borderColor: palette.soft }}
              >
                Mes rendez-vous
              </a>
            </div>
          </div>

          <div className="relative w-full max-w-sm">
            <div className="rounded-[36px] p-6 text-white shadow-2xl" style={{ backgroundColor: palette.primary }}>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-4xl">{palette.icon}</span>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Dossier actif</p>
              <h2 className="text-2xl font-black mt-2">{patient?.full_name || `${patient?.prenom || ''} ${patient?.nom || ''}`}</h2>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="bg-white/15 rounded-2xl p-4">
                  <p className="text-[10px] uppercase font-black opacity-70">ID</p>
                  <p className="font-mono font-black">#{patient?.id_patient}</p>
                </div>
                <div className="bg-white/15 rounded-2xl p-4">
                  <p className="text-[10px] uppercase font-black opacity-70">Age</p>
                  <p className="font-black">{patient?.age || '--'} ans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => {
          const isWarning = card.tone === 'warning';
          const bg = isWarning ? palette.accentSoft : card.tone === 'accent' ? palette.accentSoft : palette.soft;
          const color = isWarning ? palette.accent : card.tone === 'accent' ? palette.accent : palette.primary;
          return (
            <div key={card.label} className="bg-white rounded-3xl p-6 border shadow-sm" style={{ borderColor: bg }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: bg, color }}>
                <span className="material-symbols-outlined text-[26px]">{card.icon}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{card.label}</p>
              <p className="text-2xl font-black leading-tight" style={{ color }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-[32px] p-8 border shadow-sm" style={{ borderColor: palette.soft }}>
          <h2 className="font-headline text-2xl mb-6 flex items-center gap-3" style={{ color: palette.title }}>
            <span className="material-symbols-outlined" style={{ color: palette.primary }}>clinical_notes</span>
            Mon parcours clinique
          </h2>
          <div className="space-y-4">
            {timelineRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-6 pb-4 border-b border-slate-100 last:border-b-0">
                <span className="text-sm font-bold text-on-surface-variant">{label}</span>
                <span className="text-sm font-black text-right" style={{ color: palette.title }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-[32px] p-8 border shadow-sm" style={{ borderColor: palette.soft }}>
          <h2 className="font-headline text-2xl mb-6 flex items-center gap-3" style={{ color: palette.title }}>
            <span className="material-symbols-outlined" style={{ color: palette.primary }}>event_available</span>
            Rendez-vous
          </h2>
          <div className="rounded-3xl p-6 mb-6" style={{ backgroundColor: palette.soft }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Prochain rendez-vous</p>
            <p className="text-3xl font-black mt-2" style={{ color: palette.primary }}>{fmtDate(nextAppt)}</p>
          </div>

          {followUps?.results?.length ? (
            <div className="space-y-4">
              {followUps.results.slice(0, 4).map((f: any) => (
                <div key={f.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: palette.soft, color: palette.primary }}>
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-on-surface">{f.follow_up_type_display || f.follow_up_type}</p>
                    <p className="text-xs font-bold text-on-surface-variant">{fmtDate(f.scheduled_date)} - {f.status_display || f.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-2xl border border-slate-100">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-40">event_busy</span>
              <p className="text-sm font-bold text-on-surface-variant mt-2">Aucun rendez-vous programme.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-12 bg-white rounded-[32px] p-8 border shadow-sm" style={{ borderColor: palette.soft }}>
          <h2 className="font-headline text-2xl mb-4 flex items-center gap-3" style={{ color: palette.title }}>
            <span className="material-symbols-outlined" style={{ color: palette.primary }}>psychology</span>
            Synthese clinique
          </h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
            {patient?.ai_synthese || "Votre synthese clinique sera disponible apres validation de votre dossier par l'equipe medicale."}
          </p>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientCancerSpace;
