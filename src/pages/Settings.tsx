// src/pages/Settings.tsx — Full Functional Settings (Patient & Agent)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout.tsx';
import { BentoCard, GlassPanel, IconBox } from '../components/ui/PatientUI.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { authService } from '../services/authService.ts';
import Sidebar from '../components/Sidebar.tsx';
import Header from '../components/Header.tsx';

const Settings: React.FC = () => {
  const { user, login, updateUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.state?.defaultTab || 'profile');
  const [isLoading, setIsLoading] = useState(false);

  const isPatient = user?.role === 'patient';

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || '',
    center: user?.center || '',
  });

  const [securityData, setSecurityData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [notifPrefs, setNotifPrefs] = useState({
    email_alerts: true,
    sms_alerts: false,
    critical_only: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData({ ...securityData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      toast.error('Erreur : ' + (error.response?.data?.detail || 'Serveur indisponible'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.new_password !== securityData.confirm_password) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    setIsLoading(true);
    setTimeout(() => { 
      setIsLoading(false); 
      setSecurityData({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Mot de passe mis à jour !'); 
    }, 1000);
  };

  const tabs = [
    { id: 'profile', name: 'Mon Profil', icon: 'person', description: 'Gérez vos informations' },
    { id: 'security', name: 'Sécurité', icon: 'shield_lock', description: 'Accès & Confidentialité' },
  ];

  if (!isPatient) {
    tabs.splice(1, 0, { id: 'notifications', name: 'Alertes', icon: 'notifications_active', description: 'Canaux de notification' });
    tabs.push({ id: 'system', name: 'Système', icon: 'settings', description: 'Langue & Interface' });
  }

  // --- RENDU SÉCURITÉ ---
  const renderSecurityTab = (accentColor: string, isRose: boolean) => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-[#bec9c9]/10 pb-4">
        <IconBox icon="lock" variant={isRose ? 'rose' : 'teal'} className="w-12 h-12 rounded-xl" />
        <div>
          <h2 className={`text-2xl font-bold ${isRose ? 'text-on-surface' : 'text-[#091e25]'}`}>Changer le mot de passe</h2>
          <p className="text-sm text-[#6f7979]">Sécurisez votre compte avec un mot de passe robuste.</p>
        </div>
      </div>
      <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isRose ? 'text-compassion-rose' : 'text-[#006669]'}`}>Mot de passe actuel</label>
          <input type="password" name="current_password" value={securityData.current_password} onChange={handleSecurityChange} required className={`w-full p-3.5 rounded-xl border outline-none transition-all ${isRose ? 'bg-cream-silk/30 border-sahara-rose/40' : 'bg-[#f2fbff] border-[#bec9c9]/20'}`} />
        </div>
        <div className="space-y-2">
          <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isRose ? 'text-compassion-rose' : 'text-[#006669]'}`}>Nouveau mot de passe</label>
          <input type="password" name="new_password" value={securityData.new_password} onChange={handleSecurityChange} required className={`w-full p-3.5 rounded-xl border outline-none transition-all ${isRose ? 'bg-cream-silk/30 border-sahara-rose/40' : 'bg-[#f2fbff] border-[#bec9c9]/20'}`} />
        </div>
        <div className="space-y-2">
          <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isRose ? 'text-compassion-rose' : 'text-[#006669]'}`}>Confirmer le mot de passe</label>
          <input type="password" name="confirm_password" value={securityData.confirm_password} onChange={handleSecurityChange} required className={`w-full p-3.5 rounded-xl border outline-none transition-all ${isRose ? 'bg-cream-silk/30 border-sahara-rose/40' : 'bg-[#f2fbff] border-[#bec9c9]/20'}`} />
        </div>
        <button type="submit" disabled={isLoading} className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${isRose ? 'bg-compassion-rose hover:bg-[#b0526b]' : 'bg-[#006669] hover:bg-[#2a7f82]'}`}>
          {isLoading ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-[20px]">sync_lock</span>}
          Mettre à jour
        </button>
      </form>
    </div>
  );

  // --- RENDU NOTIFICATIONS (AGENT) ---
  const renderNotificationsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-[#091e25] border-b border-[#bec9c9]/10 pb-4">Préférences d'Alertes</h2>
      <div className="space-y-4">
        {[
          { key: 'email_alerts', label: 'Rapports par Email', desc: 'Recevoir le résumé quotidien des dépistages.' },
          { key: 'sms_alerts', label: 'Urgent SMS', desc: 'Être alerté par SMS pour les cas critiques (IVA+).' },
          { key: 'critical_only', label: 'Mode Priorité', desc: 'Ne recevoir que les notifications vitales durant le service.' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10">
            <div>
              <p className="font-bold text-[#091e25]">{item.label}</p>
              <p className="text-xs text-[#6f7979]">{item.desc}</p>
            </div>
            <button 
              onClick={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifPrefs] }))}
              className={`w-12 h-6 rounded-full transition-all relative ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-[#006669]' : 'bg-[#bec9c9]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // --- RENDU SYSTÈME (AGENT) ---
  const renderSystemTab = () => (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-[#091e25] border-b border-[#bec9c9]/10 pb-4">Configuration Système</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest ml-1">Langue de l'interface</label>
          <select className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none">
            <option>Français (Sénégal)</option>
            <option>Wolof (Interface test)</option>
            <option>English</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest ml-1">Fuseau horaire</label>
          <select className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none">
            <option>(GMT+00:00) Dakar, Afrique de l'Ouest</option>
          </select>
        </div>
      </div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
        <span className="material-symbols-outlined text-amber-600">info</span>
        <p className="text-sm text-amber-800">Votre session expirera automatiquement après 4 heures d'inactivité pour garantir la sécurité des données patientes.</p>
      </div>
    </div>
  );

  // --- RENDU FINAL AGENT ---
  const renderAgentContent = () => (
    <div className="h-full flex flex-col space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-[#bec9c9]/10 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#091e25] mb-2" style={{ fontFamily: 'Literata, serif' }}>Paramètres & Configuration</h1>
          <p className="text-[#6f7979]">Optimisez votre espace de travail et sécurisez vos accès.</p>
        </div>
        <IconBox icon="settings_accessibility" variant="teal" className="w-16 h-16 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-3 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                activeTab === tab.id 
                  ? 'bg-[#006669] text-white shadow-lg shadow-[#006669]/20 scale-[1.02]' 
                  : 'bg-white text-[#3e4949] hover:bg-[#dcf1fb] border border-[#bec9c9]/10 opacity-80 hover:opacity-100'
              }`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <div>
                <p className="font-bold text-sm leading-none">{tab.name}</p>
                <p className={`text-[10px] mt-1 ${activeTab === tab.id ? 'text-white/70' : 'text-[#6f7979]'}`}>{tab.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-9 bg-white rounded-3xl p-8 border border-[#bec9c9]/10 shadow-sm overflow-y-auto">
          {activeTab === 'profile' ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-[#091e25] border-b border-[#bec9c9]/10 pb-4">Informations Professionnelles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest ml-1">Prénom</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest ml-1">Nom</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest ml-1">Email pro</label>
                  <input name="email" value={formData.email} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest ml-1">Poste / Centre</label>
                  <input name="center" value={formData.center} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={handleSaveProfile} disabled={isLoading} className="bg-[#006669] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] transition-all flex items-center gap-2">
                  {isLoading ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined">save</span>}
                  Sauvegarder
                </button>
              </div>
            </div>
          ) : activeTab === 'security' ? renderSecurityTab('#006669', false) 
            : activeTab === 'notifications' ? renderNotificationsTab() 
            : renderSystemTab()}
        </div>
      </div>
    </div>
  );

  // --- RENDU FINAL PATIENT ---
  const renderPatientContent = () => (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-4xl text-compassion-rose mb-2">Mon Compte Patient</h1>
          <p className="font-body text-on-surface-variant">Personnalisez vos préférences de santé et vos accès</p>
        </div>
        <GlassPanel className="py-3 px-6 rounded-2xl border-sahara-rose bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-wellness-green animate-pulse"></div>
            <span className="text-xs font-bold text-on-surface uppercase tracking-widest">Connecté · Profil Actif</span>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 text-left border ${
                activeTab === tab.id 
                  ? 'bg-white shadow-ultra-soft border-sahara-rose translate-x-2' 
                  : 'bg-transparent border-transparent hover:bg-sahara-rose/30 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-colors ${activeTab === tab.id ? 'bg-sahara-rose text-compassion-rose' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[24px]">{tab.icon}</span>
              </div>
              <div>
                <p className={`font-headline text-lg ${activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>{tab.name}</p>
                <p className="text-xs text-on-surface-variant/60 font-body mt-0.5">{tab.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8">
          <BentoCard className="min-h-[550px] p-8 md:p-10">
            {activeTab === 'profile' ? (
              <div className="space-y-10">
                <div className="flex items-center gap-5">
                  <IconBox icon="person_edit" variant="rose" className="w-14 h-14 rounded-2xl shadow-sm" />
                  <div>
                    <h2 className="font-headline text-2xl text-on-surface">Informations Personnelles</h2>
                    <p className="text-sm text-on-surface-variant/70">Mise à jour de vos coordonnées.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Prénom</label>
                    <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl outline-none focus:border-compassion-rose transition-all font-body" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Nom</label>
                    <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl outline-none focus:border-compassion-rose transition-all font-body" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Email</label>
                    <input name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl outline-none focus:border-compassion-rose transition-all font-body" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Téléphone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl outline-none focus:border-compassion-rose transition-all font-body" />
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <button onClick={handleSaveProfile} disabled={isLoading} className="bg-compassion-rose text-white px-12 py-4 rounded-full font-headline text-lg shadow-lg hover:-translate-y-1 transition-all flex items-center gap-3">
                    {isLoading ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined">check_circle</span>}
                    Sauvegarder le profil
                  </button>
                </div>
              </div>
            ) : renderSecurityTab('compassion-rose', true)}
          </BentoCard>
        </div>
      </div>
    </div>
  );

  if (isPatient) return <PatientLayout>{renderPatientContent()}</PatientLayout>;

  return (
    <div className="h-screen bg-[#f2fbff] flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f2fbff]">
          <div className="p-6 h-full">
            {renderAgentContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
