import React, { useState } from 'react';
import { useQuery } from 'react-query';
import LoadingSpinner from './LoadingSpinner.tsx';
import Modal from './Modal.tsx';
import type { PaginatedResponse, PatientFilters, PatientFollowUp } from '../types';

type ClinicalPalette = {
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryBorder: string;
  title: string;
  accent: string;
  accentSoft: string;
  warning: string;
  warningSoft: string;
  cardShadow: string;
};

type Metric = {
  label: string;
  value: string;
  tone?: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral';
};

type InfoItem = {
  label: string;
  value: React.ReactNode;
};

type TabKey = 'identity' | 'medical' | 'history';

type ClinicalPatientsPageProps<T extends { record_id: number; id_patient: number; full_name?: string; nom?: string; prenom?: string; status: string; age?: number; created_at?: string; region_name?: string; next_appointment_date?: string; num_phone?: string; pat_adresse?: string; pat_nin?: string; date_naiss?: string; ai_synthese?: string }> = {
  moduleKey: string;
  title: string;
  subtitle: string;
  newButtonLabel: string;
  modalNewTitle: string;
  modalEditTitle: string;
  icon: string;
  palette: ClinicalPalette;
  noun: { singular: string; plural: string; newStatus: string; screenedStatus: string };
  form: React.ComponentType<{ patient?: T | null; onSubmit: () => void; onCancel: () => void }>;
  service: {
    getPatients: (filters?: PatientFilters, page?: number) => Promise<PaginatedResponse<T>>;
    getPatient: (recordId: number) => Promise<T>;
    getFollowUps: (filters?: { patient?: string | number }, page?: number) => Promise<PaginatedResponse<PatientFollowUp>>;
  };
  getCardMetrics: (patient: T) => Metric[];
  getMedicalSummary: (patient: T) => { title: string; rows: InfoItem[]; resultTone?: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral' };
  getRiskItems: (patient: T) => InfoItem[];
  getIdentityItems?: (patient: T) => InfoItem[];
};

const statusConfig: Record<string, { label: string; tone: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral' }> = {
  new: { label: 'NOUVEAU', tone: 'primary' },
  screened: { label: 'DEPISTE', tone: 'accent' },
  follow_up: { label: 'A REVOIR', tone: 'warning' },
  treatment: { label: 'EN TRAITEMENT', tone: 'warning' },
  completed: { label: 'TERMINE', tone: 'accent' },
  lost: { label: 'PERDU DE VUE', tone: 'danger' },
};

const fmtDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
};

const fullName = (patient: { full_name?: string; prenom?: string; nom?: string }) =>
  patient.full_name || `${patient.prenom || ''} ${patient.nom || ''}`.trim() || 'Patient sans nom';

const toneClasses = (palette: ClinicalPalette, tone: Metric['tone'] = 'neutral') => {
  switch (tone) {
    case 'primary':
      return { bg: palette.primarySoft, color: palette.primary, border: palette.primaryBorder };
    case 'accent':
      return { bg: palette.accentSoft, color: palette.accent, border: palette.primaryBorder };
    case 'warning':
      return { bg: palette.warningSoft, color: palette.warning, border: 'rgba(245, 158, 11, 0.25)' };
    case 'danger':
      return { bg: '#ffdad6', color: '#ba1a1a', border: 'rgba(186, 26, 26, 0.18)' };
    default:
      return { bg: '#f2fbff', color: '#3e4949', border: 'rgba(190, 201, 201, 0.12)' };
  }
};

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-[#3e4949] text-[11px] font-bold uppercase mb-0.5">{label}</p>
    <div className="font-bold text-sm text-[#091e25]">{children || '-'}</div>
  </div>
);

function ClinicalPatientsPage<T extends { record_id: number; id_patient: number; full_name?: string; nom?: string; prenom?: string; status: string; age?: number; created_at?: string; region_name?: string; next_appointment_date?: string; num_phone?: string; pat_adresse?: string; pat_nin?: string; date_naiss?: string; ai_synthese?: string }>({
  moduleKey,
  title,
  subtitle,
  newButtonLabel,
  modalNewTitle,
  modalEditTitle,
  icon,
  palette,
  noun,
  form: Form,
  service,
  getCardMetrics,
  getMedicalSummary,
  getRiskItems,
  getIdentityItems,
}: ClinicalPatientsPageProps<T>) {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PatientFilters>({});
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [selectedPatientList, setSelectedPatientList] = useState<T | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('identity');

  const { data, isLoading, refetch } = useQuery(
    [moduleKey, 'patients', filters, currentPage, searchTerm],
    () => service.getPatients({ ...filters, search: searchTerm }, currentPage),
    { keepPreviousData: true }
  );

  const { data: selectedPatient } = useQuery(
    [moduleKey, 'patient-detail', activePatientId],
    () => (activePatientId ? service.getPatient(activePatientId) : Promise.resolve(null as T | null)),
    { enabled: !!activePatientId && showDrawer }
  );

  const { data: followUpsData } = useQuery(
    [moduleKey, 'follow-ups', activePatientId],
    () => (activePatientId ? service.getFollowUps({ patient: activePatientId }) : Promise.resolve(null)),
    { enabled: !!activePatientId && showDrawer }
  );

  const patients = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);
  const patientToDisplay = selectedPatient || selectedPatientList;
  const selectedIsLoading = !!activePatientId && showDrawer && !selectedPatient;

  const statusBadge = (status?: string) => {
    const key = status?.toLowerCase() || 'new';
    const config = statusConfig[key] || { label: key.toUpperCase(), tone: 'neutral' as const };
    const tone = toneClasses(palette, config.tone);
    const label = key === 'new' ? noun.newStatus : key === 'screened' ? noun.screenedStatus : config.label;
    return (
      <span
        className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
        style={{ color: tone.color, backgroundColor: tone.bg, borderColor: tone.border }}
      >
        {label}
      </span>
    );
  };

  const openNewForm = () => {
    setSelectedPatientList(null);
    setActivePatientId(null);
    setShowForm(true);
  };

  const openDrawer = (patient: T) => {
    setSelectedPatientList(patient);
    setActivePatientId(patient.record_id);
    setActiveTab('identity');
    setShowDrawer(true);
  };

  const openEditForm = () => {
    setShowDrawer(false);
    setShowForm(true);
  };

  const identityRows = patientToDisplay
    ? [
        { label: 'Age', value: `${patientToDisplay.age || '-'} ans ${patientToDisplay.date_naiss ? `(${fmtDate(patientToDisplay.date_naiss)})` : ''}` },
        { label: 'Telephone', value: patientToDisplay.num_phone || '-' },
        { label: 'Region', value: patientToDisplay.region_name || '-' },
        { label: 'Adresse / Quartier', value: patientToDisplay.pat_adresse || '-' },
        { label: 'NIN', value: patientToDisplay.pat_nin || '-' },
        ...(getIdentityItems ? getIdentityItems(patientToDisplay) : []),
      ]
    : [];

  const medicalSummary = patientToDisplay ? getMedicalSummary(patientToDisplay) : null;
  const riskItems = patientToDisplay ? getRiskItems(patientToDisplay) : [];

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: palette.primarySoft, color: palette.primary, borderColor: palette.primaryBorder }}>
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold" style={{ fontFamily: 'Literata, serif', color: palette.title }}>
              {title}
            </h1>
            <p className="text-[#3e4949] text-sm mt-1">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95"
          style={{ backgroundColor: palette.primary, boxShadow: palette.cardShadow }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = palette.primaryHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = palette.primary; }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {newButtonLabel}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6f7979] text-[20px]" style={{ color: searchTerm ? palette.primary : undefined }}>search</span>
          <input
            type="text"
            placeholder="Rechercher par nom, ID ou region..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#bec9c9]/20 rounded-2xl focus:ring-4 shadow-sm font-medium text-[#091e25] outline-none transition-all"
            style={{ boxShadow: '0 1px 2px rgba(42,127,130,0.04)' }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            className="flex-1 lg:w-56 px-4 py-3.5 bg-white border border-[#bec9c9]/20 rounded-2xl text-sm font-bold text-[#3e4949] outline-none shadow-sm"
            value={filters.status || ''}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value || undefined });
              setCurrentPage(1);
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="screened">Depiste</option>
            <option value="follow_up">A revoir</option>
            <option value="treatment">En traitement</option>
            <option value="completed">Suivi termine</option>
          </select>

          <button
            type="button"
            className="p-3.5 bg-white border border-[#bec9c9]/20 rounded-2xl transition-all text-[#3e4949] shadow-sm"
            style={{ color: palette.primary }}
            onClick={() => {
              setSearchTerm('');
              setFilters({});
              setCurrentPage(1);
            }}
            title="Reinitialiser les filtres"
          >
            <span className="material-symbols-outlined">filter_alt_off</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          {patients.length === 0 ? (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center bg-white rounded-3xl border border-[#bec9c9]/10 text-center p-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: palette.primarySoft, color: palette.primary }}>
                <span className="material-symbols-outlined text-[34px]">person_search</span>
              </div>
              <h3 className="text-xl font-black text-[#091e25]">Aucun dossier trouve</h3>
              <p className="text-sm text-[#3e4949] mt-2">Ajustez la recherche ou ajoutez un nouveau dossier.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {patients.map((patient) => {
                const metrics = getCardMetrics(patient).slice(0, 4);
                return (
                  <div
                    key={patient.record_id}
                    onClick={() => openDrawer(patient)}
                    className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(42,127,130,0.06)] border border-[#bec9c9]/10 group transition-all flex flex-col cursor-pointer"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.primaryBorder; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(190, 201, 201, 0.10)'; }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder, color: palette.primary }}>
                          <span className="material-symbols-outlined text-[28px]">{icon}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#091e25] text-lg leading-tight truncate transition-colors" style={{ color: undefined }}>
                            {fullName(patient)}
                          </h3>
                          <p className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest mt-0.5 font-mono">ID: {patient.id_patient}</p>
                        </div>
                      </div>
                      {statusBadge(patient.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {metrics.map((metric) => {
                        const tone = toneClasses(palette, metric.tone);
                        return (
                          <div key={metric.label} className="p-4 rounded-2xl border" style={{ backgroundColor: tone.bg, borderColor: tone.border }}>
                            <p className="text-[9px] uppercase font-bold text-[#6f7979] mb-1 tracking-wider">{metric.label}</p>
                            <p className="text-sm font-bold truncate" style={{ color: tone.color }}>{metric.value}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#bec9c9]/10 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-[#6f7979] tracking-wider">Dernier passage</span>
                        <span className="text-xs font-bold text-[#091e25] font-mono">{fmtDate(patient.created_at)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(patient);
                        }}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all"
                        style={{ backgroundColor: palette.primarySoft, color: palette.primary }}
                      >
                        Voir dossier
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">chevron_right</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 py-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((v) => v - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#bec9c9]/30 text-sm font-bold text-[#3e4949] disabled:opacity-30 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Precedent
              </button>
              <span className="font-bold text-[#091e25] bg-white px-4 py-2 rounded-xl border border-[#bec9c9]/20 shadow-sm">
                Page <span style={{ color: palette.primary }}>{currentPage}</span> / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((v) => v + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#bec9c9]/30 text-sm font-bold text-[#3e4949] disabled:opacity-30 transition-all"
              >
                Suivant
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}

      {showDrawer && patientToDisplay && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowDrawer(false)} />

          <div className="relative w-full md:w-[500px] h-full bg-white shadow-2xl border-l border-[#bec9c9]/20 flex flex-col z-10 animate-slide-in">
            <div className="p-6 border-b border-[#bec9c9]/20" style={{ backgroundColor: palette.primarySoft }}>
              <div className="flex justify-between items-start mb-4">
                <button
                  onClick={() => setShowDrawer(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#3e4949] transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <button
                  onClick={openEditForm}
                  className="px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all active:scale-95 border"
                  style={{ borderColor: palette.accent, color: palette.accent, backgroundColor: 'rgba(255,255,255,0.45)' }}
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Modifier
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border flex items-center justify-center shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.55)', color: palette.primary, borderColor: palette.primaryBorder }}>
                  <span className="material-symbols-outlined text-[36px]">{icon}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-[#091e25] flex items-center truncate" style={{ fontFamily: 'Literata, serif' }}>
                    {fullName(patientToDisplay)}
                    {selectedIsLoading && (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-t-transparent ml-2" style={{ borderColor: palette.primary, borderTopColor: 'transparent' }} title="Chargement des donnees completes..." />
                    )}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-[#3e4949]">ID: {patientToDisplay.id_patient}</span>
                    {statusBadge(patientToDisplay.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex border-b border-[#bec9c9]/20 px-6 bg-white">
              {[
                ['identity', 'Identite'],
                ['medical', 'Medical'],
                ['history', 'Historique'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabKey)}
                  className="px-4 py-4 font-bold text-sm transition-all border-b-2"
                  style={{
                    borderColor: activeTab === key ? palette.primary : 'transparent',
                    color: activeTab === key ? palette.primary : '#3e4949',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'identity' && (
                <section className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: palette.primary }}>Informations personnelles</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {identityRows.map((row, idx) => (
                        <div key={`${row.label}-${idx}`} className={idx === 3 || idx === 4 ? 'col-span-2' : ''}>
                          <DetailRow label={row.label}>{row.value}</DetailRow>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'medical' && medicalSummary && (
                <section className="space-y-6">
                  <div className="p-4 rounded-2xl border" style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm" style={{ color: palette.primary }}>{medicalSummary.title}</h4>
                      <span className="material-symbols-outlined" style={{ color: palette.primary }}>verified</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {medicalSummary.rows.map((row) => (
                        <div key={row.label} className="flex justify-between gap-4 border-b border-[#bec9c9]/10 pb-1.5 last:border-b-0">
                          <span className="text-[#3e4949]">{row.label}</span>
                          <span className="font-bold text-[#091e25] text-right">{row.value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: palette.primary }}>Facteurs cliniques & risques</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {riskItems.map((row) => (
                        <DetailRow key={row.label} label={row.label}>{row.value}</DetailRow>
                      ))}
                    </div>
                  </div>

                  {patientToDisplay.ai_synthese && (
                    <div className="p-4 rounded-3xl border mt-4 shadow-sm" style={{ backgroundColor: '#f8fcfc', borderColor: palette.primaryBorder }}>
                      <h4 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#bec9c9]/10 pb-2" style={{ color: palette.primary }}>
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                        Synthese clinique
                      </h4>
                      <p className="text-xs text-[#3e4949] leading-relaxed whitespace-pre-wrap">{patientToDisplay.ai_synthese}</p>
                    </div>
                  )}
                </section>
              )}

              {activeTab === 'history' && (
                <section className="space-y-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: palette.primary }}>Parcours de suivi</h4>

                  {followUpsData?.results && followUpsData.results.length > 0 ? (
                    <div className="relative border-l-2 ml-2 pl-6 space-y-6" style={{ borderColor: palette.primaryBorder }}>
                      {followUpsData.results.map((f: PatientFollowUp) => (
                        <div key={f.id} className="relative">
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 z-10 flex items-center justify-center" style={{ borderColor: palette.primary }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.primary }} />
                          </div>
                          <div>
                            <div className="flex justify-between items-start gap-3">
                              <h5 className="font-bold text-[#091e25] text-sm">{f.follow_up_type_display || f.follow_up_type}</h5>
                              <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider" style={{ backgroundColor: palette.primarySoft, color: palette.primary }}>
                                {f.status_display || f.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#3e4949] font-mono mt-0.5">{fmtDate(f.scheduled_date)}</p>
                            <p className="text-xs text-[#3e4949] mt-2 leading-relaxed p-2.5 rounded-xl border border-[#bec9c9]/10" style={{ backgroundColor: palette.primarySoft }}>
                              {f.notes || 'Consultation de suivi planifiee.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 rounded-2xl border" style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder }}>
                      <span className="material-symbols-outlined text-[32px] text-[#6f7979] mb-2">event_busy</span>
                      <p className="text-xs text-[#3e4949] font-bold">Aucun historique de suivi enregistre.</p>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="p-6 border-t border-[#bec9c9]/20 flex gap-4" style={{ backgroundColor: palette.primarySoft }}>
              <button
                onClick={openEditForm}
                className="flex-1 py-3 text-white rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all"
                style={{ backgroundColor: palette.accent }}
              >
                Ouvrir la fiche
              </button>
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-3 rounded-xl transition-all border"
                style={{ backgroundColor: '#ffffff', color: palette.primary, borderColor: palette.primaryBorder }}
                title="Fermer"
              >
                <span className="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={patientToDisplay ? modalEditTitle : modalNewTitle} size="6xl">
        <Form
          patient={patientToDisplay}
          onSubmit={() => {
            setShowForm(false);
            setShowDrawer(false);
            refetch();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

export default ClinicalPatientsPage;
