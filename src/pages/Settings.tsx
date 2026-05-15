// src/pages/Settings.tsx — Dual Theme (Patient & Agent)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
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
      toast.success('Profil mis à jour avec succès !');
    } catch (error: any) {
      toast.error('Erreur : ' + (error.response?.data?.detail || 'Serveur indisponible'));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Mon Profil', icon: 'person', description: 'Gérez vos informations personnelles' },
    { id: 'security', name: 'Sécurité', icon: 'shield_lock', description: 'Mot de passe & Confidentialité' },
  ];

  if (!isPatient) {
    tabs.splice(1, 0, { id: 'notifications', name: 'Alertes', icon: 'notifications_active', description: 'Configuration notifications' });
    tabs.push({ id: 'system', name: 'Système', icon: 'settings', description: 'Paramètres généraux' });
  }

  // --- RENDU ESPACE AGENT (TEAL) ---
  const renderAgentContent = () => (
    <div className="h-full flex flex-col space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-[#bec9c9]/10 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#091e25] mb-2" style={{ fontFamily: 'Literata, serif' }}>Paramètres de l'Agent</h1>
        <p className="text-[#6f7979]">Configurez vos préférences de travail et vos informations professionnelles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
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

        <div className="lg:col-span-9 bg-white rounded-3xl p-8 border border-[#bec9c9]/10 shadow-sm overflow-y-auto">
          {activeTab === 'profile' ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-[#091e25] border-b border-[#bec9c9]/10 pb-4">Éditer le profil Agent</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Prénom</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Nom</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Email professionnel</label>
                  <input name="email" value={formData.email} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#006669] uppercase tracking-widest">Centre de rattachement</label>
                  <input name="center" value={formData.center} onChange={handleChange} className="w-full p-3.5 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl focus:ring-2 focus:ring-[#006669]/20 outline-none" />
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
              <p className="font-bold text-lg mt-4">Module en développement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- RENDU ESPACE PATIENT (ROSE) ---
  const renderPatientContent = () => (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in">
      {/* Header Patient */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-4xl text-compassion-rose mb-2">Ma Fiche Profil</h1>
          <p className="font-body text-on-surface-variant">Vérifiez et mettez à jour vos coordonnées personnelles</p>
        </div>
        <GlassPanel className="py-3 px-6 rounded-2xl border-sahara-rose bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-wellness-green animate-pulse"></div>
            <span className="text-xs font-bold text-on-surface uppercase tracking-widest">Identité Vérifiée</span>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Menu Gauche */}
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

        {/* Contenu Droite */}
        <div className="lg:col-span-8">
          <BentoCard className="min-h-[550px] p-8 md:p-10">
            {activeTab === 'profile' ? (
              <div className="space-y-10">
                <div className="flex items-center gap-5">
                  <IconBox icon="person_edit" variant="rose" className="w-14 h-14 rounded-2xl shadow-sm" />
                  <div>
                    <h2 className="font-headline text-2xl text-on-surface">Informations de Contact</h2>
                    <p className="text-sm text-on-surface-variant/70">Ces données sont utilisées pour vos rendez-vous et suivis.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Prénom</label>
                    <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl focus:border-compassion-rose focus:ring-4 focus:ring-compassion-rose/5 outline-none transition-all font-body" placeholder="Votre prénom" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Nom</label>
                    <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl focus:border-compassion-rose focus:ring-4 focus:ring-compassion-rose/5 outline-none transition-all font-body" placeholder="Votre nom" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Adresse Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl focus:border-compassion-rose focus:ring-4 focus:ring-compassion-rose/5 outline-none transition-all font-body" placeholder="Ex: marie@exemple.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Numéro de Téléphone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl focus:border-compassion-rose focus:ring-4 focus:ring-compassion-rose/5 outline-none transition-all font-body" placeholder="Ex: 77 000 00 00" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-compassion-rose uppercase tracking-widest ml-1">Région de résidence</label>
                    <select name="region" value={formData.region} onChange={handleChange} className="w-full p-4 bg-cream-silk/30 border border-sahara-rose/40 rounded-2xl focus:border-compassion-rose focus:ring-4 focus:ring-compassion-rose/5 outline-none transition-all font-body appearance-none">
                      <option value="">Sélectionnez votre région</option>
                      <option value="Dakar">Dakar</option>
                      <option value="Thiès">Thiès</option>
                      <option value="Saint-Louis">Saint-Louis</option>
                      <option value="Ziguinchor">Ziguinchor</option>
                      <option value="Diourbel">Diourbel</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <button 
                    onClick={handleSave} 
                    disabled={isLoadingProfile}
                    className="group relative bg-compassion-rose text-white px-12 py-4 rounded-full font-headline text-lg shadow-lg shadow-compassion-rose/30 hover:shadow-xl hover:shadow-compassion-rose/40 hover:-translate-y-1 transition-all flex items-center gap-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">{isLoadingProfile ? 'Mise à jour...' : 'Sauvegarder les modifications'}</span>
                    {!isLoadingProfile && <span className="material-symbols-outlined relative z-10 group-hover:rotate-12 transition-transform">done_all</span>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant/40 italic">
                <span className="material-symbols-outlined text-6xl mb-4">lock</span>
                <p>Paramètres de sécurité en cours de sécurisation...</p>
              </div>
            )}
          </BentoCard>
        </div>
      </div>
    </div>
  );

  if (isPatient) {
    return <PatientLayout>{renderPatientContent()}</PatientLayout>;
  }
  
  return renderAgentContent();
};

export default Settings;
