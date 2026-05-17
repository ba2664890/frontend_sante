import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useQuery } from 'react-query';
import { notificationService } from '../services/notificationService.ts';

interface PatientLayoutProps {
  children: React.ReactNode;
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/acceuil_patient' },
    { name: 'Mon Dossier', path: '/patient/records' },
    { name: 'Suivi & RDV', path: '/patient/appointments' },
    { name: 'Assistant', path: '/chatbot' }, // On réutilise le chatbot existant
    { name: 'Profil', path: '/settings' }, // On réutilise settings pour le profil pour l'instant
  ];

  const { data: notifications = [] } = useQuery(
    ['notifications', 'pending'],
    () => notificationService.getPendingNotifications().catch(() => []),
    { refetchInterval: 30_000 }
  );
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

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
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="p-2 hover:bg-sahara-rose rounded-full transition-all duration-300 relative"
              >
                <span className="material-symbols-outlined text-compassion-rose">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-compassion-rose text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-sahara-rose overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-sahara-rose bg-sahara-rose/10 flex items-center justify-between">
                    <h3 className="font-semibold text-on-surface text-sm">Notifications</h3>
                    <span className="text-xs text-compassion-rose font-bold">{unreadCount} non lues</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-sahara-rose opacity-40">notifications_off</span>
                        <p className="text-sm text-on-surface-variant mt-2">Aucune nouvelle alerte</p>
                      </div>
                    ) : (
                      notifications.map((n: any) => (
                        <div key={n.id} className="px-4 py-3 border-b border-sahara-rose/10 hover:bg-sahara-rose/20 transition-colors cursor-pointer group">
                          <p className="text-sm font-semibold text-on-surface group-hover:text-compassion-rose">{n.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="font-mono text-[10px] text-on-surface-variant mt-1">
                            {new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-sahara-rose/10 bg-sahara-rose/10">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full text-xs text-compassion-rose font-semibold hover:underline text-center"
                    >
                      Voir toutes les notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="p-2 hover:bg-sahara-rose rounded-full transition-all duration-300"
              >
                <span className="material-symbols-outlined text-compassion-rose">account_circle</span>
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-sahara-rose overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-4 border-b border-sahara-rose bg-sahara-rose/10">
                    <p className="text-sm font-bold text-on-surface">{user?.username}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{user?.role}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-sahara-rose/25 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Paramètres
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-[#ffdad6]/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
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
