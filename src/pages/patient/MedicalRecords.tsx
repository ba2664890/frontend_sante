import React from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../../services/patientService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import PatientLayout from '../../components/PatientLayout.tsx';
import { BentoCard, IconBox } from '../../components/ui/PatientUI.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MedicalRecords: React.FC = () => {
  const { user } = useAuth();

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

  if (isPatientLoading || isFollowUpsLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PatientLayout>
    );
  }

  const getIvaResult = (val?: number) => {
    const map: Record<number, string> = { 1: 'Négatif', 2: 'Positif', 3: 'Polype', 4: 'Suspicion cancer', 5: 'Non concluant' };
    return val ? map[val] : 'Non réalisé';
  };

  const getHpvResult = (val?: string) => val || 'Non réalisé';

  const getCytologyResult = (val?: number) => {
    const map: Record<number, string> = { 1: 'Normal', 2: 'Anormal', 3: 'Inconcluant' };
    return val ? map[val] : 'Non réalisé';
  };

  return (
    <PatientLayout>
      {/* Hero Header */}
      <div className="mb-section-gap text-center animate-fade-in">
        <h1 className="font-headline text-4xl md:text-5xl text-compassion-rose mb-4">Mes Résultats Médicaux</h1>
        <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
          Retrouvez ici le suivi complet de votre parcours de santé. Vos données sont sécurisées et traitées avec le plus grand soin.
        </p>
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-element-gap mb-section-gap">
        {/* IVA */}
        <BentoCard className="border-l-8 border-secondary-container flex flex-col justify-between h-full hover:scale-[1.02] transition-transform duration-300">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-body text-xs font-bold">Dépistage</span>
              <IconBox icon="verified_user" className="w-10 h-10" />
            </div>
            <h3 className="font-headline text-2xl text-on-surface mb-2">IVA</h3>
            <p className="font-body text-sm text-on-surface-variant mb-6">Inspection visuelle après application d'acide acétique.</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="block font-body text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Résultat</span>
              <span className={`text-2xl font-bold ${patient?.dep_resultat_iva === 2 ? 'text-error' : 'text-wellness-green'}`}>
                {getIvaResult(patient?.dep_resultat_iva)}
              </span>
            </div>
            <span className="font-body text-xs text-on-surface-variant">
              {patient?.dep_date ? format(new Date(patient.dep_date), 'dd MMM yyyy', { locale: fr }) : '--'}
            </span>
          </div>
        </BentoCard>

        {/* HPV */}
        <BentoCard className="border-l-8 border-tertiary-fixed flex flex-col justify-between h-full hover:scale-[1.02] transition-transform duration-300">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1 rounded-full font-body text-xs font-bold">Laboratoire</span>
              <IconBox icon="biotech" className="w-10 h-10" />
            </div>
            <h3 className="font-headline text-2xl text-on-surface mb-2">HPV</h3>
            <p className="font-body text-sm text-on-surface-variant mb-6">Test de détection du Papillomavirus Humain à haut risque.</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="block font-body text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Résultat</span>
              <span className="text-2xl font-bold text-compassion-rose">{getHpvResult(patient?.dep_resultat_hpv)}</span>
            </div>
            <span className="font-body text-xs text-on-surface-variant">
              {patient?.dep_date ? format(new Date(patient.dep_date), 'dd MMM yyyy', { locale: fr }) : '--'}
            </span>
          </div>
        </BentoCard>

        {/* Cytologie */}
        <BentoCard className="border-l-8 border-secondary-container flex flex-col justify-between h-full hover:scale-[1.02] transition-transform duration-300">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-body text-xs font-bold">Frottis</span>
              <IconBox icon="microscope" className="w-10 h-10" />
            </div>
            <h3 className="font-headline text-2xl text-on-surface mb-2">Cytologie</h3>
            <p className="font-body text-sm text-on-surface-variant mb-6">Analyse morphologique des cellules du col de l'utérus.</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="block font-body text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Résultat</span>
              <span className="text-2xl font-bold text-wellness-green">{getCytologyResult(patient?.dep_resultat_cytologie)}</span>
            </div>
            <span className="font-body text-xs text-on-surface-variant">
              {patient?.dep_date ? format(new Date(patient.dep_date), 'dd MMM yyyy', { locale: fr }) : '--'}
            </span>
          </div>
        </BentoCard>
      </div>

      {/* Timeline Section */}
      <section className="max-w-3xl mx-auto mt-16">
        <h2 className="font-headline text-3xl text-compassion-rose mb-12 text-center">Historique des interventions</h2>
        <div className="relative">
          {/* Timeline Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-sahara-rose"></div>
          
          {followUps?.results?.map((followUp, index) => (
            <div key={followUp.id} className={`relative flex items-center justify-between mb-16 w-full ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
              <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                <span className="inline-block bg-surface-container text-compassion-rose px-3 py-1 rounded-full font-body text-xs font-bold mb-2">
                  {format(new Date(followUp.scheduled_date), 'dd MMMM yyyy', { locale: fr })}
                </span>
                <h4 className="font-headline text-xl text-on-surface">{followUp.follow_up_type_display}</h4>
                <p className="font-body text-sm text-on-surface-variant">{followUp.notes || 'Consultation effectuée dans votre centre de santé.'}</p>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-sahara-rose shadow-md flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-compassion-rose text-sm">
                  {followUp.status === 'completed' ? 'check_circle' : 'medical_services'}
                </span>
              </div>
              <div className="w-5/12 hidden md:block"></div>
            </div>
          ))}

          {/* Initial Enrollment Item */}
          <div className="relative flex items-center justify-between w-full">
            <div className="w-5/12 text-right pr-8">
              <span className="inline-block bg-surface-container text-compassion-rose px-3 py-1 rounded-full font-body text-xs font-bold mb-2">
                {patient ? format(new Date(patient.created_at), 'dd MMMM yyyy', { locale: fr }) : '--'}
              </span>
              <h4 className="font-headline text-xl text-on-surface">Inscription CerviCare+</h4>
              <p className="font-body text-sm text-on-surface-variant">Début de votre accompagnement personnalisé.</p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-sahara-rose border-4 border-white shadow-md flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-compassion-rose text-sm">app_registration</span>
            </div>
            <div className="w-5/12"></div>
          </div>
        </div>
      </section>
    </PatientLayout>
  );
};

export default MedicalRecords;
