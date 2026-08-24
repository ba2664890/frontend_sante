// src/pages/Agents.tsx — Gestion des agents de santé (campaign_admin / center_admin / global_admin)
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import api from '../services/api.ts';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';

const Agents: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: agents, isLoading, error } = useQuery<User[]>(
    'health-agents',
    async () => {
      const res = await api.get('/accounts/users/health_agents/');
      return res.data;
    },
    { retry: false }
  );

  const createMutation = useMutation(
    (payload: any) => api.post('/accounts/users/', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('health-agents');
        toast.success('Agent créé avec succès !');
        setShowModal(false);
      },
      onError: (err: any) => {
        const detail = err?.response?.data;
        const message = typeof detail === 'string' ? detail : Object.values(detail || {}).flat().join(' ');
        toast.error(message || "Erreur lors de la création de l'agent");
      },
    }
  );

  if (isLoading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl p-12 text-center border border-[#bec9c9]/10 shadow-sm">
        <div className="w-20 h-20 bg-[#ffdeaa] text-[#795500] rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl">visibility_off</span>
        </div>
        <h2 className="text-2xl font-bold text-[#091e25] mb-2" style={{ fontFamily: 'Literata, serif' }}>Accès restreint</h2>
        <p className="text-[#6f7979] max-w-md">Vous n'avez pas la permission de gérer les agents de santé.</p>
      </div>
    );
  }

  const agentsList = agents || [];

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in overflow-y-auto p-4">
      <div className="bg-[#006669] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-[#006669]/20 flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-white/80">groups</span>
              <span className="text-sm font-bold uppercase tracking-widest text-white/80">Équipe</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-4" style={{ fontFamily: 'Literata, serif' }}>
              Agents de Santé
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Gérez les agents rattachés à votre campagne ou centre de santé.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-xs font-bold text-white/60 uppercase tracking-tighter mb-1">Agents</p>
            <p className="text-3xl font-mono font-bold">{agentsList.length}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#9a4523] text-white rounded-xl font-bold shadow-lg shadow-[#9a4523]/20 hover:bg-[#7b2e0d] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Nouvel agent
        </button>
      </div>

      <div className="flex-1">
        {agentsList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#bec9c9]/10 shadow-sm">
            <p className="text-[#6f7979]">Aucun agent de santé pour l'instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {agentsList.map((agent) => (
              <div key={agent.id} className="bg-white rounded-3xl p-6 border border-[#bec9c9]/10 shadow-[0_2px_12px_rgba(42,127,130,0.06)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#dcf1fb] text-[#006669] flex items-center justify-center font-bold text-lg">
                    {agent.first_name?.[0]?.toUpperCase() || agent.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#091e25]">{agent.first_name} {agent.last_name}</h3>
                    <p className="text-xs text-[#6f7979]">{agent.username}</p>
                  </div>
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    agent.is_active ? 'bg-[#dcf1fb] text-[#006669]' : 'bg-[#bec9c9]/20 text-[#3e4949]'
                  }`}>
                    {agent.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-[#3e4949]">
                  <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">mail</span>{agent.email || 'N/A'}</p>
                  <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">call</span>{agent.phone || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvel agent de santé" size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const password = formData.get('password') as string;
            createMutation.mutate({
              username: formData.get('username') as string,
              email: formData.get('email') as string,
              first_name: formData.get('first_name') as string,
              last_name: formData.get('last_name') as string,
              phone: formData.get('phone') as string,
              password,
              password_confirm: password,
            });
          }}
          className="space-y-6 p-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Prénom</label>
              <input name="first_name" required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Nom</label>
              <input name="last_name" required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Nom d'utilisateur</label>
              <input name="username" required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" placeholder="ex: adiop" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Email</label>
              <input type="email" name="email" required className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Téléphone</label>
              <input name="phone" className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" placeholder="+221 7X XXX XX XX" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#006669] uppercase">Mot de passe temporaire</label>
              <input type="password" name="password" required minLength={8} className="w-full p-3 bg-[#f2fbff] border border-[#bec9c9]/20 rounded-xl outline-none focus:ring-2 focus:ring-[#006669]/20" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-[#6f7979] font-bold">Annuler</button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="px-8 py-2.5 bg-[#006669] text-white rounded-xl font-bold shadow-lg shadow-[#006669]/20 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Création...' : 'Créer l\'agent'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Agents;
