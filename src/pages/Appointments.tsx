// src/pages/Appointments.tsx — Version "Clinical Precision" & "Silk" COMPLETE
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { PatientFollowUp } from '../types';
import { useAuth } from '../contexts/AuthContext.tsx';
import { format, isPast, isFuture, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';
import PatientLayout from '../components/PatientLayout.tsx';
import { BentoCard, IconBox } from '../components/ui/PatientUI.tsx';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<PatientFollowUp | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isPatient = user?.role === 'patient';

  // Récupérer les rendez-vous
  const { data: followUpsData, isLoading } = useQuery(
    ['appointments', user?.id],
    () => patientService.getFollowUps({ patient: isPatient ? user?.id : undefined }),
    { enabled: !!user?.id, refetchInterval: 60000 }
  );

  const cancelMutation = useMutation(
    (id: number) => patientService.updateFollowUp(id, { status: 'cancelled' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments']);
        toast.success('Rendez-vous annulé.');
      },
      onError: () => toast.error("Erreur lors de l'annulation"),
    }
  );

  const appointments = followUpsData?.results || [];

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.scheduled_date);
    if (filter === 'upcoming') return isFuture(aptDate) || isToday(aptDate);
    if (filter === 'past') return isPast(aptDate) && !isToday(aptDate);
    return true;
  });

  const getStatusLabel = (status: string) => {
    const s: Record<string, { label: string, color: string, bg: string }> = {
      scheduled: { label: 'Programmé', color: isPatient ? '#9a4523' : '#006669', bg: isPatient ? '#fff5f2' : '#dcf1fb' },
      completed: { label: 'Effectué', color: '#2a7f82', bg: '#e4f7ff' },
      missed: { label: 'Manqué', color: '#ba1a1a', bg: '#ffdad6' },
      cancelled: { label: 'Annulé', color: '#6f7979', bg: '#f2fbff' },
    };
    return s[status] || s.scheduled;
  };

  const renderCard = (apt: PatientFollowUp) => {
    const status = getStatusLabel(apt.status);
    const aptDate = parseISO(apt.scheduled_date);
    
    return (
      <div 
        key={apt.id}
        onClick={() => { setSelectedAppointment(apt); setShowDetailsModal(true); }}
        className={`group p-6 rounded-3xl border transition-all cursor-pointer ${
          isPatient 
            ? 'bg-white border-sahara-rose/30 hover:shadow-xl hover:shadow-compassion-rose/5' 
            : 'bg-white border-[#bec9c9]/10 hover:shadow-xl hover:border-[#006669]/20'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`} style={{ color: status.color, backgroundColor: status.bg }}>
            {status.label}
          </div>
          {isToday(aptDate) && (
            <div className="flex items-center gap-1 text-amber-600 animate-pulse">
              <span className="material-symbols-outlined text-sm">event_upcoming</span>
              <span className="text-[10px] font-bold uppercase">Aujourd'hui</span>
            </div>
          )}
        </div>

        <h3 className={`text-xl font-bold mb-4 ${isPatient ? 'text-on-surface' : 'text-[#091e25]'}`} style={{ fontFamily: isPatient ? 'inherit' : 'Literata, serif' }}>
          {apt.follow_up_type === 'screening' ? 'Dépistage Préventif' : 'Consultation de Suivi'}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[#6f7979]">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span className="text-sm font-medium">{format(aptDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-3 text-[#6f7979]">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="text-sm font-medium">{apt.scheduled_time || 'Heure à confirmer'}</span>
          </div>
          <div className="flex items-center gap-3 text-[#6f7979]">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span className="text-sm font-medium line-clamp-1">{apt.location || 'Centre de santé CerviCare'}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <span className={`material-symbols-outlined transition-transform group-hover:translate-x-1 ${isPatient ? 'text-compassion-rose' : 'text-[#006669]'}`}>arrow_forward</span>
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-semibold ${isPatient ? 'text-compassion-rose font-headline' : 'text-[#091e25]'}`} style={{ fontFamily: isPatient ? '' : 'Literata, serif' }}>
            {isPatient ? 'Mes Rendez-vous' : 'Gestion des Suivis'}
          </h1>
          <p className="text-[#6f7979] text-sm mt-1">Consultez et organisez les consultations de dépistage.</p>
        </div>
        
        <div className={`p-1 rounded-2xl flex gap-1 ${isPatient ? 'bg-sahara-rose/20' : 'bg-[#f2fbff]'}`}>
          {[
            { id: 'upcoming', label: 'À venir' },
            { id: 'past', label: 'Passés' },
            { id: 'all', label: 'Tous' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f.id 
                  ? (isPatient ? 'bg-compassion-rose text-white shadow-md' : 'bg-[#006669] text-white shadow-md')
                  : 'text-[#6f7979] hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 border border-[#bec9c9]/10 shadow-sm text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isPatient ? 'bg-sahara-rose/20 text-compassion-rose' : 'bg-[#dcf1fb] text-[#006669]'}`}>
            <span className="material-symbols-outlined text-[40px]">calendar_month</span>
          </div>
          <h3 className="text-xl font-bold text-[#091e25]">Aucun rendez-vous</h3>
          <p className="text-[#6f7979] mt-2">Vous n'avez pas de rendez-vous enregistré pour cette période.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map(renderCard)}
        </div>
      )}

      {/* Info Card */}
      <div className={`p-6 rounded-3xl border flex gap-4 ${isPatient ? 'bg-sahara-rose/10 border-sahara-rose/30' : 'bg-[#f2fbff] border-[#006669]/10'}`}>
        <span className={`material-symbols-outlined ${isPatient ? 'text-compassion-rose' : 'text-[#006669]'}`}>info</span>
        <div>
          <h4 className={`font-bold text-sm ${isPatient ? 'text-on-surface' : 'text-[#091e25]'}`}>Note de service</h4>
          <p className="text-xs text-[#6f7979] mt-1">En cas d'empêchement, merci d'annuler au moins 24h à l'avance pour libérer le créneau pour une autre patiente. La santé de toutes est notre priorité.</p>
        </div>
      </div>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Détails de la consultation" size="lg">
        {selectedAppointment && (
          <div className="space-y-8 p-2">
            <div className="flex items-center gap-4 bg-[#f2fbff] p-6 rounded-3xl border border-[#bec9c9]/10">
              <IconBox icon="medical_services" variant={isPatient ? 'rose' : 'teal'} className="w-14 h-14 rounded-2xl" />
              <div>
                <p className="text-[10px] font-bold text-[#6f7979] uppercase tracking-widest">Type de consultation</p>
                <h3 className="text-xl font-bold text-[#091e25]">
                  {selectedAppointment.follow_up_type === 'screening' ? 'Dépistage Cancer du Col' : 'Suivi Clinique'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#6f7979] uppercase">Date & Heure</p>
                <p className="font-bold text-[#091e25]">{format(parseISO(selectedAppointment.scheduled_date), 'dd MMMM yyyy', { locale: fr })}</p>
                <p className="text-sm text-[#6f7979]">{selectedAppointment.scheduled_time || 'À confirmer'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#6f7979] uppercase">Lieu</p>
                <p className="font-bold text-[#091e25]">{selectedAppointment.location || 'Centre CerviCare+'}</p>
                <p className="text-sm text-[#6f7979]">Zone régionale {user?.region || 'Dakar'}</p>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-sm text-amber-800">
                "{selectedAppointment.notes}"
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2.5 text-[#6f7979] font-bold">Fermer</button>
              {selectedAppointment.status === 'scheduled' && (
                <button 
                  onClick={() => { if(window.confirm('Annuler ?')) cancelMutation.mutate(selectedAppointment.id); setShowDetailsModal(false); }}
                  className="px-8 py-2.5 bg-[#ba1a1a] text-white rounded-xl font-bold shadow-lg shadow-[#ba1a1a]/20"
                >
                  Annuler le RDV
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  if (isPatient) return <PatientLayout>{renderContent()}</PatientLayout>;
  
  return renderContent();
};

export default Appointments;