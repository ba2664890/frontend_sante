import api, { buildQueryString, handleApiError } from './api.ts';
import { ScreeningCampaign, HealthCenter, PaginatedResponse } from '../types';

class ScreeningService {
  // ================= CAMPAIGNS =================
  async getCampaigns(filters?: any, page = 1): Promise<PaginatedResponse<ScreeningCampaign>> {
    try {
      const queryParams = { ...filters, page };
      const queryString = buildQueryString(queryParams);
      const response = await api.get(`/screening/campaigns/${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCampaign(id: number): Promise<ScreeningCampaign> {
    try {
      const response = await api.get(`/screening/campaigns/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createCampaign(campaignData: Partial<ScreeningCampaign>): Promise<ScreeningCampaign> {
    try {
      const response = await api.post('/screening/campaigns/', campaignData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateCampaign(id: number, campaignData: Partial<ScreeningCampaign>): Promise<ScreeningCampaign> {
    try {
      const response = await api.patch(`/screening/campaigns/${id}/`, campaignData);
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

  async getCampaignStats(id: number): Promise<any> {
    try {
      const response = await api.get(`/screening/campaigns/${id}/statistics/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async assignCampaignAdmin(campaignId: number, adminId: number): Promise<any> {
    try {
      const response = await api.post(`/screening/campaigns/${campaignId}/assign_admin/`, { admin_id: adminId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCampaignAgents(campaignId: number): Promise<any[]> {
    try {
      const response = await api.get(`/screening/campaigns/${campaignId}/agents/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= HEALTH CENTERS =================
  async getHealthCenters(filters?: any, page = 1): Promise<PaginatedResponse<HealthCenter>> {
    try {
      const queryParams = { ...filters, page };
      const queryString = buildQueryString(queryParams);
      const response = await api.get(`/screening/centers/${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getHealthCenter(id: number): Promise<HealthCenter> {
    try {
      const response = await api.get(`/screening/centers/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createHealthCenter(centerData: Partial<HealthCenter>): Promise<HealthCenter> {
    try {
      const response = await api.post('/screening/centers/', centerData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateHealthCenter(id: number, centerData: Partial<HealthCenter>): Promise<HealthCenter> {
    try {
      const response = await api.patch(`/screening/centers/${id}/`, centerData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteHealthCenter(id: number): Promise<void> {
    try {
      await api.delete(`/screening/centers/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getHealthCenterStats(id: number): Promise<any> {
    try {
      const response = await api.get(`/screening/centers/${id}/statistics/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async assignCenterAdmin(centerId: number, adminId: number): Promise<any> {
    try {
      const response = await api.post(`/screening/centers/${centerId}/assign_admin/`, { admin_id: adminId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCenterAgents(centerId: number): Promise<any[]> {
    try {
      const response = await api.get(`/screening/centers/${centerId}/agents/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new ScreeningService();
