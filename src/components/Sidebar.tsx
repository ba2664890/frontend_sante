// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  ShieldCheckIcon,
  DocumentTextIcon as DocumentReportIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  /* ----------  NAVIGATION PAR RÔLE  ---------- */
  const rawNav = (() => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
          { name: 'Patientes', href: '/patients', icon: UsersIcon },
          { name: 'Statistiques', href: '/statistics', icon: ChartBarIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'Administration', href: '/admin', icon: ShieldCheckIcon },
          { name: 'Rapports', href: '/reports', icon: DocumentReportIcon },
          { name: 'Campagne', href: '/accueil', icon: DocumentReportIcon }
        ];
      case 'supervisor':
        return [
          { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
          { name: 'Patientes', href: '/patients', icon: UsersIcon },
          { name: 'Statistiques', href: '/statistics', icon: ChartBarIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'Rapports', href: '/reports', icon: DocumentReportIcon },
        ];
      case 'health_agent':
        return [
          { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
          { name: 'Mes Patientes', href: '/patients', icon: UsersIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
        ];
      case 'patient':
        return [
          {name: 'Acceuil', href: `/acceuil_patient`, icon: HomeIcon },
          { name: 'Mon Suivi', href: `/patients/${user?.id}`, icon: HomeIcon },
          { name: 'Rendez-vous', href: `/appointments/${user?.id}`, icon: CalendarIcon },
          { name: 'Messages', href: '/notifications', icon: BellIcon },
          { name: 'Chatbot', href: '/chatbot', icon: BellIcon },
        ];
      default:
        return [];
    }
  })();

  const navigation = rawNav.map((item, idx) => ({ ...item, idx }));

  /* ----------  STYLES  ---------- */
  const navItemBase =
    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ' +
    'transition-all duration-300 ease-out';
  const activeClass =
    'bg-gradient-primary text-black shadow-[0_0_12px_var(--c-primary)]';
  const inactiveClass =
    'text-gray-400 hover:text-white hover:bg-white/10';

  /* ----------  NAV ITEM ANIMÉ  ---------- */
  const NavItem: React.FC<{ item: any }> = ({ item }) => {
    const active = isActive(item.href);
    return (
      <Link
        to={item.href}
        className={`${navItemBase} ${active ? activeClass : inactiveClass} ${
          isOpen ? 'translate-x-0' : '-translate-x-4'
        } animate-slide-in`}
        style={{ animationDelay: `${item.idx * 60}ms` }}
      >
        <item.icon className="w-5 h-5" />
        <span className="flex-1">{item.name}</span>
        {active && (
          <span className="h-1 w-1 rounded-full bg-white animate-ping" />
        )}
      </Link>
    );
  };

  /* ----------  RETURN  ---------- */
  return (
    <>
      {/* Burger mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 grid place-items-center rounded-xl glass shadow-neon"
        >
          {isOpen ? (
            <XIcon className="w-5 h-5 text-white animate-spin-short" />
          ) : (
            <MenuIcon className="w-5 h-5 text-gray-200" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-gray-900 shadow-neon
          transform transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >

        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary shadow-[0_0_12px_var(--c-primary)] grid place-items-center">
              <span className="text-black font-extrabold text-xs">C+</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">CerviCare+</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Profil */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-secondary shadow-[0_0_12px_var(--c-secondary)] grid place-items-center">
              <span className="text-black font-bold text-sm">
                {user?.first_name?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-gray-400 text-xs capitalize">
                {user?.role === 'admin' && 'Administrateur'}
                {user?.role === 'supervisor' && 'Superviseur'}
                {user?.role === 'health_agent' && 'Agent de santé'}
                {user?.role === 'patient' && 'Patient'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Déconnexion"
            >
              <LogoutIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;