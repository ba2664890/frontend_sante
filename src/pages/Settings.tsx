// src/pages/Settings.tsx — Dual Theme (Patient & Agent)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout.tsx';
import Layout from '../components/Layout.tsx';
import { BentoCard, GlassPanel, IconBox } from '../components/ui/PatientUI.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { authService } from '../services/authService.ts';

const Settings: React.FC = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.state?.defaultTab || 'profile');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

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

  const handleSave = async () => {
    setIsLoadingProfile(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      login(updatedUser);
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      toast.error('Erreur : ' + (error.response?.data?.detail || 'Serveur indisponible'));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: 'person', description: 'Informations personnelles' },
    { id: 'security', name: 'Sécurité', icon: 'shield_lock', description: 'Compte & Confidentialité' },
  ];

  if (!isPatient) {
    tabs.splice(1, 0, { id: 'notifications', name: 'Alertes', icon: 'notifications_active', description: 'Configuration notifications' });
    tabs.push({ id: 'system', name: 'Système', icon: 'settings', description: 'Paramètres généraux' });
  }

  const renderContent = () => {
    // THÈME AGENT (Teal/Terracotta)
    if (!isPatient) {
      return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 border border-[#bec9c9]/10 shadow-sm">
            <h1 className="text-3xl font-semibold text-[#091e25] mb-2" style={{ fontFamily: 'Literata, serif' }}>Paramètres de l'Agent</h1>
            <p className="text-[#6f7979]">Configurez vos préférences de travail et vos informations professionnelles.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-3 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                    activeTab === tab.id 
                      ? 'bg-[#006669] text-white shadow-lg shadow-[#006669]/20' 
                      : 'bg-white text-[#3e4949] hover:bg-[#dcf1fb] border border-[#bec9c9]/10'
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

            {/* Content Area */}
            <div className="lg:col-span-9 bg-white rounded-3xl p-8 border border-[#bec9c9]/10 shadow-sm overflow-y-auto">
              {activeTab === 'profile' ? (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-[#091e25] border-b border-[#bec9c9]/10 pb-4">Éditer le profil</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Prénom</label>
                      <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Nom</label>
                      <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Email</label>
                      <input name="email" value={formData.email} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Poste de santé</label>
                      <input name="center" value={formData.center} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button onClick={handleSave} disabled={isLoadingProfile} className="bg-[#006669] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#006669]/20 hover:bg-[#2a7f82] transition-all flex items-center gap-2">
                      {isLoadingProfile ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined">save</span>}
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <span className="material-symbols-outlined text-6xl">construction</span>
                  <p className="font-bold text-lg mt-4">Module en cours de développement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // THÈME PATIENT (Rose/Silk) — On garde la structure existante
    return (
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div>
            <h1 className="font-headline text-4xl text-compassion-rose mb-2">Paramètres</h1>
            <p className="font-body text-on-surface-variant">Personnalisez votre expérience CerviCare+</p>
          </div>
          <GlassPanel className="py-3 px-6 rounded-2xl border-sahara-rose">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-wellness-green animate-pulse"></div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Compte Patient</span>
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
                  activeTab === tab.id ? 'bg-white shadow-ultra-soft border-sahara-rose translate-x-2' : 'bg-transparent border-transparent hover:bg-sahara-rose/30 opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`p-3 rounded-2xl ${activeTab === tab.id ? 'bg-sahara-rose text-compassion-rose' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{tab.icon}</span>
                </div>
                <div>
                  <p className={`font-headline text-lg ${activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>{tab.name}</p>
                  <p className="text-xs text-on-surface-variant/60 font-body">{tab.description}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="lg:col-span-8">
            <BentoCard className="min-h-[500px]">
              {activeTab === 'profile' ? (
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                     <IconBox icon="person" variant="rose" className="w-14 h-14 rounded-2xl" />
                     <h2 className="font-headline text-2xl text-on-surface">Mon Profil</h2>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <input name="first_name" value={formData.first_name} onChange={handleChange} className="p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl" placeholder="Prénom" />
                      <input name="last_name" value={formData.last_name} onChange={handleChange} className="p-4 bg-cream-silk/40 border border-sahara-rose rounded-2xl" placeholder="Nom" />
                   </div>
                   <button onClick={handleSave} className="bg-compassion-rose text-white px-10 py-4 rounded-full font-headline">Sauvegarder</button>
                </div>
              ) : <div className="text-center py-20 italic">En développement...</div>}
            </BentoCard>
          </div>
        </div>
      </div>
    );
  };

  if (isPatient) return <PatientLayout>{renderContent()}</PatientLayout>;
  
  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default Settings;
