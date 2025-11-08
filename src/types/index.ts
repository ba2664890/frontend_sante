// Types utilisateur
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

// Types patiente
export interface Patient {
  user_id: number;
  record_id: number;
  id_patient: number;
  prenom: string;
  nom: string;
  full_name?: string;
  date_naiss: string;
  age: number;
  age_calculated?: number;
  num_phone: string;
  statut_matrimoniale: number;
  scolarisation: number;
  niveau_scolarite: number;
  provenance: number;
  region: number;
  region_name?: string;
  ethnie: number;
  motifs_visite: string;
  gestite: number;
  parite: number;
  anteceden_chirurgi: number;
  ouianteceden_chirurgi: number;
  anteceden_chirurgic: number;
  antecedents_medicale: number;
  antecedents_medicaux: number;
  diabetique: number;
  depistage_diabete: number;
  statut_serologique: number;
  age_menstrue: number;
  dure_cycle: number;
  cycle_mode: number;
  age1_enceint: number;
  nmbre_accouchee: number;
  agepremier_accouchee: number;
  etat_sante: number;
  traitema_contraceptif: number;
  contraceptif_sioui: number;
  agepilule_contracepti: number;
  temps_prispilule: number;
  menopause: number;
  age_menopause: number;
  depistage_cancersein: number;
  sioui_depistagedure: number;
  symptom_recent: number;
  siouisymptomrecan: number;
  examen_depistag: string;
  dat_examendepistag: number;
  diagnostic_col: number;
  siouidiagnostic_col: number;
  membr_famillecancer: number;
  mmbrfamill_qui: number;
  mmbrfamill_site: number;
  mmbrfamill_age: number;
  fumeur: number;
  debut_fumeur: number;
  nbreannee_fumeur: number;
  fumer_mode: number;
  annee_arretfumer: number;
  consommation_moyenntabac: number;
  consommatio_alcool: number;
  moyenn_semainealcool: number;
  personnel_pec: number;
  resultat_examen: number;
  resultat_examen_display?: string;
  status: string;
  next_appointment_date?: string;
  created_by?: User;
  created_at: string;
  updated_at: string;
}

// Types pour les suivis
export interface PatientFollowUp {
  id: number;
  patient: Patient;
  follow_up_type: 'screening' | 'follow_up_90' | 'follow_up_180' | 'annual' | 'symptomatic';
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'rescheduled';
  notes?: string;
  result?: string;
  next_follow_up_date?: string;
  created_by?: User;
  created_at: string;
  updated_at: string;
}

// Types pour les notifications
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

// Types pour les rapports et statistiques
export interface DashboardStats {
  total_patients: number;
  total_screened: number;
  abnormal_results: number;
  pending_followups: number;
  patients_by_region: Record<string, number>;
  screening_trend: Array<{
    month: string;
    total: number;
    normal: number;
    abnormal: number;
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
}

// Types pour les campagnes
export interface ScreeningCampaign {
  id: number;
  name: string;
  campaign_type: 'mobile' | 'fixed' | 'community' | 'special';
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

// Types pour les alertes
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

// Types pour les réponses API
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

// Types pour l'authentification
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// Types pour les filtres et recherche
export interface PatientFilters {
  region?: number;
  resultat_examen?: number;
  status?: string;
  age_min?: number;
  age_max?: number;
  search?: string;
}

export interface NotificationFilters {
  notification_type?: string;
  status?: string;
  priority?: string;
  region?: string;
}

// Types pour les formulaires
export interface PatientFormData {
  id_patient: number;
  prenom: string;
  nom: string;
  date_naiss: string;
  age: number;
  num_phone: string;
  statut_matrimoniale: number;
  scolarisation: number;
  niveau_scolarite: number;
  provenance: number;
  region: number;
  ethnie: number;
  motifs_visite: string;
  gestite: number;
  parite: number;
  anteceden_chirurgi: number;
  ouianteceden_chirurgi: number;
  anteceden_chirurgic: number;
  antecedents_medicale: number;
  antecedents_medicaux: number;
  diabetique: number;
  depistage_diabete: number;
  statut_serologique: number;
  age_menstrue: number;
  dure_cycle: number;
  cycle_mode: number;
  age1_enceint: number;
  nmbre_accouchee: number;
  agepremier_accouchee: number;
  etat_sante: number;
  traitema_contraceptif: number;
  contraceptif_sioui: number;
  agepilule_contracepti: number;
  temps_prispilule: number;
  menopause: number;
  age_menopause: number;
  depistage_cancersein: number;
  sioui_depistagedure: number;
  symptom_recent: number;
  siouisymptomrecan: number;
  examen_depistag: string;
  dat_examendepistag: number;
  diagnostic_col: number;
  siouidiagnostic_col: number;
  membr_famillecancer: number;
  mmbrfamill_qui: number;
  mmbrfamill_site: number;
  mmbrfamill_age: number;
  fumeur: number;
  debut_fumeur: number;
  nbreannee_fumeur: number;
  fumer_mode: number;
  annee_arretfumer: number;
  consommation_moyenntabac: number;
  consommatio_alcool: number;
  moyenn_semainealcool: number;
  personnel_pec: number;
  resultat_examen: number;

}