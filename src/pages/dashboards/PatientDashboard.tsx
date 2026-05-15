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
  const [showFullSummary, setShowFullSummary] = useState(false);

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
      onError: () => setAiSummary("Votre parcours de santé est en cours de suivi. Restez confiante.")
    }
  );

  useEffect(() => {
    if (patientDetails && !aiSummary && !aiSummaryMutation.isLoading) {
      aiSummaryMutation.mutate(patientDetails);
    }
  }, [patientDetails, aiSummary, aiSummaryMutation]);

  if (isDashboardLoading || !user) {
    return <LoadingSpinner fullPage size="xl" message="Chargement de votre espace personnel..." />;
  }

  const nextAppt = dashboardData?.next_appointment;

  const videoLibrary = [
    { 
      id: 1, 
      title: "Comprendre le dépistage", 
      desc: "Pourquoi faire un test IVA/HPV ?", 
      url: "https://www.youtube.com/embed/uAFhzOTu234", 
      thumb: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
      category: "Dépistage"
    },
    { 
      id: 2, 
      title: "Vivre avec la maladie", 
      desc: "Témoignages et espoir.", 
      url: "https://www.youtube.com/embed/0GsKk8gmVvA", 
      thumb: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=400",
      category: "Témoignage"
    },
    { 
      id: 3, 
      title: "Alimentation & Bien-être", 
      desc: "Conseils nutritionnels.", 
      url: "https://www.youtube.com/embed/uAFhzOTu234", 
      thumb: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400",
      category: "Mode de vie"
    },
    { 
      id: 4, 
      title: "Le parcours de soins", 
      desc: "Les étapes après le dépistage.", 
      url: "https://www.youtube.com/embed/0GsKk8gmVvA", 
      thumb: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400",
      category: "Soins"
    }
  ];

  const healthArticles = [
    { title: "L'importance du suivi", date: "15 Mai", icon: "event_available", color: "bg-blue-100 text-blue-600" },
    { title: "Activité physique douce", date: "12 Mai", icon: "fitness_center", color: "bg-emerald-100 text-emerald-600" },
    { title: "Gérer le stress", date: "10 Mai", icon: "self_improvement", color: "bg-purple-100 text-purple-600" }
  ];

  return (
    <PatientLayout>
      {/* Dynamic Welcome Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12 bg-white rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-sahara-rose/30 animate-fade-in group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sahara-rose/10 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-atlantic-sage/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="z-10 flex flex-col items-start gap-6 max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-1.5 bg-compassion-rose/10 text-compassion-rose rounded-full text-xs font-black uppercase tracking-widest border border-compassion-rose/10">
              Tableau de bord patiente
            </span>
            <span className="bg-wellness-green/10 text-wellness-green px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
              Connecté • Actif
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface leading-tight tracking-tighter">
            Dalal ak jàmm, <span className="text-compassion-rose">{user?.first_name || 'Mariama'}</span> 🌸
          </h1>
          <p className="font-body text-xl text-on-surface-variant leading-relaxed">
            Votre santé est un trésor. Nous vous accompagnons à chaque étape avec bienveillance et expertise.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/patient/records')}
              className="px-8 py-4 bg-compassion-rose text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-compassion-rose-dark shadow-xl shadow-compassion-rose/20 transition-all hover:scale-105 active:scale-95"
            >
              Voir mon dossier
            </button>
            <button 
              onClick={() => navigate('/chatbot')}
              className="px-8 py-4 bg-white text-compassion-rose border-2 border-sahara-rose rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-sahara-rose/10 transition-all active:scale-95"
            >
              Poser une question
            </button>
          </div>
        </div>
        
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 animate-float">
          <div className="absolute inset-0 bg-sahara-rose rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img
            alt="Silhouette harmonieuse"
            className="w-full h-full object-cover organic-blob shadow-2xl relative z-10 border-8 border-white group-hover:scale-105 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWGInlbvvkcJWcCFeS1GRtIuQi_skHcol6iRHRwnyM5t5Qj4uJBdAqTNXMU1Wl03tg_A4cpxPKzaH2YoL4o20NX8SwUOIblOBJlXUQzXYbGJUFffV4Ik7PCpOQUwNwbTmiHD-hVqbwP1jGhKZ-sZy8SvkLVeq0vg4E9fm6z0B3LJoI1YnRA_RA9bQ_EUN5FPAF2qmIAbHEKIP3qRP17AozRntAIsgpOJNzQMa0fJQk7A98tCX-dt0H-wIfh7Mp00W4Njk4qki5Fug"
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Animated AI Insight Card */}
        <div className="lg:col-span-12 animate-fade-in delay-100">
          <GlassPanel className="p-1 border-2 border-compassion-rose/20 bg-white/50 backdrop-blur-2xl overflow-hidden hover:border-compassion-rose/40 transition-colors">
            <div className="p-8 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="p-5 bg-gradient-to-br from-compassion-rose to-secondary-container rounded-3xl shadow-lg animate-pulse">
                <span className="material-symbols-outlined text-white text-4xl block">auto_awesome</span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-headline text-2xl text-compassion-rose tracking-tight">Analyse Intelligente Njariñu</h3>
                  <span className="text-[10px] bg-sahara-rose/30 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Llama 3 AI</span>
                </div>
                {aiSummaryMutation.isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-compassion-rose rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-compassion-rose rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-compassion-rose rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <p className="font-body text-on-surface-variant italic font-medium">Synthèse de votre dernier dossier en cours...</p>
                  </div>
                ) : (
                  <div className="relative">
                    <p className={`font-body text-xl text-on-surface italic leading-relaxed transition-all duration-500 ${showFullSummary ? '' : 'line-clamp-2'}`}>
                      "{aiSummary || "Nous analysons vos données pour vous offrir un résumé personnalisé. Votre santé est notre priorité."}"
                    </p>
                    <button 
                      onClick={() => setShowFullSummary(!showFullSummary)}
                      className="mt-2 text-compassion-rose text-sm font-black uppercase tracking-widest hover:underline"
                    >
                      {showFullSummary ? 'Réduire' : 'Lire la suite'}
                    </button>
                    <p className="text-xs text-on-surface-variant mt-4 font-bold tracking-wide uppercase opacity-60">
                      Version Wolof : "Sa nattu mu mujj mi neex na lool. Sa xol dal."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Pure Immersive Background Video Section */}
        <div className="lg:col-span-12 mt-12 animate-fade-in delay-200 pointer-events-none">
          <section className="relative w-full aspect-[16/6] md:aspect-[21/7] rounded-[50px] overflow-hidden shadow-2xl border border-sahara-rose/30">
            {/* Vidéo en boucle (Pure Visual) */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600"
            >
              <source src="/demo-app.mp4" type="video/mp4" />
            </video>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 opacity-40"></div>
            
            {/* Bottom Badge - Discret */}
            <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-black/10 backdrop-blur-lg px-6 py-2 rounded-full border border-white/5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 italic">Njariñu Live Preview</span>
            </div>
          </section>
        </div>

        {/* Action Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <BentoCard className="h-full flex flex-col justify-between hover-lift animate-fade-in delay-200">
            <div className="flex justify-between items-start mb-8">
              <IconBox icon="calendar_clock" className="w-16 h-16 rounded-[24px] bg-sahara-rose/20 text-compassion-rose" />
              <div className="bg-wellness-green/10 px-3 py-1 rounded-full text-wellness-green text-[10px] font-black uppercase tracking-widest">Confirmé</div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Prochain Rendez-vous</p>
              <h3 className="font-headline text-3xl text-on-surface mb-6 leading-none">
                {nextAppt?.type || 'Examen de contrôle'}
              </h3>
              <div className="grid grid-cols-2 gap-4 border-t border-sahara-rose/30 pt-6 mt-auto">
                <div>
                  <span className="block text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-1">Date</span>
                  <span className="font-headline text-lg font-bold">{nextAppt?.date || 'À définir'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-1">Heure</span>
                  <span className="font-headline text-lg font-bold">{nextAppt?.time || '--:--'}</span>
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard 
            onClick={() => window.location.href = 'tel:+221770000000'}
            className="bg-wellness-green text-white h-full flex flex-col justify-between hover-lift cursor-pointer animate-fade-in delay-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none"></div>
            <IconBox icon="support_agent" className="w-16 h-16 rounded-[24px] bg-white/20 text-white" />
            <div>
              <h3 className="font-headline text-3xl mb-3 leading-none">Besoin d'aide ?</h3>
              <p className="font-body text-white/80 text-lg leading-snug">
                Parlez directement à une conseillère en Wolof ou Français.
              </p>
              <div className="flex items-center gap-3 font-black text-sm uppercase tracking-widest mt-8 group">
                Appeler maintenant 
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Sidebar / Mini-magazine */}
        <div className="lg:col-span-4 space-y-8 animate-fade-in delay-400">
          <BentoCard className="bg-cream-silk border-2 border-sahara-rose/30">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline text-xl text-on-surface">Conseils Santé</h4>
              <span className="material-symbols-outlined text-compassion-rose">menu_book</span>
            </div>
            <div className="space-y-4">
              {healthArticles.map((art, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-sahara-rose/20 hover:border-compassion-rose/30 transition-all cursor-pointer group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${art.color}`}>
                    <span className="material-symbols-outlined">{art.icon}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-headline text-sm text-on-surface group-hover:text-compassion-rose transition-colors">{art.title}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">{art.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-sahara-rose rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-white transition-all">
              Lire tous les articles
            </button>
          </BentoCard>

          <GlassPanel className="bg-muted-gold/10 border-l-4 border-muted-gold p-6 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
               <span className="material-symbols-outlined text-7xl">lightbulb</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-gold mb-3">Le saviez-vous ?</p>
             <p className="font-body text-lg text-on-surface italic leading-relaxed">
               "Un dépistage précoce permet une guérison complète dans 100% des cas."
             </p>
          </GlassPanel>
        </div>

        {/* Rich Media Section */}
        <section className="lg:col-span-12 mt-8 animate-fade-in delay-500">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-headline text-4xl text-on-surface tracking-tighter mb-2">Espace Éducation & Vidéos</h2>
              <p className="font-body text-on-surface-variant text-lg italic">Tout savoir pour mieux se protéger.</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-full border border-sahara-rose hover:bg-white transition-all"><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="p-3 rounded-full border border-sahara-rose hover:bg-white transition-all"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {videoLibrary.map((vid) => (
              <div 
                key={vid.id}
                onClick={() => setSelectedVideo(vid)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-4 shadow-xl shadow-sahara-rose/20">
                  <img src={vid.thumb} alt={vid.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-compassion-rose shadow-2xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/30">
                      {vid.category}
                    </span>
                  </div>
                </div>
                <h4 className="font-headline text-xl text-on-surface mb-1 group-hover:text-compassion-rose transition-colors">{vid.title}</h4>
                <p className="font-body text-sm text-on-surface-variant line-clamp-1 italic">{vid.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Footer Links */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fade-in delay-500">
           <BentoCard onClick={() => navigate('/patient/records')} className="flex items-center gap-6 hover-lift group cursor-pointer bg-sahara-rose/5 border-2 border-sahara-rose/20">
              <IconBox icon="analytics" className="shrink-0" />
              <div className="flex-grow">
                <h3 className="font-headline text-xl text-on-surface">Résultats</h3>
                <p className="text-xs text-on-surface-variant uppercase font-black">Voir mes analyses</p>
              </div>
              <span className="material-symbols-outlined text-compassion-rose group-hover:translate-x-2 transition-transform">arrow_forward</span>
           </BentoCard>
           
           <BentoCard onClick={() => navigate('/chatbot')} className="flex items-center gap-6 hover-lift group cursor-pointer bg-atlantic-sage/5 border-2 border-atlantic-sage/20">
              <IconBox icon="forum" variant="green" className="shrink-0" />
              <div className="flex-grow">
                <h3 className="font-headline text-xl text-on-surface">Forum</h3>
                <p className="text-xs text-on-surface-variant uppercase font-black">Discuter & Échanger</p>
              </div>
              <span className="material-symbols-outlined text-wellness-green group-hover:translate-x-2 transition-transform">arrow_forward</span>
           </BentoCard>

           <BentoCard onClick={() => navigate('/patient/appointments')} className="flex items-center gap-6 hover-lift group cursor-pointer bg-primary-fixed-dim/5 border-2 border-primary-fixed-dim/20">
              <IconBox icon="history" variant="highest" className="shrink-0" />
              <div className="flex-grow">
                <h3 className="font-headline text-xl text-on-surface">Historique</h3>
                <p className="text-xs text-on-surface-variant uppercase font-black">Suivi complet</p>
              </div>
              <span className="material-symbols-outlined text-primary-fixed-dim group-hover:translate-x-2 transition-transform">arrow_forward</span>
           </BentoCard>
        </div>

      </div>

      {/* Enhanced Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-5xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-8 flex justify-between items-center border-b border-sahara-rose/30">
              <div>
                <span className="px-3 py-1 bg-compassion-rose/10 text-compassion-rose text-[10px] font-black uppercase tracking-widest rounded-full mb-2 inline-block">Médiathèque</span>
                <h3 className="font-headline text-3xl text-on-surface tracking-tighter">{selectedVideo.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedVideo(null)} 
                className="p-4 bg-sahara-rose/20 hover:bg-sahara-rose text-compassion-rose rounded-full transition-all active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="aspect-video bg-black">
              {selectedVideo.url.startsWith('http') ? (
                <iframe
                  src={selectedVideo.url}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={selectedVideo.url} 
                  className="w-full h-full" 
                  controls 
                  autoPlay
                >
                  votre navigateur ne supporte pas la vidéo.
                </video>
              )}
            </div>
            <div className="p-8 bg-cream-silk/50">
               <p className="font-body text-xl text-on-surface leading-relaxed italic">
                 {selectedVideo.desc} Pour plus d'informations, n'hésitez pas à en parler à votre agent de santé local ou à utiliser notre assistant Njariñu.
               </p>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
};

export default PatientDashboard;