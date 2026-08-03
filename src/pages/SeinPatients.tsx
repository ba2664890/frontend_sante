import React from 'react';
import { seinService } from '../services/seinService.ts';
import { SeinPatient } from '../types';
import SeinFormWizard from '../components/SeinForm.tsx';
import ClinicalPatientsPage from '../components/ClinicalPatientsPage.tsx';

const yesNo = (value?: number | boolean | null) => {
  if (value === true || value === 1) return 'Oui';
  if (value === false || value === 0) return 'Non';
  if (value === 9) return 'Ne sait pas';
  return '-';
};

const fmtDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
};

const mapValue = (value: number | undefined, map: Record<number, string>) =>
  value !== undefined && value !== null ? map[value] || '-' : '-';

const biradsLabel = (value?: number) =>
  value !== undefined && value !== null ? `BIRADS ${value}` : '-';

const resultGlobal: Record<number, string> = {
  1: 'Normal',
  2: 'Surveillance rapprochee',
  3: 'Reference examens',
  4: 'Reference urgente',
  5: 'Cancer confirme',
  6: 'Lesion benigne',
};

const menopause: Record<number, string> = {
  1: 'Non menopausee',
  2: 'Menopause naturelle',
  3: 'Menopause chirurgicale',
  9: 'Ne sait pas',
};

const vih: Record<number, string> = {
  1: 'Negatif',
  2: 'Positif sous TARV',
  3: 'Positif sans TARV',
  9: 'Inconnu/Refus',
};

const profession: Record<number, string> = {
  1: 'Menagere',
  2: 'Salariee',
  3: 'Etudiante/Eleve',
  4: 'Commercante',
  5: 'Couturiere/Coiffeuse',
  6: 'Paysanne/Eleveuse',
  7: 'Sans emploi',
  8: 'Autre',
};

const instruction: Record<number, string> = {
  0: 'Aucun',
  1: 'Primaire',
  2: 'Secondaire',
  3: 'Superieur',
  4: 'Ecole coranique/Daara',
  5: 'Alphabetisation',
};

const maxBirads = (...values: Array<number | undefined>) => {
  const nums = values.filter((v): v is number => v !== undefined && v !== null);
  return nums.length ? Math.max(...nums) : undefined;
};

const SeinPatients: React.FC = () => (
  <ClinicalPatientsPage<SeinPatient>
    moduleKey="sein"
    title="Patientes Sein"
    subtitle="Gestion clinique des examens mammaires, mammographies, echographies, biopsies et orientations"
    newButtonLabel="Nouvelle Patiente Sein"
    modalNewTitle="Nouveau Depistage Sein"
    modalEditTitle="Modifier dossier sein"
    icon="female"
    form={SeinFormWizard}
    service={seinService}
    noun={{ singular: 'patiente', plural: 'patientes', newStatus: 'NOUVELLE', screenedStatus: 'DEPISTEE' }}
    palette={{
      primary: '#be185d',
      primaryHover: '#9d174d',
      primarySoft: '#fff5f7',
      primaryBorder: 'rgba(190, 24, 93, 0.18)',
      title: '#831843',
      accent: '#6d28d9',
      accentSoft: '#f3e8ff',
      warning: '#9a4523',
      warningSoft: '#ffdbcf',
      cardShadow: '0 14px 28px rgba(190,24,93,0.18)',
    }}
    getCardMetrics={(patient) => {
      const highestBirads = maxBirads(
        patient.dep_mammo_birads_droit,
        patient.dep_mammo_birads_gauche,
        patient.dep_echo_birads_droit,
        patient.dep_echo_birads_gauche
      );
      return [
        { label: 'Age', value: patient.age ? `${patient.age} ans` : '-', tone: 'neutral' },
        { label: 'Region', value: patient.region_name || '-', tone: 'primary' },
        {
          label: 'BIRADS max',
          value: biradsLabel(highestBirads),
          tone: highestBirads && highestBirads >= 4 ? 'warning' : 'accent',
        },
        {
          label: 'Resultat',
          value: patient.resultat_display || mapValue(patient.res_resultat_global, resultGlobal),
          tone: [3, 4, 5].includes(Number(patient.res_resultat_global)) ? 'warning' : 'primary',
        },
      ];
    }}
    getIdentityItems={(patient) => [
      { label: 'Profession', value: mapValue(patient.soc_profession, profession) },
      { label: 'Instruction', value: mapValue(patient.soc_niveau_instruction, instruction) },
    ]}
    getMedicalSummary={(patient) => ({
      title: 'Dernier bilan sein',
      rows: [
        { label: 'Date examen clinique', value: fmtDate(patient.exam_date) },
        { label: 'Masse a l examen', value: yesNo(patient.exam_masse_palpee) },
        { label: 'Ganglion axillaire', value: yesNo(patient.exam_ganglion_axillaire) },
        { label: 'Mammographie', value: yesNo(patient.dep_mammo_realisee) },
        { label: 'BIRADS mammo droit', value: biradsLabel(patient.dep_mammo_birads_droit) },
        { label: 'BIRADS mammo gauche', value: biradsLabel(patient.dep_mammo_birads_gauche) },
        { label: 'Echographie', value: yesNo(patient.dep_echo_realisee) },
        { label: 'BIRADS echo droit', value: biradsLabel(patient.dep_echo_birads_droit) },
        { label: 'BIRADS echo gauche', value: biradsLabel(patient.dep_echo_birads_gauche) },
        { label: 'Biopsie', value: yesNo(patient.dep_biopsie_realisee) },
        { label: 'Resultat global', value: patient.resultat_display || mapValue(patient.res_resultat_global, resultGlobal) },
        { label: 'Prochain RDV', value: fmtDate(patient.next_appointment_date || patient.res_rdv_suivi) },
      ],
      resultTone: [3, 4, 5].includes(Number(patient.res_resultat_global)) ? 'warning' : 'primary',
    })}
    getRiskItems={(patient) => [
      { label: 'ATCD personnel', value: yesNo(patient.ris_atcd_perso_sein) },
      { label: 'ATCD familial sein', value: yesNo(patient.ris_atcd_fam_sein) },
      { label: 'Lien familial', value: patient.ris_atcd_fam_sein_lien || '-' },
      { label: 'ATCD ovaire', value: yesNo(patient.ris_atcd_fam_ovaire) },
      { label: 'BRCA', value: yesNo(patient.ris_mutation_brca) },
      { label: 'Menopause', value: mapValue(patient.ris_menopause, menopause) },
      { label: 'Statut VIH', value: mapValue(patient.ris_vih_statut, vih) },
      { label: 'Reference', value: yesNo(patient.res_reference) },
    ]}
  />
);

export default SeinPatients;
