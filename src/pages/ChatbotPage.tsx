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

type Message = {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
};

// Inline bold parser
const parseInlineBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-extrabold text-[#9a4523] bg-[#fffaf5] px-1 py-0.5 rounded border border-[#ffdbcf]/50">
          {boldText.replace(/\*/g, '')}
        </strong>
      );
    }
    return part.replace(/\*/g, '');
  });
};

// Beautiful formatting renderer
const renderFormattedMessage = (content: string) => {
  let text = content.replace(/<\/?s>/g, '').replace(/\[\/?INST\]/g, '').trim();
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-3">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const listMatch = line.match(/^[\s*\-\u2022]+\s*(.*)$/);
              if (listMatch) {
                const itemContent = listMatch[1];
                return (
                  <div key={lIdx} className="flex gap-2 items-start pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9a4523] mt-2 flex-shrink-0" />
                    <span className="text-[#3e4949] font-medium">{parseInlineBold(itemContent)}</span>
                  </div>
                );
              }
              return (
                <p key={lIdx} className="text-[#3e4949] leading-relaxed">
                  {parseInlineBold(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
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

  // Charger l'historique des discussions passées
  const { data: conversationsData, refetch: refetchConversations } = useQuery(
    ['conversations-list'],
    () => patientService.getConversations(1).catch(() => ({ results: [] })),
    { enabled: true, refetchOnWindowFocus: false }
  );
  const conversations = conversationsData?.results || [];

  // Sélectionner et charger une conversation existante
  const selectConversation = async (id: number) => {
    try {
      const msgs = await patientService.getConversationMessages(id);
      if (msgs && msgs.length > 0) {
        setMessages(msgs.map((m: any) => ({
          role: m.role,
          content: m.content,
          created_at: m.created_at
        })));
      } else {
        setMessages([
          {
            role: 'assistant',
            content: "Cette discussion est vide. Posez votre première question pour commencer !",
          }
        ]);
      }
      setConversationId(id);
      setShowHistory(false);
      toast.success("Discussion chargée avec succès !");
    } catch (err) {
      toast.error("Impossible de charger l'historique de cette discussion.");
    }
  };

  // Recommencer une nouvelle session (nouvelle discussion)
  const startNewSession = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Dalal ak jàmm ! Nouvelle discussion démarrée. Je suis Njariñu, votre assistant CerviCare+. Comment puis-je vous aider ?",
      },
    ]);
    setConversationId(null);
    toast.success("Nouvelle discussion commencée !");
  };

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
      // Actualiser la liste des conversations pour inclure la nouvelle
      refetchConversations();
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
          <div className="flex items-center gap-2">
            <button
              onClick={startNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dcf1fb] text-[#006669] rounded-xl text-xs font-semibold hover:bg-compassion-rose hover:text-white transition-all shadow-sm"
              title="Démarrer une nouvelle discussion"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Nouveau
            </button>
            <button
              onClick={() => {
                refetchConversations();
                setShowHistory(true);
              }}
              className="p-2 hover:bg-sahara-rose rounded-full transition-colors"
              title="Historique des discussions"
            >
              <span className="material-symbols-outlined text-compassion-rose">history</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-cream-silk/10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                  ? 'bg-compassion-rose text-white rounded-tr-none'
                  : 'bg-white text-on-surface border border-sahara-rose rounded-tl-none'
                  }`}>
                  {msg.role === 'assistant' ? renderFormattedMessage(msg.content) : msg.content}
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
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Mes Discussions Passées">
        <div className="max-h-[50vh] overflow-y-auto space-y-3 p-4">
          <button
            onClick={() => {
              startNewSession();
              setShowHistory(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-sahara-rose/30 hover:bg-sahara-rose/50 text-compassion-rose rounded-2xl font-semibold text-sm transition-all border border-sahara-rose"
          >
            <span className="material-symbols-outlined text-base">add_comment</span>
            Démarrer une nouvelle discussion
          </button>
          
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-sahara-rose opacity-40">forum</span>
              <p className="text-sm text-on-surface-variant mt-2">Aucune conversation passée</p>
            </div>
          ) : (
            conversations.map((c: any) => (
              <div
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  conversationId === c.id
                    ? 'border-compassion-rose bg-sahara-rose/10 shadow-sm'
                    : 'border-sahara-rose/40 hover:bg-cream-silk/25'
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-semibold text-sm text-on-surface truncate">
                    {c.title || "Discussion sans titre"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-medium">
                    {new Date(c.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="material-symbols-outlined text-compassion-rose text-lg">chevron_right</span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );

  return isPatient ? <PatientLayout>{renderContent()}</PatientLayout> : renderContent();
};

export default ChatbotPage;