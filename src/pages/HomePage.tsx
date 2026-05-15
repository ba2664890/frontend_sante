import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = React.useState(0);

  const testimonials = [
    { 
      name: 'Aïssatou Diallo', 
      role: 'Patiente, Dakar', 
      img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200',
      text: "Grâce au dépistage précoce de CerviCare+, j'ai pu être soignée à temps. Le processus était simple et sans stress. C'est une bénédiction pour nous toutes.",
      color: '#E28B7A'
    },
    { 
      name: 'Dr. Fatou Sène', 
      role: 'Gynécologue', 
      img: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200',
      text: "CerviCare+ nous permet de suivre nos patientes avec une précision inégalée. Cette plateforme réduit considérablement le temps entre diagnostic et traitement.",
      color: '#7D9B8A'
    },
    { 
      name: 'Mariama Ba', 
      role: 'Patiente, Thiès', 
      img: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200',
      text: "Les rappels automatiques et le suivi m'ont donné une grande tranquillité d'esprit. Je recommande CerviCare+ à toutes mes amies.",
      color: '#E28B7A'
    }
  ];

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#4A3F3D] font-body selection:bg-primary/20">
      {/* Styles locaux pour les polices et effets spécifiques */}
      <style>{`
        .font-headline { font-family: 'DM Serif Display', serif; }
        .font-body { font-family: 'Nunito', sans-serif; }
        .patient-gradient {
          background: linear-gradient(135deg, #FDFBF9 0%, #F7F2EE 100%);
        }
        .soft-shadow {
          box-shadow: 0 10px 30px -10px rgba(226, 139, 122, 0.1);
        }
      `}</style>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#D1C2BE]/20">
        <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="font-headline text-3xl font-bold text-[#E28B7A] tracking-tight">CerviCare+</Link>
          <div className="hidden md:flex gap-8 items-center font-semibold">
            <Link to="/" className="text-[#E28B7A] border-b-2 border-[#E28B7A] pb-1">Éducation</Link>
            <Link to="/accueil" className="text-[#7A6C69] hover:text-[#E28B7A] transition-colors">Campagnes</Link>
            <a href="#testimonials" className="text-[#7A6C69] hover:text-[#E28B7A] transition-colors">Témoignages</a>
            <Link to="/" className="text-[#7A6C69] hover:text-[#E28B7A] transition-colors">À propos</Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to={user.role === 'patient' ? "/acceuil_patient" : "/dashboard"} className="bg-[#E28B7A] text-white px-8 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-md shadow-[#E28B7A]/20">
                Mon Espace
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="hidden sm:flex text-[#E28B7A] border border-[#E28B7A]/30 px-6 py-2.5 rounded-full font-bold hover:bg-[#E28B7A]/5 transition-all">
                  Connexion
                </Link>
                <Link to="/login" className="bg-[#E28B7A] text-white px-8 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-md shadow-[#E28B7A]/20">
                  Dépistage
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 py-24 overflow-hidden patient-gradient">
          {/* Abstract Shapes */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#E28B7A]/10 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, delay: 1 }}
            className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#7D9B8A]/10 rounded-full blur-[100px]"
          />

          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-5xl z-10"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white border border-[#E28B7A]/20 px-5 py-1.5 rounded-full mb-10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E28B7A] animate-pulse"></span>
              <span className="text-[10px] font-black text-[#E28B7A] uppercase tracking-[0.2em]">Solution Certifiée OMS</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-headline text-6xl md:text-8xl text-[#2D2422] mb-8 leading-[1.1]">
              CerviCare<span className="text-[#E28B7A]">+</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[#7A6C69] max-w-3xl mx-auto mb-12 leading-relaxed font-light italic">
              Chaque minute compte. Nous déployons une technologie de pointe pour le dépistage précoce, sauvant des vies grâce à une prise en charge humaine et technologique au Sénégal.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link to={user ? (user.role === 'patient' ? "/acceuil_patient" : "/dashboard") : "/login"} className="w-full sm:w-auto px-12 py-5 rounded-full bg-[#E28B7A] text-white font-bold text-lg shadow-xl shadow-[#E28B7A]/30 hover:shadow-[#E28B7A]/50 transition-all hover:-translate-y-1 text-center">
                Commencer l'aventure
              </Link>
              <Link to="/accueil" className="w-full sm:w-auto px-12 py-5 rounded-full border-2 border-[#7D9B8A] text-[#7D9B8A] font-bold text-lg hover:bg-[#7D9B8A]/5 transition-all text-center">
                Voir les Campagnes
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-20 flex flex-wrap justify-center gap-12 opacity-80">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E28B7A] text-3xl">verified_user</span>
                <span className="text-sm font-bold uppercase tracking-wider">Sécurisé & Privé</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E28B7A] text-3xl">groups</span>
                <span className="text-sm font-bold uppercase tracking-wider">+10,000 Femmes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E28B7A] text-3xl">medical_services</span>
                <span className="text-sm font-bold uppercase tracking-wider">Experts Qualifiés</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Section Comment ça marche */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-headline text-5xl mb-6 text-[#2D2422]">Parcours de Soin Simplifié</h2>
            <div className="h-1.5 w-24 bg-[#E28B7A]/30 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: 'calendar_month', title: 'Prendre Rendez-vous', text: 'Planifiez votre dépistage en quelques clics auprès de nos centres partenaires certifiés au Sénégal.', color: '#F4E6E0' },
              { icon: 'biotech', title: 'Dépistage Précis', text: "Bénéficiez d'une analyse haute précision réalisée par des professionnels formés aux dernières technologies.", color: '#DCE7E1' },
              { icon: 'monitor_heart', title: 'Suivi & Accompagnement', text: 'Recevez vos résultats en toute confidentialité et accédez à un parcours de soins personnalisé.', color: '#F4E6E0' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-12 rounded-[2rem] border border-[#D1C2BE]/20 soft-shadow group hover:-translate-y-3 transition-all duration-500 cursor-pointer"
              >
                <div 
                  className="mb-8 w-20 h-20 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                  style={{ backgroundColor: step.color }}
                >
                  <span className="material-symbols-outlined text-[#E28B7A] text-4xl">{step.icon}</span>
                </div>
                <h3 className="font-headline text-2xl mb-5 text-[#2D2422]">{step.title}</h3>
                <p className="text-[#7A6C69] leading-relaxed text-lg">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section Témoignages */}
        <section id="testimonials" className="py-32 bg-[#F7F2EE]/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
              <div className="max-w-2xl">
                <h2 className="font-headline text-5xl mb-6 text-[#2D2422]">La Voix de notre Communauté</h2>
                <p className="text-xl text-[#7A6C69] font-light italic">Découvrez l'impact de CerviCare+ à travers les récits de celles qui nous font confiance.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={prevTestimonial}
                  className="w-16 h-16 rounded-full border border-[#D1C2BE]/40 flex items-center justify-center hover:bg-white transition-all material-symbols-outlined text-[#7A6C69]"
                >
                  arrow_back
                </button>
                <button 
                  onClick={nextTestimonial}
                  className="w-16 h-16 rounded-full bg-[#E28B7A] text-white flex items-center justify-center hover:shadow-lg transition-all material-symbols-outlined"
                >
                  arrow_forward
                </button>
              </div>
            </div>

            <div className="relative h-[400px] sm:h-[300px]">
              {testimonials.map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ 
                    opacity: activeTestimonial === i ? 1 : 0,
                    x: activeTestimonial === i ? 0 : (activeTestimonial > i ? -50 : 50),
                    zIndex: activeTestimonial === i ? 10 : 0
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-white p-10 rounded-[2.5rem] border border-[#D1C2BE]/20 soft-shadow flex flex-col sm:flex-row gap-8 items-center sm:items-start ${activeTestimonial === i ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img alt={t.name} className="w-full h-full object-cover" src={t.img} />
                  </div>
                  <div>
                    <div className="flex mb-4 gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined text-[#E28B7A] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                    </div>
                    <p className="text-[#4A3F3D] italic mb-6 leading-relaxed text-lg">"{t.text}"</p>
                    <h4 className="font-bold text-xl" style={{ color: t.color }}>{t.name}</h4>
                    <span className="text-sm text-[#7A6C69] font-bold uppercase tracking-widest">{t.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Finale */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-[#F4E6E0]/40 p-16 md:p-28 rounded-[3rem] overflow-hidden border border-[#E28B7A]/10 text-center"
          >
            <div className="absolute inset-0 patient-gradient opacity-60"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-10 shadow-lg">
                <span className="material-symbols-outlined text-[#E28B7A] text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <h2 className="font-headline text-5xl md:text-7xl mb-8 max-w-3xl text-[#2D2422] leading-tight">Rejoignez le Mouvement pour la Vie</h2>
              <p className="text-xl md:text-2xl text-[#7A6C69] max-w-2xl mx-auto mb-14 leading-relaxed font-light italic">
                Votre santé est notre priorité. Ne laissez pas le doute s'installer, agissez dès aujourd'hui pour vous et pour ceux qui vous aiment.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                <Link to="/login" className="bg-[#E28B7A] text-white font-bold px-16 py-5 rounded-full text-xl hover:bg-opacity-90 transition-all shadow-xl shadow-[#E28B7A]/30">
                  Commencer Maintenant
                </Link>
                <a href="tel:+221338234567" className="bg-white border-2 border-[#D1C2BE] text-[#4A3F3D] font-bold px-16 py-5 rounded-full text-xl hover:bg-[#F7F2EE] transition-all">
                  Contactez-nous
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-20 px-6 flex flex-col items-center gap-10 text-center border-t border-[#D1C2BE]/10 bg-white">
        <div className="font-headline text-4xl text-[#E28B7A] font-bold">CerviCare+</div>
        <div className="flex flex-wrap justify-center gap-10">
          <Link to="/" className="text-sm font-bold text-[#7A6C69] hover:text-[#E28B7A] transition-colors uppercase tracking-widest">Politique de confidentialité</Link>
          <Link to="/" className="text-sm font-bold text-[#7A6C69] hover:text-[#E28B7A] transition-colors uppercase tracking-widest">Conditions d'utilisation</Link>
          <Link to="/" className="text-sm font-bold text-[#7A6C69] hover:text-[#E28B7A] transition-colors uppercase tracking-widest">Ministère de la Santé</Link>
          <Link to="/" className="text-sm font-bold text-[#7A6C69] hover:text-[#E28B7A] transition-colors uppercase tracking-widest">Support</Link>
        </div>
        <p className="text-xs text-[#7A6C69] opacity-60 max-w-2xl leading-relaxed">
          © 2025 CerviCare+ Sénégal. Soutenir les femmes à travers la technologie et des soins bienveillants en collaboration avec les autorités sanitaires nationales.
        </p>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-3 md:hidden bg-white/90 backdrop-blur-xl border-t border-[#D1C2BE]/10 shadow-2xl">
        <div className="flex flex-col items-center justify-center text-[#E28B7A]">
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Accueil</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#7A6C69] opacity-70">
          <span className="material-symbols-outlined text-2xl">menu_book</span>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Savoir</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#7A6C69] opacity-70">
          <span className="material-symbols-outlined text-2xl">location_on</span>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Carte</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#7A6C69] opacity-70">
          <span className="material-symbols-outlined text-2xl">account_circle</span>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Profil</span>
        </div>
      </nav>
    </div>
  );
};

export default HomePage;