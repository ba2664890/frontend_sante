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
  if (error.code === 'ECONNABORTED') return 'Le délai de réponse a été dépassé. Veuillez réessayer.';
  if (!error.response) return 'Impossible de contacter le serveur. Vérifiez votre connexion.';

  const { status, data } = error.response;

  // Messages simples renvoyés tels quels par le backend (detail/message/error)
  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
  }

  switch (status) {
    case 400:
      if (data && typeof data === 'object') {
        // Erreurs de validation par champ (DRF)
        return Object.entries(data)
          .map(([field, msgs]) => {
            const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            return `${field} : ${text}`;
          })
          .join('\n');
      }
      return typeof data === 'string' ? data : 'Requête invalide.';
    case 401:
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
    case 404:
      return 'Ressource introuvable.';
    case 429:
      return 'Trop de requêtes envoyées. Veuillez patienter un instant avant de réessayer.';
    case 500:
      console.error('Erreur Serveur 500:', data);
      return 'Le serveur rencontre une difficulté technique. Veuillez réessayer dans quelques instants.';
    case 503:
      return 'Le service est momentanément indisponible. Veuillez réessayer dans quelques instants.';
    default:
      return 'Une erreur inattendue est survenue.';
  }
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
