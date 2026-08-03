import api, { buildQueryString, handleApiError } from './api.ts';
import { ProstatePatient, PatientFollowUp, PatientFilters, PaginatedResponse } from '../types';

class ProstateService {
  // ================= PATIENTS PROSTATE =================
  async getPatients(filters?: PatientFilters, page = 1): Promise<PaginatedResponse<ProstatePatient>> {
    try {
      const queryParams = { ...filters, page };
      const queryString = buildQueryString(queryParams);
      const url = `/prostate/patients/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatient(record_id: number): Promise<ProstatePatient> {
    try {
      const response = await api.get(`/prostate/patients/${record_id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createPatient(patientData: Partial<ProstatePatient>): Promise<ProstatePatient> {
    try {
      const response = await api.post('/prostate/patients/', patientData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePatient(record_id: number, patientData: Partial<ProstatePatient>): Promise<ProstatePatient> {
    try {
      const response = await api.patch(`/prostate/patients/${record_id}/`, patientData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deletePatient(record_id: number): Promise<void> {
    try {
      await api.delete(`/prostate/patients/${record_id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatientStats(): Promise<any> {
    try {
      const response = await api.get('/prostate/patients/stats/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= FOLLOW UPS =================
  async getFollowUps(filters?: { patient?: string | number }, page = 1): Promise<PaginatedResponse<PatientFollowUp>> {
    try {
      const queryParams: Record<string, string | number> = { page };
      if (filters?.patient !== undefined && filters.patient !== null) {
        queryParams.patient = filters.patient;
      }
      const queryString = buildQueryString(queryParams);
      const url = `/prostate/follow-ups/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get<PaginatedResponse<PatientFollowUp>>(url);
      return response.data ?? { results: [], count: 0, next: null, previous: null };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createFollowUp(followUpData: Partial<PatientFollowUp>): Promise<PatientFollowUp> {
    try {
      const response = await api.post('/prostate/follow-ups/', followUpData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const prostateService = new ProstateService();
