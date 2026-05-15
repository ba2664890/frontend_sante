import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const loggedUser = await login(data.username, data.password);
      toast.success('Bienvenue sur CerviCare+');
      
      // Redirection basée sur le rôle
      if (loggedUser?.role === 'patient') {
        navigate('/acceuil_patient');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Identifiants invalides';
      
      if (error.code === 'ERR_NETWORK' || error.response?.status === 502) {
        errorMessage = 'Le serveur est temporairement indisponible.';
      } else if (error.response?.data?.detail || error.response?.data?.message) {
        errorMessage = error.response.data.detail || error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fcf9f6] text-[#1b1c1a] min-h-screen selection:bg-[#8f464c]/20 selection:text-[#8f464c] overflow-hidden">
      {/* Styles locaux pour injecter le design system exactement comme dans le HTML fourni */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&family=Playfair+Display:wght@600;700&display=swap');
        
        .font-headline { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Nunito Sans', sans-serif; }
        
        .soft-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 12px 40px rgba(146, 72, 78, 0.08);
        }
        .glow-blob {
            filter: blur(100px);
            z-index: -1;
        }
      `}</style>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="glow-blob absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#8f464c]/10 rounded-full"></div>
        <div className="glow-blob absolute top-1/2 -right-20 w-[700px] h-[700px] bg-[#066a5f]/10 rounded-full"></div>
        <div className="glow-blob absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-[#655959]/5 rounded-full"></div>
      </div>

      {/* Layout Container */}
      <main className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section: Form */}
        <div className="flex flex-col justify-center items-center p-6 lg:p-12 z-10">
          <div className="soft-panel w-full max-w-[520px] p-8 md:p-14 rounded-[2rem]">
            {/* Brand Anchor */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-[#8f464c]/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8f464c] text-3xl">clinical_notes</span>
              </div>
              <span className="font-headline text-2xl font-bold tracking-tight text-[#8f464c]">CerviCare+</span>
            </div>

            <div className="mb-10">
              <h1 className="font-headline text-4xl md:text-5xl text-[#1b1c1a] mb-4 leading-tight">Bienvenue sur CerviCare+</h1>
              <p className="font-body text-lg text-[#534343] leading-relaxed">Connectez-vous pour accéder à votre espace santé sécurisé.</p>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="font-body text-sm font-bold text-[#8f464c]/80 ml-1 uppercase tracking-widest">Utilisateur ou Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#867273] group-focus-within:text-[#8f464c] transition-colors">person</span>
                  <input 
                    {...register('username', { required: true })}
                    className="w-full bg-[#f6f3f0] border border-[#d8c1c1] rounded-full py-4 pl-12 pr-4 text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#8f464c]/20 focus:border-[#8f464c] transition-all font-body text-base placeholder:text-[#d8c1c1]" 
                    placeholder="nom@exemple.com" 
                    type="text"
                  />
                </div>
                {errors.username && <p className="text-[10px] text-[#ba1a1a] ml-4 font-bold uppercase tracking-wider">Ce champ est requis</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-body text-sm font-bold text-[#8f464c]/80 uppercase tracking-widest">Mot de passe</label>
                  <a className="font-body text-xs text-[#066a5f] hover:text-[#8f464c] transition-colors underline underline-offset-4" href="/login">Mot de passe oublié ?</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#867273] group-focus-within:text-[#8f464c] transition-colors">lock</span>
                  <input 
                    {...register('password', { required: true })}
                    className="w-full bg-[#f6f3f0] border border-[#d8c1c1] rounded-full py-4 pl-12 pr-4 text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#8f464c]/20 focus:border-[#8f464c] transition-all font-body text-base placeholder:text-[#d8c1c1]" 
                    placeholder="••••••••" 
                    type="password"
                  />
                </div>
                {errors.password && <p className="text-[10px] text-[#ba1a1a] ml-4 font-bold uppercase tracking-wider">Ce champ est requis</p>}
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#8f464c] text-white font-body text-sm font-bold uppercase tracking-widest shadow-xl shadow-[#8f464c]/20 hover:bg-[#8f464c]/90 hover:scale-[1.01] active:scale-95 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10 text-center">
              <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#d8c1c1]/40"></span></span>
              <span className="relative bg-[#fcf9f6] px-4 font-body text-[10px] text-[#867273] uppercase tracking-widest">Ou continuer avec</span>
            </div>

            {/* Biometrics & Third Party */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-4 rounded-full border border-[#d8c1c1] hover:border-[#8f464c] hover:bg-[#8f464c]/5 transition-all group">
                <span className="material-symbols-outlined text-[#8f464c] group-hover:scale-110 transition-transform">fingerprint</span>
                <span className="font-body text-xs font-bold text-[#1b1c1a]">Biométrie</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-4 rounded-full border border-[#d8c1c1] hover:border-[#066a5f] hover:bg-[#066a5f]/5 transition-all group">
                <span className="material-symbols-outlined text-[#066a5f] group-hover:scale-110 transition-transform">shield_person</span>
                <span className="font-body text-xs font-bold text-[#1b1c1a]">Passkey</span>
              </button>
            </div>

            {/* Trust Badges Mobile */}
            <div className="mt-12 lg:hidden flex justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#066a5f]">security</span>
                <span className="font-body text-[10px] text-[#1b1c1a] uppercase tracking-tight">100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#8f464c]">health_and_safety</span>
                <span className="font-body text-[10px] text-[#1b1c1a] uppercase tracking-tight">Santé France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Visual */}
        <div className="hidden lg:flex relative overflow-hidden bg-[#f6f3f0]">
          <div className="absolute inset-0">
            <img 
              alt="Atmospheric Medical Wellness" 
              className="w-full h-full object-cover opacity-30 mix-blend-multiply" 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#fcf9f6] via-[#fcf9f6]/40 to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-end p-20 w-full">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#d8c1c1] text-[#066a5f] font-body text-xs font-bold mb-8 shadow-sm">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Technologie médicale de pointe
              </div>
              <h2 className="font-headline text-5xl text-[#1b1c1a] mb-8 leading-[1.1]">Prendre soin de vous, avec <span className="text-[#8f464c] italic">bienveillance</span>.</h2>
              <p className="font-body text-lg text-[#534343] mb-12 max-w-md leading-relaxed">
                Notre plateforme allie expertise clinique et intelligence artificielle pour un accompagnement personnalisé de votre santé féminine.
              </p>
              
              {/* Trust Badges Desktop */}
              <div className="flex gap-12 border-t border-[#d8c1c1]/30 pt-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#d8c1c1] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[#066a5f] text-2xl">gpp_maybe</span>
                  </div>
                  <div>
                    <p className="font-body text-[10px] text-[#867273] uppercase tracking-wider">Certifié par</p>
                    <p className="font-body text-sm text-[#1b1c1a] font-bold">Ministère de la Santé</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#d8c1c1] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[#8f464c] text-2xl">encrypted</span>
                  </div>
                  <div>
                    <p className="font-body text-[10px] text-[#867273] uppercase tracking-wider">Confidentialité</p>
                    <p className="font-body text-sm text-[#1b1c1a] font-bold">Chiffrement AES-256</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;