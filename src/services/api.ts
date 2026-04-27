import axios from 'axios';

const API_BASE_URL = 'https://backend-sante-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // corrigé ici
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      console.error('Accès non autorisé');
    }

    return Promise.reject(error);
  }
);

// Gestion des erreurs
export const handleApiError = (error: any): string => {
  // si backend renvoie un objet d'erreurs par champ
  if (error.response?.data && typeof error.response.data === 'object') {
    // concaténation des messages par champ
    return Object.entries(error.response.data)
      .map(([field, msgs]) => {
        if (Array.isArray(msgs)) return `${field}: ${msgs.join(', ')}`;
        return `${field}: ${msgs}`;
      })
      .join('\n');
  }

  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.status === 400) return error.response.data || 'Requête invalide.';
  if (error.response?.status === 404) return 'Ressource non trouvée.';
  if (error.response?.status === 500) return 'Erreur serveur.';
  return 'Une erreur est survenue.';
};


// Construire une query string
export const buildQueryString = (params: Record<string, any>): string => {
  const cleanParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);

  return new URLSearchParams(cleanParams).toString();
};

export default api;
