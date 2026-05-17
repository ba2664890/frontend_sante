// src/pages/AgentChatbotPage.tsx — Version Agent Médical
// Design basé sur : refonte_agent/assistant_njari_u_menu_agent_cervicare/code.html
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { Patient } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';

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
        <strong key={i} className="font-extrabold text-[#006669] bg-[#dcf1fb]/40 px-1 py-0.5 rounded border border-[#bec9c9]/10">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006669] mt-2 flex-shrink-0" />
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

const AgentChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bonjour ${user?.first_name || 'Docteur'}. Je suis Njariñu, votre assistant IA CerviCare+. J'ai accès aux protocoles cliniques et aux données anonymisées de votre région. Comment puis-je vous assister aujourd'hui ?`,
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isWolof, setIsWolof] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // SMS Reminder state
  const [smsText, setSmsText] = useState('Bonjour [Nom], c\'est CerviCare+. Vos résultats sont disponibles au centre de santé. Merci de nous contacter.');
  const [selectedSmsPatients, setSelectedSmsPatients] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: patients = [] } = useQuery<Patient[]>(
    ['patients-for-agent-chat'],
    async () => {
      const res = await patientService.getPatients({}, 1);
      return res.results || [];
    }
  );

  // Charger l'historique des discussions passées
  const { data: conversationsData, refetch: refetchConversations } = useQuery(
    ['agent-conversations-list'],
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
        content: `Bonjour ${user?.first_name || 'Docteur'}. Nouvelle discussion démarrée. Je suis Njariñu, votre assistant IA CerviCare+. Comment puis-je vous assister ?`,
        created_at: new Date().toISOString(),
      },
    ]);
    setConversationId(null);
    toast.success("Nouvelle discussion commencée !");
  };

  // Patientes urgentes (IVA positif)
  const urgentPatients = patients.filter((p: Patient) => p.dep_resultat_iva === 2).slice(0, 5);

  const sendMessage = async (text?: string) => {
    const messageContent = text || input;
    if (!messageContent.trim() || isSending) return;

    const userMsg: Message = {
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await patientService.sendChatbotMessage({
        question: messageContent,
        patient_id: selectedPatientId || undefined,
        conversation_id: conversationId || undefined,
      });
      const botMsg: Message = {
        role: 'assistant',
        content: res.answer,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setConversationId(res.conversation_id);
      refetchConversations();
    } catch {
      toast.error("Erreur de connexion avec Njariñu.");
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, je rencontre une difficulté technique. Veuillez réessayer.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSms = async () => {
    if (selectedSmsPatients.length === 0) {
      toast.error('Sélectionnez au moins une patiente.');
      return;
    }
    toast.success(`SMS envoyé à ${selectedSmsPatients.length} patiente(s) !`);
    setSelectedSmsPatients([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chips = [
    { label: 'Protocoles de suivi', icon: 'psychiatry', text: 'Quel est le protocole pour une patiente IVA positive ?' },
    { label: 'Rapport PDF', icon: 'summarize', text: 'Génère un résumé des dépistages du mois.' },
    { label: 'Prochain rappel', icon: 'schedule', text: 'Quelles patientes ont un suivi prévu cette semaine ?' },
    { label: 'Traduction Wolof', icon: 'translate', text: 'Traduis ce message en Wolof : Bonjour, vos résultats sont disponibles.' },
  ];

  return (
    <div className="min-h-screen bg-[#f2fbff] font-jakarta">
      <div className="p-6 h-[calc(100vh-80px)] grid grid-cols-12 grid-rows-6 gap-4 overflow-hidden">

        {/* === COLONNE GAUCHE : Profil Agent + SMS === */}
        <div className="col-span-12 lg:col-span-4 row-span-6 flex flex-col gap-4">

          {/* Profil Agent */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#006669] font-semibold text-lg" style={{fontFamily: 'Literata, serif'}}>Profil Agent</h2>
              <span className="px-2.5 py-0.5 bg-[#006669]/10 text-[#006669] rounded-full text-[10px] font-bold uppercase tracking-widest">Actif</span>
            </div>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-[#dcf1fb] flex items-center justify-center text-[#006669] text-2xl font-bold border-2 border-white shadow-lg mb-2">
                {user?.first_name?.[0] || 'A'}
              </div>
              <h3 className="font-semibold text-[#091e25] text-base">{user?.first_name} {user?.last_name}</h3>
              <p className="text-[#3e4949] text-xs">Agent de santé · {user?.region || 'Dakar'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#f2fbff] p-3 rounded-xl border border-[#bec9c9]/10">
                <p className="text-[10px] text-[#3e4949] uppercase font-bold mb-1">Dépistages</p>
                <p className="font-mono text-xl text-[#006669] font-semibold">{patients.length || '—'}</p>
              </div>
              <div className="bg-[#f2fbff] p-3 rounded-xl border border-[#bec9c9]/10">
                <p className="text-[10px] text-[#3e4949] uppercase font-bold mb-1">Activité</p>
                <p className="font-mono text-xl text-[#9a4523] font-semibold">Récent</p>
              </div>
            </div>
          </div>

          {/* Panneau SMS Rappels */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#006669] font-semibold" style={{fontFamily: 'Literata, serif'}}>Rappels SMS</h2>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#6f7979]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>

            {/* Liste patientes urgentes */}
            <div className="mb-3">
              <p className="text-[10px] text-[#3e4949] uppercase font-bold mb-2">Patientes urgentes</p>
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {urgentPatients.length > 0 ? urgentPatients.map((p: Patient) => (
                  <div key={p.record_id} className={`flex items-center justify-between p-2.5 rounded-lg border-l-4 ${selectedSmsPatients.includes(p.record_id) ? 'bg-[#f2fbff] border-[#006669]' : 'bg-[#f2fbff] border-[#9a4523]'}`}>
                    <div>
                      <p className="font-semibold text-[#091e25] text-sm">{p.full_name}</p>
                      <p className="font-mono text-[10px] text-[#6f7979]">ID: {p.id_patient}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSmsPatients.includes(p.record_id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSmsPatients(prev => [...prev, p.record_id]);
                        else setSelectedSmsPatients(prev => prev.filter(id => id !== p.record_id));
                      }}
                      className="rounded border-[#bec9c9] text-[#006669] focus:ring-[#006669]"
                    />
                  </div>
                )) : (
                  <p className="text-sm text-[#3e4949] italic text-center py-2">Aucune patiente urgente</p>
                )}
              </div>
            </div>

            {/* Modèle SMS */}
            <div className="mb-3 flex-1">
              <p className="text-[10px] text-[#3e4949] uppercase font-bold mb-2">Message</p>
              <textarea
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                rows={3}
                className="w-full text-sm text-[#091e25] bg-[#f2fbff] border border-[#bec9c9]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#006669]/20 focus:border-[#006669] outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSendSms}
              disabled={selectedSmsPatients.length === 0}
              className="w-full bg-[#9a4523] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#7b2e0d] active:scale-95 transition-all disabled:opacity-40 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              {selectedSmsPatients.length > 0 ? `Envoyer à ${selectedSmsPatients.length} patiente(s)` : 'Sélectionner des patientes'}
            </button>
          </div>
        </div>

        {/* === COLONNE DROITE : Chat Njariñu === */}
        <section className="col-span-12 lg:col-span-8 row-span-6 bg-white rounded-2xl flex flex-col shadow-[0_4px_12px_rgba(42,127,130,0.1)] border border-[#bec9c9]/10 overflow-hidden">

          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-[#bec9c9]/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#dcf1fb] rounded-xl flex items-center justify-center text-[#006669] font-bold text-sm shadow-sm">Nj</div>
              <div>
                <h2 className="text-[#006669] font-semibold" style={{fontFamily: 'Literata, serif'}}>Assistant IA Njariñu 🤖</h2>
                <p className="text-xs text-[#3e4949] flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {isSending ? 'En train de répondre...' : 'En ligne et prêt à assister'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={startNewSession}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f2fbff] text-[#006669] border border-[#006669]/10 rounded-xl text-xs font-semibold hover:bg-[#006669] hover:text-white transition-all shadow-sm"
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
                className="p-2 hover:bg-[#dcf1fb] rounded-xl transition-colors text-[#006669]"
                title="Historique des discussions"
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
              </button>

              {patients.length > 0 && (
                <select
                  className="text-xs px-3 py-1.5 bg-[#f2fbff] border border-[#bec9c9]/30 rounded-xl text-[#091e25] focus:ring-2 focus:ring-[#006669]/20 outline-none"
                  value={selectedPatientId || ''}
                  onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Contexte patiente...</option>
                  {patients.slice(0, 20).map((p: Patient) => (
                    <option key={p.record_id} value={p.record_id}>{p.full_name}</option>
                  ))}
                </select>
              )}
              <div className="bg-[#f2fbff] p-1 rounded-full flex items-center shadow-inner border border-[#bec9c9]/20">
                <button
                  onClick={() => setIsWolof(false)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${!isWolof ? 'bg-white text-[#006669] shadow-sm' : 'text-[#3e4949]'}`}
                >FR</button>
                <button
                  onClick={() => setIsWolof(true)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${isWolof ? 'bg-white text-[#006669] shadow-sm' : 'text-[#3e4949]'}`}
                >Wolof</button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f2fbff]/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold bg-[#9a4523] text-white">
                  {msg.role === 'user' ? (user?.first_name?.[0] || 'A') : 'Nj'}
                </div>
                <div className="max-w-[78%]">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#9a4523] text-white rounded-tr-none'
                      : 'bg-white text-[#091e25] border border-[#bec9c9]/20 rounded-tl-none'
                  }`}>
                    {msg.role === 'assistant' ? renderFormattedMessage(msg.content) : msg.content}
                  </div>
                  {msg.created_at && (
                    <span className="font-mono text-[10px] text-[#6f7979] mt-1 block px-1">
                      {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-[#dcf1fb] flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#006669]">Nj</div>
                <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-none border border-[#bec9c9]/20 shadow-sm">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips d'actions suggérées */}
          <div className="px-5 py-2.5 bg-white border-t border-[#bec9c9]/10 flex gap-2 overflow-x-auto flex-shrink-0">
            {chips.map((chip, i) => (
              <button
                key={i}
                onClick={() => sendMessage(chip.text)}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-[#f2fbff] hover:bg-[#dcf1fb] text-[#006669] border border-[#006669]/10 rounded-full text-xs font-semibold transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-[#bec9c9]/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={isWolof ? 'Bind sa laaj ci Wolof...' : 'Posez une question à Njariñu...'}
                  className="w-full bg-[#f2fbff] border border-[#bec9c9]/30 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-[#006669]/20 focus:border-[#006669] outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isSending}
                className="w-12 h-12 bg-[#006669] text-white rounded-xl flex items-center justify-center hover:bg-[#2a7f82] active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-[#006669]/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal History */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Mes Discussions Passées (Espace Agent)">
        <div className="max-h-[50vh] overflow-y-auto space-y-3 p-4">
          <button
            onClick={() => {
              startNewSession();
              setShowHistory(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-[#dcf1fb]/50 hover:bg-[#dcf1fb] text-[#006669] rounded-2xl font-semibold text-sm transition-all border border-[#006669]/20"
          >
            <span className="material-symbols-outlined text-base">add_comment</span>
            Démarrer une nouvelle discussion
          </button>
          
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-[#bec9c9] opacity-40">forum</span>
              <p className="text-sm text-[#3e4949] mt-2">Aucune conversation passée</p>
            </div>
          ) : (
            conversations.map((c: any) => (
              <div
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  conversationId === c.id
                    ? 'border-[#006669] bg-[#dcf1fb]/20 shadow-sm'
                    : 'border-[#bec9c9]/30 hover:bg-[#f2fbff]'
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-semibold text-sm text-[#091e25] truncate">
                    {c.title || "Discussion sans titre"}
                  </p>
                  <p className="text-[10px] text-[#6f7979] mt-1 font-medium">
                    {new Date(c.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#006669] text-lg">chevron_right</span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AgentChatbotPage;
