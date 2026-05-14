import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

interface PatientLayoutProps {
  children: React.ReactNode;
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Accueil', path: '/acceuil_patient' },
    { name: 'Mon Dossier', path: '/patient/records' },
    { name: 'Suivi & RDV', path: '/patient/appointments' },
    { name: 'Assistant', path: '/chatbot' }, // On réutilise le chatbot existant
    { name: 'Profil', path: '/settings' }, // On réutilise settings pour le profil pour l'instant
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-cream-silk text-on-surface font-body selection:bg-primary-fixed wax-pattern flex flex-col">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-ultra-soft">
        <div className="flex justify-between items-center px-container-padding py-4 max-w-max-width mx-auto w-full">
          <Link to="/acceuil_patient" className="font-headline text-2xl font-bold text-compassion-rose">
            CerviCare+
          </Link>
          
          <nav className="hidden md:flex items-center gap-element-gap">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-base transition-colors hover:text-compassion-rose ${
                  isActive(link.path)
                    ? 'text-compassion-rose border-b-2 border-compassion-rose pb-1 font-bold'
                    : 'text-on-surface-variant'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-sahara-rose rounded-full transition-all duration-300">
              <span className="material-symbols-outlined text-compassion-rose">notifications</span>
            </button>
            <div className="relative group">
              <button className="p-2 hover:bg-sahara-rose rounded-full transition-all duration-300">
                <span className="material-symbols-outlined text-compassion-rose">account_circle</span>
              </button>
              {/* Dropdown simple pour le logout */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sahara-rose opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-[60]">
                <div className="p-4 border-b border-sahara-rose">
                  <p className="font-bold text-sm text-on-surface">{user?.username}</p>
                  <p className="text-xs text-on-surface-variant">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm text-error hover:bg-sahara-rose/50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-max-width mx-auto px-container-padding pt-8 pb-section-gap w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-sahara-rose mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-padding py-8 gap-4 max-w-max-width mx-auto w-full">
          <div className="font-headline text-xl text-compassion-rose">CerviCare+</div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="#" className="font-body text-sm text-on-surface-variant hover:text-wellness-green transition-colors underline">Confidentialité</Link>
            <Link to="#" className="font-body text-sm text-on-surface-variant hover:text-wellness-green transition-colors underline">Conditions</Link>
            <Link to="#" className="font-body text-sm text-on-surface-variant hover:text-wellness-green transition-colors underline">Contact</Link>
          </div>
          
          <div className="font-body text-sm text-on-surface-variant">
            © 2024 CerviCare+. Accompagnement avec bienveillance.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientLayout;
