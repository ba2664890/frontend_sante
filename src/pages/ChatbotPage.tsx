// src/pages/ChatbotPage.tsx — Version Patient (ESPACE PATIENT UNIQUEMENT)
import React, { useState, useRef, useEffect } from 'react';
import { patientService } from '../services/patientService.ts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
};

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Dalal ak jàmm ! Je suis Njariñu, votre assistant CerviCare+. Je suis là pour répondre à vos questions sur votre santé, vos examens ou vos prochains rendez-vous. Comment puis-je vous aider ?",
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const res = await patientService.sendChatbotMessage({
        question: input,
        conversation_id: conversationId || undefined,
      });
      const botMsg: Message = {
        role: 'assistant',
        content: res.answer,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setConversationId(res.conversation_id);
    } catch {
      toast.error("Erreur lors de l'envoi du message.");
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Désolé, une erreur s'est produite.", created_at: new Date().toISOString() },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Questions fréquentes pour aider la patiente
  const quickQuestions = [
    "C'est quoi un test HPV ?",
    "Quand est mon prochain rendez-vous ?",
    "Comment lire mes résultats ?",
    "Le dépistage est-il douloureux ?",
  ];

  return (
    <div className="min-h-screen bg-[#f2fbff] font-jakarta">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
        {/* Sidebar info */}
        <aside className="lg:w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#bec9c9]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#dcf1fb] rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="font-bold text-[#091e25]">Njariñu IA</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-[#3e4949]">En ligne</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#3e4949] leading-relaxed">
              Posez vos questions en <strong>français</strong> ou en <strong>wolof</strong>. Je suis là pour vous aider.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#bec9c9]/20">
            <h3 className="font-bold text-[#091e25] mb-3 text-sm">Questions fréquentes</h3>
            <div className="flex flex-col gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); }}
                  className="text-left text-sm text-[#006669] bg-[#f2fbff] hover:bg-[#dcf1fb] px-3 py-2.5 rounded-xl transition-colors border border-[#bec9c9]/20"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#e4f7ff] rounded-2xl p-4 border border-[#006669]/10">
            <p className="text-xs text-[#3e4949] leading-relaxed">
              🔒 <strong>Confidentiel</strong> — Vos conversations sont protégées et accessibles uniquement par vous et votre équipe médicale.
            </p>
          </div>
        </aside>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-[#bec9c9]/20 overflow-hidden">
          {/* Header */}
          <header className="px-6 py-4 border-b border-[#bec9c9]/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#006669] rounded-xl flex items-center justify-center text-white text-sm font-bold">Nj</div>
            <div>
              <h2 className="font-bold text-[#091e25]">Assistant Njariñu</h2>
              <p className="text-xs text-[#3e4949]">CerviCare+ · Votre santé, notre priorité</p>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%]`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#006669] text-white rounded-tr-none'
                      : 'bg-[#f2fbff] text-[#091e25] border border-[#bec9c9]/20 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.created_at && (
                    <p className={`text-[10px] mt-1 text-[#3e4949]/50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <footer className="px-6 py-4 border-t border-[#bec9c9]/20 bg-[#f2fbff]/50">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Posez votre question en français ou wolof..."
                className="flex-1 px-4 py-3 bg-white border border-[#bec9c9]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#006669]/20 focus:border-[#006669] outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-12 h-12 bg-[#006669] text-white rounded-xl flex items-center justify-center hover:bg-[#2a7f82] active:scale-95 transition-all disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;