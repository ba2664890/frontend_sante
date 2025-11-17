// src/services/analyticsService.ts
import api, { buildQueryString, handleApiError } from './api.ts';
import { PaginatedResponse } from '../types';

// Typesss
export interface DashboardStats {
  total_patients: number;
  active_patients: number;
  monthly_screenings: number;
  total_screened: number;
  abnormal_results: number;
  pending_followups: number;
  coverage_rate: number;
  follow_up_rate: number;
  screening_trend: any[];
  age_distribution: any;
  geographic_data: any[];
  patients_by_region: any;
  recent_patients: any[];
  recent_alerts: any[];
  active_campaigns: any[];
  pending_actions: any[];
  pending_alerts: number;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  generated_at: string;
  file_url?: string;
  filters: any;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  campaign_type: string;
  status: string;
  start_date: string;
  end_date: string;
  region: string;
  district?: string;
  location_details?: string;
  target_population: number;
  expected_screenings: number;
  actual_screenings: number;
  team_leader: any;
  team_members: any[];
  created_by: any;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  campaign_type: 'routine' | 'outreach' | 'special';
  status?: 'planned' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  region: string;
  district?: string;
  location_details?: string;
  target_population?: number;
  expected_screenings?: number;
  team_leader?: number;
  team_members?: number[];
}

export interface ScreeningResult {
  id: number;
  patient: any;
  campaign: Campaign;
  screening_date: string;
  result: 'normal' | 'abnormal' | 'suspicious' | 'positive' | 'negative' | 'inconclusive';
  notes?: string;
  performed_by: any;
  created_at: string;
  updated_at: string;
}

export interface PatientDashboardData {
  my_screenings: any[];
  upcoming_appointments: any[];
  my_messages: any[];
}

class AnalyticsService {
  // ================= DASHBOARD =================
  async getDashboardData(): Promise<DashboardStats> {
    try {
      const endpoint = '/analytics/dashboard-metrics/dashboard-data/';
      const response = await api.get(endpoint);
      const data = response.data;

      // Normaliser les alertes si elles existent
      if (data.recent_alerts && Array.isArray(data.recent_alerts)) {
        data.recent_alerts = data.recent_alerts.map((alert: any) => ({
          ...alert,
          alert_type: alert.alert_type || 'system',
          updated_at: alert.updated_at || alert.created_at,
          description: alert.description || alert.message || '',
        }));
      }

      return {
        total_patients: data.total_patients || 0,
        active_patients: data.active_patients || 0,
        monthly_screenings: data.monthly_screenings || 0,
        total_screened: data.total_screened || 0,
        abnormal_results: data.abnormal_results || 0,
        pending_followups: data.pending_followups || 0,
        coverage_rate: data.coverage_rate || 0,
        follow_up_rate: data.follow_up_rate || 0,
        screening_trend: data.screening_trend || [],
        age_distribution: data.age_distribution || {},
        geographic_data: data.geographic_data || [],
        patients_by_region: data.patients_by_region || {},
        recent_patients: data.recent_patients || [],
        recent_alerts: data.recent_alerts || [],
        active_campaigns: data.active_campaigns || [],
        pending_actions: data.pending_actions || [],
        pending_alerts: data.pending_alerts || 0,
      };
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatientDashboardData(): Promise<PatientDashboardData> {
    try {
      const response = await api.get('/analytics/dashboard-metrics/patient-dashboard/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= REPORTS =================
  async getReports(filters?: Record<string, any>): Promise<PaginatedResponse<Report>> {
    try {
      const queryString = buildQueryString(filters || {});
      const url = `/analytics/reports/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getReport(id: number): Promise<Report> {
    try {
      const response = await api.get(`/analytics/reports/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createReport(reportData: Partial<Report>): Promise<Report> {
    try {
      const response = await api.post('/analytics/reports/', reportData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
    try {
      const response = await api.patch(`/analytics/reports/${id}/`, reportData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteReport(id: number): Promise<void> {
    try {
      await api.delete(`/analytics/reports/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async generateReport(id: number): Promise<void> {
    try {
      await api.post(`/analytics/reports/${id}/generate/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async downloadReport(id: number): Promise<Blob> {
    try {
      const response = await api.get(`/analytics/reports/${id}/download/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= ALERTS =================
  async getAlerts(filters?: Record<string, any>): Promise<PaginatedResponse<Alert>> {
    try {
      const response = await api.get('/analytics/alerts/', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    try {
      const response = await api.post('/analytics/alerts/', alertData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async acknowledgeAlert(id: number): Promise<void> {
    try {
      await api.post(`/analytics/alerts/${id}/acknowledge/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async resolveAlert(id: number): Promise<void> {
    try {
      await api.post(`/analytics/alerts/${id}/resolve/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCriticalAlerts(): Promise<Alert[]> {
    try {
      const response = await api.get('/analytics/alerts/critical/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= CAMPAIGNS =================
  async getCampaigns(filters?: Record<string, any>, page = 1): Promise<PaginatedResponse<Campaign>> {
    try {
      const queryParams = { ...filters, page };
      const queryString = buildQueryString(queryParams || {});
      const url = `/screening/campaigns/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCampaign(id: number): Promise<Campaign> {
    try {
      const response = await api.get(`/screening/campaigns/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createCampaign(campaignData: Partial<CampaignFormData>): Promise<Campaign> {
    try {
      const response = await api.post('/screening/campaigns/', campaignData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateCampaign(id: number, data: Partial<CampaignFormData>): Promise<Campaign> {
    try {
      const response = await api.patch(`/screening/campaigns/${id}/`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteCampaign(id: number): Promise<void> {
    try {
      await api.delete(`/screening/campaigns/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCampaignStatistics(id: number): Promise<{
    total_screenings: number;
    results_breakdown: any[];
    completion_rate: number;
    is_active: boolean;
    days_remaining: number;
  }> {
    try {
      const response = await api.get(`/screening/campaigns/${id}/statistics/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async activateCampaign(id: number): Promise<void> {
    try {
      await api.post(`/screening/campaigns/${id}/activate/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    try {
      const response = await api.get('/screening/campaigns/active/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= SCREENING RESULTS =================
  async getResults(
    filters?: Record<string, any>,
    page = 1
  ): Promise<PaginatedResponse<ScreeningResult>> {
    try {
      const queryParams = { ...filters, page };
      const queryString = buildQueryString(queryParams || {});
      const url = `/screening/results/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getResult(id: number): Promise<ScreeningResult> {
    try {
      const response = await api.get(`/screening/results/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createResult(data: Partial<ScreeningResult>): Promise<ScreeningResult> {
    try {
      const response = await api.post('/screening/results/', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateResult(id: number, data: Partial<ScreeningResult>): Promise<ScreeningResult> {
    try {
      const response = await api.patch(`/screening/results/${id}/`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteResult(id: number): Promise<void> {
    try {
      await api.delete(`/screening/results/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getResultsSummary(filters?: Record<string, any>): Promise<{
    total_screenings: number;
    results_breakdown: any[];
    recent_screenings: ScreeningResult[];
  }> {
    try {
      const queryString = buildQueryString(filters || {});
      const url = `/screening/results/summary/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= METRICS =================
  async getMetrics(filters?: Record<string, any>): Promise<any> {
    try {
      const response = await api.get('/analytics/dashboard-metrics/', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const analyticsService = new AnalyticsService();