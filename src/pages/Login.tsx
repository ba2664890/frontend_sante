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
      toast.success('Bienvenue sur Depisteel');

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&family=Playfair+Display:wght@600;700&display=swap');
        
        .font-headline { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Nunito Sans', sans-serif; }
        
        .soft-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 12px 40px rgba(146, 72, 78, 0.08);
            border-radius: 2rem;
        }
        .glow-blob {
            filter: blur(100px);
            z-index: -1;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .input-field {
            background-color: #f6f3f0;
            border: 1px solid #d8c1c1;
            border-radius: 9999px;
            padding: 1.25rem 1rem 1.25rem 3.5rem;
            transition: all 0.3s ease;
            font-family: 'Nunito Sans', sans-serif;
        }
        .input-field:focus {
            outline: none;
            border-color: #8f464c;
            background-color: #ffffff;
            box-shadow: 0 0 0 4px rgba(143, 70, 76, 0.05);
        }
        .btn-primary {
            background-color: #8f464c;
            color: white;
            border-radius: 9999px;
            padding: 1.25rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            box-shadow: 0 12px 24px rgba(143, 70, 76, 0.25);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-primary:hover {
            background-color: #753138;
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 15px 30px rgba(143, 70, 76, 0.3);
        }
        .text-headline-xl {
            font-size: 48px;
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        .text-headline-md {
            font-size: 24px;
            line-height: 1.4;
            font-weight: 600;
        }
        .text-label-md {
            font-size: 13px;
            line-height: 1.4;
            letter-spacing: 0.08em;
            font-weight: 700;
        }
      `}</style>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="glow-blob absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#8f464c]/10 rounded-full"></div>
        <div className="glow-blob absolute top-1/2 -right-20 w-[700px] h-[700px] bg-[#066a5f]/10 rounded-full"></div>
        <div className="glow-blob absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-[#655959]/5 rounded-full"></div>
      </div>

      <main className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section: Form */}
        <div className="flex flex-col justify-center items-center p-4 lg:p-8 z-10">
          <div className="soft-panel w-full max-w-[500px] p-8 md:p-10">
            {/* Brand Anchor */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#8f464c]/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8f464c] text-2xl">clinical_notes</span>
              </div>
              <span className="font-headline text-xl font-bold text-[#8f464c] tracking-tight">Depisteel</span>
            </div>

            <div className="mb-6">
              <h1 className="font-headline text-3xl md:text-4xl text-[#1b1c1a] mb-2 leading-tight">Bienvenue sur Depisteel</h1>
              <p className="font-body text-base text-[#534343] leading-relaxed opacity-80">Connectez-vous pour accéder à votre espace santé sécurisé.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="text-label-md text-[#8f464c]/70 ml-1 uppercase">Utilisateur ou Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#867273] group-focus-within:text-[#8f464c] transition-colors">person</span>
                  <input
                    {...register('username', { required: true })}
                    className="input-field w-full text-base placeholder:text-[#d8c1c1]"
                    placeholder="nom@exemple.com"
                    type="text"
                  />
                </div>
                {errors.username && <p className="text-[11px] text-[#ba1a1a] ml-5 font-bold uppercase tracking-wider">Ce champ est requis</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-label-md text-[#8f464c]/70 uppercase">Mot de passe</label>
                  <a className="text-xs font-bold text-[#066a5f] hover:text-[#8f464c] transition-colors underline underline-offset-4" href="/login">Mot de passe oublié ?</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#867273] group-focus-within:text-[#8f464c] transition-colors">lock</span>
                  <input
                    {...register('password', { required: true })}
                    className="input-field w-full text-base placeholder:text-[#d8c1c1]"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
                {errors.password && <p className="text-[11px] text-[#ba1a1a] ml-5 font-bold uppercase tracking-wider">Ce champ est requis</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#d8c1c1]/40"></span></span>
              <span className="relative bg-[#fcf9f6] px-6 text-[10px] text-[#867273] uppercase tracking-[0.2em] font-bold">Ou continuer avec</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 rounded-full border border-[#d8c1c1] hover:border-[#8f464c] hover:bg-[#8f464c]/5 transition-all group">
                <span className="material-symbols-outlined text-[#8f464c] group-hover:scale-110 transition-transform">fingerprint</span>
                <span className="font-body text-xs font-bold text-[#1b1c1a]">Biométrie</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3 rounded-full border border-[#d8c1c1] hover:border-[#066a5f] hover:bg-[#066a5f]/5 transition-all group">
                <span className="material-symbols-outlined text-[#066a5f] group-hover:scale-110 transition-transform">shield_person</span>
                <span className="font-body text-xs font-bold text-[#1b1c1a]">Passkey</span>
              </button>
            </div>

            <div className="mt-8 lg:hidden flex justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#066a5f]">security</span>
                <span className="text-[10px] text-[#1b1c1a] uppercase tracking-wider font-bold">100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#8f464c]">health_and_safety</span>
                <span className="text-[10px] text-[#1b1c1a] uppercase tracking-wider font-bold">Santé France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Visual */}
        <div className="hidden lg:flex relative overflow-hidden bg-[#f6f3f0]">
          <div className="absolute inset-0">
            <img
              alt="Atmospheric Medical Wellness"
              className="w-full h-full object-cover opacity-40 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFMcE94wRKdyGqfiEUc7uFZ7plXiGdtmxTxloeZfkdgXo0FREHVUh8LaFbqD_Z4BPPPGPuVJpDde2kkU_Wf2KYfX3u06v64pZyVVDpnB-UHZ50U63jpWoaR3OGrgEbXP2tnG1FN95zdwLXKauScOI1ZuXgsvFYuyV7Cn6y36Cv--H1kjNa9UbRs5pGxbWOE6gDeQLzNSBrU6oK3j0yLfDmN-fjV0tsiFPlCXtgN7Kn88IoZe7m_SaOOEwmOlZY_LR5WEvGHlRzrIg"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#fcf9f6] via-[#fcf9f6]/30 to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16 w-full">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#d8c1c1] text-[#066a5f] text-xs font-bold mb-6 shadow-sm">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Technologie médicale de pointe
              </div>
              <h2 className="font-headline text-3xl lg:text-4xl text-[#1b1c1a] mb-6 leading-[1.1]">Prendre soin de vous, avec <span className="text-[#8f464c] italic">bienveillance</span>.</h2>
              <p className="font-body text-base lg:text-lg text-[#534343] mb-8 max-w-md leading-relaxed opacity-90">
                Notre plateforme allie expertise clinique et intelligence artificielle pour un accompagnement personnalisé de votre santé féminine.
              </p>

              <div className="flex gap-10 border-t border-[#d8c1c1]/40 pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#d8c1c1] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[#066a5f] text-2xl">gpp_maybe</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#867273] uppercase tracking-[0.15em] font-bold">Certifié par</p>
                    <p className="text-sm text-[#1b1c1a] font-bold">Ministère de la Santé</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#d8c1c1] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[#8f464c] text-2xl">encrypted</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#867273] uppercase tracking-[0.15em] font-bold">Confidentialité</p>
                    <p className="text-sm text-[#1b1c1a] font-bold">Chiffrement AES-256</p>
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