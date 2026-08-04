// ============================================================
// Utilisateur
// ============================================================
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'global_admin' | 'campaign_admin' | 'center_admin' | 'health_agent' | 'patient' | 'admin' | 'supervisor';
  phone?: string;
  region?: string;
  center?: string;
  campaign?: number;
  health_center?: number;
  structure_name?: string;
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
  meta_agent_qualif_autre?: string;
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
  pat_telephone_proche_2?: string;
  pat_telephone_proche_3?: string;
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
  ethnie_autre?: string;

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
  gyn_nb_avortements?: number;
  gyn_nb_morts_nes?: number;
  gyn_parite_simple?: number;
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
  ris_ist_type_autre?: string;
  ris_vih_statut?: number;
  ris_tabagisme?: number;
  ris_contraception?: string;
  ris_contraception_autre?: string;
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

  // G — PHYSIOLOGIE
  phy_statut?: number;
  phy_ddr?: string;
  phy_age_gestationnel?: number;
  phy_age_menopause?: number;

  // H — DÉPISTAGE
  dep_date?: string;
  dep_methode?: string;
  dep_resultat_iva?: number;
  dep_resultat_ivl?: number;
  dep_resultat_hpv?: string; // Change to string for multi-select
  dep_hpv_details?: any; // Add details field
  dep_resultat_cytologie?: number;
  dep_colposcopie_realisee?: boolean;
  dep_colposcopie_aspect?: number;
  dep_zone_transformation?: number;
  dep_biopsie_indiquee?: boolean;
  dep_biopsie_realisee?: boolean;
  dep_biopsie_sites?: number;
  dep_mapping_json?: any; // Stores interactive map data (zones marked)
  dep_distance_capture?: number;
  dep_ia_deep_learning_result?: string;

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
  trt_effets_immediats_autre?: string;
  trt_antalgique_administre?: boolean;

  // J — SUIVI / ANAPATH
  sui_anapath_date_reception?: string;
  sui_anapath_resultat?: number;
  sui_anapath_resultat_autre?: string;
  sui_stade_figo?: string;
  sui_rdv_1mois?: string;
  sui_rdv_3mois?: string;
  sui_rdv_6mois?: string;
  sui_rdv_12mois?: string;
  sui_rdv_24mois?: string;
  sui_rdv_36mois?: string;
  sui_reference?: boolean;
  sui_reference_structure?: string;
  sui_reference_structure_autre?: string;
  sui_reference_motif?: string;

  // K — HPV / VACCINATION
  hpv_connaissance_ccu?: boolean;
  hpv_source_info?: string;
  hpv_source_info_autre?: string;
  hpv_statut_vaccinal?: number;
  hpv_vaccin_type?: string;
  hpv_vaccin_nb_doses?: number;
  hpv_a_des_filles?: boolean;
  hpv_nb_filles_total?: number;
  hpv_nb_filles_9_14?: number;
  hpv_nb_filles_vaccinees?: number;
  hpv_raison_non_vaccination?: string;
  hpv_raison_non_vaccination_autre?: string;

  // L — CONSENTEMENTS
  con_depistage?: boolean;
  con_depistage_date?: string;
  con_traitement?: boolean;
  con_donnees_anonymisees?: boolean;
  con_rappels_sms?: boolean;
  con_signature_presente?: boolean;

  // M — SYNTHÈSE IA
  ai_synthese?: string;
  ai_synthese_date?: string;
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
// Centres de santé permanents
// ============================================================
export interface HealthCenter {
  id: number;
  name: string;
  code?: string;
  admin?: User;
  admin_id?: number;
  region?: number;
  region_display?: string;
  district?: string;
  type_structure?: number;
  type_structure_display?: string;
  adresse?: string;
  telephone?: string;
  covers_col: boolean;
  covers_sein: boolean;
  covers_prostate: boolean;
  cancers_couverts: string[];
  is_active: boolean;
  agents_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Campagnes de dépistage
// ============================================================
export interface ScreeningCampaign {
  id: number;
  name: string;
  description?: string;
  campaign_type: 'routine' | 'outreach' | 'special';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  admin?: User;
  admin_id?: number;
  start_date: string;
  end_date: string;
  region: number;
  region_display?: string;
  district?: string;
  location_details?: string;
  districts_couverts?: string[];
  covers_col: boolean;
  covers_sein: boolean;
  covers_prostate: boolean;
  cancers_couverts: string[];
  target_population?: number;
  expected_screenings?: number;
  objectif_col?: number;
  objectif_sein?: number;
  objectif_prostate?: number;
  actual_screenings: number;
  actual_col: number;
  actual_sein: number;
  actual_prostate: number;
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

// ============================================================
// Prostate Patient Interface
// ============================================================
export interface ProstatePatient {
  user?: number;
  record_id: number;
  id_patient: number;
  prenom: string;
  nom: string;
  full_name?: string;
  date_naiss?: string;
  age: number;
  pat_age_estime?: boolean;
  num_phone?: string;
  pat_telephone_proche?: string;
  pat_adresse?: string;
  pat_nin?: string;

  geo_region?: number;
  geo_district?: string;
  geo_structure?: string;
  geo_type_structure?: number;
  region_name?: string;

  meta_agent_qualif?: number;
  meta_agent_qualif_autre?: string;
  meta_version_fiche?: string;

  soc_profession?: number;
  soc_profession_autre?: string;
  soc_niveau_instruction?: number;
  soc_statut_matrimonial?: number;
  soc_mode_entree?: number;

  ris_atcd_fam_prostate?: number;
  ris_atcd_fam_prostate_lien?: string;
  ris_atcd_perso_prostate?: number;
  ris_atcd_perso_detail?: string;
  ris_atcd_chir_urologique?: number;
  ris_atcd_chir_detail?: string;
  ris_vih_statut?: number;
  ris_diabete?: number;
  ris_hta?: number;
  ris_tabagisme?: number;
  ris_consommation_alcool?: number;
  ris_psa_anterieur?: number;
  ris_psa_anterieur_valeur?: number;
  ris_psa_anterieur_date?: string;
  ris_tr_anterieur?: number;
  ris_tr_anterieur_resultat?: number;

  sym_pollakiurie?: number;
  sym_nycturie?: number;
  sym_nycturie_nb?: number;
  sym_urgence_mictionnelle?: number;
  sym_jet_faible?: number;
  sym_dysurie?: number;
  sym_retention_urine?: number;
  sym_hematurie?: number;
  sym_hemospermie?: number;
  sym_douleur_pelvienne?: number;
  sym_douleur_osseuse?: number;
  sym_score_ipss?: number;

  dep_date?: string;
  dep_tr_realise?: boolean;
  dep_tr_resultat?: number;
  dep_tr_volume_estime?: string;
  dep_tr_note?: string;
  dep_psa_realise?: boolean;
  dep_psa_valeur?: number;
  dep_psa_libre_valeur?: number;
  dep_psa_rapport_libre_total?: number;
  dep_psa_date?: string;
  dep_psa_interpretation?: number;
  dep_echo_realisee?: boolean;
  dep_echo_resultat?: number;
  dep_echo_volume?: number;
  dep_biopsie_indiquee?: boolean;
  dep_biopsie_realisee?: boolean;
  dep_biopsie_resultat?: number;
  dep_biopsie_gleason?: string;
  dep_biopsie_nb_carottes?: number;
  dep_biopsie_nb_positives?: number;

  res_resultat_global?: number;
  resultat_display?: string;
  res_reference?: boolean;
  res_reference_structure?: string;
  res_reference_motif?: string;
  res_stade_tnm?: string;
  res_traitement_propose?: number;
  res_traitement_note?: string;
  res_rdv_suivi?: string;

  con_depistage?: boolean;
  con_depistage_date?: string;
  con_traitement?: boolean;
  con_donnees_anonymisees?: boolean;
  con_rappels_sms?: boolean;
  con_signature_presente?: boolean;

  ai_synthese?: string;
  ai_synthese_date?: string;
  status: string;
  next_appointment_date?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Sein Patient Interface
// ============================================================
export interface SeinPatient {
  user?: number;
  record_id: number;
  id_patient: number;
  prenom: string;
  nom: string;
  full_name?: string;
  date_naiss?: string;
  age: number;
  pat_age_estime?: boolean;
  num_phone?: string;
  pat_telephone_proche?: string;
  pat_adresse?: string;
  pat_nin?: string;

  geo_region?: number;
  geo_district?: string;
  geo_structure?: string;
  geo_type_structure?: number;
  region_name?: string;

  meta_agent_qualif?: number;
  meta_agent_qualif_autre?: string;
  meta_version_fiche?: string;

  soc_profession?: number;
  soc_profession_autre?: string;
  soc_niveau_instruction?: number;
  soc_statut_matrimonial?: number;
  soc_mode_entree?: number;

  ris_atcd_perso_sein?: number;
  ris_atcd_perso_sein_annee?: number;
  ris_atcd_lesion_benigne?: number;
  ris_atcd_fam_sein?: number;
  ris_atcd_fam_sein_lien?: string;
  ris_atcd_fam_ovaire?: number;
  ris_mutation_brca?: number;
  ris_menopause?: number;
  ris_age_menopause?: number;
  ris_age_menarche?: number;
  ris_age_premiere_grossesse?: number;
  ris_nullipare?: boolean;
  ris_nb_enfants?: number;
  ris_allaitement?: number;
  ris_allaitement_duree_mois?: number;
  ris_contraception?: number;
  ris_contraception_duree_ans?: number;
  ris_thm?: number;
  ris_thm_duree_ans?: number;
  ris_obesite?: number;
  ris_imc?: number;
  ris_activite_physique?: number;
  ris_consommation_alcool?: number;
  ris_vih_statut?: number;
  ris_irradiation_thoracique?: number;
  ris_mammographie_anterieure?: number;
  ris_mammographie_anterieure_annee?: number;
  ris_mammographie_anterieure_birads?: number;
  ris_auto_examen_pratique?: number;

  sym_masse_palpable?: number;
  sym_masse_sein?: string;
  sym_ecoulement_mamelonnaire?: number;
  sym_ecoulement_type?: string;
  sym_douleur_sein?: number;
  sym_retraction_mamelon?: number;
  sym_modification_peau?: number;
  sym_adenopathie_axillaire?: number;
  sym_duree_symptomes_mois?: number;

  exam_date?: string;
  exam_inspection_droit?: number;
  exam_inspection_gauche?: number;
  exam_mamelon_droit?: string;
  exam_mamelon_gauche?: string;
  exam_masse_palpee?: boolean;
  exam_masse_sein?: string;
  exam_masse_quadrant?: string;
  exam_masse_taille_cm?: number;
  exam_masse_consistance?: number;
  exam_masse_contours?: string;
  exam_masse_mobile?: boolean;
  exam_ganglion_axillaire?: boolean;
  exam_ganglion_axillaire_sein?: string;
  exam_ganglion_sus_claviculaire?: boolean;
  exam_note?: string;

  dep_mammo_realisee?: boolean;
  dep_mammo_date?: string;
  dep_mammo_birads_droit?: number;
  dep_mammo_birads_gauche?: number;
  dep_mammo_densite?: number;
  dep_mammo_anomalie?: boolean;
  dep_mammo_anomalie_detail?: string;
  dep_echo_realisee?: boolean;
  dep_echo_date?: string;
  dep_echo_birads_droit?: number;
  dep_echo_birads_gauche?: number;
  dep_echo_masse?: boolean;
  dep_echo_masse_taille_cm?: number;
  dep_echo_note?: string;
  dep_cytoponction_realisee?: boolean;
  dep_biopsie_realisee?: boolean;
  dep_biopsie_type?: number;
  dep_anapath_resultat?: number;
  dep_anapath_recepteurs?: string;
  dep_anapath_ki67?: number;

  res_resultat_global?: number;
  resultat_display?: string;
  res_reference?: boolean;
  res_reference_structure?: string;
  res_reference_motif?: string;
  res_stade_tnm?: string;
  res_stade_clinical?: string;
  res_traitement_propose?: number;
  res_traitement_note?: string;
  res_rdv_suivi?: string;
  res_rdv_1mois?: string;
  res_rdv_3mois?: string;
  res_rdv_6mois?: string;
  res_rdv_1an?: string;

  con_depistage?: boolean;
  con_depistage_date?: string;
  con_traitement?: boolean;
  con_donnees_anonymisees?: boolean;
  con_rappels_sms?: boolean;
  con_signature_presente?: boolean;

  ai_synthese?: string;
  ai_synthese_date?: string;
  status: string;
  next_appointment_date?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Demande de campagne de dépistage (B2B / Partenaires)
// ============================================================
export interface CampaignRequest {
  id?: number;
  org_name: string;
  org_type: 'association' | 'ong' | 'health_center' | 'state' | 'other';
  org_type_display?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  preferred_start_date?: string;
  preferred_end_date?: string;
  health_center_name?: string;
  region?: number;
  region_display?: string;
  district?: string;
  expected_patients?: number;
  covers_col: boolean;
  covers_sein: boolean;
  covers_prostate: boolean;
  notes?: string;
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected';
  status_display?: string;
  created_campaign?: number;
  response_notes?: string;
  reviewed_by?: User;
  created_at?: string;
  updated_at?: string;
}

