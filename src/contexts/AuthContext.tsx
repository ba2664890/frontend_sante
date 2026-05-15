import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { authService } from '../services/authService.ts';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newUser: User) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Charger l'utilisateur depuis localStorage si déjà connecté
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (accessToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Connexion
  const login = async (username: string, password: string) => {
    console.log('AuthContext - Initializing login process for:', username);
    setLoading(true);
    try {
      const res = await authService.login(username, password);
      console.log('AuthContext - Login successful, updating state');

      // Stocker les tokens et l'utilisateur
      localStorage.setItem('accessToken', res.access);
      localStorage.setItem('refreshToken', res.refresh);
      localStorage.setItem('user', JSON.stringify(res.user));

      setUser(res.user);
      console.log('LOGIN SUCCESS', res.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("LOGIN FAILED", error);
      throw error; // On laisse le composant catcher l'erreur
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("LOGOUT FAILED", error);
    } finally {
      // Nettoyer localStorage et état
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setLoading(false);
      navigate("/login");
    }
  };

  // Mise à jour locale de l'utilisateur
  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
