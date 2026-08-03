// src/components/Sidebar.tsx — Design "Clinical Precision" (refonte_agent)
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  /* ---- NAVIGATION PAR RÔLE ---- */
  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
          { name: 'Col de l\'utérus', href: '/patients', icon: 'group' },
          { name: 'Prostate', href: '/prostate', icon: 'male' },
          { name: 'Cancer du Sein', href: '/sein', icon: 'female' },
          { name: 'Statistiques', href: '/statistics', icon: 'analytics' },
          { name: 'Notifications', href: '/notifications', icon: 'notifications' },
          { name: 'Campagnes', href: '/accueil', icon: 'campaign' },
          { name: 'Rapports', href: '/reports', icon: 'summarize' },
          { name: 'Assistant Njariñu', href: '/agent/chatbot', icon: 'robot_2' },
          { name: 'Administration', href: '/admin', icon: 'admin_panel_settings' },
        ];
      case 'supervisor':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
          { name: 'Col de l\'utérus', href: '/patients', icon: 'group' },
          { name: 'Prostate', href: '/prostate', icon: 'male' },
          { name: 'Cancer du Sein', href: '/sein', icon: 'female' },
          { name: 'Statistiques', href: '/statistics', icon: 'analytics' },
          { name: 'Notifications', href: '/notifications', icon: 'notifications' },
          { name: 'Rapports', href: '/reports', icon: 'summarize' },
        ];
      case 'health_agent':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
          { name: 'Col de l\'utérus', href: '/patients', icon: 'group' },
          { name: 'Prostate', href: '/prostate', icon: 'male' },
          { name: 'Cancer du Sein', href: '/sein', icon: 'female' },
          { name: 'Mes Notifications', href: '/notifications', icon: 'notifications' },
          { name: 'Campagnes locales', href: '/accueil', icon: 'campaign' },
          { name: 'Assistant Njariñu', href: '/agent/chatbot', icon: 'robot_2' },
        ];
      case 'patient':
        return [
          { name: 'Accueil', href: '/acceuil_patient', icon: 'home' },
          { name: 'Mon dossier', href: '/patient/records', icon: 'folder_open' },
          { name: 'Rendez-vous', href: '/patient/appointments', icon: 'calendar_today' },
          { name: 'Notifications', href: '/notifications', icon: 'notifications' },
          { name: 'Assistant Njariñu', href: '/chatbot', icon: 'robot_2' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const isAgent = user?.role === 'health_agent' || user?.role === 'admin' || user?.role === 'supervisor';

  const handleNewScreening = () => {
    navigate('/patients');
  };

  return (
    <>
      {/* Burger mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 grid place-items-center rounded-xl bg-white shadow-lg border border-[#bec9c9]/30"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined text-[#006669]">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-[#e4f7ff] border-r border-[#bec9c9]/20
          shadow-[2px_0_8px_rgba(42,127,130,0.08)]
          transform transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center px-6 h-16 border-b border-[#bec9c9]/20 flex-shrink-0">
          <span
            className="text-[#006669] text-xl font-semibold"
            style={{ fontFamily: 'Literata, serif' }}
          >
            CerviCare+
          </span>
        </div>

        {/* Profile Card */}
        <div className="px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 bg-[#dcf1fb] rounded-xl border border-[#bec9c9]/20">
            <div className="w-10 h-10 rounded-xl bg-[#006669] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.first_name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[#091e25] text-sm font-semibold truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[#3e4949] text-[10px] uppercase font-bold tracking-wider truncate">
                {user?.region || 'Pikine'} · Dakar
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                  active
                    ? 'bg-[#9a4523] text-white shadow-md shadow-[#9a4523]/20'
                    : 'text-[#3e4949] hover:text-[#006669] hover:bg-[#dcf1fb]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}

          {/* Bouton Nouveau Dépistage (agents seulement) */}
          {isAgent && (
            <button
              onClick={handleNewScreening}
              className="w-full mt-4 bg-[#006669] text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#006669]/20 flex items-center justify-center gap-2 hover:bg-[#2a7f82] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nouveau dépistage
            </button>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#bec9c9]/20 space-y-1 flex-shrink-0">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-[#3e4949] text-sm font-semibold transition-all rounded-xl hover:text-[#006669] hover:bg-[#dcf1fb]"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Paramètres</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[#3e4949] text-sm font-semibold transition-all rounded-xl hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#091e25]/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;