import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#07131b] text-white">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,184,166,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.18),_transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(125deg,_rgba(255,255,255,0.04)_0%,_rgba(255,255,255,0)_48%,_rgba(0,184,166,0.06)_100%)]" />

        <div className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 sm:p-10 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1.5 text-sm font-medium text-teal-200">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                Zone hors connexion
              </div>

              <div className="mt-6 flex items-center gap-3 text-[clamp(3rem,6vw,5rem)] font-black leading-none tracking-[-0.04em] text-white">
                <span className="text-teal-400">404</span>
                <span className="text-white/90">•</span>
                <span className="text-white/80">Oops</span>
              </div>

              <h1 className="mt-6 text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold leading-tight text-white">
                Cette destination n’est pas encore accessible.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                La page que vous cherchez a peut-être été déplacée, supprimée ou n’existe pas dans cette version de l’application.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-2xl bg-teal-500 px-5 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-400"
                >
                  Revenir à l’accueil
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-slate-100 transition duration-200 hover:bg-white/20"
                >
                  Retour précédent
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center border-t border-white/10 bg-slate-950/55 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(0,184,166,0.14),_transparent_60%)]" />
              <div className="relative w-full max-w-sm rounded-[1.8rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Navigation</span>
                  <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-2.5 py-1 text-xs text-teal-300">
                    Dépisteel
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-xl font-bold text-white">
                      ✦
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Interface de navigation</p>
                      <p className="text-sm text-slate-400">Direction claire, parcours fluide.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-300">
                    <div className="rounded-xl border border-white/10 bg-slate-800/70 p-3">Accédez au tableau de bord depuis l’accueil.</div>
                    <div className="rounded-xl border border-white/10 bg-slate-800/70 p-3">Consultez les dossiers patients en quelques clics.</div>
                    <div className="rounded-xl border border-white/10 bg-slate-800/70 p-3">Retrouvez rapidement les campagnes et rapports.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
