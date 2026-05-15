// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  HomeIcon,
  UsersIcon,
  BellIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  ShieldCheckIcon,
  DocumentTextIcon as DocumentReportIcon,
  CalendarIcon,
  BeakerIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  PlusIcon
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
          { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
          { name: 'Patient Queue', href: '/patients', icon: UsersIcon },
          { name: 'Lab Results', href: '/lab-results', icon: BeakerIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'Administration', href: '/admin', icon: ShieldCheckIcon },
          { name: 'Reports', href: '/reports', icon: DocumentReportIcon },
          { name: 'Chatbot Njariñu', href: '/chatbot', icon: ChatBubbleBottomCenterTextIcon }
        ];
      case 'supervisor':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
          { name: 'Patient Queue', href: '/patients', icon: UsersIcon },
          { name: 'Lab Results', href: '/lab-results', icon: BeakerIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'Reports', href: '/reports', icon: DocumentReportIcon },
        ];
      case 'health_agent':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
          { name: 'Patient Queue', href: '/patients', icon: UsersIcon },
          { name: 'Lab Results', href: '/lab-results', icon: BeakerIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'Chatbot Njariñu', href: '/chatbot', icon: ChatBubbleBottomCenterTextIcon }
        ];
      case 'patient':
        return [
          { name: 'Accueil', href: `/acceuil_patient`, icon: HomeIcon },
          { name: 'Mon Suivi', href: `/patients/${user?.id}`, icon: HomeIcon },
          { name: 'Rendez-vous', href: `/appointments/${user?.id}`, icon: CalendarIcon },
          { name: 'Messages', href: '/notifications', icon: BellIcon },
          { name: 'Chatbot Njariñu', href: '/chatbot', icon: ChatBubbleBottomCenterTextIcon },
        ];
      default:
        return [];
    }
  })();

  const navigation = rawNav.map((item, idx) => ({ ...item, idx }));

  /* ----------  NAV ITEM  ---------- */
  const NavItem: React.FC<{ item: any }> = ({ item }) => {
    const active = isActive(item.href);
    return (
      <Link
        to={item.href}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
          active 
            ? 'bg-[#9a4523] text-white shadow-lg shadow-[#9a4523]/20' 
            : 'text-[#3e4949] hover:text-[#006669] hover:bg-[#dcf1fb]'
        }`}
      >
        <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[#3e4949] group-hover:text-[#006669]'}`} />
        <span className="flex-1">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Burger mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 grid place-items-center rounded-xl bg-white shadow-lg border border-[#bec9c9]/30"
        >
          {isOpen ? (
            <XIcon className="w-5 h-5 text-[#006669]" />
          ) : (
            <MenuIcon className="w-5 h-5 text-[#006669]" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-[#e4f7ff] border-r border-[#bec9c9]/20
          transform transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center px-8 h-20 border-b border-[#bec9c9]/10 mb-6">
          <span className="font-headline text-2xl text-[#006669]">CerviCare+</span>
        </div>

        {/* Profile Card Mini */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-[#dcf1fb] rounded-2xl border border-[#bec9c9]/20">
            <div className="w-10 h-10 rounded-xl bg-[#006669] flex items-center justify-center text-white font-bold text-sm">
              {user?.first_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#091e25] text-sm font-bold truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[#3e4949] text-[10px] uppercase font-bold tracking-wider">
                {user?.region || 'Pikine'} · Dakar
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
          
          {(user?.role === 'health_agent' || user?.role === 'admin') && (
            <button className="w-full mt-6 bg-[#006669] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#006669]/20 flex items-center justify-center gap-2 hover:bg-[#2a7f82] transition-all active:scale-95">
              <PlusIcon className="h-5 w-5" />
              New Screening
            </button>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#bec9c9]/10 space-y-1">
          <Link to="/help" className="flex items-center gap-4 px-4 py-3 text-[#3e4949] hover:text-[#006669] text-sm font-bold transition-all">
            <QuestionMarkCircleIcon className="w-5 h-5" />
            <span>Help Center</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-[#3e4949] hover:text-[#ba1a1a] text-sm font-bold transition-all"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Logout</span>
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