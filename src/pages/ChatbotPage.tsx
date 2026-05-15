// src/pages/ChatbotPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { Patient } from '../types';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  DocumentArrowDownIcon,
  BellAlertIcon,
  UserCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
      content: "Dalal ak jàmm ! Je suis Njariñu, votre assistant CerviCare+. Je suis là pour vous aider dans vos protocoles de suivi et la gestion de vos patientes. Comment puis-je vous assister aujourd'hui ?",
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isWolof, setIsWolof] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger liste patientes
  const { data: patients = [] } = useQuery<Patient[]>(
    ['patients-for-chat'],
    async () => {
      const res = await patientService.getPatients({}, 1);
      return res.results || [];
    },
    { enabled: user?.role !== 'patient' }
  );

  const sendMessage = async (text?: string) => {
    const messageContent = text || input;
    if (!messageContent.trim()) return;

    const userMsg: Message = { 
      role: 'user', 
      content: messageContent,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const res = await patientService.sendChatbotMessage({
        question: messageContent,
        patient_id: selectedPatientId || undefined,
        language: isWolof ? 'wolof' : 'french'
      });

      const botMsg: Message = {
        role: 'assistant',
        content: res.answer,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      toast.error("Erreur de connexion avec Njariñu.");
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Désolé, je rencontre une difficulté technique. Veuillez réessayer." },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in font-jakarta">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-[#bec9c9]/20 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 bg-[#f2fbff] border-b border-[#bec9c9]/20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#006669] flex items-center justify-center text-white shadow-lg shadow-[#006669]/20">
              <ChatBubbleLeftRightIcon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-headline text-xl text-[#091e25]">Njariñu IA</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#006669] animate-pulse"></span>
                <span className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Assistant Opérationnel</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsWolof(!isWolof)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isWolof ? 'bg-[#9a4523] text-white border-[#9a4523]' : 'bg-white text-[#3e4949] border-[#bec9c9]/30'
              }`}
            >
              <LanguageIcon className="h-4 w-4" />
              {isWolof ? 'Wolof' : 'Français'}
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f2fbff]/10 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`px-5 py-4 rounded-3xl shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#006669] text-white rounded-tr-none' 
                    : 'bg-white text-[#091e25] border border-[#bec9c9]/20 rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium">{msg.content}</p>
                </div>
                <p className={`text-[10px] mt-1 font-bold text-[#3e4949]/50 uppercase ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.created_at && format(new Date(msg.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Actions (Chips) */}
        <div className="px-6 py-3 bg-[#f2fbff]/30 flex flex-wrap gap-2 border-t border-[#bec9c9]/10">
          {[
            { label: 'Protocole Suivi', icon: ClipboardIcon, text: "Quel est le protocole pour une patiente IVA positive ?" },
            { label: 'Rapport PDF', icon: DocumentArrowDownIcon, text: "Génère-moi un rapport mensuel des dépistages." },
            { label: 'Rappel SMS', icon: BellAlertIcon, text: "Prépare un rappel SMS pour les patientes à revoir." },
            { label: 'Traduction', icon: LanguageIcon, text: "Traduis ce message en Wolof pour la patiente." }
          ].map((chip, i) => (
            <button 
              key={i}
              onClick={() => sendMessage(chip.text)}
              className="px-4 py-2 bg-white border border-[#006669]/10 rounded-full text-xs font-bold text-[#006669] hover:bg-[#006669] hover:text-white transition-all flex items-center gap-2"
            >
              <chip.icon className="h-3 w-3" />
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <footer className="p-6 bg-white border-t border-[#bec9c9]/20">
          <div className="flex gap-4 items-center">
            <select
              className="hidden lg:block w-48 px-4 py-3 bg-[#f2fbff] border-none rounded-2xl text-xs font-bold text-[#3e4949]"
              value={selectedPatientId || ''}
              onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Contexte Patiente</option>
              {patients.map(p => (
                <option key={p.record_id} value={p.record_id}>{p.full_name}</option>
              ))}
            </select>
            
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Posez votre question à Njariñu..."
                className="w-full pl-6 pr-16 py-4 bg-[#f2fbff] border-none rounded-2xl focus:ring-4 focus:ring-[#006669]/5 text-sm font-medium placeholder-[#3e4949]/40"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                onClick={() => sendMessage()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#006669] text-white rounded-xl flex items-center justify-center hover:bg-[#2a7f82] transition-all active:scale-90 shadow-lg shadow-[#006669]/20"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Side Actions Panel (Bento Sidebar) */}
      <aside className="lg:w-80 flex flex-col gap-6">
        {/* SMS Reminder Card */}
        <div className="bento-card bg-[#ffdbcf] border-[#9a4523]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#9a4523] rounded-xl text-white">
              <BellAlertIcon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#380d00]">Rappels SMS</h3>
          </div>
          <p className="text-xs text-[#7b2e0d] leading-relaxed mb-4">
            Programmez des messages de rappel pour les dépistages manqués dans votre région.
          </p>
          <button className="w-full py-3 bg-[#9a4523] text-white rounded-xl font-bold text-xs hover:bg-[#7b2e0d] transition-all">
            Lancer une campagne
          </button>
        </div>

        {/* Recent Contexts */}
        <div className="bento-card flex-1">
          <h3 className="font-headline text-lg text-[#091e25] mb-4">Contextes récents</h3>
          <div className="space-y-3">
            {[
              { name: 'Fatou Diallo', region: 'Pikine', time: '10 min' },
              { name: 'Moussa Ndiaye', region: 'Guédiawaye', time: '1h' },
              { name: 'Awa Diop', region: 'Rufisque', time: '3h' }
            ].map((ctx, i) => (
              <div key={i} className="p-3 bg-[#f2fbff] rounded-2xl border border-[#bec9c9]/10 flex items-center gap-3 group cursor-pointer hover:border-[#006669]/30 transition-all">
                <div className="w-10 h-10 rounded-full bg-[#dcf1fb] flex items-center justify-center text-[#006669]">
                  <UserCircleIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#091e25] truncate">{ctx.name}</p>
                  <p className="text-[10px] text-[#3e4949] font-bold uppercase">{ctx.region}</p>
                </div>
                <ClockIcon className="h-4 w-4 text-[#bec9c9]" />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

// ClipboardIcon mock if needed (was missing in previous view)
const ClipboardIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m.75-12h3.508a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V6.75a.75.75 0 01.75-.75H9m.75-1.5h3.75M12 3v3m-3-3v3m6-3v3" />
  </svg>
);

export default ChatbotPage;