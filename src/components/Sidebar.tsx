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

  // Navigation pour les administrateurs
  const adminNavigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Patientes', href: '/patients', icon: UsersIcon },
    { name: 'Statistiques', href: '/statistics', icon: ChartBarIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Administration', href: '/admin', icon: ShieldCheckIcon },
    { name: 'Rapports', href: '/reports', icon: DocumentReportIcon },
  ];

  // Navigation pour les superviseurs
  const supervisorNavigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Patientes', href: '/patients', icon: UsersIcon },
    { name: 'Statistiques', href: '/statistics', icon: ChartBarIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Rapports', href: '/reports', icon: DocumentReportIcon },
  ];

  // Navigation pour les agents de santé
  const healthAgentNavigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Mes Patientes', href: '/patients', icon: UsersIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
  ];

  // Navigation pour les patients
  const patientNavigation = [
    { name: 'Mon Suivi', href: `/patients/${user?.id}`, icon: HomeIcon },
    { name: 'Rendez-vous', href: '/appointments', icon: CalendarIcon },
    { name: 'Messages', href: '/notifications', icon: BellIcon },
  ];

  // Sélectionner la navigation en fonction du rôle
  const navigation = (() => {
    switch (user?.role) {
      case 'admin':
        return adminNavigation;
      case 'supervisor':
        return supervisorNavigation;
      case 'health_agent':
        return healthAgentNavigation;
      case 'patient':
        return patientNavigation;
      default:
        return [];
    }
  })();
  const isActive = (path: string) => location.pathname === path;

  const NavItem: React.FC<{ item: any; isActive: boolean }> = ({ item, isActive }) => (
    <Link
      to={item.href}
      className={`
        flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
        ${isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <item.icon className="w-5 h-5 mr-3" />
      {item.name}
    </Link>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isOpen ? (
            <XIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <MenuIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C+</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CerviCare+</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={isActive(item.href)}
              />
            ))}

            {user?.role === 'admin' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Administration
                </p>
                {adminNavigation.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    isActive={isActive(item.href)}
                  />
                ))}
              </div>
            )}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-medium text-sm">
                    {user?.username?.[0] || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' && 'Administrateur'}
                  {user?.role === 'supervisor' && 'Superviseur'}
                  {user?.role === 'health_agent' && 'Agent de Santé'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <LogoutIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;