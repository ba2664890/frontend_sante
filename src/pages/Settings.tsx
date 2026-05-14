import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Cog6ToothIcon as CogIcon, UserIcon, BellIcon, ShieldCheckIcon, ServerIcon as DatabaseIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout.tsx';

type Tab = {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type CommonSettingsProps = {
  onSave: () => void;
  isLoading: boolean;
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.state?.defaultTab || 'profile');

  const isPatient = user?.role === 'patient';

  const tabs: Tab[] = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
  ];

  if (!isPatient) {
    tabs.splice(1, 0, { id: 'notifications', name: 'Notifications', icon: BellIcon });
    tabs.push({ id: 'system', name: 'Système', icon: CogIcon });
    if (user?.role === 'admin') {
      tabs.push({ id: 'database', name: 'Base de données', icon: DatabaseIcon });
    }
  }

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Paramètres sauvegardés avec succès !');
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings user={user} onSave={handleSave} isLoading={isLoading} />;
      case 'notifications':
        return <NotificationSettings onSave={handleSave} isLoading={isLoading} />;
      case 'security':
        return <SecuritySettings onSave={handleSave} isLoading={isLoading} />;
      case 'system':
        return <SystemSettings onSave={handleSave} isLoading={isLoading} />;
      case 'database':
        return <DatabaseSettings onSave={handleSave} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={isPatient ? "animate-fade-in" : ""}>
        <h1 className={`text-2xl font-bold ${isPatient ? 'font-headline text-compassion-rose' : 'text-gray-900'}`}>
          Paramètres
        </h1>
        <p className={`text-gray-600 ${isPatient ? 'font-body' : ''}`}>Gérez vos préférences et configurations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap
                ${activeTab === tab.id
                  ? (isPatient ? 'border-compassion-rose text-compassion-rose' : 'border-primary-500 text-primary-600')
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={isPatient ? "bg-white p-8 rounded-lg shadow-ultra-soft border border-sahara-rose" : "card"}>
        {renderTabContent()}
      </div>
    </div>
  );

  return isPatient ? <PatientLayout>{renderContent()}</PatientLayout> : renderContent();
};

/* ========================= */
/* PROFILE SETTINGS COMPONENT */
/* ========================= */
type ProfileSettingsProps = {
  user: any;
  onSave: () => void;
  isLoading: boolean;
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onSave, isLoading }) => {
  const isPatient = user?.role === 'patient';
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-sahara-rose flex items-center justify-center">
          <span className="material-symbols-outlined text-compassion-rose text-3xl">person</span>
        </div>
        <div>
          <h3 className="font-headline text-2xl text-on-surface">Mon Profil</h3>
          <p className="font-body text-sm text-on-surface-variant">Informations personnelles de votre compte</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest">Prénom</label>
          <input 
            type="text" 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleChange} 
            className="w-full p-4 bg-cream-silk/30 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose outline-none font-body transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest">Nom</label>
          <input 
            type="text" 
            name="last_name" 
            value={formData.last_name} 
            onChange={handleChange} 
            className="w-full p-4 bg-cream-silk/30 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose outline-none font-body transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest">Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className="w-full p-4 bg-cream-silk/30 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose outline-none font-body transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest">Téléphone</label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            className="w-full p-4 bg-cream-silk/30 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose outline-none font-body transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest">Région</label>
          <select 
            name="region" 
            value={formData.region} 
            onChange={handleChange} 
            className="w-full p-4 bg-cream-silk/30 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose outline-none font-body transition-all"
          >
            <option value="">Sélectionner une région</option>
            <option value="dakar">Dakar</option>
            <option value="thiès">Thiès</option>
            <option value="diourbel">Diourbel</option>
            <option value="fatick">Fatick</option>
            <option value="kaolack">Kaolack</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest">Centre de santé</label>
          <input 
            type="text" 
            name="center" 
            value={formData.center} 
            onChange={handleChange} 
            className="w-full p-4 bg-cream-silk/30 border border-sahara-rose rounded-2xl focus:ring-2 focus:ring-compassion-rose outline-none font-body transition-all" 
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={onSave} 
          disabled={isLoading} 
          className="bg-compassion-rose text-white px-10 py-4 rounded-full font-body font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
};

/* ========================= */
/* NOTIFICATION SETTINGS */
/* ========================= */
type NotificationSettingsProps = {
  onSave: () => void;
  isLoading: boolean;
};

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onSave, isLoading }) => {
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false,
    daily_summary: true,
    weekly_reports: true,
    alert_notifications: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-sahara-rose flex items-center justify-center">
          <span className="material-symbols-outlined text-compassion-rose text-3xl">notifications</span>
        </div>
        <div>
          <h3 className="font-headline text-2xl text-on-surface">Notifications</h3>
          <p className="font-body text-sm text-on-surface-variant">Gérez comment vous souhaitez être informé</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="bg-white p-6 rounded-3xl border border-sahara-rose flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="font-headline text-lg text-on-surface">
                {{
                  email_notifications: 'Emails',
                  sms_notifications: 'SMS / Mobile',
                  push_notifications: 'Notifications Push',
                  daily_summary: 'Résumé Quotidien',
                  weekly_reports: 'Rapports Hebdomadaires',
                  alert_notifications: 'Alertes Critiques',
                }[key as keyof typeof settings]}
              </p>
              <p className="text-sm text-on-surface-variant font-body">
                Recevez des mises à jour régulières via ce canal.
              </p>
            </div>
            <button
              onClick={() => handleToggle(key as keyof typeof settings)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                value ? 'bg-compassion-rose' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onSave} disabled={isLoading} className="bg-compassion-rose text-white px-10 py-4 rounded-full font-body font-bold shadow-lg hover:scale-105 transition-all">
          Enregistrer les préférences
        </button>
      </div>
    </div>
  );
};

/* ========================= */
/* SECURITY SETTINGS */
/* ========================= */
const SecuritySettings: React.FC<CommonSettingsProps> = ({ onSave, isLoading }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-sahara-rose flex items-center justify-center">
          <span className="material-symbols-outlined text-compassion-rose text-3xl">lock</span>
        </div>
        <div>
          <h3 className="font-headline text-2xl text-on-surface">Sécurité</h3>
          <p className="font-body text-sm text-on-surface-variant">Protégez l'accès à votre dossier de santé</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-cream-silk/20 p-6 rounded-3xl border border-sahara-rose flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h4 className="font-headline text-xl text-on-surface mb-2">Mot de passe</h4>
            <p className="font-body text-sm text-on-surface-variant">Dernière modification il y a 3 mois. Utilisez un mot de passe fort pour votre sécurité.</p>
          </div>
          <button className="bg-white text-compassion-rose border-2 border-compassion-rose px-6 py-2 rounded-full font-body font-bold hover:bg-compassion-rose hover:text-white transition-all">
            Changer
          </button>
        </div>

        <div className="bg-cream-silk/20 p-6 rounded-3xl border border-sahara-rose flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h4 className="font-headline text-xl text-on-surface mb-2">Vérification en deux étapes</h4>
            <p className="font-body text-sm text-on-surface-variant">Ajoutez un code de sécurité envoyé par SMS lors de la connexion.</p>
          </div>
          <button className="bg-wellness-green text-white px-6 py-2 rounded-full font-body font-bold hover:opacity-90 transition-all">
            Activer
          </button>
        </div>

        <div className="bg-cream-silk/20 p-6 rounded-3xl border border-sahara-rose flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h4 className="font-headline text-xl text-on-surface mb-2">Sessions actives</h4>
            <p className="font-body text-sm text-on-surface-variant">Vous êtes actuellement connectée sur cet appareil.</p>
          </div>
          <button className="text-on-surface-variant hover:text-error font-body font-bold underline transition-colors">
            Tout déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================= */
/* SYSTEM SETTINGS */
/* ========================= */
const SystemSettings: React.FC<CommonSettingsProps> = ({ onSave, isLoading }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Paramètres système</h3>
        <p className="mt-1 text-sm text-gray-600">Configurez les paramètres généraux du système</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="form-label">Langue par défaut</label>
          <select className="input-field">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="wo">Wolof</option>
          </select>
        </div>

        <div>
          <label className="form-label">Fuseau horaire</label>
          <select className="input-field">
            <option value="Africa/Dakar">Afrique/Dakar (GMT+0)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="form-label">Format de date</label>
          <select className="input-field">
            <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
            <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
            <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
          </select>
        </div>

        <div>
          <label className="form-label">Nombre d'éléments par page</label>
          <select className="input-field">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} disabled={isLoading} className="btn-primary">
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
};

/* ========================= */
/* DATABASE SETTINGS */
/* ========================= */
const DatabaseSettings: React.FC<CommonSettingsProps> = ({ onSave, isLoading }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Gestion de la base de données</h3>
        <p className="mt-1 text-sm text-gray-600">Outils d'administration de la base de données</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900">Sauvegarde</h4>
          <p className="text-sm text-gray-600 mb-4">Créez une sauvegarde complète de la base de données</p>
          <button className="btn-secondary">Créer une sauvegarde</button>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Importation de données</h4>
          <p className="text-sm text-gray-600 mb-4">Importez des données depuis un fichier CSV ou Excel</p>
          <button className="btn-secondary">Importer des données</button>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Nettoyage</h4>
          <p className="text-sm text-gray-600 mb-4">Nettoyez les données obsolètes et optimisez la base de données</p>
          <button className="btn-warning">Nettoyer la base de données</button>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Statistiques</h4>
          <div className="bg-gray-50 rounded-lg p-4 mt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Taille de la base:</span>
                <span className="font-medium ml-2">2.3 GB</span>
              </div>
              <div>
                <span className="text-gray-600">Nombre d'enregistrements:</span>
                <span className="font-medium ml-2">15,234</span>
              </div>
              <div>
                <span className="text-gray-600">Dernière sauvegarde:</span>
                <span className="font-medium ml-2">2024-01-15 14:30</span>
              </div>
              <div>
                <span className="text-gray-600">Statut:</span>
                <span className="font-medium ml-2 text-success-600">OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} disabled={isLoading} className="btn-primary">
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
