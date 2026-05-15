// src/components/Header.tsx — Design Clinical Precision (refonte_agent/tableau_de_bord)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { notificationService } from '../services/notificationService.ts';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const { data: notifications = [] } = useQuery(
    ['notifications', 'pending'],
    () => notificationService.getPendingNotifications(),
    { refetchInterval: 30_000 }
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#f2fbff] border-b border-[#bec9c9]/20 shadow-[0px_2px_4px_0px_rgba(42,127,130,0.08)] flex justify-between items-center px-6 flex-shrink-0">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7979] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Rechercher une patiente, un résultat..."
            className="w-full pl-10 pr-4 py-2 bg-[#dcf1fb] border border-[#bec9c9]/30 rounded-full text-sm font-medium placeholder-[#6f7979] focus:outline-none focus:ring-2 focus:ring-[#006669]/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications + Settings + Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="p-2 hover:bg-[#dcf1fb] rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined text-[#3e4949] text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#f2fbff]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#bec9c9]/20 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-[#bec9c9]/10 bg-[#f2fbff] flex items-center justify-between">
                <h3 className="font-semibold text-[#091e25] text-sm">Notifications</h3>
                <span className="text-xs text-[#006669] font-bold">{unreadCount} non lues</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-[#bec9c9]">notifications_off</span>
                    <p className="text-sm text-[#3e4949]/50 mt-2">Aucune nouvelle alerte</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-[#bec9c9]/5 hover:bg-[#f2fbff] transition-colors cursor-pointer group">
                      <p className="text-sm font-semibold text-[#091e25] group-hover:text-[#006669]">{n.title}</p>
                      <p className="text-xs text-[#3e4949] mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="font-mono text-[10px] text-[#6f7979] mt-1">{new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-[#bec9c9]/10 bg-[#f2fbff]">
                <button onClick={() => { navigate('/notifications'); setShowNotifications(false); }} className="w-full text-xs text-[#006669] font-semibold hover:underline">
                  Voir toutes les notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-[#dcf1fb] rounded-full transition-colors">
          <span className="material-symbols-outlined text-[#3e4949] text-[22px]">settings</span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-[#bec9c9]/30 mx-1"></div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-3 pl-2 hover:bg-[#dcf1fb] rounded-xl px-3 py-2 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#091e25] leading-none">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] font-bold text-[#006669] uppercase tracking-wider mt-0.5">
                {user?.role === 'health_agent' ? 'Agent de Santé' : user?.role === 'admin' ? 'Administrateur' : user?.role}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#2a7f82] flex items-center justify-center text-white font-bold text-sm border-2 border-[#006669]/20">
              {user?.first_name?.[0] || 'A'}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-[#bec9c9]/20 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-4 border-b border-[#bec9c9]/10 bg-[#f2fbff]">
                <p className="text-sm font-semibold text-[#091e25]">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-[#3e4949]">{user?.region || 'Dakar'}</p>
              </div>
              <div className="p-2">
                <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#3e4949] hover:bg-[#f2fbff] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Paramètres
                </button>
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;