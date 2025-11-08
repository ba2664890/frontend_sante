import api, { buildQueryString, handleApiError } from './api.ts';
import { Notification, NotificationFilters, PaginatedResponse } from '../types';

class NotificationService {
  async getNotifications(filters?: NotificationFilters, page = 1): Promise<PaginatedResponse<Notification>> {
    try {
      const queryParams = {
        ...filters,
        page,
      };
      
      const queryString = buildQueryString(queryParams);
      const url = `/notifications/notifications/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getNotification(id: number): Promise<Notification> {
    try {
      const response = await api.get(`/notifications/notifications/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await api.post('/notifications/notifications/', notificationData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateNotification(id: number, notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await api.patch(`/notifications/notifications/${id}/`, notificationData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteNotification(id: number): Promise<void> {
    try {
      await api.delete(`/notifications/notifications/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async sendNotification(id: number): Promise<void> {
    try {
      await api.post(`/notifications/notifications/${id}/send/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPendingNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications/notifications/pending/');
      console.log('NotificationService - getPendingNotifications response:', response);
      return response.data.results;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getOverdueNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications/notifications/overdue/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async sendCustomNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await api.post('/notifications/notifications/send_custom/', notificationData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Méthodes pour les modèles de notification
  async getNotificationTemplates(filters?: any): Promise<any> {
    try {
      const queryString = buildQueryString(filters);
      const url = `/notifications/templates/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createNotificationTemplate(templateData: any): Promise<any> {
    try {
      const response = await api.post('/notifications/templates/', templateData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateNotificationTemplate(id: number, templateData: any): Promise<any> {
    try {
      const response = await api.patch(`/notifications/templates/${id}/`, templateData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteNotificationTemplate(id: number): Promise<void> {
    try {
      await api.delete(`/notifications/templates/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async renderTemplate(id: number, context: any): Promise<any> {
    try {
      const response = await api.post(`/notifications/templates/${id}/test_render/`, { context });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createNotificationFromTemplate(templateId: number, data: any): Promise<Notification> {
    try {
      const response = await api.post('/notifications/templates/create_from_template/', {
        template_id: templateId,
        ...data,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const notificationService = new NotificationService();