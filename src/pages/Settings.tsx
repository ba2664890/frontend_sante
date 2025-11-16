import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Cog6ToothIcon as CogIcon, UserIcon, BellIcon, ShieldCheckIcon, ServerIcon as DatabaseIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
// Settings.tsx (ajout en haut)
import { useLocation } from 'react-router-dom';



type Tab = {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.state?.defaultTab || 'profile');

  const tabs: Tab[] = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'system', name: 'Système', icon: CogIcon },
  ];

  if (user?.role === 'admin') {
    tabs.push({ id: 'database', name: 'Base de données', icon: DatabaseIcon });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez vos préférences et configurations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
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
      <div className="card">
        {renderTabContent()}
      </div>
    </div>
  );
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
        <p className="mt-1 text-sm text-gray-600">Mettez à jour vos informations de profil</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Prénom</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="form-label">Nom</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="form-label">Téléphone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="form-label">Région</label>
          <select name="region" value={formData.region} onChange={handleChange} className="input-field">
            <option value="">Sélectionner une région</option>
            <option value="dakar">Dakar</option>
            <option value="thiès">Thiès</option>
            <option value="diourbel">Diourbel</option>
            <option value="fatick">Fatick</option>
            <option value="kaolack">Kaolack</option>
          </select>
        </div>
        <div>
          <label className="form-label">Centre de santé</label>
          <input type="text" name="center" value={formData.center} onChange={handleChange} className="input-field" />
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Préférences de notification</h3>
        <p className="mt-1 text-sm text-gray-600">Choisissez comment vous souhaitez recevoir les notifications</p>
      </div>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {{
                  email_notifications: 'Notifications par email',
                  sms_notifications: 'Notifications par SMS',
                  push_notifications: 'Notifications push',
                  daily_summary: 'Résumé quotidien',
                  weekly_reports: 'Rapports hebdomadaires',
                  alert_notifications: 'Alertes importantes',
                }[key as keyof typeof settings]}
              </p>
              <p className="text-sm text-gray-600">
                {{
                  email_notifications: 'Recevez les notifications par email',
                  sms_notifications: 'Recevez les notifications par SMS',
                  push_notifications: 'Notifications dans le navigateur',
                  daily_summary: 'Résumé quotidien des activités',
                  weekly_reports: 'Rapports hebdomadaires par email',
                  alert_notifications: 'Alertes pour les événements critiques',
                }[key as keyof typeof settings]}
              </p>
            </div>
            <button
              onClick={() => handleToggle(key as keyof typeof settings)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                value ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
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
/* SECURITY SETTINGS */
/* ========================= */
type CommonSettingsProps = { onSave: () => void; isLoading: boolean };

const SecuritySettings: React.FC<CommonSettingsProps> = ({ onSave, isLoading }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Sécurité du compte</h3>
        <p className="mt-1 text-sm text-gray-600">Gérez la sécurité de votre compte</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900">Changer le mot de passe</h4>
          <p className="text-sm text-gray-600 mb-4">Mettez à jour régulièrement votre mot de passe pour sécuriser votre compte</p>
          <button className="btn-secondary">Changer le mot de passe</button>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Authentification à deux facteurs</h4>
          <p className="text-sm text-gray-600 mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
          <button className="btn-secondary">Activer la 2FA</button>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Sessions actives</h4>
          <p className="text-sm text-gray-600 mb-4">Gérez vos sessions de connexion actives</p>
          <button className="btn-secondary">Voir les sessions</button>
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
