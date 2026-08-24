import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import screeningService from '../services/screeningService.ts';
import api from '../services/api.ts';


const SENEGAL_REGIONS = [
  { id: 1, name: 'Dakar' },
  { id: 2, name: 'Diourbel' },
  { id: 3, name: 'Fatick' },
  { id: 4, name: 'Kaffrine' },
  { id: 5, name: 'Kaolack' },
  { id: 6, name: 'Kédougou' },
  { id: 7, name: 'Kolda' },
  { id: 8, name: 'Louga' },
  { id: 9, name: 'Matam' },
  { id: 10, name: 'Saint-Louis' },
  { id: 11, name: 'Sédhiou' },
  { id: 12, name: 'Tambacounda' },
  { id: 13, name: 'Thiès' },
  { id: 14, name: 'Ziguinchor' },
];

const TARGET_AUDIENCES = [
  {
    id: 'association',
    icon: 'groups_3',
    title: 'Associations de Femmes',
    color: '#7C2FE0',
    badge: 'Santé Communautaire',
    description: "Organisez des dépistages de masse pour vos membres et communautés. Nous fournissons la technologie, les outils de sensibilisation et le suivi.",
  },
  {
    id: 'ong',
    icon: 'public',
    title: 'ONG & Partenaires',
    color: '#04696C',
    badge: "Projets d'Impact",
    description: "Déployez des caravanes mobiles financées avec tableau de bord d'impact en temps réel, indicateurs OMS et traçabilité complète des soins.",
  },
  {
    id: 'health_center',
    icon: 'local_hospital',
    title: 'Centres de Santé & Hôpitaux',
    color: '#2A7F82',
    badge: 'Digitalisation Clés en Main',
    description: "Équipez vos prestataires d'une solution multi-cancer (Col, Sein, Prostate) avec assistance IA et gestion centralisée des dossiers.",
  },
  {
    id: 'state',
    icon: 'account_balance',
    title: "Structures de l'État (MSAS)",
    color: '#0B1F24',
    badge: 'Stratégie Nationale',
    description: "Supervisez la couverture régionale, surveillez les objectifs OMS 90-70-90 et cartographiez les cas sur l'ensemble du territoire national.",
  },
];

const CANCERS = [
  { id: 'col', name: "Cancer du Col de l'Utérus", color: '#7C2FE0', icon: 'female', desc: 'Test HPV, IVA/IVL et IA prédictive' },
  { id: 'sein', name: 'Cancer du Sein', color: '#E5484D', icon: 'female', desc: 'Examen clinique, Mammographie & BIRADS' },
  { id: 'prostate', name: 'Cancer de la Prostate', color: '#04696C', icon: 'male', desc: 'Toucher rectal, Dosage PSA & Score IPSS' },
];

/* ── Fonts (Fraunces / Inter / IBM Plex Mono) ──────────────────────────── */
const useDesignFonts = () => {
  useEffect(() => {
    if (document.getElementById('depisteel-fonts')) return;
    const link = document.createElement('link');
    link.id = 'depisteel-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);
};

/* ── The pulse line — signature motif, reused as every section divider ──── */
const PulseDivider: React.FC<{ tone?: 'light' | 'dark'; flat?: boolean }> = ({ tone = 'light', flat = false }) => {
  const reduce = useReducedMotion();
  const stroke = tone === 'dark' ? '#E5484D' : '#04696C';
  const bg = tone === 'dark' ? 'transparent' : 'transparent';
  return (
    <div className="relative w-full overflow-hidden leading-none select-none" style={{ background: bg }} aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[42px] sm:h-[56px]">
        <motion.path
          d={flat
            ? 'M0,30 L1200,30'
            : 'M0,30 L430,30 L460,30 L480,6 L500,54 L520,14 L540,30 L560,30 L1200,30'}
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.4 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
};

/* ── Small ribbon glyph used on cancer-module cards ──────────────────────── */
const RibbonMark: React.FC<{ color: string }> = ({ color }) => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <path d="M17 15c-3-4-8-9-13-6-3 2-2 6 1 7 3 1 9 1 12-1z" fill={color} opacity="0.85" />
    <path d="M17 15c3-4 8-9 13-6 3 2 2 6-1 7-3 1-9 1-12-1z" fill={color} />
    <path d="M17 15c-1 5-4 10-3 15 0 2 3 2 4 0 1-3 0-9-1-15z" fill={color} opacity="0.7" />
    <path d="M17 15c1 5 4 10 3 15 0 2-3 2-4 0-1-3 0-9 1-15z" fill={color} opacity="0.55" />
  </svg>
);

const HomePage: React.FC = () => {
  useDesignFonts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // Réveille silencieusement le backend (Render se met en veille après inactivité) dès
  // l'arrivée sur l'accueil, pour éviter le cold-start au premier vrai appel de l'utilisateur.
  useEffect(() => {
    api.get('/health/').catch(() => {});
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const monitorY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);

  // Form state
  const [formData, setFormData] = useState({
    org_name: '',
    org_type: 'association',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    region: '1',
    district: '',
    health_center_name: '',
    preferred_start_date: '',
    preferred_end_date: '',
    expected_patients: '',
    covers_col: true,
    covers_sein: false,
    covers_prostate: false,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await screeningService.createCampaignRequest({
        ...formData,
        region: Number(formData.region),
        expected_patients: formData.expected_patients ? Number(formData.expected_patients) : null,
        preferred_start_date: formData.preferred_start_date || null,
        preferred_end_date: formData.preferred_end_date || null,
      });

      setSubmitSuccess(true);
      setFormData({
        org_name: '',
        org_type: 'association',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        region: '1',
        district: '',
        health_center_name: '',
        preferred_start_date: '',
        preferred_end_date: '',
        expected_patients: '',
        covers_col: true,
        covers_sein: false,
        covers_prostate: false,
        notes: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de l'envoi de votre demande.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('demande-campagne')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#0B1F24]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .vital-blip { animation: vitalBlip 2.4s ease-in-out infinite; }
        @keyframes vitalBlip { 0%,100%{opacity:.35} 50%{opacity:1} }
        @media (prefers-reduced-motion: reduce) {
          .vital-blip { animation: none; opacity: 1; }
        }
        input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible {
          outline: 2px solid #04696C; outline-offset: 2px;
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-[#DCE4DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-11 h-11 rounded-full border-[3px] border-[#C9B8EE] flex items-center justify-center bg-white overflow-hidden">
              <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full">
                <path d="M2 20 H13 L16 12 L20 28 L23 20 H38" fill="none" stroke="#E5484D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight font-display">DEPISTEEL</span>
              <span className="block text-[10px] uppercase font-semibold text-[#04696C] tracking-[0.14em] font-mono">Fagaru ci teel</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#3E4949]">
            <a href="#services" className="hover:text-[#04696C] transition-colors">Nos Services</a>
            <a href="#cancers" className="hover:text-[#04696C] transition-colors">Cancers Couverts</a>
            <a href="#fonctionnement" className="hover:text-[#04696C] transition-colors">Comment ça marche</a>
            <button onClick={scrollToForm} className="hover:text-[#04696C] transition-colors font-semibold">Organiser une Campagne</button>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'global_admin' || user.role === 'admin' ? '/dashboard' : '/dashboard')}
                className="bg-[#04696C] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm hover:bg-[#053638] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Mon Espace ({user.first_name || user.username})
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-[#04696C] hover:text-[#0B1F24] px-4 py-2 transition-colors">
                  Connexion Pro
                </Link>
                <button
                  onClick={scrollToForm}
                  className="bg-[#0B1F24] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm hover:bg-[#04696C] transition-all"
                >
                  Demander une Campagne
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-7">

              <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-[4.2rem] font-semibold leading-[1.03] tracking-tight">
                Chaque région compte.
                <br />
                <span className="italic font-normal">Chaque vie</span>{' '}
                <span className="text-[#04696C]">aussi.</span>
              </h1>

              <p className="text-lg text-[#3E4949] leading-relaxed max-w-xl">
                Depisteel donne aux <strong className="text-[#0B1F24]">ONG, associations de femmes, structures de l'État et centres de santé</strong> la technologie pour planifier, déployer et suivre en direct leurs campagnes de dépistage du <strong className="text-[#0B1F24]">Col de l'utérus, du Sein et de la Prostate</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={scrollToForm}
                  className="bg-[#04696C] hover:bg-[#053638] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-base"
                >
                  <span className="material-symbols-outlined">campaign</span>
                  Demander une campagne clé en main
                </button>
                {user ? (
                  <Link
                    to="/admin/dashboard"
                    className="bg-white text-[#04696C] border border-[#DCE4DE] hover:border-[#04696C] font-semibold px-6 py-4 rounded-full transition-all text-center text-base"
                  >
                    Accéder à mon tableau de bord
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-white text-[#0B1F24] border border-[#DCE4DE] hover:border-[#04696C] font-semibold px-6 py-4 rounded-full transition-all text-center text-base"
                  >
                    Espace Professionnel Santé
                  </Link>
                )}
              </div>
            </div>

            {/* Monitor readout panel — replaces the generic dashboard mockup */}
            <div className="lg:col-span-5 relative">
              <motion.div style={{ y: monitorY }} className="relative rounded-[28px] p-7 shadow-2xl bg-[#0B1F24] text-white space-y-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

                <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/60">Campagne active</span>
                  <span className="text-[11px] font-mono text-[#7CE0C6] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7CE0C6] vital-blip"></span> LIVE
                  </span>
                </div>

                <div className="relative space-y-1">
                  <div className="flex justify-between text-xs font-mono text-white/70">
                    <span>Octobre Rose — Thiès</span>
                    <span className="text-[#7CE0C6]">85%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#7CE0C6] h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* live pulse trace */}
                <div className="relative h-16 -mx-1">
                  <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-full">
                    <motion.path
                      d="M0,30 L90,30 L100,30 L108,6 L118,54 L128,14 L138,30 L150,30 L160,30 L168,6 L178,54 L188,14 L198,30 L300,30"
                      fill="none" stroke="#E5484D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2.2, ease: 'easeInOut', repeat: reduce ? 0 : Infinity, repeatDelay: 0.4 }}
                    />
                  </svg>
                </div>

                <div className="relative grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-[#C9B8EE] font-mono">COL</span>
                    <span className="text-lg font-semibold font-display">1 240</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-[#F5A3A6] font-mono">SEIN</span>
                    <span className="text-lg font-semibold font-display">980</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-[#7CE0C6] font-mono">PROSTATE</span>
                    <span className="text-lg font-semibold font-display">450</span>
                  </div>
                </div>

                <div className="relative p-3.5 bg-white/5 rounded-xl flex items-center gap-3 border border-white/10">
                  <span className="material-symbols-outlined text-[#7CE0C6]">group_add</span>
                  <div className="text-xs text-white/80">
                    <strong className="block text-white">Enrôlement instantané</strong>
                    Invitation par lien & affectation par structure
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Trust vitals strip */}
          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-[#DCE4DE] pt-8">
            {[
              { v: '14 Régions', l: 'Couverture Sénégal', c: '#7C2FE0' },
              { v: 'OMS 90-70-90', l: 'Conformité sanitaire', c: '#0B1F24' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-display font-semibold" style={{ color: s.c }}>{s.v}</div>
                <div className="text-xs text-[#3E4949] font-mono uppercase tracking-wide mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PulseDivider />

      {/* ── SEGMENTS CIBLES B2B ────────────────────────────────────────── */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 space-y-4">
            <span className="text-[11px] font-semibold text-[#04696C] uppercase tracking-[0.14em] font-mono">Partenaires & Institutions</span>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold">Une solution adaptée à chaque acteur de santé</h2>
            <p className="text-[#3E4949] text-base">Que vous soyez une association locale ou un ministère, Depisteel adapte son infrastructure pour déployer vos campagnes sur le terrain.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TARGET_AUDIENCES.map((target) => (
              <div
                key={target.id}
                className="group relative bg-[#FAF8F4] rounded-2xl p-6 border border-[#DCE4DE] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                style={{ borderTop: `4px solid ${target.color}` }}
              >
                {/* folded corner — dossier motif */}
                <div
                  className="absolute top-0 right-0 w-6 h-6 opacity-70"
                  style={{ background: `linear-gradient(135deg, transparent 50%, ${target.color}22 50%)` }}
                />
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: target.color }}>
                    <span className="material-symbols-outlined text-xl">{target.icon}</span>
                  </div>
                  <span className="inline-block text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md" style={{ color: target.color, background: `${target.color}15` }}>
                    {target.badge}
                  </span>
                  <h3 className="text-lg font-display font-semibold">{target.title}</h3>
                  <p className="text-xs text-[#3E4949] leading-relaxed">{target.description}</p>
                </div>

                <button onClick={scrollToForm} className="mt-6 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: target.color }}>
                  Demander pour ce secteur <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CANCERS COUVERTS ───────────────────────────────────────────── */}
      <section id="cancers" className="py-20 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 space-y-4">
            <span className="text-[11px] font-semibold text-[#7C2FE0] uppercase tracking-[0.14em] font-mono">Dépistage Tri-Cancer</span>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold">Trois modules spécialisés, une seule plateforme</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {CANCERS.map((c) => (
              <div key={c.id} className="relative bg-white rounded-2xl p-8 border border-[#DCE4DE] hover:shadow-lg transition-all" style={{ borderBottom: `4px solid ${c.color}` }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: c.color }}>
                    <span className="material-symbols-outlined">{c.icon}</span>
                  </div>
                  <RibbonMark color={c.color} />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{c.name}</h3>
                <p className="text-sm text-[#3E4949] mb-5">{c.desc}</p>
                <div className="text-[11px] font-mono font-semibold text-[#04696C] bg-[#EAF3F1] inline-block px-3 py-1 rounded-full">
                  Fiche conforme MSAS
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PulseDivider tone="dark" />

      {/* ── COMMENT ÇA MARCHE — checkpoints along the trace ───────────────── */}
      <section id="fonctionnement" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold">Trois arrêts jusqu'au terrain</h2>
            <p className="text-[#3E4949]">Du premier contact à l'enrôlement des agents de santé — chaque étape est un point sur la même ligne.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-[#DCE4DE]" />
            {[
              { n: '01', t: 'Soumettez votre demande', d: 'Remplissez le formulaire avec vos dates, lieu, type de structure et nombre de patients ciblés.', c: '#04696C' },
              { n: '02', t: 'Validation & Configuration', d: "Notre équipe valide la campagne et configure l'espace dédié à votre organisation.", c: '#2A7F82' },
              { n: '03', t: 'Enrôlement & Déploiement', d: 'Inscrivez vos agents de santé et commencez la collecte des données sur le terrain.', c: '#7C2FE0' },
            ].map((s) => (
              <div key={s.n} className="relative p-8 bg-[#FAF8F4] rounded-2xl border border-[#DCE4DE]">
                <span
                  className="absolute -top-4 left-8 w-8 h-8 rounded-full text-white font-mono text-xs font-semibold flex items-center justify-center ring-4 ring-white"
                  style={{ background: s.c }}
                >
                  {s.n}
                </span>
                <h3 className="text-lg font-display font-semibold mb-2 mt-3">{s.t}</h3>
                <p className="text-xs text-[#3E4949] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE ─────────────────────────────────────────────────── */}
      <section id="demande-campagne" className="py-24 bg-[#EAF3F1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[28px] p-8 sm:p-12 shadow-xl border border-[#DCE4DE]">
            <div className="max-w-2xl mb-10 space-y-3">
              <span className="text-[11px] font-semibold text-[#04696C] uppercase tracking-[0.14em] font-mono">Formulaire Partenaire</span>
              <h2 className="text-3xl font-display font-semibold">Demande d'organisation de campagne</h2>
              <p className="text-sm text-[#3E4949]">Transmettez-nous les caractéristiques de votre projet. Notre équipe vous recontactera sous 24h pour finaliser la mise en place.</p>
            </div>

            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#EAF3F1] border border-[#04696C]/25 p-8 rounded-2xl text-center space-y-4"
              >
                <div className="w-14 h-14 bg-[#04696C] text-white rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
                <h3 className="text-2xl font-display font-semibold">Demande enregistrée avec succès !</h3>
                <p className="text-sm text-[#3E4949] max-w-md mx-auto">
                  Merci pour votre engagement. Un responsable de la plateforme Depisteel prendra contact avec vous rapidement à l'adresse <strong>{formData.contact_email}</strong>. Un e-mail vous sera transmis après réception et approbation de votre demande.
                </p>
                <button onClick={() => setSubmitSuccess(false)} className="bg-[#04696C] text-white font-semibold px-6 py-2.5 rounded-full text-xs hover:bg-[#053638] transition-colors">
                  Soumettre une autre demande
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {errorMessage && (
                  <div className="p-4 bg-[#E5484D]/10 border border-[#E5484D]/30 text-[#E5484D] rounded-xl text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Fiche 1 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-semibold text-[#04696C] uppercase tracking-[0.12em] border-b border-[#DCE4DE] pb-2">
                    Fiche 01 — Organisation & Contact
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Nom de l'organisation *</label>
                      <input
                        type="text" required value={formData.org_name}
                        onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                        placeholder="Ex: Association Siggil Jigeen / ONG Santé"
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Type de structure *</label>
                      <select
                        value={formData.org_type}
                        onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm bg-white"
                      >
                        <option value="association">Association de femmes</option>
                        <option value="ong">ONG / Organisation non gouvernementale</option>
                        <option value="health_center">Centre de santé / Hôpital</option>
                        <option value="state">Structure de l'État / MSAS</option>
                        <option value="other">Autre organisation</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Nom du contact *</label>
                      <input
                        type="text" required value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        placeholder="Prénom & Nom"
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Email de contact *</label>
                      <input
                        type="email" required value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="contact@ong.org"
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Téléphone *</label>
                      <input
                        type="tel" required value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="+221 77 000 00 00"
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Fiche 2 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-semibold text-[#04696C] uppercase tracking-[0.12em] border-b border-[#DCE4DE] pb-2">
                    Fiche 02 — Localisation & Dates
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Région principale *</label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm bg-white"
                      >
                        {SENEGAL_REGIONS.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">District Sanitaire</label>
                      <input
                        type="text" value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Ex: District de Mbour"
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Centre / Lieu proposé</label>
                      <input
                        type="text" value={formData.health_center_name}
                        onChange={(e) => setFormData({ ...formData, health_center_name: e.target.value })}
                        placeholder="Ex: Centre de Santé de Popenguine"
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Date de début souhaitée</label>
                      <input
                        type="date" value={formData.preferred_start_date}
                        onChange={(e) => setFormData({ ...formData, preferred_start_date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Date de fin souhaitée</label>
                      <input
                        type="date" value={formData.preferred_end_date}
                        onChange={(e) => setFormData({ ...formData, preferred_end_date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Nombre d'usagers estimé</label>
                      <input
                        type="number" value={formData.expected_patients}
                        onChange={(e) => setFormData({ ...formData, expected_patients: e.target.value })}
                        placeholder="Ex: 500"
                        className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Fiche 3 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-semibold text-[#04696C] uppercase tracking-[0.12em] border-b border-[#DCE4DE] pb-2">
                    Fiche 03 — Type(s) de dépistage souhaité(s) *
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${formData.covers_col ? 'border-[#7C2FE0] bg-[#7C2FE0]/5' : 'border-[#DCE4DE] bg-white'}`}>
                      <input type="checkbox" checked={formData.covers_col} onChange={(e) => setFormData({ ...formData, covers_col: e.target.checked })} className="w-5 h-5 accent-[#7C2FE0]" />
                      <div>
                        <strong className="block text-xs">Col de l'Utérus</strong>
                        <span className="text-[10px] text-[#3E4949]">Test HPV / IVL / IA</span>
                      </div>
                    </label>

                    <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${formData.covers_sein ? 'border-[#E5484D] bg-[#E5484D]/5' : 'border-[#DCE4DE] bg-white'}`}>
                      <input type="checkbox" checked={formData.covers_sein} onChange={(e) => setFormData({ ...formData, covers_sein: e.target.checked })} className="w-5 h-5 accent-[#E5484D]" />
                      <div>
                        <strong className="block text-xs">Cancer du Sein</strong>
                        <span className="text-[10px] text-[#3E4949]">Palpation & Mammo</span>
                      </div>
                    </label>

                    <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${formData.covers_prostate ? 'border-[#04696C] bg-[#04696C]/5' : 'border-[#DCE4DE] bg-white'}`}>
                      <input type="checkbox" checked={formData.covers_prostate} onChange={(e) => setFormData({ ...formData, covers_prostate: e.target.checked })} className="w-5 h-5 accent-[#04696C]" />
                      <div>
                        <strong className="block text-xs">Prostate</strong>
                        <span className="text-[10px] text-[#3E4949]">PSA & TR</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E4949] mb-1.5">Informations complémentaires / Besoins spécifiques</label>
                  <textarea
                    rows={3} value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Besoins en matériel, logistique caravane, agents formés sur place..."
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE4DE] focus:border-[#04696C] focus:outline-hidden text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-[#04696C] hover:bg-[#053638] text-white font-semibold py-4 rounded-full shadow-lg hover:shadow-xl transition-all text-base flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {submitting ? (
                    <span>Envoi de votre demande en cours...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Envoyer ma demande d'organisation de campagne
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#0B1F24] text-white py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1200 20" preserveAspectRatio="none" className="w-full h-5 opacity-40">
            <path d="M0,10 L560,10 L580,10 L590,2 L600,18 L610,4 L620,10 L640,10 L1200,10" fill="none" stroke="#E5484D" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full border-2 border-[#C9B8EE] bg-white/5 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <path d="M2 20 H13 L16 12 L20 28 L23 20 H38" fill="none" stroke="#E5484D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-display font-semibold tracking-tight">DEPISTEEL</span>
          </div>

          <p className="text-xs text-[#9FB0AC] text-center md:text-left font-mono">
            Depisteel © 2026 — Plateforme Nationale de Dépistage Multi-Cancer & Prévention Sanitaire.
          </p>

          <div className="flex items-center space-x-6 text-xs text-[#9FB0AC]">
            <Link to="/login" className="hover:text-white transition-colors">Espace Professionnel</Link>
            <a href="#demande-campagne" className="hover:text-white transition-colors">Demander une campagne</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;