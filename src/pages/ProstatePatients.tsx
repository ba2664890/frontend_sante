import React from 'react';
import { prostateService } from '../services/prostateService.ts';
import { ProstatePatient } from '../types';
import ProstateFormWizard from '../components/ProstateForm.tsx';
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

const psaInterpretation: Record<number, string> = {
  1: 'Normal (< 4 ng/mL)',
  2: 'Zone grise (4-10)',
  3: 'Eleve (10-20)',
  4: 'Tres eleve (> 20)',
};

const trResult: Record<number, string> = {
  1: 'Normal',
  2: 'HBP probable',
  3: 'Nodule suspect',
  4: 'Vesicule seminale suspecte',
  5: 'Extra-prostatique suspect',
  9: 'Non realise',
};

const prostateResult: Record<number, string> = {
  1: 'Normal',
  2: 'Surveillance PSA',
  3: 'Reference urologue',
  4: 'Cancer confirme',
  5: 'HBP',
};

const vih: Record<number, string> = {
  1: 'Negatif',
  2: 'Positif sous TARV',
  3: 'Positif sans TARV',
  9: 'Inconnu/Refus',
};

const tabac: Record<number, string> = {
  0: 'Non',
  1: 'Actif',
  2: 'Sevre',
  3: 'Passif',
};

const profession: Record<number, string> = {
  1: 'Salarie',
  2: 'Commercant',
  3: 'Cultivateur/Eleveur',
  4: 'Pecheur',
  5: 'Retraite',
  6: 'Sans emploi',
  7: 'Autre',
};

const instruction: Record<number, string> = {
  0: 'Aucun',
  1: 'Primaire',
  2: 'Secondaire',
  3: 'Superieur',
  4: 'Ecole coranique/Daara',
  5: 'Alphabetisation',
};

const ProstatePatients: React.FC = () => (
  <ClinicalPatientsPage<ProstatePatient>
    moduleKey="prostate"
    title="Patients Prostate"
    subtitle="Gestion clinique des depistages, dosages PSA, toucher rectal et orientations urologiques"
    newButtonLabel="Nouveau Patient Prostate"
    modalNewTitle="Nouveau Depistage Prostate"
    modalEditTitle="Modifier dossier prostate"
    icon="male"
    form={ProstateFormWizard}
    service={prostateService}
    noun={{ singular: 'patient', plural: 'patients', newStatus: 'NOUVEAU', screenedStatus: 'DEPISTE' }}
    palette={{
      primary: '#006669',
      primaryHover: '#005255',
      primarySoft: '#dcf1fb',
      primaryBorder: 'rgba(0, 102, 105, 0.18)',
      title: '#091e25',
      accent: '#9a4523',
      accentSoft: '#ffdbcf',
      warning: '#795500',
      warningSoft: '#ffdeaa',
      cardShadow: '0 14px 28px rgba(0,102,105,0.18)',
    }}
    getCardMetrics={(patient) => [
      { label: 'Age', value: patient.age ? `${patient.age} ans` : '-', tone: 'neutral' },
      { label: 'Region', value: patient.region_name || '-', tone: 'primary' },
      {
        label: 'PSA',
        value: patient.dep_psa_valeur ? `${patient.dep_psa_valeur} ng/mL` : '-',
        tone: Number(patient.dep_psa_valeur) >= 10 ? 'warning' : 'accent',
      },
      {
        label: 'Resultat',
        value: patient.resultat_display || mapValue(patient.res_resultat_global, prostateResult),
        tone: [3, 4].includes(Number(patient.res_resultat_global)) ? 'warning' : 'primary',
      },
    ]}
    getIdentityItems={(patient) => [
      { label: 'Profession', value: mapValue(patient.soc_profession, profession) },
      { label: 'Instruction', value: mapValue(patient.soc_niveau_instruction, instruction) },
    ]}
    getMedicalSummary={(patient) => ({
      title: 'Dernier depistage prostate',
      rows: [
        { label: 'Date depistage', value: fmtDate(patient.dep_date) },
        { label: 'PSA total', value: patient.dep_psa_valeur ? `${patient.dep_psa_valeur} ng/mL` : '-' },
        { label: 'Interpretation PSA', value: mapValue(patient.dep_psa_interpretation, psaInterpretation) },
        { label: 'Toucher rectal', value: mapValue(patient.dep_tr_resultat, trResult) },
        { label: 'Biopsie indiquee', value: yesNo(patient.dep_biopsie_indiquee) },
        { label: 'Biopsie realisee', value: yesNo(patient.dep_biopsie_realisee) },
        { label: 'Resultat global', value: patient.resultat_display || mapValue(patient.res_resultat_global, prostateResult) },
        { label: 'Prochain RDV', value: fmtDate(patient.next_appointment_date || patient.res_rdv_suivi) },
      ],
      resultTone: [3, 4].includes(Number(patient.res_resultat_global)) ? 'warning' : 'primary',
    })}
    getRiskItems={(patient) => [
      { label: 'ATCD familial', value: yesNo(patient.ris_atcd_fam_prostate) },
      { label: 'Lien familial', value: patient.ris_atcd_fam_prostate_lien || '-' },
      { label: 'ATCD personnel', value: yesNo(patient.ris_atcd_perso_prostate) },
      { label: 'Statut VIH', value: mapValue(patient.ris_vih_statut, vih) },
      { label: 'Diabete', value: yesNo(patient.ris_diabete) },
      { label: 'HTA', value: yesNo(patient.ris_hta) },
      { label: 'Tabagisme', value: mapValue(patient.ris_tabagisme, tabac) },
      { label: 'Reference', value: yesNo(patient.res_reference) },
    ]}
  />
);

export default ProstatePatients;
