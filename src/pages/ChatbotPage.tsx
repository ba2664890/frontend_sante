// src/pages/ChatbotPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { Patient } from '../types';
import Modal from '../components/Modal.tsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.tsx';
import PatientLayout from '../components/PatientLayout.tsx';
import { IconBox } from '../components/ui/PatientUI.tsx';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
};

const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Dalal ak jàmm ! Je suis Njariñu, votre assistant CerviCare+. Je suis là pour répondre à vos questions sur votre santé, vos examens ou vos prochains rendez-vous. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPatient = user?.role === 'patient';

  // Charger liste patientes (uniquement pour les agents)
  const { data: patients = [] } = useQuery<Patient[]>(
    ['patients-for-chat'],
    async () => {
      const res = await patientService.getPatients({}, 1);
      return res.results || [];
    },
    { enabled: !isPatient }
  );

  // Envoi message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const res = await patientService.sendChatbotMessage({
        question: input,
        patient_id: isPatient ? undefined : (selectedPatientId || undefined),
        conversation_id: conversationId || undefined,
      });

      const botMsg: Message = {
        role: 'assistant',
        content: res.answer,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setConversationId(res.conversation_id);
    } catch (err: any) {
      toast.error("Erreur lors de l'envoi du message.");
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Désolé, une erreur s'est produite." },
      ]);
    }
  };

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderContent = () => (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Sidebar Gauche - Infos & Conseils */}
      <aside className="lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-ultra-soft border border-sahara-rose relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-sahara-rose/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <h2 className="font-headline text-2xl text-compassion-rose mb-6 relative z-10">Njariñu IA</h2>
          <div className="space-y-6 relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-sahara-rose flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-compassion-rose text-sm">lightbulb</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Conseil du jour</h4>
                <p className="text-sm text-on-surface-variant">L'examen IVA est simple, rapide et indolore. Il permet de vous protéger efficacement.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-wellness-green/20 flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-wellness-green text-sm">shield_moon</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Votre Protection</h4>
                <p className="text-sm text-on-surface-variant">Vos données de santé sont cryptées et accessibles uniquement par vous et votre médecin.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-compassion-rose text-white p-8 rounded-3xl shadow-ultra-soft flex flex-col gap-6">
          <h3 className="font-headline text-xl">Questions Fréquentes</h3>
          <ul className="space-y-4">
            <li className="text-sm bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/20 transition-colors">C'est quoi un test HPV ?</li>
            <li className="text-sm bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/20 transition-colors">Quand est mon prochain RDV ?</li>
            <li className="text-sm bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/20 transition-colors">Comment lire mes résultats ?</li>
          </ul>
        </div>
      </aside>

      {/* Zone de Chat Principale */}
      <div className="lg:w-2/3 flex flex-col h-[70vh] bg-white rounded-3xl shadow-ultra-soft border border-sahara-rose overflow-hidden">
        {/* Chat Header */}
        <header className="p-6 border-b border-sahara-rose flex justify-between items-center bg-cream-silk/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sahara-rose flex items-center justify-center">
              <span className="material-symbols-outlined text-compassion-rose text-2xl">smart_toy</span>
            </div>
            <div>
              <h2 className="font-headline text-xl text-on-surface">Assistant Médical</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-wellness-green animate-pulse"></span>
                <span className="text-xs text-on-surface-variant font-bold">En ligne • Njariñu</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowHistory(true)} className="p-2 hover:bg-sahara-rose rounded-full transition-colors">
            <span className="material-symbols-outlined text-compassion-rose">history</span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-cream-silk/10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-compassion-rose text-white rounded-tr-none' 
                    : 'bg-white text-on-surface border border-sahara-rose rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                {msg.created_at && (
                  <span className="text-[10px] text-on-surface-variant mt-1 px-1">
                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-6 bg-white border-t border-sahara-rose">
          {!isPatient && (
            <div className="mb-4">
              <select
                className="w-full p-2 text-xs border border-sahara-rose rounded-xl focus:ring-compassion-rose outline-none"
                onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Agent: Sélectionner une patiente</option>
                {patients.map((p) => (
                  <option key={p.record_id} value={p.record_id}>{p.full_name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-4 bg-cream-silk/30 p-2 rounded-full border border-sahara-rose">
            <input
              type="text"
              className="flex-1 bg-transparent px-4 py-2 outline-none font-body text-sm"
              placeholder="Posez votre question en français ou wolof..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              className="w-12 h-12 rounded-full bg-compassion-rose text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Modal History */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Historique">
        <div className="p-8 text-center">
          <IconBox icon="history" className="mx-auto mb-4" />
          <p className="text-on-surface-variant italic">L'historique de vos conversations sera disponible prochainement.</p>
        </div>
      </Modal>
    </div>
  );

  return isPatient ? <PatientLayout>{renderContent()}</PatientLayout> : renderContent();
};

export default ChatbotPage;