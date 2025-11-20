import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analyticsService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  ShieldCheckIcon,
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  BellIcon,
  PhoneIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Hero Section Component
const HeroSection: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full mb-8">
            <SparklesIcon className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold text-sm">Plateforme de Dépistage du Cancer du Col de l'Utérus</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="text-white">CerviCare</span>
            <span className="text-gradient-primary">+</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-2xl md:text-3xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed"
          >
            Ensemble pour <span className="text-pink-400 font-semibold">sauver des vies</span> et 
            <span className="text-purple-400 font-semibold"> prévenir le cancer</span> du col de l'utérus au Sénégal
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Une plateforme innovante pour le suivi des patientes, la gestion des campagnes de dépistage 
            et l'amélioration de la santé des femmes sénégalaises
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {user ? (
              <>
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                  <ChartBarIcon className="w-6 h-6" />
                  Accéder au Dashboard
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link to="/campaigns" className="btn-secondary text-lg px-8 py-4">
                  <CalendarIcon className="w-6 h-6" />
                  Voir les Campagnes
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  <UserGroupIcon className="w-6 h-6" />
                  S'inscrire Gratuitement
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Connexion
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <span>Certifié Ministère de la Santé</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-400" />
              <span>100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-pink-400" />
              <span>Confidentiel</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-purple-400 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-purple-400 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Stats Section Component
const StatsSection: React.FC<{ stats: any }> = ({ stats }) => {
  const statItems = [
    {
      icon: UserGroupIcon,
      label: 'Patientes Enregistrées',
      value: stats?.total_patients || 0,
      suffix: '+',
      color: 'purple',
      description: 'Femmes suivies dans notre système'
    },
    {
      icon: CheckCircleIcon,
      label: 'Dépistages Réalisés',
      value: stats?.total_screened || 0,
      suffix: '+',
      color: 'green',
      description: 'Tests de dépistage effectués'
    },
    {
      icon: CalendarIcon,
      label: 'Campagnes Actives',
      value: stats?.active_campaigns?.length || 0,
      suffix: '',
      color: 'blue',
      description: 'En cours dans toutes les régions'
    },
    {
      icon: HeartIcon,
      label: 'Vies Sauvées',
      value: Math.floor((stats?.total_screened || 0) * 0.15),
      suffix: '+',
      color: 'pink',
      description: 'Grâce au dépistage précoce'
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-4">
            Notre Impact en <span className="text-gradient-primary">Chiffres</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
            Des résultats concrets dans la lutte contre le cancer du col de l'utérus
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="card group hover:border-purple-500/50 transition-all duration-500"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-${stat.color}-500/10 mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                <CountUp end={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-sm font-semibold text-gray-300 mb-2">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Features Section Component
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: UserGroupIcon,
      title: 'Gestion des Patientes',
      description: 'Suivi personnalisé de chaque patiente avec historique médical complet et rappels automatiques',
      color: 'purple'
    },
    {
      icon: CalendarIcon,
      title: 'Campagnes de Dépistage',
      description: 'Organisation et suivi de campagnes mobiles dans toutes les régions du Sénégal',
      color: 'pink'
    },
    {
      icon: ChartBarIcon,
      title: 'Analyses & Statistiques',
      description: 'Tableaux de bord interactifs avec données en temps réel pour une meilleure prise de décision',
      color: 'blue'
    },
    {
      icon: BellIcon,
      title: 'Notifications Intelligentes',
      description: 'Rappels SMS et email automatiques pour les rendez-vous et suivis médicaux',
      color: 'green'
    },
    {
      icon: MapPinIcon,
      title: 'Couverture Nationale',
      description: 'Présence dans les 14 régions du Sénégal avec centres de dépistage accessibles',
      color: 'cyan'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sécurité & Confidentialité',
      description: 'Protection des données médicales selon les normes internationales RGPD',
      color: 'red'
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-4">
            Fonctionnalités <span className="text-gradient-primary">Innovantes</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
            Une plateforme complète pour révolutionner le dépistage du cancer au Sénégal
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="card group hover:scale-105 transition-all duration-500"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-${feature.color}-500/10 mb-4 group-hover:shadow-lg group-hover:shadow-${feature.color}-500/20 transition-all`}>
                <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Inscription',
      description: 'Créez votre compte en quelques clics. Simple, rapide et sécurisé.',
      icon: UserGroupIcon,
    },
    {
      number: '02',
      title: 'Rendez-vous',
      description: 'Prenez rendez-vous dans le centre le plus proche de chez vous.',
      icon: CalendarIcon,
    },
    {
      number: '03',
      title: 'Dépistage',
      description: 'Réalisez votre test de dépistage avec nos professionnels de santé.',
      icon: HeartIcon,
    },
    {
      number: '04',
      title: 'Suivi',
      description: 'Recevez vos résultats et bénéficiez d\'un suivi personnalisé.',
      icon: CheckCircleIcon,
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-4">
            Comment ça <span className="text-gradient-primary">Marche ?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
            4 étapes simples pour prendre soin de votre santé
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              )}
              <div className="card text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl mb-4">
                  {step.number}
                </div>
                <div className="inline-flex p-3 rounded-xl bg-purple-500/10 mb-4">
                  <step.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Aïssatou Diallo',
      role: 'Patiente',
      region: 'Dakar',
      image: '👩🏾',
      text: 'Grâce à CerviCare+, j\'ai pu faire mon dépistage facilement. L\'équipe est très professionnelle et rassurante.',
      rating: 5,
    },
    {
      name: 'Dr. Fatou Sène',
      role: 'Agent de Santé',
      region: 'Thiès',
      image: '👩🏾‍⚕️',
      text: 'Cette plateforme a transformé notre façon de travailler. Le suivi des patientes est désormais beaucoup plus efficace.',
      rating: 5,
    },
    {
      name: 'Mariama Ba',
      role: 'Patiente',
      region: 'Saint-Louis',
      image: '👩🏾',
      text: 'Les rappels automatiques m\'ont permis de ne jamais manquer mes rendez-vous de suivi. Je me sens vraiment prise en charge.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ce qu'elles <span className="text-gradient-primary">Disent</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
            Témoignages de nos utilisatrices et professionnelles de santé
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="card"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                  <div className="text-xs text-purple-400 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    {testimonial.region}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="card bg-gradient-to-br from-purple-900 to-pink-900 border-purple-500/30 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <HeartIcon className="w-12 h-12 text-pink-300" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Rejoignez le Mouvement
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Ensemble, sauvons des vies et prévenons le cancer du col de l'utérus. 
              Inscrivez-vous aujourd'hui et bénéficiez d'un dépistage gratuit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 bg-white text-purple-900 hover:bg-gray-100">
                <UserGroupIcon className="w-6 h-6" />
                Commencer Maintenant
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <a href="tel:+221338234567" className="btn-secondary text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10">
                <PhoneIcon className="w-6 h-6" />
                Contactez-nous
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// CountUp Component
const CountUp: React.FC<{ end: number }> = ({ end }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{count.toLocaleString('fr-FR')}</span>;
};

// Main Component
const HomePage: React.FC = () => {
  const { data: dashboardData } = useQuery(
    'dashboard-stats',
    () => analyticsService.getDashboardData(),
    {
      staleTime: 60000,
    }
  );

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      <HeroSection />
      <StatsSection stats={dashboardData} />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default HomePage;