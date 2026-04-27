// ============================================================
// Utilisateur
// ============================================================
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'supervisor' | 'health_agent' | 'patient';
  phone?: string;
  region?: string;
  center?: string;
  is_active: boolean;
  created_at: string;
}

// ============================================================
// Patient — Fiche collecte cancer col utérus (Sections A-L)
// ============================================================
export interface Patient {
  // Système
  user_id?: number;
  record_id: number;
  full_name?: string;
  age_calculated?: number;
  region_name?: string;
  resultat_examen_display?: string;
  created_by?: User;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  status: string;
  next_appointment_date?: string;

  // A — MÉTADONNÉES
  meta_agent_qualif?: number;
  meta_version_fiche?: string;

  // B — GÉOGRAPHIE
  geo_region?: number;
  geo_district?: string;
  geo_structure?: string;
  geo_type_structure?: number;
  geo_gps_lat?: number;
  geo_gps_lon?: number;

  // C — IDENTITÉ PATIENTE
  id_patient: number;
  prenom: string;
  nom: string;
  date_naiss?: string;
  age: number;
  pat_age_estime?: boolean;
  num_phone?: string;
  pat_telephone_proche?: string;
  pat_adresse?: string;
  pat_nin?: string;

  // D — SOCIODÉMOGRAPHIQUE
  soc_profession?: number;
  soc_profession_autre?: string;
  soc_niveau_instruction?: number;
  soc_statut_matrimonial?: number;
  soc_menage_polygame?: boolean;
  soc_mode_entree?: number;
  ethnie?: number;

  // Legacy D
  statut_matrimoniale?: number;
  scolarisation?: number;
  niveau_scolarite?: number;
  provenance?: number;
  region?: number;
  motifs_visite?: string;

  // E — GYNÉCO-OBSTÉTRICAUX
  gyn_gestite?: number;
  gyn_parite?: number;
  gyn_nb_grossesses?: number;
  gyn_nb_accouchements?: number;
  gyn_age_premier_rapport?: number;
  gyn_age_premiere_grossesse?: number;
  gyn_nb_partenaires_vie?: number;
  gyn_ddr?: string;
  gyn_cycle_regulier?: number;

  // Legacy E
  gestite?: number;
  parite?: number;
  age_menstrue?: number;
  dure_cycle?: number;
  cycle_mode?: number;
  age1_enceint?: number;
  nmbre_accouchee?: number;
  agepremier_accouchee?: number;

  // F — FACTEURS DE RISQUE
  ris_ist_antecedent?: number;
  ris_ist_type?: string;
  ris_vih_statut?: number;
  ris_tabagisme?: number;
  ris_contraception?: string;
  ris_duree_contraception_horm?: number;
  ris_depistage_anterieur?: number;
  ris_date_dern_depistage?: string;
  ris_resultat_dern_depistage?: number;

  // Legacy F
  anteceden_chirurgi?: number;
  ouianteceden_chirurgi?: number;
  anteceden_chirurgic?: number;
  antecedents_medicale?: number;
  antecedents_medicaux?: number;
  diabetique?: number;
  depistage_diabete?: number;
  statut_serologique?: number;
  etat_sante?: number;
  traitema_contraceptif?: number;
  contraceptif_sioui?: number;
  agepilule_contracepti?: number;
  temps_prispilule?: number;
  menopause?: number;
  age_menopause?: number;
  depistage_cancersein?: number;
  sioui_depistagedure?: number;
  symptom_recent?: number;
  siouisymptomrecan?: number;
  examen_depistag?: string;
  dat_examendepistag?: number;
  diagnostic_col?: number;
  siouidiagnostic_col?: number;
  membr_famillecancer?: number;
  mmbrfamill_qui?: number;
  mmbrfamill_site?: number;
  mmbrfamill_age?: number;
  fumeur?: number;
  debut_fumeur?: number;
  nbreannee_fumeur?: number;
  fumer_mode?: number;
  annee_arretfumer?: number;
  consommation_moyenntabac?: number;
  consommatio_alcool?: number;
  moyenn_semainealcool?: number;
  personnel_pec?: number;
  resultat_examen?: number;

  // G — STATUT PHYSIOLOGIQUE
  phy_statut?: number;
  phy_age_gestationnel?: number;
  phy_age_menopause?: number;

  // H — DÉPISTAGE
  dep_date?: string;
  dep_methode?: string;
  dep_resultat_iva?: number;
  dep_resultat_ivl?: number;
  dep_resultat_hpv?: number;
  dep_resultat_cytologie?: number;
  dep_colposcopie_realisee?: boolean;
  dep_colposcopie_aspect?: number;
  dep_zone_transformation?: number;
  dep_biopsie_indiquee?: boolean;
  dep_biopsie_realisee?: boolean;
  dep_biopsie_sites?: number;

  // I — TRAITEMENT
  trt_eligible_immediat?: boolean;
  trt_non_eligible_motif?: number;
  trt_non_eligible_autre?: string;
  trt_methode?: number;
  trt_date?: string;
  trt_duree_application?: number;
  trt_nb_applications?: number;
  trt_temperature_sonde?: number;
  trt_effets_immediats?: string;
  trt_antalgique_administre?: boolean;

  // J — SUIVI / ANAPATH
  sui_anapath_date_reception?: string;
  sui_anapath_resultat?: number;
  sui_stade_figo?: string;
  sui_rdv_1mois?: string;
  sui_rdv_3mois?: string;
  sui_rdv_6mois?: string;
  sui_rdv_12mois?: string;
  sui_rdv_24mois?: string;
  sui_rdv_36mois?: string;
  sui_reference?: boolean;
  sui_reference_structure?: string;
  sui_reference_motif?: string;

  // K — HPV / VACCINATION
  hpv_connaissance_ccu?: boolean;
  hpv_source_info?: string;
  hpv_statut_vaccinal?: number;
  hpv_a_des_filles?: boolean;
  hpv_nb_filles_total?: number;
  hpv_nb_filles_9_14?: number;
  hpv_nb_filles_vaccinees?: number;
  hpv_raison_non_vaccination?: string;

  // L — CONSENTEMENTS
  con_depistage?: boolean;
  con_depistage_date?: string;
  con_traitement?: boolean;
  con_donnees_anonymisees?: boolean;
  con_rappels_sms?: boolean;
  con_signature_presente?: boolean;
}

// ============================================================
// FormData (sous-ensemble pour le formulaire)
// ============================================================
export type PatientFormData = Omit<Patient,
  'record_id' | 'full_name' | 'age_calculated' | 'region_name' |
  'resultat_examen_display' | 'created_by' | 'created_by_name' |
  'created_at' | 'updated_at' | 'user_id'
>;

// ============================================================
// Suivi de patiente
// ============================================================
export interface PatientFollowUp {
  id: number;
  patient: number;
  patient_name?: string;
  agent_name?: string;
  follow_up_type:
    | 'screening'
    | 'follow_up_30'
    | 'follow_up_90'
    | 'follow_up_180'
    | 'annual'
    | 'follow_up_24m'
    | 'follow_up_36m'
    | 'symptomatic';
  follow_up_type_display?: string;
  scheduled_date: string;
  scheduled_time?: string;
  completed_date?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'rescheduled';
  status_display?: string;
  location?: string;
  notes?: string;
  result?: string;
  next_follow_up_date?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Filtres patienten
// ============================================================
export interface PatientFilters {
  region?: number;
  geo_region?: number;
  resultat_examen?: number;
  dep_resultat_iva?: number;
  dep_resultat_hpv?: number;
  trt_methode?: number;
  ris_vih_statut?: number;
  phy_statut?: number;
  status?: string;
  age_min?: number;
  age_max?: number;
  search?: string;
}

// ============================================================
// Statistiques / Dashboard
// ============================================================
export interface DashboardStats {
  total_patients: number;
  total_screened: number;
  abnormal_results: number;
  pending_followups: number;
  patients_by_region: Record<string, number>;
  patients_by_result: Record<string, number>;
  screening_trend: Array<{
    month: string;
    total: number;
    iva_positif: number;
    traite: number;
  }>;
  age_distribution: Record<string, number>;
  recent_alerts: Array<{
    id: number;
    title: string;
    priority: string;
    status: string;
    created_at: string;
  }>;
  active_campaigns: Array<{
    id: number;
    name: string;
    region: string;
    coverage_rate: number;
    end_date: string;
  }>;
  coverage_rate: number;
  follow_up_compliance_rate: number;
  taux_positivite_iva?: number;
  taux_traitement_immediat?: number;
  taux_suivi_12mois?: number;
  patients_vih_positif?: number;
}

// ============================================================
// Campagnes de dépistage
// ============================================================
export interface ScreeningCampaign {
  id: number;
  name: string;
  campaign_type: 'routine' | 'outreach' | 'special';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  region: string;
  district?: string;
  location_details?: string;
  target_population?: number;
  expected_screenings?: number;
  actual_screenings: number;
  team_leader?: User;
  team_members: User[];
  created_by?: User;
  created_at: string;
  updated_at: string;
  coverage_rate?: number;
  is_active?: boolean;
}

// ============================================================
// Alertes
// ============================================================
export interface Alert {
  id: number;
  alert_type: 'low_coverage' | 'high_abnormal_rate' | 'missed_followups' | 'system_issue' | 'data_quality';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'ignored';
  related_data?: Record<string, any>;
  region?: string;
  acknowledged_by?: User;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  is_critical?: boolean;
}

// ============================================================
// Notifications
// ============================================================
export interface Notification {
  id: number;
  notification_type: 'sms' | 'email' | 'push' | 'call';
  recipient_patient?: Patient;
  recipient_user?: User;
  title: string;
  message: string;
  scheduled_time: string;
  sent_time?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  delivery_status?: string;
  error_message?: string;
  related_follow_up?: PatientFollowUp;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// API
// ============================================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface NotificationFilters {
  notification_type?: string;
  status?: string;
  priority?: string;
  region?: string;
}