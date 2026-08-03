import React from 'react';
import { useQuery } from 'react-query';
import PatientLayout from '../../components/PatientLayout.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import { patientSpaceService, PatientSpaceModule } from '../../services/patientSpaceService.ts';
import { patientService } from '../../services/patientService.ts';
import { prostateService } from '../../services/prostateService.ts';
import { seinService } from '../../services/seinService.ts';

const paletteByModule: Record<string, { primary: string; soft: string; title: string; icon: string; label: string }> = {
  col: { primary: '#8f464c', soft: '#fff3f4', title: '#1b1c1a', icon: 'female', label: "Cancer du col de l'uterus" },
  prostate: { primary: '#006669', soft: '#dcf1fb', title: '#091e25', icon: 'male', label: 'Cancer de la prostate' },
  sein: { primary: '#be185d', soft: '#fff5f7', title: '#831843', icon: 'female', label: 'Cancer du sein' },
};

const serviceByModule: Record<string, any> = {
  col: patientService,
  prostate: prostateService,
  sein: seinService,
};

const fmtDate = (value?: string) => {
  if (!value) return '--';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '--' : d.toLocaleDateString('fr-FR');
};

const PatientAppointments: React.FC = () => {
  const { data: space, isLoading: spaceLoading } = useQuery(
    ['patient-space-appointments'],
    () => patientSpaceService.resolve()
  );

  const module = (space?.module || 'col') as Exclude<PatientSpaceModule, 'agent' | null>;
  const palette = paletteByModule[module] || paletteByModule.col;
  const service = serviceByModule[module] || patientService;

  const { data: followUps, isLoading: followUpsLoading } = useQuery(
    ['patient-appointments', module, space?.record_id],
    () => service.getFollowUps({ patient: space!.record_id }),
    { enabled: !!space?.record_id && !!service }
  );

  if (spaceLoading || followUpsLoading) {
    return <LoadingSpinner fullPage size="xl" message="Chargement de vos rendez-vous..." />;
  }

  const appointments = followUps?.results || [];

  return (
    <PatientLayout>
      <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border mb-10" style={{ borderColor: palette.soft }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <span className="inline-flex px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4" style={{ backgroundColor: palette.soft, color: palette.primary }}>
              {palette.label}
            </span>
            <h1 className="font-headline text-5xl leading-tight" style={{ color: palette.title }}>Mes rendez-vous</h1>
            <p className="text-on-surface-variant text-lg mt-3">Suivez les consultations, controles et examens prevus dans votre parcours.</p>
          </div>
          <div className="w-20 h-20 rounded-[28px] flex items-center justify-center" style={{ backgroundColor: palette.soft, color: palette.primary }}>
            <span className="material-symbols-outlined text-5xl">{palette.icon}</span>
          </div>
        </div>
      </section>

      {appointments.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appointments.map((appointment: any) => (
            <div key={appointment.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: palette.soft, color: palette.primary }}>
                  <span className="material-symbols-outlined text-3xl">event</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <h3 className="font-headline text-xl text-on-surface">{appointment.follow_up_type_display || appointment.follow_up_type}</h3>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: palette.soft, color: palette.primary }}>
                      {appointment.status_display || appointment.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-on-surface-variant mt-2">{fmtDate(appointment.scheduled_date)}</p>
                  <p className="text-sm text-on-surface-variant mt-4 leading-relaxed">{appointment.notes || 'Consultation de suivi planifiee.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[36px] p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: palette.soft, color: palette.primary }}>
            <span className="material-symbols-outlined text-4xl">event_busy</span>
          </div>
          <h2 className="font-headline text-3xl text-on-surface">Aucun rendez-vous programme</h2>
          <p className="text-on-surface-variant mt-3">Votre centre de sante vous notifiera lorsqu'un suivi sera planifie.</p>
        </div>
      )}
    </PatientLayout>
  );
};

export default PatientAppointments;
