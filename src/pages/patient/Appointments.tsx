import React from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../../services/patientService.ts';
import { analyticsService } from '../../services/analyticsService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import PatientLayout from '../../components/PatientLayout.tsx';
import { BentoCard, IconBox } from '../../components/ui/PatientUI.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import { format, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useNavigate } from 'react-router-dom';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery(
    ['patient-dashboard', user?.id],
    () => analyticsService.getPatientDashboardData(),
    { enabled: !!user }
  );

  const { data: patient, isLoading: isPatientLoading } = useQuery(
    ['patient-details', user?.id],
    () => patientService.getPatientByUserId(user!.id),
    { enabled: !!user }
  );

  const { data: followUps, isLoading: isFollowUpsLoading } = useQuery(
    ['patient-followups', user?.id],
    () => patientService.getFollowUps({ patient: patient?.record_id }),
    { enabled: !!patient }
  );

  if (isDashboardLoading || isPatientLoading || isFollowUpsLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PatientLayout>
    );
  }

  const safeFormatDate = (dateStr?: string, formatStr: string = 'dd MMM yyyy') => {
    if (!dateStr) return '--';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '--';
      return format(date, formatStr, { locale: fr });
    } catch (e) {
      return '--';
    }
  };

  const nextAppt = dashboardData?.next_appointment;
  
  // Calcul de l'étape actuelle (Fleur de Santé)
  const monthsSinceEnrollment = patient ? differenceInMonths(new Date(), new Date(patient.created_at)) : 0;
  
  const milestones = [
    { month: 0, label: 'Départ', icon: 'check', completed: monthsSinceEnrollment >= 0 },
    { month: 6, label: 'Consultation', icon: 'local_florist', completed: monthsSinceEnrollment >= 6 },
    { month: 12, label: 'Examen', icon: 'medical_services', completed: monthsSinceEnrollment >= 12 },
    { month: 24, label: 'Contrôle', icon: 'analytics', completed: monthsSinceEnrollment >= 24 },
    { month: 36, label: 'Bilan Final', icon: 'verified', completed: monthsSinceEnrollment >= 36 },
  ];

  return (
    <PatientLayout>
      {/* Page Header */}
      <header className="mb-12 animate-fade-in">
        <h1 className="font-headline text-4xl md:text-5xl text-compassion-rose mb-2">Mon Suivi & Mes Rendez-vous</h1>
        <p className="font-body text-lg text-on-surface-variant">Votre parcours de santé, accompagné avec douceur et clarté.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-element-gap">
        {/* Next Appointment Card */}
        <BentoCard className="md:col-span-8 relative overflow-hidden flex flex-col md:flex-row gap-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sahara-rose opacity-20 rounded-bl-full"></div>
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full mb-6">
              <span className="material-symbols-outlined text-sm">event_upcoming</span>
              <span className="font-body text-xs font-bold uppercase">Prochain RDV</span>
            </div>
            <h2 className="font-headline text-3xl text-on-surface mb-6">{nextAppt?.type || 'Suivi préventif'}</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <IconBox icon="calendar_today" className="w-12 h-12" />
                <div>
                  <p className="font-body text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Date</p>
                  <p className="font-body text-lg font-bold">{nextAppt?.date || 'À définir'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <IconBox icon="schedule" className="w-12 h-12" />
                <div>
                  <p className="font-body text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Heure</p>
                  <p className="font-body text-lg font-bold">{nextAppt?.time || '--:--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <IconBox icon="location_on" className="w-12 h-12" />
                <div>
                  <p className="font-body text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Lieu</p>
                  <p className="font-body text-lg font-bold">Centre de Santé de {patient?.geo_district || 'Dakar'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button className="bg-compassion-rose text-white px-8 py-3 rounded-full font-body text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit</span> Modifier
              </button>
            </div>
          </div>
          <div className="hidden md:block w-1/3">
            <img 
              alt="Hôpital" 
              className="w-full h-full object-cover rounded-lg shadow-sm" 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400" 
            />
          </div>
        </BentoCard>

        {/* Quick Actions Side */}
        <aside className="md:col-span-4 flex flex-col gap-6">
          <BentoCard onClick={() => navigate('/chatbot')} className="bg-secondary-container text-on-secondary-container hover:scale-[1.02] transition-transform flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <div>
              <h3 className="font-headline text-xl leading-tight">Nouveau RDV</h3>
              <p className="font-body text-sm opacity-80 font-bold">Planifiez une visite</p>
            </div>
          </BentoCard>

          <BentoCard onClick={() => window.location.href = 'tel:+221770000000'} className="bg-tertiary-fixed text-on-tertiary-fixed-variant hover:scale-[1.02] transition-transform flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">contact_support</span>
            </div>
            <div>
              <h3 className="font-headline text-xl leading-tight">Agent local</h3>
              <p className="font-body text-sm opacity-80 font-bold">Conseils & Aide</p>
            </div>
          </BentoCard>
        </aside>

        {/* Fleur de Santé */}
        <section className="md:col-span-12 bg-white rounded-lg p-10 shadow-ultra-soft overflow-x-auto mt-8 border border-sahara-rose">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-headline text-3xl text-compassion-rose mb-1">Ma Fleur de Santé</h2>
              <p className="font-body text-sm text-on-surface-variant font-bold">Protocole de suivi sur 36 mois</p>
            </div>
            <div className="bg-sahara-rose text-compassion-rose px-6 py-2 rounded-full font-body font-bold">
              Étape Actuelle : Mois {monthsSinceEnrollment > 36 ? '36+' : monthsSinceEnrollment}
            </div>
          </header>
          
          <div className="relative flex items-center justify-between min-w-[800px] px-8 py-12">
            {/* Progress Line */}
            <div className="absolute h-1 bg-sahara-rose w-full left-0 top-1/2 -translate-y-1/2"></div>
            <div 
              className="absolute h-1 bg-compassion-rose transition-all duration-1000 left-0 top-1/2 -translate-y-1/2" 
              style={{ width: `${Math.min(100, (monthsSinceEnrollment / 36) * 100)}%` }}
            ></div>
            
            {milestones.map((ms) => (
              <div key={ms.month} className="relative z-10 flex flex-col items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all ${
                  ms.completed ? 'bg-compassion-rose text-white' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined">{ms.icon}</span>
                </div>
                <p className={`mt-4 font-body font-bold ${ms.completed ? 'text-compassion-rose' : 'text-on-surface-variant'}`}>
                  {ms.label}
                </p>
                <p className="text-xs text-on-surface-variant">Mois {ms.month}</p>
                {monthsSinceEnrollment >= ms.month && monthsSinceEnrollment < (milestones[milestones.indexOf(ms) + 1]?.month || 999) && (
                  <div className="absolute -top-12 bg-compassion-rose text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold whitespace-nowrap">
                    Vous êtes ici
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* History List */}
        <section className="md:col-span-12 mt-12">
          <h2 className="font-headline text-3xl text-on-surface mb-8">Historique des visites</h2>
          <div className="space-y-4">
            {followUps?.results?.filter(f => f.status === 'completed').map((followUp) => (
              <div key={followUp.id} className="bg-white p-6 rounded-lg flex items-center justify-between hover:shadow-md transition-all group border border-sahara-rose">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-sahara-rose/30 flex items-center justify-center text-compassion-rose">
                    <span className="material-symbols-outlined">vaccines</span>
                  </div>
                  <div>
                    <h4 className="font-body text-lg font-bold">{followUp.follow_up_type_display}</h4>
                    <p className="font-body text-sm text-on-surface-variant">
                      {safeFormatDate(followUp.scheduled_date, 'dd MMMM yyyy')} • {followUp.location || 'Centre de Santé'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-on-secondary-container bg-secondary-container px-4 py-1 rounded-full font-body text-xs font-bold">Terminé</span>
                  <span className="material-symbols-outlined text-on-surface-variant cursor-pointer group-hover:text-compassion-rose">chevron_right</span>
                </div>
              </div>
            ))}
            
            {(!followUps || followUps.results.filter(f => f.status === 'completed').length === 0) && (
              <p className="text-center py-12 text-on-surface-variant font-body italic">Aucune visite passée enregistrée pour le moment.</p>
            )}
          </div>
        </section>
      </div>
    </PatientLayout>
  );
};

export default Appointments;
