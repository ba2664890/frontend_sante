import api from './api.ts';
import { LoginRequest, LoginResponse, User } from '../types';

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const loginData: LoginRequest = { username, password };
    
    try {
      // 1. Authentification JWT
      const response = await api.post('/auth/jwt/create/', loginData);
      const { access, refresh } = response.data;

      // 2. Récupérer les informations de l'utilisateur connecté
      const userResponse = await api.get('/accounts/users/me/', {
        headers: { Authorization: `Bearer ${access}` },
      });

      const user: User = userResponse.data; // <-- directement data, pas de results
      console.log('AuthService - getCurrentUser response:', user);

      return { access, refresh, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await api.get('/accounts/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user: User = response.data; // <-- directement data
      console.log('AuthService - getCurrentUser response:', user);

      return user;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await api.post('/auth/jwt/refresh/', { refresh: refreshToken });
      return response.data.access;
    } catch (error) {
      console.error('refreshToken error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/jwt/verify/', { token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/users/set_password/', {
        current_password: oldPassword,
        new_password: newPassword,
        re_new_password: newPassword,
      });
    } catch (error) {
      console.error('changePassword error:', error);
      throw error;
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch('/accounts/users/me/', userData);
      return response.data;
    } catch (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/users/reset_password/', { email });
    } catch (error) {
      console.error('resetPassword error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
