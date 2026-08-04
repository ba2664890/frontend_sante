import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import screeningService from '../services/screeningService.ts';

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
    color: '#9013fe',
    badge: 'Santé Communautaire',
    description: 'Organisez des dépistages de masse pour vos membres et communautés. Nous fournissons la technologie, les outils de sensibilisation et le suivi.',
  },
  {
    id: 'ong',
    icon: 'public',
    title: 'ONG & Partenaires',
    color: '#006669',
    badge: 'Projets d\'Impact',
    description: 'Déployez des caravanes mobiles financées avec tableau de bord d\'impact en temps réel, indicateurs OMS et traçabilité complète des soins.',
  },
  {
    id: 'health_center',
    icon: 'local_hospital',
    title: 'Centres de Santé & Hôpitaux',
    color: '#2a7f82',
    badge: 'Digitalisation Clés en Main',
    description: 'Équipez vos prestataires d\'une solution multi-cancer (Col, Sein, Prostate) avec assistance IA et gestion centralisée des dossiers.',
  },
  {
    id: 'state',
    icon: 'account_balance',
    title: 'Structures de l\'État (MSAS)',
    color: '#091e25',
    badge: 'Stratégie Nationale',
    description: 'Supervisez la couverture régionale, surveillez les objectifs OMS 90-70-90 et cartographiez les cas sur l\'ensemble du territoire national.',
  },
];

const CANCERS = [
  { id: 'col', name: 'Cancer du Col de l\'Utérus', color: '#9013fe', icon: 'female', desc: 'Test HPV, IVA/IVL et IA prédictive' },
  { id: 'sein', name: 'Cancer du Sein', color: '#e02020', icon: 'female', desc: 'Examen clinique, Mammographie & BIRADS' },
  { id: 'prostate', name: 'Cancer de la Prostate', color: '#006669', icon: 'male', desc: 'Toucher rectal, Dosage PSA & Score IPSS' },
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      setErrorMessage(err.message || 'Une erreur est survenue lors de l\'envoi de votre demande.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('demande-campagne')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fcfd] text-[#091e25] font-sans">
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#bec9c9]/20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006669] to-[#2a7f82] flex items-center justify-center text-white font-bold text-xl shadow-md">
              D
            </div>
            <div>
              <span className="text-2xl font-black text-[#091e25] tracking-tight">DEPISTEEL</span>
              <span className="block text-[10px] uppercase font-bold text-[#006669] tracking-wider">Santé & Prévention Multi-Cancer</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#3e4949]">
            <a href="#services" className="hover:text-[#006669] transition-colors">Nos Services</a>
            <a href="#cancers" className="hover:text-[#006669] transition-colors">Cancers Couverts</a>
            <a href="#fonctionnement" className="hover:text-[#006669] transition-colors">Comment ça marche</a>
            <button onClick={scrollToForm} className="hover:text-[#006669] transition-colors font-bold">Organiser une Campagne</button>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'global_admin' || user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard')}
                className="bg-[#006669] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#2a7f82] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Mon Espace ({user.first_name || user.username})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-[#006669] hover:text-[#091e25] px-4 py-2 transition-colors"
                >
                  Connexion Pro
                </Link>
                <button
                  onClick={scrollToForm}
                  className="bg-gradient-to-r from-[#006669] to-[#2a7f82] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Demander une Campagne
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 bg-gradient-to-b from-[#eaf6f6]/60 via-[#f8fcfd] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dcf1fb] text-[#006669] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#006669] animate-pulse"></span>
                Plateforme Nationale de Dépistage & Suivi AI
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#091e25] leading-tight">
                Organisez vos Campagnes de Dépistage <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006669] to-[#9013fe]">Multi-Cancer</span>
              </h1>

              <p className="text-lg text-[#3e4949] leading-relaxed max-w-2xl">
                Depisteel met à disposition des <strong>ONG, associations de femmes, structures de l'État et centres de santé</strong> une technologie de pointe pour planifier, exécuter et enrôler les agents de terrain pour les dépistages du <strong>Col de l'utérus, Sein et Prostate</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <button
                  onClick={scrollToForm}
                  className="bg-[#006669] hover:bg-[#2a7f82] text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-base"
                >
                  <span className="material-symbols-outlined">campaign</span>
                  Demander une campagne clé en main
                </button>
                {user ? (
                  <Link
                    to="/admin/dashboard"
                    className="bg-white text-[#006669] border-2 border-[#006669]/20 hover:border-[#006669] font-bold px-6 py-4 rounded-2xl transition-all text-center text-base"
                  >
                    Accéder à mon tableau de bord
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-white text-[#091e25] border border-[#bec9c9] hover:border-[#006669] font-bold px-6 py-4 rounded-2xl transition-all text-center text-base"
                  >
                    Espace Professionnel Santé
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-[#bec9c9]/20 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-black text-[#006669]">10 000+</div>
                  <div className="text-xs text-[#3e4949] font-medium">Patients dépistés</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#9013fe]">14 Régions</div>
                  <div className="text-xs text-[#3e4949] font-medium">Couverture Sénégal</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#2a7f82]">OMS 90-70-90</div>
                  <div className="text-xs text-[#3e4949] font-medium">Conformité sanitaire</div>
                </div>
              </div>
            </div>

            {/* Illustration / Card preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-[#bec9c9]/20 space-y-6">
                <div className="flex items-center justify-between border-b border-[#f2fbff] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-[#e02020]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#795500]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#006669]"></div>
                  </div>
                  <span className="text-xs font-bold text-[#006669] bg-[#dcf1fb] px-3 py-1 rounded-full">
                    Aperçu Campagne Active
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#f8fcfd] p-4 rounded-2xl border border-[#006669]/10">
                    <div className="flex justify-between text-xs font-bold text-[#3e4949] mb-1">
                      <span>Campagne Octobre Rose — Thiès</span>
                      <span className="text-[#006669]">85% réalisé</span>
                    </div>
                    <div className="w-full bg-[#bec9c9]/20 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#006669] to-[#9013fe] h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[#9013fe]/5 rounded-xl border border-[#9013fe]/10">
                      <span className="block text-xs text-[#9013fe] font-bold">Col</span>
                      <span className="text-lg font-bold text-[#091e25]">1 240</span>
                    </div>
                    <div className="p-3 bg-[#e02020]/5 rounded-xl border border-[#e02020]/10">
                      <span className="block text-xs text-[#e02020] font-bold">Sein</span>
                      <span className="text-lg font-bold text-[#091e25]">980</span>
                    </div>
                    <div className="p-3 bg-[#006669]/5 rounded-xl border border-[#006669]/10">
                      <span className="block text-xs text-[#006669] font-bold">Prostate</span>
                      <span className="text-lg font-bold text-[#091e25]">450</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#f2fbff] rounded-2xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#006669]">group_add</span>
                    <div className="text-xs">
                      <strong className="block text-[#091e25]">Enrôlement des agents instantané</strong>
                      <span className="text-[#3e4949]">Invitation par lien & affectation par structure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEGMENTS CIBLES B2B ──────────────────────────────────────────────── */}
      <section id="services" className="py-20 bg-white border-y border-[#bec9c9]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-[#006669] uppercase tracking-widest bg-[#dcf1fb] px-3 py-1 rounded-full">
              Partenaires & Institutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#091e25]">
              Une solution adaptée à chaque acteur de santé
            </h2>
            <p className="text-[#3e4949] text-base">
              Que vous soyez une association locale ou un ministère, Depisteel adapte son infrastructure pour déployer vos campagnes sur le terrain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TARGET_AUDIENCES.map((target) => (
              <div
                key={target.id}
                className="bg-[#f8fcfd] rounded-3xl p-6 border border-[#bec9c9]/20 hover:border-[#006669]/40 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: target.color }}>
                    <span className="material-symbols-outlined text-2xl">{target.icon}</span>
                  </div>

                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md" style={{ color: target.color, background: `${target.color}15` }}>
                    {target.badge}
                  </span>

                  <h3 className="text-xl font-bold text-[#091e25]">{target.title}</h3>
                  <p className="text-xs text-[#3e4949] leading-relaxed">{target.description}</p>
                </div>

                <button
                  onClick={scrollToForm}
                  className="mt-6 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: target.color }}
                >
                  Demander pour ce secteur <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CANCERS COUVERTS ─────────────────────────────────────────────────── */}
      <section id="cancers" className="py-20 bg-[#f8fcfd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-[#9013fe] uppercase tracking-widest bg-[#9013fe]/10 px-3 py-1 rounded-full">
              Dépistage Tri-Cancer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#091e25]">
              Trois modules spécialisés sur une seule plateforme
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {CANCERS.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl p-8 border-t-4 shadow-sm hover:shadow-md transition-all" style={{ borderTopColor: c.color }}>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white" style={{ background: c.color }}>
                  <span className="material-symbols-outlined">{c.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#091e25] mb-2">{c.name}</h3>
                <p className="text-sm text-[#3e4949] mb-4">{c.desc}</p>
                <div className="text-xs font-semibold text-[#006669] bg-[#dcf1fb] inline-block px-3 py-1 rounded-full">
                  Fiche de collecte conforme MSAS
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ───────────────────────────────────────────────── */}
      <section id="fonctionnement" className="py-20 bg-white border-t border-[#bec9c9]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-[#091e25]">
              Comment mettre en place votre campagne ?
            </h2>
            <p className="text-[#3e4949]">Du premier contact à l'enrôlement des agents de santé sur le terrain.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="p-8 bg-[#f8fcfd] rounded-3xl border border-[#bec9c9]/20 relative">
              <span className="w-10 h-10 rounded-2xl bg-[#006669] text-white font-bold flex items-center justify-center mb-6">1</span>
              <h3 className="text-xl font-bold text-[#091e25] mb-2">Soumettez votre demande</h3>
              <p className="text-xs text-[#3e4949]">Remplissez le formulaire ci-dessous avec vos dates, lieu, type de structure et nombre de patients ciblés.</p>
            </div>

            <div className="p-8 bg-[#f8fcfd] rounded-3xl border border-[#bec9c9]/20 relative">
              <span className="w-10 h-10 rounded-2xl bg-[#2a7f82] text-white font-bold flex items-center justify-center mb-6">2</span>
              <h3 className="text-xl font-bold text-[#091e25] mb-2">Validation & Configuration</h3>
              <p className="text-xs text-[#3e4949]">Notre équipe valide la campagne et configure l'espace dédié à votre organisation.</p>
            </div>

            <div className="p-8 bg-[#f8fcfd] rounded-3xl border border-[#bec9c9]/20 relative">
              <span className="w-10 h-10 rounded-2xl bg-[#9013fe] text-white font-bold flex items-center justify-center mb-6">3</span>
              <h3 className="text-xl font-bold text-[#091e25] mb-2">Enrôlement & Déploiement</h3>
              <p className="text-xs text-[#3e4949]">Inscrivez vos agents de santé sur la plateforme et commencez la collecte des données sur le terrain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE DE DEMANDE DE CAMPAGNE ───────────────────────────────── */}
      <section id="demande-campagne" className="py-24 bg-gradient-to-b from-[#eaf6f6]/40 to-[#f8fcfd]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#006669]/20">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
              <span className="text-xs font-bold text-[#006669] uppercase tracking-widest bg-[#dcf1fb] px-3 py-1 rounded-full">
                Formulaire Partenaire
              </span>
              <h2 className="text-3xl font-black text-[#091e25]">
                Demande d'organisation de Campagne
              </h2>
              <p className="text-xs sm:text-sm text-[#3e4949]">
                Transmettez-nous les caractéristiques de votre projet. Notre équipe vous recontactera sous 24h pour finaliser la mise en place.
              </p>
            </div>

            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#dcf1fb] border border-[#006669]/30 p-8 rounded-2xl text-center space-y-4"
              >
                <div className="w-16 h-16 bg-[#006669] text-white rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-[#091e25]">Demande enregistrée avec succès !</h3>
                <p className="text-sm text-[#3e4949] max-w-md mx-auto">
                  Merci pour votre engagement. Un responsable de la plateforme Depisteel prendra contact avec vous rapidement à l'adresse <strong>{formData.contact_email}</strong>.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-[#006669] text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-[#2a7f82] transition-colors"
                >
                  Soumettre une autre demande
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-4 bg-[#e02020]/10 border border-[#e02020]/30 text-[#e02020] rounded-xl text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Section 1 : Organisation */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#006669] uppercase tracking-wider border-b border-[#bec9c9]/20 pb-2">
                    1. Votre Organisation & Contact
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Nom de l'organisation *</label>
                      <input
                        type="text"
                        required
                        value={formData.org_name}
                        onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                        placeholder="Ex: Association Siggil Jigeen / ONG Sante"
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Type de structure *</label>
                      <select
                        value={formData.org_type}
                        onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm bg-white"
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
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Nom du contact *</label>
                      <input
                        type="text"
                        required
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        placeholder="Prénom & Nom"
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Email de contact *</label>
                      <input
                        type="email"
                        required
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="contact@ong.org"
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="+221 77 000 00 00"
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2 : Détails de la Campagne */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold text-[#006669] uppercase tracking-wider border-b border-[#bec9c9]/20 pb-2">
                    2. Localisation & Dates Souhaitées
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Région principale *</label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm bg-white"
                      >
                        {SENEGAL_REGIONS.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">District Sanitaire</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Ex: District de Mbour"
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Centre / Lieu proposé</label>
                      <input
                        type="text"
                        value={formData.health_center_name}
                        onChange={(e) => setFormData({ ...formData, health_center_name: e.target.value })}
                        placeholder="Ex: Centre de Santé de Popenguine"
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Date de début souhaitée</label>
                      <input
                        type="date"
                        value={formData.preferred_start_date}
                        onChange={(e) => setFormData({ ...formData, preferred_start_date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Date de fin souhaitée</label>
                      <input
                        type="date"
                        value={formData.preferred_end_date}
                        onChange={(e) => setFormData({ ...formData, preferred_end_date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3e4949] mb-1">Nombre d'usagers estimé</label>
                      <input
                        type="number"
                        value={formData.expected_patients}
                        onChange={(e) => setFormData({ ...formData, expected_patients: e.target.value })}
                        placeholder="Ex: 500"
                        className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3 : Types de Dépistage */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold text-[#006669] uppercase tracking-wider border-b border-[#bec9c9]/20 pb-2">
                    3. Type(s) de Dépistage Souhaité(s) *
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${formData.covers_col ? 'border-[#9013fe] bg-[#9013fe]/5' : 'border-[#bec9c9]/30 bg-white'}`}>
                      <input
                        type="checkbox"
                        checked={formData.covers_col}
                        onChange={(e) => setFormData({ ...formData, covers_col: e.target.checked })}
                        className="w-5 h-5 accent-[#9013fe]"
                      />
                      <div>
                        <strong className="block text-xs text-[#091e25]">Col de l'Utérus</strong>
                        <span className="text-[10px] text-[#3e4949]">Test HPV / IVL / IA</span>
                      </div>
                    </label>

                    <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${formData.covers_sein ? 'border-[#e02020] bg-[#e02020]/5' : 'border-[#bec9c9]/30 bg-white'}`}>
                      <input
                        type="checkbox"
                        checked={formData.covers_sein}
                        onChange={(e) => setFormData({ ...formData, covers_sein: e.target.checked })}
                        className="w-5 h-5 accent-[#e02020]"
                      />
                      <div>
                        <strong className="block text-xs text-[#091e25]">Cancer du Sein</strong>
                        <span className="text-[10px] text-[#3e4949]">Palpation & Mammo</span>
                      </div>
                    </label>

                    <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${formData.covers_prostate ? 'border-[#006669] bg-[#006669]/5' : 'border-[#bec9c9]/30 bg-white'}`}>
                      <input
                        type="checkbox"
                        checked={formData.covers_prostate}
                        onChange={(e) => setFormData({ ...formData, covers_prostate: e.target.checked })}
                        className="w-5 h-5 accent-[#006669]"
                      />
                      <div>
                        <strong className="block text-xs text-[#091e25]">Prostate</strong>
                        <span className="text-[10px] text-[#3e4949]">PSA & TR</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Section 4 : Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#3e4949] mb-1">Informations complémentaires / Besoins spécifiques</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Besoins en matériel, logistique caravane, agents formés sur place..."
                    className="w-full px-4 py-3 rounded-xl border border-[#bec9c9]/50 focus:border-[#006669] focus:outline-hidden text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#006669] to-[#2a7f82] hover:from-[#2a7f82] hover:to-[#006669] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base flex items-center justify-center gap-3"
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

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#091e25] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#006669] flex items-center justify-center font-bold text-white">
              D
            </div>
            <span className="text-xl font-black tracking-tight">DEPISTEEL</span>
          </div>

          <p className="text-xs text-[#bec9c9] text-center md:text-left">
            Depisteel © 2026 — Plateforme Nationale de Dépistage Multi-Cancer & Prévention Sanitaire.
          </p>

          <div className="flex items-center space-x-6 text-xs text-[#bec9c9]">
            <Link to="/login" className="hover:text-white transition-colors">Espace Professionnel</Link>
            <a href="#demande-campagne" className="hover:text-white transition-colors">Demander une campagne</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;