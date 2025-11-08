export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'sms' | 'email';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  recipient_patient?: {
    id: number;
    prenom: string;
    nom: string;
  };
  recipient_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  recipient_name?: string;
  scheduled_time: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'resolved' | 'dismissed';
  alert_type: 'screening' | 'follow_up' | 'system';
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  region: string;
  name: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'annual' | 'quarterly';
  format: 'pdf' | 'excel' | 'csv';
  status: 'generating' | 'ready' | 'failed' | 'completed' | 'pending';
  url?: string;
  created_at: string;
  updated_at: string;
  generated_by: number;
}