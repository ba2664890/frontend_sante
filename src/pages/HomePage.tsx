import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const stagger = { animate: { transition: { staggerChildren: 0.15 } } };

const cancers = [
  {
    id: 'col-uterus',
    name: 'Col de l\'Utérus',
    icon: 'female',
    available: true,
    color: '#E28B7A',
    light: '#FDF0ED',
    gradient: 'from-[#E28B7A] to-[#C46B5A]',
    badge: 'Disponible',
    description: 'Dépistage précoce du cancer cervical grâce au test HPV et à la colposcopie assistée par IA.',
    stat: '10 000+ femmes dépistées',
    link: '/login',
  },
  {
    id: 'sein',
    name: 'Cancer du Sein',
    icon: 'favorite',
    available: false,
    color: '#D97BAE',
    light: '#FBF0F7',
    gradient: 'from-[#D97BAE] to-[#B55A8A]',
    badge: 'Bientôt disponible',
    description: 'Mammographie numérique et suivi personnalisé pour la détection précoce du cancer du sein.',
    stat: 'Lancement Q3 2025',
    link: '#',
  },
  {
    id: 'prostate',
    name: 'Cancer de la Prostate',
    icon: 'male',
    available: false,
    color: '#5B8FD4',
    light: '#EDF3FB',
    gradient: 'from-[#5B8FD4] to-[#3A6AAE]',
    badge: 'Bientôt disponible',
    description: 'Dosage PSA et biopsie guidée par échographie pour le dépistage du cancer de la prostate.',
    stat: 'Lancement Q4 2025',
    link: '#',
  },
];

const steps = [
  { icon: 'calendar_month', title: 'Prendre Rendez-vous', text: 'Planifiez votre dépistage en quelques clics auprès de nos centres certifiés.' },
  { icon: 'biotech', title: 'Dépistage Précis', text: 'Analyses haute précision réalisées par des professionnels formés aux dernières technologies.' },
  { icon: 'monitor_heart', title: 'Suivi & Accompagnement', text: 'Résultats confidentiels et parcours de soins personnalisé avec nos équipes.' },
];

const stats = [
  { value: '10 000+', label: 'Patients dépistés' },
  { value: '3', label: 'Cancers ciblés' },
  { value: '14', label: 'Centres partenaires' },
  { value: '98%', label: 'Satisfaction patients' },
];

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#F8F9FB', color: '#1A2340' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap');
        .headline { font-family: 'Sora', sans-serif; }
        .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.9); }
        .card-hover { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(0,0,0,0.10); }
        .badge-available { background: linear-gradient(135deg,#22c55e20,#16a34a15); color: #15803d; border: 1px solid #22c55e40; }
        .badge-soon { background: linear-gradient(135deg,#f59e0b20,#d9770615); color: #b45309; border: 1px solid #f59e0b40; }
        .hero-bg { background: linear-gradient(135deg, #0F1C3F 0%, #1A2F6B 50%, #0F1C3F 100%); }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1A2F6B,#3B5BDB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>health_and_safety</span>
            </div>
            <span className="headline" style={{ fontSize: 22, fontWeight: 800, color: '#1A2340', letterSpacing: '-0.5px' }}>
              Despisteel
            </span>
          </Link>

          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <a href="#cancers" style={{ color: '#4A5568', fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>Nos Programmes</a>
            <a href="#how" style={{ color: '#4A5568', fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>Comment ça marche</a>
            <a href="#stats" style={{ color: '#4A5568', fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>Impact</a>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {user ? (
              <Link to={user.role === 'patient' ? '/acceuil_patient' : '/dashboard'}
                style={{ background: 'linear-gradient(135deg,#1A2F6B,#3B5BDB)', color: '#fff', padding: '10px 24px', borderRadius: 100, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                Mon Espace
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ color: '#1A2340', border: '1.5px solid #CBD5E0', padding: '9px 20px', borderRadius: 100, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                  Connexion
                </Link>
                <Link to="/login" style={{ background: 'linear-gradient(135deg,#1A2F6B,#3B5BDB)', color: '#fff', padding: '10px 24px', borderRadius: 100, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                  Se dépister
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main style={{ paddingTop: 68 }}>

        {/* HERO */}
        <section className="hero-bg" style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,91,219,0.3) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,139,122,0.2) 0%, transparent 70%)' }} />

          <motion.div initial="initial" animate="animate" variants={stagger}
            style={{ textAlign: 'center', maxWidth: 900, padding: '0 24px', position: 'relative', zIndex: 10 }}>

            <motion.div variants={fadeInUp}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,91,219,0.2)', border: '1px solid rgba(59,91,219,0.4)', padding: '6px 18px', borderRadius: 100, marginBottom: 32 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#93C5FD', fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Plateforme Nationale de Dépistage</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="headline"
              style={{ fontSize: 'clamp(44px,7vw,82px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
              Despisteel
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #60A5FA, #E28B7A, #D97BAE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '0.75em' }}>
                Dépistez. Tôt. Vivez.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp}
              style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', maxWidth: 680, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>
              La première plateforme intégrée de dépistage oncologique au Sénégal. Trois cancers, un seul outil, des milliers de vies sauvées.
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={user ? (user.role === 'patient' ? '/acceuil_patient' : '/dashboard') : '/login'}
                style={{ background: 'linear-gradient(135deg,#3B5BDB,#1A2F6B)', color: '#fff', padding: '16px 40px', borderRadius: 100, fontWeight: 800, textDecoration: 'none', fontSize: 17, boxShadow: '0 12px 40px rgba(59,91,219,0.5)' }}>
                Commencer le dépistage
              </Link>
              <a href="#cancers"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', padding: '16px 40px', borderRadius: 100, fontWeight: 700, textDecoration: 'none', fontSize: 17 }}>
                Nos programmes →
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* STATS */}
        <section id="stats" style={{ background: '#fff', padding: '60px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center' }}>
                <div className="headline" style={{ fontSize: 42, fontWeight: 800, color: '#1A2F6B', letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ color: '#718096', fontWeight: 600, fontSize: 14, marginTop: 6 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CANCER CARDS */}
        <section id="cancers" style={{ padding: '100px 24px', background: '#F8F9FB' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-block', background: '#EEF2FF', color: '#3B5BDB', padding: '6px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 20, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Nos Programmes de Dépistage
              </div>
              <h2 className="headline" style={{ fontSize: 46, fontWeight: 800, color: '#1A2340', letterSpacing: '-1px', marginBottom: 16 }}>
                Trois cancers, une mission
              </h2>
              <p style={{ color: '#718096', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                Despisteel vous accompagne dans la détection précoce des cancers les plus fréquents au Sénégal.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {cancers.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="card-hover"
                  style={{ background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>

                  {/* Top colored banner */}
                  <div style={{ background: `linear-gradient(135deg, ${c.color}22, ${c.color}10)`, padding: '40px 32px 32px', borderBottom: `1px solid ${c.color}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${c.color}, ${c.color}CC)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${c.color}40` }}>
                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 32, fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                      </div>
                      <span className={c.available ? 'badge-available' : 'badge-soon'}
                        style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                        {c.badge}
                      </span>
                    </div>
                    <h3 className="headline" style={{ fontSize: 26, fontWeight: 800, color: '#1A2340', marginBottom: 12 }}>{c.name}</h3>
                    <p style={{ color: '#718096', lineHeight: 1.65, fontSize: 15 }}>{c.description}</p>
                  </div>

                  <div style={{ padding: '24px 32px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                      <span className="material-symbols-outlined" style={{ color: c.color, fontSize: 18 }}>bar_chart</span>
                      <span style={{ color: '#4A5568', fontWeight: 700, fontSize: 14 }}>{c.stat}</span>
                    </div>

                    {c.available ? (
                      <Link to={c.link}
                        style={{ display: 'block', textAlign: 'center', background: `linear-gradient(135deg, ${c.color}, ${c.color}CC)`, color: '#fff', padding: '14px 24px', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: 15, boxShadow: `0 8px 24px ${c.color}40` }}>
                        Accéder au programme →
                      </Link>
                    ) : (
                      <div style={{ textAlign: 'center', background: '#F7F8FA', color: '#A0AEC0', padding: '14px 24px', borderRadius: 14, fontWeight: 700, fontSize: 15, border: '1.5px dashed #E2E8F0' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>schedule</span>
                        En cours de déploiement
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ background: '#fff', padding: '100px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 className="headline" style={{ fontSize: 46, fontWeight: 800, color: '#1A2340', letterSpacing: '-1px', marginBottom: 16 }}>Parcours de Soin Simplifié</h2>
              <p style={{ color: '#718096', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>En 3 étapes, bénéficiez d'un dépistage complet et d'un suivi personnalisé.</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {steps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="card-hover"
                  style={{ background: '#F8F9FB', borderRadius: 24, padding: '40px 32px', border: '1px solid #EDF2F7' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#EEF2FF,#DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <span className="material-symbols-outlined" style={{ color: '#3B5BDB', fontSize: 30 }}>{s.icon}</span>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A2F6B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{i + 1}</div>
                  <h3 className="headline" style={{ fontSize: 20, fontWeight: 800, color: '#1A2340', marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ color: '#718096', lineHeight: 1.7, fontSize: 15 }}>{s.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '100px 24px', background: '#F8F9FB' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              style={{ background: 'linear-gradient(135deg, #0F1C3F, #1A2F6B)', borderRadius: 40, padding: '80px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,91,219,0.4), transparent)' }} />
              <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,139,122,0.3), transparent)' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 40, fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                </div>
                <h2 className="headline" style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, color: '#fff', marginBottom: 20, letterSpacing: '-1px' }}>
                  Votre santé, notre priorité
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
                  Ne laissez pas la maladie prendre de l'avance. Avec Despisteel, chaque dépistage est un acte de courage qui sauve des vies.
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/login" style={{ background: '#fff', color: '#1A2F6B', padding: '16px 40px', borderRadius: 100, fontWeight: 800, textDecoration: 'none', fontSize: 16 }}>
                    Se dépister maintenant
                  </Link>
                  <a href="tel:+221338234567" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', padding: '16px 40px', borderRadius: 100, fontWeight: 700, textDecoration: 'none', fontSize: 16 }}>
                    Nous appeler
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0F1C3F', color: 'rgba(255,255,255,0.6)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="headline" style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Despisteel</div>
          <p style={{ fontSize: 14, marginBottom: 32 }}>Plateforme nationale de dépistage oncologique — Sénégal</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
            {['Politique de confidentialité', "Conditions d'utilisation", 'Ministère de la Santé', 'Support'].map(l => (
              <Link key={l} to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</Link>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 28, fontSize: 13 }}>
            © 2025 Despisteel Sénégal — Cancer du Col de l'Utérus · Cancer du Sein · Cancer de la Prostate
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;