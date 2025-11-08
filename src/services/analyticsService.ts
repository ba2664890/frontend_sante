import api, { buildQueryString, handleApiError } from './api.ts';
import { DashboardStats, Report, Campaign, Alert, PatientDashboardData } from '../types/analytics';

class AnalyticsService {
  // ================= DASHBOARD =================
  async getDashboardData(): Promise<DashboardStats> {
    try {
      console.log('AnalyticsService - getDashboardData called');
      
      // L'endpoint principal du dashboard qui gère tous les rôles
      const endpoint = '/analytics/dashboard-metrics/dashboard-data/';
      
      const response = await api.get(endpoint);
      const data = response.data;

      console.log('AnalyticsService - Dashboard data received:', data);

      // Normaliser les alertes si elles existent
      if (data.recent_alerts && Array.isArray(data.recent_alerts)) {
        data.recent_alerts = data.recent_alerts.map((alert: any) => ({
          ...alert,
          alert_type: alert.alert_type || 'system',
          updated_at: alert.updated_at || alert.created_at,
          description: alert.description || alert.message || '',
        }));
      }

      // Normaliser les données manquantes
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
      console.error('AnalyticsService - getDashboardData error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(handleApiError(error));
    }
  }

  async getPatientDashboardData(): Promise<PatientDashboardData> {
    try {
      const response = await api.get('/analytics/dashboard-metrics/patient-dashboard/');
      return response.data;
    } catch (error) {
      console.error('AnalyticsService - getPatientDashboardData error:', error);
      throw new Error(handleApiError(error));
    }
  }

  // ================= REPORTS =================
  async getReports(filters?: any): Promise<any> {
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


  async getAlerts(filters?: any): Promise<any> {
    try {
      const response = await api.get('analytics/alerts/', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    try {
      const response = await api.post('analytics/alerts/', alertData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async acknowledgeAlert(id: number): Promise<void> {
    try {
      await api.post(`analytics/alerts/${id}/acknowledge/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async resolveAlert(id: number): Promise<void> {
    try {
      await api.post(`analytics/alerts/${id}/resolve/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCampaigns(filters?: any): Promise<any> {
    try {
      const response = await api.get('analytics/campaigns/', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    try {
      const response = await api.post('analytics/campaigns/', campaignData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async activateCampaign(id: number): Promise<void> {
    try {
      await api.post(`analytics/campaigns/${id}/activate/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    try {
      const response = await api.get('analytics/campaigns/active/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCriticalAlerts(): Promise<Alert[]> {
    try {
      const response = await api.get('analytics/alerts/critical/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMetrics(filters?: any): Promise<any> {
    try {
      const response = await api.get('analytics/dashboard-metrics/', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const analyticsService = new AnalyticsService();