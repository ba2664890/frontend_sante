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

  // --- Fonctions de formatage et de mapping ---
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

  const getRegion = (val?: number) => {
    const regions: Record<number, string> = {
      1: 'Dakar', 2: 'Diourbel', 3: 'Fatick', 4: 'Kaffrine', 5: 'Kaolack',
      6: 'Kédougou', 7: 'Kolda', 8: 'Louga', 9: 'Matam', 10: 'Saint-Louis',
      11: 'Sédhiou', 12: 'Tambacounda', 13: 'Thiès', 14: 'Ziguinchor'
    };
    return val ? regions[val] : '--';
  };

  const getProfession = (val?: number) => {
    const profs: Record<number, string> = {
      1: 'Ménagère', 2: 'Salariée', 3: 'Étudiante', 4: 'Commerçante',
      5: 'Artisane', 6: 'Paysanne', 7: 'Sans emploi', 8: 'Autre'
    };
    return val ? profs[val] : '--';
  };

  const getIvaResult = (val?: number) => {
    const map: Record<number, string> = { 1: 'Négatif', 2: 'Positif', 3: 'Polype', 4: 'Suspicion cancer', 5: 'Non concluant' };
    return val ? map[val] : 'Non réalisé';
  };

  const getHpvResult = (val?: string) => {
    if (!val) return 'Non réalisé';
    const map: Record<string, string> = {
      '0': 'Négatif', '1': 'Positif 16', '2': 'Positif 18', '3': 'Haut risque', '4': 'Multi-types'
    };
    return val.split(',').map(v => map[v.trim()] || v).join(', ');
  };

  const getVihStatut = (val?: number) => {
    const map: Record<number, string> = { 1: 'Négatif', 2: 'Positif (TARV+)', 3: 'Positif (TARV-)', 9: 'Inconnu' };
    return val ? map[val] : '--';
  };

  const getHpvVaccin = (val?: number) => {
    const map: Record<number, string> = { 0: 'Non vaccinée', 1: '1 dose', 2: '2 doses', 3: '3 doses', 9: 'Inconnu' };
    return val !== undefined ? map[val] : '--';
  };

  return (
    <PatientLayout>
      {/* Header Profil Rapide */}
      <div className="mb-12 animate-fade-in flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl shadow-ultra-soft border border-sahara-rose relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sahara-rose/10 rounded-bl-full"></div>
        <div className="w-24 h-24 rounded-full bg-sahara-rose flex items-center justify-center border-4 border-white shadow-md relative z-10">
          <span className="material-symbols-outlined text-compassion-rose text-4xl">female</span>
        </div>
        <div className="flex-grow text-center md:text-left relative z-10">
          <h1 className="font-headline text-3xl text-on-surface mb-1">{patient?.full_name}</h1>
          <p className="font-body text-on-surface-variant flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold">
            <span>Age: {patient?.age} ans</span>
            <span>•</span>
            <span>Région: {getRegion(patient?.geo_region)}</span>
            <span>•</span>
            <span>ID: #{patient?.id_patient}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-wellness-green/10 px-4 py-2 rounded-xl text-wellness-green font-bold text-xs">
            Dossier Actif
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-element-gap mb-section-gap">
        
        {/* SECTION 1: RESULTATS CLINIQUES (IVA / HPV) */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <BentoCard className="bg-white border-t-4 border-secondary-container">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline text-xl text-on-surface">Résultat IVA</h3>
              <IconBox icon="verified_user" className="w-10 h-10 bg-secondary-container/20 text-on-secondary-container" />
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Dernier Examen</span>
                <span className={`text-2xl font-bold ${patient?.dep_resultat_iva === 2 ? 'text-error' : 'text-wellness-green'}`}>
                  {getIvaResult(patient?.dep_resultat_iva)}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant italic">Date: {safeFormatDate(patient?.dep_date)}</p>
            </div>
          </BentoCard>

          <BentoCard className="bg-white border-t-4 border-tertiary-fixed">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline text-xl text-on-surface">Test HPV</h3>
              <IconBox icon="biotech" className="w-10 h-10 bg-tertiary-fixed/20 text-on-tertiary-fixed-variant" />
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Statut Viral</span>
                <span className="text-2xl font-bold text-compassion-rose">
                  {getHpvResult(patient?.dep_resultat_hpv)}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant italic">Laboratoire: {patient?.geo_structure || 'Centre de référence'}</p>
            </div>
          </BentoCard>
        </div>

        {/* SECTION 2: STATUT VACCINAL & VIH */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <BentoCard className="bg-compassion-rose text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-symbols-outlined text-2xl">vaccines</span>
              <h3 className="font-headline text-xl">Vaccination HPV</h3>
            </div>
            <p className="text-3xl font-bold mb-2">{getHpvVaccin(patient?.hpv_statut_vaccinal)}</p>
            <p className="text-xs opacity-80">Protection renforcée contre le cancer.</p>
          </BentoCard>

          <BentoCard className="bg-wellness-green text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-symbols-outlined text-2xl">shield_health</span>
              <h3 className="font-headline text-xl">Statut Immunitaire</h3>
            </div>
            <p className="text-2xl font-bold mb-1">VIH: {getVihStatut(patient?.ris_vih_statut)}</p>
            <p className="text-xs opacity-80">Suivi confidentiel & sécurisé.</p>
          </BentoCard>
        </div>

        {/* SECTION 3: ANTECEDENTS GYNECO (Bento large) */}
        <div className="md:col-span-12">
          <h2 className="font-headline text-2xl text-on-surface mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-compassion-rose">history_edu</span>
            Antécédents Gynécologiques & Obstétricaux
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <BentoCard className="bg-white border border-sahara-rose">
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Gestité (G)</span>
              <span className="text-xl font-bold text-on-surface">{patient?.gyn_nb_grossesses || 0} Grossesses</span>
            </BentoCard>
            <BentoCard className="bg-white border border-sahara-rose">
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Parité (P)</span>
              <span className="text-xl font-bold text-on-surface">{patient?.gyn_nb_accouchements || 0} Accouchements</span>
            </BentoCard>
            <BentoCard className="bg-white border border-sahara-rose">
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Dernières Règles</span>
              <span className="text-xl font-bold text-on-surface">{safeFormatDate(patient?.gyn_ddr)}</span>
            </BentoCard>
            <BentoCard className="bg-white border border-sahara-rose">
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Premier Rapport</span>
              <span className="text-xl font-bold text-on-surface">{patient?.gyn_age_premier_rapport || '--'} ans</span>
            </BentoCard>
          </div>
        </div>

        {/* SECTION 4: INFOS SOCIO-DEMO */}
        <div className="md:col-span-12 bg-cream-silk/30 p-8 rounded-3xl border border-sahara-rose">
          <h3 className="font-headline text-xl text-on-surface mb-6">Informations Complémentaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <IconBox icon="work" className="bg-white" />
              <div>
                <p className="text-xs text-on-surface-variant font-bold">Profession</p>
                <p className="font-body font-bold">{getProfession(patient?.soc_profession)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <IconBox icon="home" className="bg-white" />
              <div>
                <p className="text-xs text-on-surface-variant font-bold">Adresse</p>
                <p className="font-body font-bold">{patient?.pat_adresse || '--'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <IconBox icon="call" className="bg-white" />
              <div>
                <p className="text-xs text-on-surface-variant font-bold">Contact Proche</p>
                <p className="font-body font-bold">{patient?.pat_telephone_proche || '--'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-sahara-rose/50 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-on-surface-variant font-bold mb-2 uppercase tracking-widest">Mode de Vie</p>
              <div className="flex gap-4">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold border border-sahara-rose">Tabac: {patient?.ris_tabagisme === 0 ? 'Non-fumeuse' : 'Active/Sevrée'}</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold border border-sahara-rose">Contraception: {patient?.ris_contraception ? 'Oui' : 'Aucune'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold mb-2 uppercase tracking-widest">Instruction</p>
              <p className="text-sm font-body italic text-on-surface-variant">"La connaissance est la première étape de la prévention."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <section className="max-w-4xl mx-auto mt-16 pt-16 border-t border-sahara-rose">
        <h2 className="font-headline text-3xl text-compassion-rose mb-16 text-center">Historique de Prise en Charge</h2>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-sahara-rose/50"></div>
          
          {followUps?.results?.map((followUp, index) => (
            <div key={followUp.id} className={`relative flex items-center justify-between mb-16 w-full ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
              <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}>
                <span className="inline-block bg-sahara-rose/30 text-compassion-rose px-3 py-1 rounded-full text-xs font-bold mb-3">
                  {safeFormatDate(followUp.scheduled_date, 'dd MMMM yyyy')}
                </span>
                <h4 className="font-headline text-xl text-on-surface mb-2">{followUp.follow_up_type_display}</h4>
                <div className={`p-4 rounded-2xl bg-white border border-sahara-rose shadow-sm ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    {followUp.notes || 'Consultation de suivi effectuée conformément au protocole de santé.'}
                  </p>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-compassion-rose shadow-lg flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-compassion-rose text-lg">
                  {followUp.status === 'completed' ? 'check_circle' : 'medical_services'}
                </span>
              </div>
              <div className="w-5/12"></div>
            </div>
          ))}

          {/* Enrollment */}
          <div className="relative flex items-center justify-between w-full">
            <div className="w-5/12 text-right pr-12">
              <span className="inline-block bg-wellness-green/20 text-wellness-green px-3 py-1 rounded-full text-xs font-bold mb-3">
                {safeFormatDate(patient?.created_at, 'dd MMMM yyyy')}
              </span>
              <h4 className="font-headline text-xl text-on-surface">Inscription Programme</h4>
              <p className="font-body text-sm text-on-surface-variant">Début de l'accompagnement personnalisé CerviCare+.</p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-wellness-green border-4 border-white shadow-lg flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-white text-lg">verified</span>
            </div>
            <div className="w-5/12"></div>
          </div>
        </div>
      </section>
    </PatientLayout>
  );
};

export default MedicalRecords;
