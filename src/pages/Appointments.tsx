import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { PatientFollowUp } from '../types';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  PhoneIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { format, isPast, isFuture, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

// Types
interface AppointmentDetailsModalProps {
  appointment: PatientFollowUp | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (id: number) => void;
}

// Composant Modal de détails
const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onCancel,
}) => {
  if (!appointment) return null;

  const appointmentDate = parseISO(appointment.scheduled_date);
  const canCancel = isFuture(appointmentDate) && appointment.status === 'scheduled';

  const getFollowUpTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      screening: 'Dépistage',
      follow_up_90: 'Suivi à 90 jours',
      follow_up_180: 'Suivi à 180 jours',
      annual: 'Suivi annuel',
      symptomatic: 'Consultation symptomatique',
    };
    return types[type] || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du rendez-vous" size="lg">
      <div className="space-y-6">
        {/* En-tête avec statut */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {getFollowUpTypeLabel(appointment.follow_up_type)}
              </h3>
              <p className="text-sm text-gray-600">
                {format(appointmentDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Heure</p>
              <p className="text-gray-900">
                {appointment.scheduled_time || 'À confirmer'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Lieu</p>
              <p className="text-gray-900">
                {appointment.location || 'Centre de santé'}
              </p>
            </div>
          </div>

          {appointment.agent_name && (
            <div className="flex items-start space-x-3">
              <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Agent</p>
                <p className="text-gray-900">{appointment.agent_name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Notes importantes</p>
                <p className="text-sm text-blue-800 mt-1">{appointment.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Préparation</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Arrivez 15 minutes avant l'heure prévue</li>
            <li>• Apportez votre carte d'identité</li>
            <li>• Apportez vos précédents résultats si disponibles</li>
            <li>• En cas d'empêchement, prévenez au moins 24h à l'avance</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button onClick={onClose} className="btn-secondary">
            Fermer
          </button>
          {canCancel && onCancel && (
            <button
              onClick={() => {
                onCancel(appointment.id);
                onClose();
              }}
              className="btn-danger"
            >
              Annuler le rendez-vous
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Composant Badge de statut
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const badges: Record<string, { label: string; className: string; icon: any }> = {
    scheduled: {
      label: 'Programmé',
      className: 'bg-blue-100 text-blue-800',
      icon: ClockIcon,
    },
    completed: {
      label: 'Effectué',
      className: 'bg-green-100 text-green-800',
      icon: CheckCircleIcon,
    },
    missed: {
      label: 'Manqué',
      className: 'bg-red-100 text-red-800',
      icon: XCircleIcon,
    },
    cancelled: {
      label: 'Annulé',
      className: 'bg-gray-100 text-gray-800',
      icon: XCircleIcon,
    },
  };

  const badge = badges[status] || badges.scheduled;
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {badge.label}
    </span>
  );
};

// Composant Card de rendez-vous
const AppointmentCard: React.FC<{
  appointment: PatientFollowUp;
  onClick: () => void;
}> = ({ appointment, onClick }) => {
  const appointmentDate = parseISO(appointment.scheduled_date);
  const isPastAppointment = isPast(appointmentDate) && !isToday(appointmentDate);
  const isTodayAppointment = isToday(appointmentDate);

  const getFollowUpTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      screening: 'Dépistage',
      follow_up_90: 'Suivi à 90 jours',
      follow_up_180: 'Suivi à 180 jours',
      annual: 'Suivi annuel',
      symptomatic: 'Consultation symptomatique',
    };
    return types[type] || type;
  };

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
        isTodayAppointment ? 'border-2 border-primary-500' : ''
      }`}
    >
      {isTodayAppointment && (
        <div className="mb-3 px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full inline-flex items-center">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          Aujourd'hui
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getFollowUpTypeLabel(appointment.follow_up_type)}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {format(appointmentDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
            </div>

            {appointment.scheduled_time && (
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{appointment.scheduled_time}</span>
              </div>
            )}

            {appointment.location && (
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{appointment.location}</span>
              </div>
            )}
          </div>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      {appointment.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-2">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
};

// Composant principal
const Appointments: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<PatientFollowUp | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Récupérer les rendez-vous du patient
  const { data: followUpsData, isLoading } = useQuery(
    ['patient-appointments', user?.id],
    () => patientService.getFollowUps({ patient: user?.id }),
    {
      enabled: !!user?.id,
      refetchInterval: 60000, // Rafraîchir toutes les minutes
    }
  );

  // Mutation pour annuler un rendez-vous
  const cancelMutation = useMutation(
    (id: number) => patientService.updateFollowUp(id, { status: 'cancelled' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['patient-appointments']);
        toast.success('Rendez-vous annulé avec succès');
      },
      onError: () => {
        toast.error("Erreur lors de l'annulation du rendez-vous");
      },
    }
  );

  const handleCancelAppointment = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const handleAppointmentClick = (appointment: PatientFollowUp) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const appointments = followUpsData?.results || [];
  const now = new Date();

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.scheduled_date);
    if (filter === 'upcoming') {
      return isFuture(aptDate) || isToday(aptDate);
    } else if (filter === 'past') {
      return isPast(aptDate) && !isToday(aptDate);
    }
    return true;
  });

  // Statistiques
  const upcomingCount = appointments.filter((apt) => {
    const aptDate = parseISO(apt.scheduled_date);
    return isFuture(aptDate) || isToday(aptDate);
  }).length;

  const todayCount = appointments.filter((apt) => {
    return isToday(parseISO(apt.scheduled_date));
  }).length;

  const missedCount = appointments.filter((apt) => apt.status === 'missed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Rendez-vous</h1>
        <p className="text-gray-600 mt-1">
          Consultez et gérez vos rendez-vous de suivi médical
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">À venir</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <ExclamationCircleIcon className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-error-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Manqués</p>
              <p className="text-2xl font-bold text-gray-900">{missedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'upcoming'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'past'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Passés
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tous
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredAppointments.length} rendez-vous
        </div>
      </div>

      {/* Liste des rendez-vous */}
      {filteredAppointments.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun rendez-vous
          </h3>
          <p className="text-gray-600">
            {filter === 'upcoming'
              ? 'Vous n\'avez pas de rendez-vous à venir'
              : filter === 'past'
              ? 'Vous n\'avez pas de rendez-vous passés'
              : 'Vous n\'avez aucun rendez-vous enregistré'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onClick={() => handleAppointmentClick(appointment)}
            />
          ))}
        </div>
      )}

      {/* Modal de détails */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        onCancel={handleCancelAppointment}
      />

      {/* Info supplémentaire */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Besoin d'aide ?
            </h4>
            <p className="text-sm text-blue-800">
              Pour toute question ou modification de rendez-vous, contactez votre centre de santé.
              En cas d'urgence, composez le 15.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;