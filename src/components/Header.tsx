// src/components/Header.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { notificationService } from '../services/notificationService.ts';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Notifications
  const { data: notifications = [] } = useQuery(
    ['notifications', 'pending'],
    () => notificationService.getPendingNotifications(),
    { refetchInterval: 30_000 }
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Navigation rapide
  const goToSettings = (tab: string = 'profile') => {
    navigate('/settings', { state: { defaultTab: tab } });
    setShowProfile(false);
  };

  return (
    <header className={`shadow-sm border-b ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center space-x-4">
            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tableau de bord
            </h1>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm text-primary-600">Accueil</span>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-3">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Basculer le thème"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Notifications"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className={`p-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aucune notification
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b cursor-pointer transition ${isDark ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'} ${!n.is_read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                          onClick={() => {
                            /* marquer comme lue + redirection si besoin */
                            toast.success('Notification ouverte');
                          }}
                        >
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{n.title}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{n.message}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(n.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={`p-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => goToSettings('notifications')}
                      className="w-full text-center text-sm text-primary-600 hover:underline"
                    >
                      Gérer les préférences
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profil */}
            <div className="relative">
              <button
                onClick={() => setShowProfile((v) => !v)}
                className={`flex items-center space-x-2 p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                    {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <span className={`hidden sm:block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {user?.first_name || 'Profil'}
                </span>
              </button>

              {showProfile && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.role === 'admin' && 'Administrateur'}
                      {user?.role === 'supervisor' && 'Superviseur'}
                      {user?.role === 'health_agent' && 'Agent de santé'}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => goToSettings('profile')}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <UserCircleIcon className="w-4 h-4 mr-2" />
                      Mon profil
                    </button>
                    <button
                      onClick={() => goToSettings('notifications')}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <BellIcon className="w-4 h-4 mr-2" />
                      Notifications
                    </button>
                    <button
                      onClick={() => goToSettings('security')}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-2" />
                      Paramètres
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;