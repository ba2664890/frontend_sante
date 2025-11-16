export interface DashboardStats {
  // Common stats
  total_patients: number;
  active_patients: number;
  total_screened: number;
  abnormal_results: number;
  pending_followups: number;
  monthly_screenings: number;
  follow_up_rate: number;
  coverage_rate: number;
  
  // Trends and analytics
  screening_trend: Array<{
    month: string;
    total: number;
    normal: number;
    abnormal: number;
  }>;
  age_distribution: {
    [key: string]: number;
  };
  patients_by_region: {
    [key: string]: number;
  };
  geographic_data: Array<{
    region: string;
    count: number;
    coordinates: [number, number];
  }>;
  
  // Recent activity
  recent_patients: Array<{
    id: number;
    prenom: string;
    nom: string;
    age: number;
    last_visit: string;
    next_appointment?: string;
    status: string;
  }>;
  recent_alerts: Array<{
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'resolved' | 'dismissed';
    alert_type: 'screening' | 'follow_up' | 'system';
    created_at: string;
    updated_at: string;
  }>;
  
  // Actions and campaigns
  pending_actions: Array<{
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  pending_alerts: number;
  active_campaigns: Array<Campaign>;
}

export interface Campaign {
  actual_screenings: ReactNode;
  id: number;
  name: string;
  description: string;
  region: string;
  target_population: number;
  screened_count: number;
  coverage_rate: number;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PatientDashboardData {
  next_appointment?: {
    id: number;
    type: string;
    date: string;
    time: string;
  };
  unread_messages: number;
  screening_count: number;
  upcoming_appointments: Array<{
    id: number;
    type: string;
    date: string;
    time: string;
  }>;
  recent_results: Array<{
    id: number;
    type: string;
    date: string;
    summary: string;
  }>;
}

export type { Alert, Report, Notification } from './notification';