import React from 'react';
import PatientLayout from '../../components/PatientLayout.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

const PatientNoRecord: React.FC = () => {
  const { user } = useAuth();

  return (
    <PatientLayout>
      <section className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[40px] p-10 md:p-14 border border-sahara-rose/40 shadow-2xl text-center">
          <div className="w-20 h-20 rounded-[28px] bg-sahara-rose/30 text-compassion-rose flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl">folder_managed</span>
          </div>
          <span className="inline-flex px-4 py-1.5 rounded-full bg-atlantic-sage/10 text-atlantic-sage text-xs font-black uppercase tracking-widest mb-5">
            Compte patient actif
          </span>
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight">
            Aucun dossier de depistage lie a votre compte
          </h1>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed mt-5">
            Bonjour {user?.first_name || ''}. Votre compte est bien connecte, mais aucun dossier col de l'uterus, prostate ou sein n'est encore associe a ce profil.
          </p>
          <div className="mt-8 rounded-3xl bg-cream-silk/40 border border-sahara-rose/40 p-6 text-left">
            <p className="text-sm font-bold text-on-surface mb-2">Que faire ?</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Contactez votre agent de sante ou votre centre de depistage pour lier votre dossier medical a ce compte. Si vous venez d'etre enregistre, la synchronisation peut prendre quelques instants.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a href="/chatbot" className="px-8 py-4 bg-compassion-rose text-white rounded-2xl font-black uppercase tracking-widest text-sm">
              Contacter l'assistant
            </a>
            <a href="/login" className="px-8 py-4 bg-white text-compassion-rose border-2 border-sahara-rose rounded-2xl font-black uppercase tracking-widest text-sm">
              Reconnexion
            </a>
          </div>
        </div>
      </section>
    </PatientLayout>
  );
};

export default PatientNoRecord;
