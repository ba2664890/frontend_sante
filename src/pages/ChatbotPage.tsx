// src/pages/ChatbotPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { patientService } from '../services/patientService.ts';
import { Patient } from '../types';
import Modal from '../components/Modal.tsx';
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
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

const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
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
    <div className={`max-w-5xl mx-auto ${isPatient ? '' : 'p-6'} space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-sahara-rose rounded-full flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-compassion-rose" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-gray-900">Assistant Médical</h1>
            <p className="text-sm font-body text-gray-600">
              Spécialisé en santé féminine et cancer du col de l'utérus
            </p>
          </div>
        </div>
        <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 text-compassion-rose font-bold hover:underline">
          <ClockIcon className="w-4 h-4" />
          Historique
        </button>
      </div>

      {/* Patient Selector (Hidden for patients) */}
      {!isPatient && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patiente (optionnel) :
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-compassion-rose focus:border-compassion-rose"
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
      )}

      {/* Chat Area */}
      <div className="bg-white p-6 rounded-lg shadow-ultra-soft border border-sahara-rose space-y-4">
        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-cream-silk/30 rounded-lg">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.role === 'user'
                  ? 'bg-compassion-rose text-white shadow-md'
                  : 'bg-white text-gray-800 border border-sahara-rose shadow-sm'
                  }`}
              >
                {msg.content}
                {msg.created_at && (
                  <div className="text-[10px] text-right mt-1 opacity-70">
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
            className="flex-1 p-3 border border-sahara-rose rounded-full focus:ring-2 focus:ring-compassion-rose focus:border-transparent outline-none shadow-inner"
            placeholder="Posez votre question ici (français ou wolof)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage} 
            className="bg-compassion-rose text-white p-3 rounded-full hover:opacity-90 transition-opacity shadow-md"
          >
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
        <p className="text-gray-600 text-sm italic">
          Fonctionnalité à venir : liste de vos échanges passés avec l'assistant.
        </p>
      </Modal>
    </div>
  );

  return isPatient ? <PatientLayout>{renderContent()}</PatientLayout> : renderContent();
};

export default ChatbotPage;