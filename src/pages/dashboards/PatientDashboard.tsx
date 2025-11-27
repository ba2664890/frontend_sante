import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { analyticsService } from '../../services/analyticsService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import StatCard from '../../components/StatCard.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import {
  ClockIcon,
  ChatBubbleLeftIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  const { data: patientData, isLoading } = useQuery(
    ['patient-dashboard', user?.id],
    () => analyticsService.getPatientDashboardData(),
    {
      enabled: !!user,
    }
  );

  const educationalVideos = [
    {
      id: 1,
      title: "Comprendre le dépistage du cancer du col de l'utérus",
      duration: "Info",
      description: "Site officiel avec toutes les informations essentielles",
      thumbnail: "🎥",
      url: "https://jefaismondepistage.cancer.fr/cancer-du-col-de-l-uterus/"
    },
    {
      id: 2,
      title: "Le dépistage en pratique",
      duration: "Guide",
      description: "Comment se déroule l'examen étape par étape",
      thumbnail: "📋",
      url: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.youtube.com/watch%3Fv%3D0GsKk8gmVvA&ved=2ahUKEwjpsYjb2pKRAxVgOPsDHQPSPGMQtwJ6BAgQEAI&usg=AOvVaw0IZ-ONk08ZZDGZoiS2vram"
    },
    {
      id: 3,
      title: "Dépistage organisé - Ameli",
      duration: "Info",
      description: " cancer du col de l'utérus. Dépistage, symptômes, vaccin, frottis… On fait le point",
      thumbnail: "💳",
      url: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.youtube.com/watch%3Fv%3DN8lNxXqT8PI&ved=2ahUKEwi7uqae2pKRAxWdNvsDHaxPHMUQtwJ6BAgTEAI&usg=AOvVaw3dGkdMWt-i0hERhY7iQt8b"
    }
  ];

  const faqItems = [
    {
      question: "Le dépistage est-il douloureux ?",
      answer: "L'examen n'est généralement pas douloureux, mais peut être ressenti comme désagréable. Il dure seulement quelques minutes. Votre professionnel de santé vous aidera à vous détendre."
    },
    {
      question: "Que signifie un test HPV positif ?",
      answer: "Un test HPV positif ne signifie pas que vous avez un cancer. Dans 90% des cas, l'infection disparaît naturellement. Un suivi adapté vous sera proposé."
    },
    {
      question: "À quelle fréquence faut-il se faire dépister ?",
      answer: "De 25 à 29 ans : frottis tous les 3 ans. À partir de 30 ans : test HPV tous les 5 ans. Même vaccinées, le dépistage reste essentiel."
    }
  ];

  const preventionTips = [
    {
      icon: "💉",
      title: "Vaccination HPV",
      description: "La vaccination protège contre les types de HPV les plus dangereux"
    },
    {
      icon: "🔬", 
      title: "Dépistage régulier",
      description: "Le meilleur moyen de détecter précocement les anomalies"
    },
    {
      icon: "🛡️",
      title: "Hygiène de vie",
      description: "Un mode de vie sain renforce votre système immunitaire"
    }
  ];
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Prochain RDV',
      value: patientData?.next_appointment?.date || 'Aucun',
      icon: ClockIcon,
      color: 'primary'
    },
    {
      title: 'Messages',
      value: patientData?.unread_messages || 0,
      icon: ChatBubbleLeftIcon,
      color: 'info'
    },
    {
      title: 'Dépistages',
      value: patientData?.screening_count || 0,
      icon: DocumentCheckIcon,
      color: 'success'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-4">
      {/* Header avec statistiques */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Section principale */}
      <div className="max-w-6xl mx-auto">
        {/* Status actuel */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg border border-indigo-200 rounded-3xl p-8 mb-8 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔬</span>
            </div>
            
            <h2 className="text-2xl font-bold text-indigo-700 tracking-tight">
              Analyse en cours
            </h2>

            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
              Votre échantillon a été pris en charge avec succès.
              Nos équipes médicales sont en train d'effectuer les analyses nécessaires afin de garantir des résultats fiables, précis et sécurisés.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg">
              Nous vous informerons immédiatement dès que la validation finale sera prête.
            </p>

            <p className="text-indigo-600 font-medium italic text-base">
              Merci pour votre confiance. Votre santé mérite l'excellence. 🩺
            </p>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'info'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📚 Informations
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎥 Vidéos
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'faq'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ❓ FAQ
            </button>
            <button
              onClick={() => setActiveTab('prevention')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'prevention'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🛡️ Prévention
            </button>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Comprendre le dépistage du cancer du col</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🔬</span>
                    Qu'est-ce que le dépistage ?
                  </h4>
                  <p className="text-blue-700 leading-relaxed">
                    Le dépistage permet de détecter précocement les cellules anormales du col de l'utérus avant qu'elles ne deviennent cancéreuses. C'est un geste préventif essentiel qui sauve des vies.
                  </p>
                </div>

                <div className="bg-pink-50 rounded-xl p-6">
                  <h4 className="font-semibold text-pink-800 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🧬</span>
                    Le test HPV
                  </h4>
                  <p className="text-pink-700 leading-relaxed">
                    À partir de 30 ans, le test HPV remplace le frottis classique. Il détecte les virus à haut risque qui pourraient provoquer des lésions. Plus efficace, plus rassurant.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="text-2xl mr-2">📊</span>
                    Résultats et suivi
                  </h4>
                  <p className="text-green-700 leading-relaxed">
                    Un résultat positif ne signifie pas cancer. Dans 90% des cas, l'infection disparaît naturellement. Un suivi adapté est proposé selon votre situation personnelle.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="text-2xl mr-2">⏰</span>
                    Fréquence du dépistage
                  </h4>
                  <p className="text-purple-700 leading-relaxed">
                    De 25 à 29 ans : frottis tous les 3 ans. À partir de 30 ans : test HPV tous les 5 ans. Un rythme adapté à votre âge pour une protection optimale.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  Chiffres rassurants
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">90%</div>
                    <div className="text-yellow-700 text-sm">des cancers évitables avec le dépistage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">10-15 ans</div>
                    <div className="text-yellow-700 text-sm">de progression lente vers le cancer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">95%</div>
                    <div className="text-yellow-700 text-sm">de guérison en détection précoce</div>
                  </div>
                </div>
              </div>
            </div>
          )}


        {activeTab === 'videos' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Vidéos éducatives</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationalVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-4xl">{video.thumbnail}</span>
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-2">{video.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{video.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">⏱️ {video.duration}</span>
                    <button
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      onClick={() => setSelectedVideo(video)}
                    >
                      ▶️ Regarder
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- MODAL VIDÉO --- */}
            {selectedVideo && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-4 w-full max-w-3xl shadow-xl">
                  <h3 className="text-lg font-bold mb-3">{selectedVideo.title}</h3>

                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-4">
                    <iframe
                      src={selectedVideo.url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={() => setSelectedVideo(null)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-800 mb-3">Pourquoi ces vidéos sont importantes ?</h4>
                <ul className="space-y-2 text-blue-700">
                  <li>• Elles vous aident à comprendre chaque étape du processus</li>
                  <li>• Elles répondent aux questions les plus fréquentes</li>
                  <li>• Elles vous rassurent avec des témoignages positifs</li>
                  <li>• Elles vous préparent mentalement à l'examen</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Questions fréquentes</h3>
              
              {faqItems.map((item, index) => (
                <details key={index} className="bg-gray-50 rounded-xl">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-800 hover:bg-gray-100 rounded-xl">
                    {item.question}
                  </summary>
                  <div className="px-4 pb-4 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}

              <div className="bg-green-50 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-green-800 mb-3">💡 Le saviez-vous ?</h4>
                <p className="text-green-700 leading-relaxed">
                  Le dépistage du cancer du col de l'utérus est pris en charge à 100% par l'Assurance Maladie 
                  sur présentation de l'invitation au dépistage. La consultation est remboursée dans les conditions habituelles.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'prevention' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Prévention et protection</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {preventionTips.map((tip, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-4">{tip.icon}</div>
                    <h4 className="font-semibold text-gray-800 mb-3">{tip.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl p-6 text-white">
                <h4 className="font-bold text-lg mb-4">📋 Votre checklist prévention</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">✅ À faire :</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• Se faire dépister régulièrement</li>
                      <li>• Se faire vacciner contre les HPV</li>
                      <li>• Avoir une hygiène de vie saine</li>
                      <li>• Consulter en cas de symptômes</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">❌ À éviter :</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• Ignorer les invitations au dépistage</li>
                      <li>• Fumer (facteur de risque)</li>
                      <li>• Sous-estimer l'importance du suivi</li>
                      <li>• Hésiter à poser des questions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6">
                <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🌟</span>
                  Bonne nouvelle
                </h4>
                <p className="text-yellow-700 leading-relaxed">
                  Grâce au dépistage organisé et à la vaccination, le nombre de cancers du col de l'utérus 
                  diminue chaque année en France. Vous faites partie d'une génération plus protégée !
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer informatif */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">📞</div>
              <h4 className="font-semibold text-gray-800 mb-2">Besoin d'aide ?</h4>
              <p className="text-gray-600 text-sm">Contactez votre professionnel de santé</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💬</div>
              <h4 className="font-semibold text-gray-800 mb-2">Questions ?</h4>
              <p className="text-gray-600 text-sm">N'hésitez pas à poser toutes vos questions</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤝</div>
              <h4 className="font-semibold text-gray-800 mb-2">Accompagnement</h4>
              <p className="text-gray-600 text-sm">Vous êtes accompagnée à chaque étape</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;