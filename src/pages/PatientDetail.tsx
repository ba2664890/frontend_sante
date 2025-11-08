import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { Patient, PatientFollowUp } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import PatientForm from '../components/PatientForm.tsx';
import FollowUpForm from '../components/FollowUpForm.tsx';
import { 
  UserIcon, 
  CalendarIcon, 
  PencilIcon, 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  // 1. Récupérer avec user_id (de l'URL)
  const { data: patientByUser, isLoading: isLoadingByUser } = useQuery(
    ['patient-by-user', id],
    () => patientService.getPatientByUserId(Number(id)),
    { enabled: !!id }
  );
  console.log('Patient by User:', patientByUser);

  // 2. Extraire record_id
  const record_id = patientByUser?.record_id;

  console.log('Extracted record_id:', record_id);

  // 3. Récupérer détails complets avec record_id
  const { data: patient, isLoading: isLoadingPatient, refetch } = useQuery(
    ['patient-detail', record_id],
    () => patientService.getPatient(record_id!),
    { enabled: !!record_id }
  );

  // 4. Récupérer les suivis avec record_id
  const { data: followUps, refetch: refetchFollowUps } = useQuery(
    ['patient-followups', record_id],
    () => patientService.getFollowUps({ patient: record_id }),
    { enabled: !!record_id }
  );

  const handlePatientUpdated = () => {
    setShowEditForm(false);
    refetch();
    toast.success('Informations mises à jour avec succès !');
  };

  const handleFollowUpCreated = () => {
    setShowFollowUpForm(false);
    refetchFollowUps();
    toast.success('Suivi programmé avec succès !');
  };

  // CORRECTION: Gérer les états de chargement
  const isLoading = isLoadingByUser || isLoadingPatient;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Patiente non trouvée</p>
        <Link to="/patients" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const upcomingFollowUps = followUps?.results?.filter(
    (f: PatientFollowUp) => f.status === 'scheduled' && new Date(f.scheduled_date) > new Date()
  ) || [];

  const pastFollowUps = followUps?.results?.filter(
    (f: PatientFollowUp) => f.status !== 'scheduled' || new Date(f.scheduled_date) <= new Date()
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
            <p className="text-gray-600">
              ID Patient: {patient.id_patient} • {patient.age} ans • {patient.region_name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFollowUpForm(true)}
            className="btn-secondary"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Programmer un suivi
          </button>
          <button
            onClick={() => setShowEditForm(true)}
            className="btn-primary"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Modifier
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Statut</p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {patient.status === 'new' && 'Nouvelle'}
                {patient.status === 'screened' && 'Dépistée'}
                {patient.status === 'follow_up' && 'À revoir'}
                {patient.status === 'completed' && 'Terminé'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Résultat</p>
              <p className="text-lg font-bold text-gray-900">
                {patient.resultat_examen_display || 'En attente'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-info-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Prochain RDV</p>
              <p className="text-lg font-bold text-gray-900">
                {patient.next_appointment_date
                  ? format(new Date(patient.next_appointment_date), 'dd MMM yyyy', { locale: fr })
                  : 'Aucun'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la patiente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">ID Patient:</span>
                <p className="mt-1 text-gray-900">{patient.id_patient}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Âge:</span>
                <p className="mt-1 text-gray-900">{patient.age} ans</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Téléphone:</span>
                <p className="mt-1 text-gray-900">{patient.num_phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Région:</span>
                <p className="mt-1 text-gray-900">{patient.region_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Statut matrimonial:</span>
                <p className="mt-1 text-gray-900">
                  {patient.statut_matrimoniale === 1 && 'Mariée'}
                  {patient.statut_matrimoniale === 2 && 'Célibataire'}
                  {patient.statut_matrimoniale === 3 && 'Divorcée'}
                  {patient.statut_matrimoniale === 4 && 'Veuve'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Niveau de scolarité:</span>
                <p className="mt-1 text-gray-900">
                  {patient.niveau_scolarite === 0 && 'Non scolarisée'}
                  {patient.niveau_scolarite === 1 && 'Primaire'}
                  {patient.niveau_scolarite === 2 && 'Secondaire'}
                  {patient.niveau_scolarite === 3 && 'Supérieur'}
                  {patient.niveau_scolarite === 4 && 'Coranique'}
                </p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Date d'enregistrement:</span>
                <p className="mt-1 text-gray-900">
                  {format(new Date(patient.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-ups */}
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Suivis programmés</h3>
              <span className="text-sm text-gray-500">
                {upcomingFollowUps.length} suivi{upcomingFollowUps.length !== 1 && 's'} actif
                {upcomingFollowUps.length !== 1 && 's'}
              </span>
            </div>

            {upcomingFollowUps.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun suivi programmé
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingFollowUps.map((followUp: PatientFollowUp) => (
                  <div key={followUp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {followUp.follow_up_type === 'screening' && 'Dépistage'}
                        {followUp.follow_up_type === 'follow_up_90' && 'Suivi à 90 jours'}
                        {followUp.follow_up_type === 'follow_up_180' && 'Suivi à 180 jours'}
                        {followUp.follow_up_type === 'annual' && 'Suivi annuel'}
                        {followUp.follow_up_type === 'symptomatic' && 'Consultation symptomatique'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Prévu le {format(new Date(followUp.scheduled_date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      {followUp.notes && (
                        <p className="text-sm text-gray-500 mt-1">{followUp.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Programmé
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique des suivis */}
          {pastFollowUps.length > 0 && (
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des suivis</h3>
              <div className="space-y-3">
                {pastFollowUps.slice(0, 5).map((followUp: PatientFollowUp) => (
                  <div key={followUp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {followUp.follow_up_type === 'screening' && 'Dépistage'}
                        {followUp.follow_up_type === 'follow_up_90' && 'Suivi à 90 jours'}
                        {followUp.follow_up_type === 'follow_up_180' && 'Suivi à 180 jours'}
                        {followUp.follow_up_type === 'annual' && 'Suivi annuel'}
                        {followUp.follow_up_type === 'symptomatic' && 'Consultation symptomatique'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {followUp.completed_date
                          ? `Effectué le ${format(new Date(followUp.completed_date), 'dd MMMM yyyy', { locale: fr })}`
                          : `Prévu le ${format(new Date(followUp.scheduled_date), 'dd MMMM yyyy', { locale: fr })}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          followUp.status === 'completed'
                            ? 'bg-success-100 text-success-800'
                            : followUp.status === 'missed'
                            ? 'bg-error-100 text-error-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {followUp.status === 'completed' && (
                          <><CheckCircleIcon className="w-3 h-3 mr-1" /> Effectué</>
                        )}
                        {followUp.status === 'missed' && (
                          <><ExclamationCircleIcon className="w-3 h-3 mr-1" /> Manqué</>
                        )}
                        {followUp.status === 'cancelled' && 'Annulé'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowFollowUpForm(true)}
                className="w-full btn-secondary justify-start"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouveau suivi
              </button>
              <button className="w-full btn-secondary justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Historique complète
              </button>
              <button className="w-full btn-secondary justify-start">
                <UserIcon className="w-4 h-4 mr-2" />
                Contacter la patiente
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coordonnées</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Téléphone:</span>
                <p className="mt-1 text-gray-900">{patient.num_phone}</p>
              </div>
              {patient.region && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Région:</span>
                  <p className="mt-1 text-gray-900">{patient.region_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations médicales</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Résultat:</span>
                <p className="mt-1 text-gray-900">{patient.resultat_examen_display || 'En attente'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Statut:</span>
                <p className="mt-1 text-gray-900 capitalize">
                  {patient.status === 'new' && 'Nouvelle'}
                  {patient.status === 'screened' && 'Dépistée'}
                  {patient.status === 'follow_up' && 'À revoir'}
                  {patient.status === 'completed' && 'Terminé'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - CORRECTION: utiliser user_id pour scheduleFollowUp */}
      <Modal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        title="Modifier les informations de la patiente"
        size="xl"
      >
        <PatientForm
          patient={patient}
          onSubmit={handlePatientUpdated}
          onCancel={() => setShowEditForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showFollowUpForm}
        onClose={() => setShowFollowUpForm(false)}
        title="Programmer un suivi"
      >
        <FollowUpForm
          patientId={patient.record_id}
          onSubmit={handleFollowUpCreated}
          onCancel={() => setShowFollowUpForm(false)}
        />
      </Modal>
    </div>
  );
};

export default PatientDetail;