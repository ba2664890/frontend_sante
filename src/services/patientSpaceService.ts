import api, { handleApiError } from './api.ts';

export type PatientSpaceModule = 'col' | 'prostate' | 'sein' | 'agent' | null;

export interface PatientSpace {
  role: string;
  module: PatientSpaceModule;
  path: string;
  record_id?: number;
  id_patient?: number;
  full_name?: string;
  status?: string;
  next_appointment_date?: string | null;
  detail?: string;
}

class PatientSpaceService {
  async resolve(): Promise<PatientSpace> {
    try {
      const response = await api.get('/accounts/users/patient-space/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const patientSpaceService = new PatientSpaceService();
