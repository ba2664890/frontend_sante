// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const rawNav = (() => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard' },
          { name: 'Patientes', href: '/patients', icon: 'group' },
          { name: 'Statistiques', href: '/statistics', icon: 'monitoring' },
          { name: 'Notifications', href: '/notifications', icon: 'notifications' },
          { name: 'Administration', href: '/admin', icon: 'shield_person' },
          { name: 'Rapports', href: '/reports', icon: 'clinical_notes' },
          { name: 'Campagne', href: '/accueil', icon: 'campaign' }
        ];
      case 'supervisor':
        return [
          { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard' },
          { name: 'Patientes', href: '/patients', icon: 'group' },
          { name: 'Statistiques', href: '/statistics', icon: 'monitoring' },
          { name: 'Notifications', href: '/notifications', icon: 'notifications' },
          { name: 'Rapports', href: '/reports', icon: 'clinical_notes' },
        ];
      case 'health_agent':
        return [
          { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard' },
          { name: 'Mes Patientes', href: '/patients', icon: 'group' },
          { name: 'Notifications', href: '/notifications', icon: 'notifications' },
        ];
      case 'patient':
        return [
          { name: 'Accueil', href: '/acceuil_patient', icon: 'home' },
          { name: 'Mon Suivi', href: `/patients/${user?.id}`, icon: 'patient_list' },
          { name: 'Rendez-vous', href: `/appointments/${user?.id}`, icon: 'calendar_month' },
          { name: 'Messages', href: '/notifications', icon: 'mail' },
          { name: 'Chatbot', href: '/chatbot', icon: 'smart_toy' },
        ];
      default:
        return [];
    }
  })();

  const navigation = rawNav.map((item, idx) => ({ ...item, idx }));

  const NavItem: React.FC<{ item: any }> = ({ item }) => {
    const active = isActive(item.href);
    return (
      <Link
        to={item.href}
        className={`
          flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium
          ${active 
            ? 'bg-white text-primary shadow-sm' 
            : 'text-slate-500 hover:text-primary hover:bg-white/50'}
        `}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>
          {item.icon}
        </span>
        <span className={active ? 'font-semibold' : ''}>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Burger mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-slate-600"
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Sidebar */}
      <nav className={`
        fixed left-0 top-0 pt-20 pb-8 flex flex-col h-full z-40 bg-slate-50/80 backdrop-blur-lg w-64 border-r border-slate-200
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
            <h2 className="text-primary font-bold text-lg uppercase tracking-tight">
              {user?.role === 'patient' ? 'Votre Suivi' : 'En cours'}
            </h2>
          </div>
          <p className="text-slate-500 text-xs truncate">
            {user?.role === 'patient' ? 'Espace Patient CerviCare' : 'ID Dossier: #SEN-2024-CAR-042'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        <div className="mt-auto px-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group" onClick={logout}>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-error transition-colors">logout</span>
            <span className="text-sm font-medium text-slate-500 group-hover:text-error transition-colors">Déconnexion</span>
          </div>
        </div>
      </nav>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;