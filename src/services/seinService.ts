import api, { buildQueryString, handleApiError } from './api.ts';
import { SeinPatient, PatientFollowUp, PatientFilters, PaginatedResponse } from '../types';

class SeinService {
  // ================= PATIENTS SEIN =================
  async getPatients(filters?: PatientFilters, page = 1): Promise<PaginatedResponse<SeinPatient>> {
    try {
      const queryParams = { ...filters, page };
      const queryString = buildQueryString(queryParams);
      const url = `/sein/patients/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatient(record_id: number): Promise<SeinPatient> {
    try {
      const response = await api.get(`/sein/patients/${record_id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createPatient(patientData: Partial<SeinPatient>): Promise<SeinPatient> {
    try {
      const response = await api.post('/sein/patients/', patientData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePatient(record_id: number, patientData: Partial<SeinPatient>): Promise<SeinPatient> {
    try {
      const response = await api.patch(`/sein/patients/${record_id}/`, patientData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deletePatient(record_id: number): Promise<void> {
    try {
      await api.delete(`/sein/patients/${record_id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatientStats(): Promise<any> {
    try {
      const response = await api.get('/sein/patients/stats/');
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
      const url = `/sein/follow-ups/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get<PaginatedResponse<PatientFollowUp>>(url);
      return response.data ?? { results: [], count: 0, next: null, previous: null };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createFollowUp(followUpData: Partial<PatientFollowUp>): Promise<PatientFollowUp> {
    try {
      const response = await api.post('/sein/follow-ups/', followUpData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const seinService = new SeinService();
