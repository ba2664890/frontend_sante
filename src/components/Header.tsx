// src/components/Header.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { notificationService } from '../services/notificationService.ts';
import {
  BellIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon as SearchIcon,
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  // Notifications
  const { data: notifications = [] } = useQuery(
    ['notifications', 'pending'],
    () => notificationService.getPendingNotifications(),
    { refetchInterval: 30_000 }
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 w-full z-30 bg-white/80 backdrop-blur-md border-b border-[#bec9c9]/20 h-16 flex justify-between items-center px-8">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3e4949] transition-colors group-focus-within:text-[#006669]" />
          <input 
            type="text" 
            placeholder="Rechercher une patiente, un résultat..." 
            className="w-full pl-12 pr-4 py-2 bg-[#f2fbff] border-none rounded-full focus:ring-2 focus:ring-[#006669]/20 text-sm font-medium placeholder-[#3e4949]/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-[#dcf1fb] rounded-full transition-colors relative group"
            >
              <BellIcon className="h-6 w-6 text-[#3e4949] group-hover:text-[#006669]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#bec9c9]/20 overflow-hidden animate-slide-up">
                <div className="p-4 border-b border-[#bec9c9]/10 bg-[#f2fbff]">
                  <h3 className="font-bold text-[#091e25]">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-[#3e4949]/50">Aucune nouvelle alerte</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-[#bec9c9]/5 hover:bg-[#f2fbff] transition-colors cursor-pointer group">
                        <p className="text-sm font-bold text-[#091e25] group-hover:text-[#006669]">{n.title}</p>
                        <p className="text-xs text-[#3e4949] mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-[#3e4949]/50 mt-2 font-mono">
                          {new Date(n.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-[#dcf1fb] rounded-full transition-colors group"
          >
            <Cog6ToothIcon className="h-6 w-6 text-[#3e4949] group-hover:text-[#006669]" />
          </button>
        </div>

        <div className="h-8 w-px bg-[#bec9c9]/20 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#091e25] leading-none">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] font-bold text-[#006669] uppercase tracking-tighter mt-1">
              {user?.role === 'health_agent' ? 'Agent de Santé' : user?.role}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#006669]/20 p-0.5">
            <div className="w-full h-full rounded-full bg-[#2a7f82] flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.first_name?.[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;