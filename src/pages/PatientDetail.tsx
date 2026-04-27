import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import PatientForm from '../components/PatientForm.tsx';
import FollowUpForm from '../components/FollowUpForm.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  UserIcon, 
  CalendarIcon, 
  PencilIcon, 
  PlusIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  BeakerIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Helper Components ─────────────────────────────────────────────────────

const DataRow: React.FC<{ label: string; value: React.ReactNode; full?: boolean }> = ({ label, value, full }) => (
  <div className={`py-2 border-b border-gray-50 flex flex-col sm:flex-row sm:items-baseline sm:justify-between ${full ? 'col-span-full' : ''}`}>
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    <div className="mt-1 sm:mt-0 text-sm text-gray-900 font-semibold">{value || '—'}</div>
  </div>
);

const Section: React.FC<{ icon: any; title: string; children: React.ReactNode; color: string }> = ({ icon: Icon, title, children, color }) => (
  <div className="card h-full">
    <div className="flex items-center gap-2 mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
      {children}
    </div>
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; type: 'success' | 'warning' | 'error' | 'info' | 'gray' }> = ({ children, type }) => {
  const styles = {
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-info-100 text-info-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${styles[type]}`}>
      {children}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';
  const isOwnProfile = isPatient && Number(id) === user?.id;
  const recordIdForNonPatient = !isPatient ? Number(id) : undefined;
  
  const { data: patientByUser, isLoading: isLoadingByUser } = useQuery(
    ['patient-by-user', id],
    () => patientService.getPatientByUserId(Number(id)),
    { enabled: !!id && isPatient }
  );
  
  const record_id = isPatient ? patientByUser?.record_id : recordIdForNonPatient;
  
  const { data: patient, isLoading: isLoadingPatient, refetch } = useQuery(
    ['patient-detail', record_id],
    () => patientService.getPatient(record_id!),
    { enabled: !!record_id && (isPatient ? !!patientByUser : true) }
  );
  
  refetchFollowUps; // Mark as used conceptually if needed, or remove completely if not used. 
  // Wait, refetchFollowUps is used in handleFollowUpCreated. So it's fine.
  // But followUps was reported as unused.
  
  // Let's just remove the assignment if it's truly not used in the JSX.
  useQuery(
    ['patient-followups', record_id],
    () => patientService.getFollowUps({ patient: String(record_id) }),
    { enabled: !!record_id && (isPatient ? !!patientByUser : true) }
  );
  
  if (isPatient && !isOwnProfile) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="w-12 h-12 text-error-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600 mb-4">Vous ne pouvez consulter que votre propre fiche patient.</p>
        <Link to="/dashboard" className="btn-primary">Retour au tableau de bord</Link>
      </div>
    );
  }
  
  const isLoading = (isPatient && isLoadingByUser) || isLoadingPatient;
  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!patient) return <div className="text-center py-12"><p className="text-gray-600">Patiente non trouvée</p></div>;

  const handlePatientUpdated = () => { setShowEditForm(false); refetch(); };
  const handleFollowUpCreated = () => { setShowFollowUpForm(false); refetchFollowUps(); };

  const formatDate = (d?: string) => d ? format(new Date(d), 'dd MMMM yyyy', { locale: fr }) : '—';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
            <UserIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{patient.full_name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
              <span className="font-semibold">ID: {patient.id_patient}</span>
              <span>•</span>
              <span className="bg-gray-100 px-2 rounded font-medium">{patient.age} ans</span>
              <span>•</span>
              <span className="inline-flex items-center"><MapPinIcon className="w-3 h-3 mr-1" /> {patient.region_name}</span>
            </div>
          </div>
        </div>
        
        {!isPatient && (
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFollowUpForm(true)} className="btn-secondary">
              <PlusIcon className="w-4 h-4 mr-2" /> Suivi
            </button>
            <button onClick={() => setShowEditForm(true)} className="btn-primary">
              <PencilIcon className="w-4 h-4 mr-2" /> Modifier la fiche
            </button>
          </div>
        )}
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Statut Suivi</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-gray-900 capitalize">
              {patient.status === 'new' ? 'Nouvelle' : 
               patient.status === 'screened' ? 'Dépistée' : 
               patient.status === 'follow_up' ? 'À revoir' : 
               patient.status === 'treatment' ? 'Traitement' : 'Terminé'}
            </p>
            <Badge type={patient.status === 'completed' ? 'success' : patient.status === 'new' ? 'info' : 'warning'}>
              {patient.status}
            </Badge>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dernière IVA</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-gray-900">
              {patient.resultat_examen_display || 'Non réalisée'}
            </p>
            {patient.dep_resultat_iva && (
              <Badge type={patient.dep_resultat_iva === 1 ? 'success' : 'error'}>
                {patient.dep_date ? format(new Date(patient.dep_date), 'dd/MM/yy') : ''}
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Statut VIH</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-gray-900">
              {patient.ris_vih_statut === 1 ? 'Négatif' : 
               patient.ris_vih_statut === 2 ? 'Positif (TARV+)' :
               patient.ris_vih_statut === 3 ? 'Positif (TARV-)' : 'Inconnu'}
            </p>
            <HeartIcon className={`w-6 h-6 ${patient.ris_vih_statut === 2 || patient.ris_vih_statut === 3 ? 'text-red-500' : 'text-gray-300'}`} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prochain RDV</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-gray-900">
              {patient.next_appointment_date ? format(new Date(patient.next_appointment_date), 'dd MMM yyyy', { locale: fr }) : 'Aucun'}
            </p>
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* ─── Detailed Info ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section A, B, C: Géo & Identité */}
        <Section icon={MapPinIcon} title="Identification & Géographie" color="bg-blue-100 text-blue-600">
          <DataRow label="ID Patient" value={patient.id_patient} />
          <DataRow label="Région MSAS" value={patient.region_name} />
          <DataRow label="District" value={patient.geo_district} />
          <DataRow label="Structure" value={patient.geo_structure} />
          <DataRow label="Type Structure" value={patient.geo_type_structure} />
          <DataRow label="NIN" value={patient.pat_nin} />
          <DataRow label="Adresse" value={patient.pat_adresse} full />
        </Section>

        {/* Section D: Socio & GYN */}
        <Section icon={DocumentTextIcon} title="Socio-démographique & GYN" color="bg-purple-100 text-purple-600">
          <DataRow label="Profession" value={patient.soc_profession} />
          <DataRow label="Scolarité" value={patient.soc_niveau_instruction} />
          <DataRow label="Matrimonial" value={patient.soc_statut_matrimonial} />
          <DataRow label="Mode Entrée" value={patient.soc_mode_entree} />
          <DataRow label="Gestité (G)" value={patient.gyn_nb_grossesses} />
          <DataRow label="Parité (P)" value={patient.gyn_nb_accouchements} />
          <DataRow label="Âge 1er rapport" value={patient.gyn_age_premier_rapport} />
          <DataRow label="DDR" value={formatDate(patient.gyn_ddr)} />
        </Section>

        {/* Section F & G: Risques & Physio */}
        <Section icon={BeakerIcon} title="Risques & État Physiologique" color="bg-amber-100 text-amber-600">
          <DataRow label="IST Antécédent" value={patient.ris_ist_antecedent === 1 ? 'Oui' : 'Non'} />
          <DataRow label="Statut VIH" value={patient.ris_vih_statut} />
          <DataRow label="Tabagisme" value={patient.ris_tabagisme} />
          <DataRow label="Physiologie" value={patient.phy_statut} />
          <DataRow label="Dépistage Ant." value={patient.ris_depistage_anterieur === 1 ? 'Oui' : 'Non'} />
          <DataRow label="Dernier Résultat" value={patient.ris_resultat_dern_depistage} />
        </Section>

        {/* Section H: Dépistage (DEP) */}
        <Section icon={ShieldCheckIcon} title="Dépistage Actuel (DEP)" color="bg-emerald-100 text-emerald-600">
          <DataRow label="Date" value={formatDate(patient.dep_date)} />
          <DataRow label="Méthode" value={patient.dep_methode} />
          <DataRow label="Résultat IVA" value={<Badge type={patient.dep_resultat_iva === 1 ? 'success' : 'error'}>{patient.resultat_examen_display}</Badge>} />
          <DataRow label="Résultat HPV" value={patient.dep_resultat_hpv} />
          <DataRow label="Colpo Réalisée" value={patient.dep_colposcopie_realisee ? 'Oui' : 'Non'} />
          <DataRow label="Biopsie Réalisée" value={patient.dep_biopsie_realisee ? 'Oui' : 'Non'} />
        </Section>

        {/* Section I: Traitement (TRT) */}
        <Section icon={HeartIcon} title="Prise en charge & Traitement" color="bg-red-100 text-red-600">
          <DataRow label="Éligible TRT" value={patient.trt_eligible_immediat ? 'Oui' : 'Non'} />
          <DataRow label="Méthode TRT" value={patient.trt_methode} />
          <DataRow label="Date TRT" value={formatDate(patient.trt_date)} />
          <DataRow label="Support" value={patient.trt_antalgique_administre ? 'Antalgiques' : 'Aucun'} />
        </Section>

        {/* Section J & K: Suivi & HPV */}
        <Section icon={CalendarIcon} title="Suivi & Prévention HPV" color="bg-indigo-100 text-indigo-600">
          <DataRow label="Anapath" value={patient.sui_anapath_resultat} />
          <DataRow label="Stade FIGO" value={patient.sui_stade_figo} />
          <DataRow label="Vaccin HPV Pers." value={patient.hpv_statut_vaccinal} />
          <DataRow label="Filles 9-14 ans" value={patient.hpv_nb_filles_9_14} />
          <DataRow label="Filles Vaccinées" value={patient.hpv_nb_filles_vaccinees} />
        </Section>
      </div>

      {/* ─── Consentements Area ─── */}
      <div className="card bg-gray-50 border-gray-200">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Consentements & Conformité (Livre d'entretien)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Dépistage</span>
            <span className={`text-sm font-bold ${patient.con_depistage ? 'text-emerald-600' : 'text-red-500'}`}>
              {patient.con_depistage ? '✓ Accordé' : '✗ Refusé'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Données</span>
            <span className={`text-sm font-bold ${patient.con_donnees_anonymisees ? 'text-emerald-600' : 'text-red-500'}`}>
              {patient.con_donnees_anonymisees ? '✓ Accordé' : '✗ Refusé'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Rappels SMS</span>
            <span className={`text-sm font-bold ${patient.con_rappels_sms ? 'text-emerald-600' : 'text-red-500'}`}>
              {patient.con_rappels_sms ? '✓ Oui' : '✗ Non'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Signature</span>
            <span className={`text-sm font-bold ${patient.con_signature_presente ? 'text-emerald-600' : 'text-gray-400'}`}>
              {patient.con_signature_presente ? '✓ Présente' : 'Inexistante'}
            </span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Agent Responsable</span>
            <span className="text-sm font-bold text-gray-700">{patient.created_by_name || 'Non spécifié'}</span>
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)} title="Modifier la fiche complète" size="xl">
        <PatientForm patient={patient} onSubmit={handlePatientUpdated} onCancel={() => setShowEditForm(false)} />
      </Modal>

      <Modal isOpen={showFollowUpForm} onClose={() => setShowFollowUpForm(false)} title="Programmer un suivi">
        <FollowUpForm patientId={patient.record_id} onSubmit={handleFollowUpCreated} onCancel={() => setShowFollowUpForm(false)} />
      </Modal>
    </div>
  );
};

export default PatientDetail;