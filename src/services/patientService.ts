import api, { buildQueryString, handleApiError } from './api.ts';
import { Patient, PatientFollowUp, PatientFilters, PaginatedResponse } from '../types';

class PatientService {
  // ================= PATIENTS =================
  async getPatients(filters?: PatientFilters, page = 1): Promise<PaginatedResponse<Patient>> {
    try {
      const queryParams = { ...filters, page };
      const queryString = buildQueryString(queryParams);
      const url = `/patients/patients/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // CORRECTION: Utiliser record_id comme identifiant principal
  async getPatient(record_id: number): Promise<Patient> {
    try {
      const response = await api.get(`/patients/patients/${record_id}/`);
      const patient = response.data;
      // Normalisation optionnelle si nécessaire
      return patient;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await api.post('/patients/patients/', patientData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // CORRECTION: Utiliser user_id au lieu de id_patient
  async updatePatient(user_id: number, patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await api.patch(`/patients/patients/${user_id}/`, patientData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatientByUserId(user_id: number): Promise<Patient> {
    try {
      const response = await api.get(`/patients/patients/by-user/${user_id}/`);
      const patient = response.data;
      
      // S'assurer que les champs essentiels existent pour éviter les crashs UI
      if (patient) {
        patient.id_patient = patient.id_patient || '';
        patient.prenom = patient.prenom || '';
        patient.nom = patient.nom || '';
        // Ajouter d'autres champs par défaut ici si nécessaire
      }
      
      return patient;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }


  // CORRECTION: Utiliser user_id au lieu de id_patient
  async deletePatient(user_id: number): Promise<void> {
    try {
      await api.delete(`/patients/patients/${user_id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatientStats(): Promise<any> {
    try {
      const response = await api.get('/patients/patients/stats/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatientsNeedingFollowUp(): Promise<Patient[]> {
    try {
      const response = await api.get('/patients/patients/needs_follow_up/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportPatientsData(): Promise<Blob> {
    try {
      const response = await api.get('/patients/patients/export_data/', { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async generateDocumentBlob(recordId: number, docType: 'anapath' | 'fcv' | 'hpv' | 'colposcopie' | 'reference'): Promise<Blob> {
    try {
      const response = await api.get(`/patients/patients/${recordId}/generate_document/?type=${docType}`, { responseType: 'blob' });
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
      const url = `/patients/follow-ups/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get<PaginatedResponse<PatientFollowUp>>(url);

      return response.data ?? { results: [], count: 0, next: null, previous: null };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFollowUp(id: number): Promise<PatientFollowUp> {
    try {
      const response = await api.get(`/patients/follow-ups/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createFollowUp(followUpData: Partial<PatientFollowUp>): Promise<PatientFollowUp> {
    try {
      const response = await api.post('/patients/follow-ups/', followUpData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateFollowUp(id: number, followUpData: Partial<PatientFollowUp>): Promise<PatientFollowUp> {
    try {
      const response = await api.patch(`/patients/follow-ups/${id}/`, followUpData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteFollowUp(id: number): Promise<void> {
    try {
      await api.delete(`/patients/follow-ups/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // CORRECTION: Utiliser user_id au lieu de id_patient
  async scheduleFollowUp(user_id: number, followUpData: {
    follow_up_type: string;
    scheduled_date: string;
    notes?: string;
  }): Promise<PatientFollowUp> {
    try {
      const response = await api.post(`/patients/patients/${user_id}/schedule_follow_up/`, followUpData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUpcomingFollowUps(): Promise<PatientFollowUp[]> {
    try {
      const response = await api.get('/patients/follow-ups/upcoming/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getOverdueFollowUps(): Promise<PatientFollowUp[]> {
    try {
      const response = await api.get('/patients/follow-ups/overdue/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }



  // ================= CHATBOT =================

  async sendChatbotMessage(params: {
    question: string;
    patient_id?: number;
    conversation_id?: number;
  }): Promise<{
    answer: string;
    conversation_id: number;
    message_id: number;
    detected_language?: string;
    translated_question?: string;
  }> {
    try {
      const response = await api.post('/conversations/chat/', params);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getConversations(page = 1): Promise<PaginatedResponse<any>> {
    try {
      const queryString = buildQueryString({ page });
      const url = `/conversations/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getConversationMessages(conversationId: number): Promise<any[]> {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getConversation(conversationId: number): Promise<any> {
    try {
      const response = await api.get(`/conversations/${conversationId}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= IA & SYNTHÈSE =================
  async getAiSummary(patientData: any): Promise<{ synthese: string }> {
    try {
      const response = await api.post('/patients/patients/ai-summary/', patientData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ================= GÉNÉRATION DE DOCUMENTS MÉDICAUX =================

  /**
   * Génère l'une des 5 fiches officielles MSAS sous forme de Blob PDF.
   * @param recordId  — record_id de la patiente
   * @param docType   — 'anapath' | 'fcv' | 'hpv' | 'colposcopie' | 'reference'
   */
  async generateDocumentBlob(recordId: number, docType: string): Promise<Blob> {
    try {
      const response = await api.get(
        `/patients/patients/${recordId}/generate-document/${docType}/`,
        { responseType: 'blob' }
      );
      return response.data as Blob;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const patientService = new PatientService();