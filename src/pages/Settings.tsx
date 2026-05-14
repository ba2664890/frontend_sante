import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  Cog6ToothIcon as CogIcon,
  ServerIcon as DatabaseIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout.tsx';
import { BentoCard, GlassPanel, IconBox } from '../components/ui/PatientUI.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { authService } from '../services/authService.ts';

const Settings: React.FC = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.state?.defaultTab || 'profile');

  const isPatient = user?.role === 'patient';

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserIcon, description: 'Gérez vos informations personnelles' },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon, description: 'Protégez votre compte et vos données' },
  ];

  if (!isPatient) {
    tabs.splice(1, 0, { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Configurez vos alertes' });
    tabs.push({ id: 'system', name: 'Système', icon: CogIcon, description: 'Paramètres généraux' });
    if (user?.role === 'admin') {
      tabs.push({ id: 'database', name: 'Base de données', icon: DatabaseIcon, description: 'Maintenance et sauvegardes' });
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings user={user} onRefreshUser={login} />;
      case 'security':
        return <SecuritySettings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/40">
            <span className="material-symbols-outlined text-6xl mb-4">construction</span>
            <p className="font-headline text-xl">En cours de développement</p>
          </div>
        );
    }
  };

  const renderContent = () => (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="font-headline text-4xl text-compassion-rose mb-2">Paramètres</h1>
          <p className="font-body text-on-surface-variant">Personnalisez votre expérience CerviCare+</p>
        </div>
        
        {/* Quick Stats or Status */}
        <div className="flex gap-4">
          <GlassPanel className="py-3 px-6 rounded-2xl border-sahara-rose">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-wellness-green animate-pulse"></div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Compte Vérifié</span>
            </div>
          </GlassPanel>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 text-left border
                ${activeTab === tab.id
                  ? 'bg-white shadow-ultra-soft border-sahara-rose translate-x-2'
                  : 'bg-transparent border-transparent hover:bg-sahara-rose/30 opacity-70 hover:opacity-100'
                }
              `}
            >
              <div className={`
                p-3 rounded-2xl 
                ${activeTab === tab.id ? 'bg-sahara-rose text-compassion-rose' : 'bg-surface-container-highest text-on-surface-variant'}
              `}>
                <tab.icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`font-headline text-lg ${activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {tab.name}
                </p>
                <p className="text-xs text-on-surface-variant/60 font-body">{tab.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 animate-slide-up">
          <BentoCard className="min-h-[500px] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-sahara-rose/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-atlantic-sage/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {renderTabContent()}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );

  return isPatient ? <PatientLayout>{renderContent()}</PatientLayout> : <div className="p-10">{renderContent()}</div>;
};

/* ========================= */
/* PROFILE SETTINGS */
/* ========================= */
const ProfileSettings: React.FC<{ user: any, onRefreshUser: (user: any) => void }> = ({ user, onRefreshUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || '',
    center: user?.center || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      onRefreshUser(updatedUser);
      toast.success('Profil mis à jour avec succès !', {
        style: {
          borderRadius: '20px',
          background: '#8f464c',
          color: '#fff',
          fontFamily: 'Nunito Sans'
        }
      });
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour : ' + (error.response?.data?.detail || 'Serveur indisponible'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <IconBox icon="person" variant="rose" className="w-14 h-14 rounded-2xl" />
        <div>
          <h2 className="font-headline text-2xl text-on-surface">Informations Personnelles</h2>
          <p className="text-sm text-on-surface-variant font-body">Ces informations sont utilisées pour votre dossier médical.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Prénom</label>
          <input 
            type="text" name="first_name" value={formData.first_name} onChange={handleChange}
            className="w-full p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose/30 outline-none font-body transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Nom</label>
          <input 
            type="text" name="last_name" value={formData.last_name} onChange={handleChange}
            className="w-full p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose/30 outline-none font-body transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Email</label>
          <input 
            type="email" name="email" value={formData.email} onChange={handleChange}
            className="w-full p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose/30 outline-none font-body transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Téléphone</label>
          <input 
            type="tel" name="phone" value={formData.phone} onChange={handleChange}
            className="w-full p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose/30 outline-none font-body transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Région</label>
          <select 
            name="region" value={formData.region} onChange={handleChange}
            className="w-full p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose/30 outline-none font-body transition-all appearance-none"
          >
            <option value="">Sélectionner...</option>
            <option value="Dakar">Dakar</option>
            <option value="Thiès">Thiès</option>
            <option value="Kaolack">Kaolack</option>
            <option value="Saint-Louis">Saint-Louis</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Centre Préféré</label>
          <input 
            type="text" name="center" value={formData.center} onChange={handleChange}
            className="w-full p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose/30 outline-none font-body transition-all"
            placeholder="Ex: Hôpital Principal"
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="bg-compassion-rose text-white px-12 py-4 rounded-full font-headline text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3"
        >
          {isLoading ? <LoadingSpinner size="sm" color="white" /> : <span className="material-symbols-outlined">save</span>}
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
};

/* ========================= */
/* SECURITY SETTINGS */
/* ========================= */
const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 mb-2">
        <IconBox icon="shield_lock" variant="green" className="w-14 h-14 rounded-2xl" />
        <div>
          <h2 className="font-headline text-2xl text-on-surface">Sécurité & Confidentialité</h2>
          <p className="text-sm text-on-surface-variant font-body">Protégez votre compte et vos données médicales.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-3xl border border-sahara-rose bg-cream-silk/20 hover:bg-white transition-colors group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-sahara-rose flex items-center justify-center text-compassion-rose group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">password</span>
              </div>
              <div>
                <h4 className="font-headline text-lg text-on-surface">Mot de passe</h4>
                <p className="text-xs text-on-surface-variant font-body">Dernière modification il y a 3 mois.</p>
              </div>
            </div>
            <button className="px-6 py-2 rounded-full border-2 border-compassion-rose text-compassion-rose font-bold text-sm hover:bg-compassion-rose hover:text-white transition-all">
              Changer
            </button>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-sahara-rose bg-cream-silk/20 hover:bg-white transition-colors group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-atlantic-sage flex items-center justify-center text-wellness-green group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h4 className="font-headline text-lg text-on-surface">Double Authentification (2FA)</h4>
                <p className="text-xs text-on-surface-variant font-body">Ajoute une couche de sécurité par SMS.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-on-surface-variant uppercase mr-2">Désactivé</span>
               <button className="w-14 h-7 bg-surface-container-highest rounded-full relative transition-all">
                 <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
               </button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-sahara-rose bg-cream-silk/20 hover:bg-white transition-colors group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">devices</span>
              </div>
              <div>
                <h4 className="font-headline text-lg text-on-surface">Appareils Connectés</h4>
                <p className="text-xs text-on-surface-variant font-body">Vous êtes connectée sur ce navigateur.</p>
              </div>
            </div>
            <button className="text-xs font-bold text-error underline hover:text-error/80 transition-colors uppercase tracking-widest">
              Tout déconnecter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-wellness-green/5 p-6 rounded-3xl border border-wellness-green/20 flex gap-4">
        <span className="material-symbols-outlined text-wellness-green">info</span>
        <p className="text-xs text-wellness-green font-body leading-relaxed">
          Vos données médicales sont cryptées et stockées conformément aux normes de protection des données de santé au Sénégal. Seul le personnel soignant autorisé peut y accéder avec votre consentement.
        </p>
      </div>
    </div>
  );
};

export default Settings;
