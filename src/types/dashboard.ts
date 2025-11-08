// Common Types
export type ColorType = 'primary' | 'success' | 'warning' | 'info' | 'error';

export interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
}

export interface ScreeningResult {
  id: string;
  type: string;
  date: string;
  summary: string;
}

export interface Patient {
  id: number;
  prenom: string;
  nom: string;
  age: number;
  last_visit: string;
  next_appointment?: string;
  status: string;
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  date: string;
  severity: ColorType;
  isRead: boolean;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  priority: ColorType;
  dueDate?: string;
}

export interface GeographicDataPoint {
  region: string;
  count: number;
  coordinates: [number, number];
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

// Dashboard Stats Types
export interface DashboardStats {
  // Common stats
  total_patients: number;
  active_patients: number;
  monthly_screenings: number;
  follow_up_rate: number;
  
  // Trends and analytics
  screening_trend: TrendDataPoint[];
  geographic_data: GeographicDataPoint[];
  
  // Recent items
  recent_patients: Patient[];
  recent_alerts: Alert[];
  recent_appointments: Appointment[];
  
  // Action items
  pending_actions: Action[];
  pending_alerts: number;
}

// Patient Dashboard Data
export interface PatientDashboardData {
  next_appointment?: Appointment;
  unread_messages: number;
  screening_count: number;
  upcoming_appointments: Appointment[];
  recent_results: ScreeningResult[];
}

// Component Props Types
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: ColorType;
}

export interface ChartProps {
  data: TrendDataPoint[];
  type: 'line' | 'bar' | 'pie';
  height?: number;
}

export interface RecentPatientsProps {
  patients: Patient[];
  showActions?: boolean;
}

export interface RecentAlertsProps {
  alerts: Alert[];
}

export interface SenegalMapProps {
  data: GeographicDataPoint[];
}