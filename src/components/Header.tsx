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
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications = [] } = useQuery(
    ['notifications', 'pending'],
    () => notificationService.getPendingNotifications(),
    { refetchInterval: 30_000 }
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const goToSettings = (tab: string = 'profile') => {
    navigate('/settings', { state: { defaultTab: tab } });
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl fixed top-0 w-full border-b border-slate-200/50 z-50 shadow-[0_4px_20px_rgba(0,86,179,0.04)] h-16 flex justify-between items-center px-6">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent tracking-tight">
          CerviCare Clinical
        </span>
        <div className="hidden md:flex h-8 w-[1px] bg-slate-200 mx-2"></div>
        <span className="hidden md:block text-slate-500 font-medium text-xs">
          National Cervical Cancer Elimination Caravan
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center bg-slate-100/50 rounded-full px-4 py-1.5 border border-slate-200">
          <span className="material-symbols-outlined text-slate-400 text-sm mr-2">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-xs text-slate-600 w-48 p-0" 
            placeholder="Rechercher un dossier..." 
            type="text"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-blue-50/50 rounded-lg transition-all text-slate-500 relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-white/50">
                  <h3 className="font-bold text-sm text-primary">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">Aucune notification</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => goToSettings('security')}
            className="p-2 hover:bg-blue-50/50 rounded-lg transition-all text-slate-500"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className="flex items-center gap-3 pl-2 ml-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {user?.role === 'admin' ? 'Coordinateur' : 'Clinical Lead'}
              </p>
            </div>
            <div 
              className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden cursor-pointer"
              onClick={() => goToSettings('profile')}
            >
              {user?.avatar 
                ? <img src={user.avatar} className="w-full h-full object-cover" />
                : user?.first_name?.[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;