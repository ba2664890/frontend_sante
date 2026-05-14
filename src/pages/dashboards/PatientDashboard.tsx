import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { analyticsService } from '../../services/analyticsService.ts';
import { patientService } from '../../services/patientService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import PatientLayout from '../../components/PatientLayout.tsx';
import { BentoCard, GlassPanel, IconBox } from '../../components/ui/PatientUI.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';

import { useNavigate } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Données du tableau de bord
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery(
    ['patient-dashboard', user?.id],
    () => analyticsService.getPatientDashboardData(),
    { enabled: !!user }
  );

  // Détails de la patiente (nécessaire pour le résumé IA)
  const { data: patientDetails } = useQuery(
    ['patient-details', user?.id],
    () => patientService.getPatientByUserId(user!.id),
    { enabled: !!user }
  );

  // Résumé IA
  const [aiSummary, setAiSummary] = useState<string>("");
  const aiSummaryMutation = useMutation(
    (data: any) => patientService.getAiSummary(data),
    {
      onSuccess: (data) => setAiSummary(data.synthese),
      onError: () => setAiSummary("Impossible de générer le résumé pour le moment.")
    }
  );

  useEffect(() => {
    if (patientDetails) {
      aiSummaryMutation.mutate(patientDetails);
    }
  }, [patientDetails, aiSummaryMutation]);

  if (isDashboardLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const nextAppt = dashboardData?.next_appointment;

  return (
    <PatientLayout>
      {/* Welcome Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-element-gap mb-8 bg-sahara-rose rounded-lg p-10 relative overflow-hidden shadow-ultra-soft animate-fade-in">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-compassion-rose/10 organic-blob"></div>
        <div className="z-10 flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-4xl md:text-5xl text-compassion-rose">
              Dalal ak jàmm, {user?.first_name || 'Mariama'} 🌸
            </h1>
            <span className="bg-white/50 text-compassion-rose px-4 py-1 rounded-full font-body text-sm font-bold">
              À revoir • Xoolaat
            </span>
          </div>
          <p className="font-body text-lg text-on-surface-variant max-w-lg">
            Ravi de vous revoir. Votre parcours de santé est notre priorité. Prenez un moment pour vous aujourd'hui.
          </p>
        </div>
        <div className="relative z-10 w-48 h-48 md:w-64 md:h-64">
          <img
            alt="Silhouette de femme"
            className="w-full h-full object-cover organic-blob shadow-lg"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWGInlbvvkcJWcCFeS1GRtIuQi_skHcol6iRHRwnyM5t5Qj4uJBdAqTNXMU1Wl03tg_A4cpxPKzaH2YoL4o20NX8SwUOIblOBJlXUQzXYbGJUFffV4Ik7PCpOQUwNwbTmiHD-hVqbwP1jGhKZ-sZy8SvkLVeq0vg4E9fm6z0B3LJoI1YnRA_RA9bQ_EUN5FPAF2qmIAbHEKIP3qRP17AozRntAIsgpOJNzQMa0fJQk7A98tCX-dt0H-wIfh7Mp00W4Njk4qki5Fug"
          />
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-element-gap">
        
        {/* AI Summary Card */}
        <GlassPanel className="md:col-span-12">
          <div className="bg-compassion-rose/10 p-4 rounded-full">
            <span className="material-symbols-outlined text-compassion-rose text-3xl">auto_awesome</span>
          </div>
          <div className="flex-grow">
            <h3 className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest mb-1">
              Résumé IA • Mistral-7B
            </h3>
            {aiSummaryMutation.isLoading ? (
              <p className="font-body text-on-surface-variant italic animate-pulse">Génération du résumé en cours...</p>
            ) : (
              <>
                <p className="font-body text-lg text-on-surface italic">
                  "{aiSummary || "Votre dernier examen montre une stabilité rassurante. Restez sereine."}"
                </p>
                <p className="text-xs text-on-surface-variant mt-1 italic">
                  Njariñu IA: "Sa nattu mu mujj mi neex na lool. Sa xol dal."
                </p>
              </>
            )}
          </div>
        </GlassPanel>

        {/* Prochain RDV Card */}
        <BentoCard className="md:col-span-8 flex flex-col justify-between h-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <IconBox icon="calendar_today" className="w-16 h-16 rounded-2xl" />
              <div>
                <p className="font-body text-xs font-bold text-compassion-rose uppercase tracking-widest mb-1">
                  Prochain Rendez-vous
                </p>
                <h3 className="font-headline text-2xl text-on-surface">
                  {nextAppt?.type || 'Examen de contrôle annuel'}
                </h3>
              </div>
            </div>
            <button 
              onClick={() => navigate('/patient/appointments')}
              className="bg-compassion-rose text-white px-8 py-3 rounded-full font-body text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Modifier
            </button>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-sahara-rose pt-6">
            <div>
              <span className="block font-body text-[10px] text-on-surface-variant uppercase font-bold">Date / Bis bi</span>
              <span className="font-body font-bold">{nextAppt?.date || 'À définir'}</span>
            </div>
            <div>
              <span className="block font-body text-[10px] text-on-surface-variant uppercase font-bold">Heure / Waqtu bi</span>
              <span className="font-body font-bold">{nextAppt?.time || '--:--'}</span>
            </div>
            <div>
              <span className="block font-body text-[10px] text-on-surface-variant uppercase font-bold">Lieu / Barab bi</span>
              <span className="font-body font-bold">Centre de Santé</span>
            </div>
          </div>
        </BentoCard>

        <div 
          onClick={() => window.location.href = 'tel:+221770000000'}
          className="md:col-span-4 bg-wellness-green text-white p-8 rounded-lg shadow-ultra-soft flex flex-col justify-between group cursor-pointer hover:translate-y-[-4px] transition-all"
        >
          <span className="material-symbols-outlined text-3xl opacity-80">support_agent</span>
          <div>
            <h3 className="font-headline text-2xl mb-2">Besoin d'aide ?</h3>
            <p className="text-white/80 text-sm">Parlez à un agent local en Wolof ou Français.</p>
          </div>
          <div className="flex items-center gap-2 font-body text-sm font-bold mt-4">
            Appeler maintenant <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        {/* Education Section */}
        <section className="md:col-span-12 mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-3xl text-compassion-rose flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl">school</span>
              Espace Éducation & Prévention
            </h2>
            <button className="text-wellness-green font-body text-sm font-bold hover:underline">Tout voir</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-element-gap">
            <div className="md:col-span-7 space-y-6">
              <h3 className="font-headline text-xl text-on-surface">Vidéos Éducatives • Vidéo yi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Video Card 1 */}
                <div 
                  className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm h-40"
                  onClick={() => setSelectedVideo({ title: "Comprendre le dépistage", url: "https://www.youtube.com/embed/uAFhzOTu234" })}
                >
                  <img alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-compassion-rose">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-bold">
                    Comprendre le dépistage
                  </div>
                </div>
                {/* Video Card 2 */}
                <div 
                  className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm h-40"
                  onClick={() => setSelectedVideo({ title: "Témoignages", url: "https://www.youtube.com/embed/0GsKk8gmVvA" })}
                >
                  <img alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=400" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-compassion-rose">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-bold">
                    Témoignages de patientes
                  </div>
                </div>
              </div>

              <div className="bg-atlantic-sage p-6 rounded-lg flex items-center gap-6 shadow-ultra-soft">
                <IconBox icon="health_and_safety" variant="green" className="w-20 h-20 shrink-0" />
                <div>
                  <h4 className="font-headline text-lg text-on-surface mb-1">Prévention au quotidien</h4>
                  <p className="text-on-surface-variant text-sm">
                    Les gestes simples pour protéger votre santé. Lu wara def ci sa bësh bu nekk.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-6">
              <GlassPanel className="border-l-4 border-muted-gold relative overflow-hidden block">
                <div className="absolute top-[-20px] right-[-20px] opacity-10">
                  <span className="material-symbols-outlined text-[120px]">lightbulb</span>
                </div>
                <h3 className="font-body text-xs font-bold text-muted-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">tips_and_updates</span>
                  Le Saviez-vous ?
                </h3>
                <p className="font-body text-lg text-on-surface italic mb-4">
                  "Le dépistage régulier peut prévenir jusqu'à 90% des cancers du col de l'utérus."
                </p>
                <p className="text-xs text-on-surface-variant italic">
                  "Nattu bu bees te sax, mën na faju 90% ci jàngoroy col de l'utérus."
                </p>
              </GlassPanel>

              <BentoCard className="p-6">
                <h4 className="font-body text-xs font-bold text-compassion-rose uppercase mb-4">Mythe vs Réalité</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error text-xl">cancel</span>
                    <p className="text-xs font-bold italic">"C'est une maladie contagieuse."</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-wellness-green text-xl">check_circle</span>
                    <p className="text-xs">
                      Non, c'est causé par un virus (HPV) mais la maladie elle-même ne se transmet pas.
                    </p>
                  </div>
                </div>
              </BentoCard>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <div className="md:col-span-4">
          <BentoCard onClick={() => navigate('/patient/records')} className="flex flex-col gap-4 group hover:bg-sahara-rose/20 transition-colors h-full">
            <IconBox icon="analytics" />
            <div>
              <h3 className="font-headline text-xl text-on-surface">Mes résultats</h3>
              <p className="text-on-surface-variant text-sm">Wone say nattu</p>
            </div>
            <span className="material-symbols-outlined self-end group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </BentoCard>
        </div>
        <div className="md:col-span-4">
          <BentoCard onClick={() => navigate('/chatbot')} className="flex flex-col gap-4 group hover:bg-atlantic-sage/20 transition-colors h-full">
            <IconBox icon="forum" variant="green" />
            <div>
              <h3 className="font-headline text-xl text-on-surface">Forum Entraide</h3>
              <p className="text-on-surface-variant text-sm">Wax ak sa moromu jigéen</p>
            </div>
            <span className="material-symbols-outlined self-end group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </BentoCard>
        </div>
        <div className="md:col-span-4">
          <BentoCard onClick={() => navigate('/patient/appointments')} className="flex flex-col gap-4 group hover:bg-surface-container/20 transition-colors h-full">
            <IconBox icon="history" variant="highest" />
            <div>
              <h3 className="font-headline text-xl text-on-surface">Historique</h3>
              <p className="text-on-surface-variant text-sm">Li jàll lépp</p>
            </div>
            <span className="material-symbols-outlined self-end group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </BentoCard>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-4 flex justify-between items-center border-b border-sahara-rose">
              <h3 className="font-headline text-xl text-compassion-rose">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-sahara-rose rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={selectedVideo.url}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
};

export default PatientDashboard;