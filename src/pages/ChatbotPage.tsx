// src/pages/ChatbotPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
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
      content:
        "Bonjour ! Je suis votre assistant médical spécialisé en santé féminine et cancer du col de l'utérus. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger liste patientes
  const { data: patients = [] } = useQuery<Patient[]>(
    ['patients-for-chat'],
    async () => {
      const res = await patientService.getPatients({}, 1);
      return res.results || [];
    }
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chatbot Médical</h1>
            <p className="text-sm text-gray-600">
              Assistant spécialisé en santé féminine et cancer du col de l'utérus
            </p>
          </div>
        </div>
        <button onClick={() => setShowHistory(true)} className="btn-secondary">
          <ClockIcon className="w-4 h-4 mr-2" />
          Historique
        </button>
      </div>

      {/* Patient Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Patiente (optionnel) :
        </label>
        <select
          className="input"
          onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Aucune patiente sélectionnée</option>
          {patients.map((p) => (
            <option key={p.record_id} value={p.record_id}>
              {p.full_name || `Patiente #${p.record_id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Area */}
      <div className="card space-y-4">
        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-800 border'
                  }`}
              >
                {msg.content}
                {msg.created_at && (
                  <div className="text-xs text-right mt-1 opacity-70">
                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            className="input flex-1"
            placeholder="Posez votre question ici (français ou wolof)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="btn-primary">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Historique */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Historique des conversations"
      >
        <p className="text-gray-600 text-sm">
          Fonctionnalité à venir : liste des conversations passées.
        </p>
      </Modal>
    </div>
  );
};

export default ChatbotPage;