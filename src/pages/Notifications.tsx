// src/pages/Notifications.tsx — Refonte "Clinical Precision" (Espace Agent)
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Notification } from '../types/notification.ts';
import { notificationService } from '../services/notificationService.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.tsx';

const Notifications: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const { user } = useAuth();

  const { data: notifications, isLoading, refetch, error } = useQuery(
    ['notifications', filter],
    () => notificationService.getNotifications({
      status: filter !== 'all' ? filter : undefined
    }),
    {
      enabled: !!user,
      refetchInterval: 30000,
      retry: 2,
    }
  );

  const handleSendNotification = async (id: number) => {
    try {
      await notificationService.sendNotification(id);
      toast.success('Notification envoyée !');
      refetch();
    } catch {
      toast.error("Erreur lors de l'envoi de la notification");
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (window.confirm('Supprimer cette notification ?')) {
      try {
        await notificationService.deleteNotification(id);
        toast.success('Notification supprimée !');
        refetch();
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-2.5 py-0.5 bg-[#dcf1fb] text-[#006669] rounded-full text-[10px] font-bold uppercase">Envoyée</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 bg-[#dcf1fb] text-[#2a7f82] rounded-full text-[10px] font-bold uppercase">Livrée</span>;
      case 'failed':
        return <span className="px-2.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a] rounded-full text-[10px] font-bold uppercase">Échouée</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-[#ffdeaa] text-[#795500] rounded-full text-[10px] font-bold uppercase">En attente</span>;
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-[#ba1a1a]';
      case 'high': return 'bg-[#9a4523]';
      case 'medium': return 'bg-[#795500]';
      default: return 'bg-[#bec9c9]';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return 'sms';
      case 'email': return 'email';
      default: return 'notifications';
    }
  };

  const notifList = notifications?.results || [];
  const pendingCount = notifList.filter((n) => n.status === 'pending').length;
  const sentCount = notifList.filter((n) => n.status === 'sent').length;
  const failedCount = notifList.filter((n) => n.status === 'failed').length;

  const filterTabs = [
    { label: 'Toutes', value: 'all', count: notifications?.count || 0 },
    { label: 'En attente', value: 'pending', count: pendingCount },
    { label: 'Envoyées', value: 'sent', count: sentCount },
    { label: 'Échouées', value: 'failed', count: failedCount },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f2fbff] font-jakarta animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#2a7f82]" style={{ fontFamily: 'Literata, serif' }}>
            Notifications & Rappels
          </h1>
          <p className="text-[#3e4949] mt-1 text-sm">Gestion des notifications et rappels automatiques aux patientes</p>
        </div>
      </header>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: notifications?.count || 0, icon: 'notifications', color: '#006669', bg: '#dcf1fb' },
          { label: 'En attente', value: pendingCount, icon: 'schedule', color: '#795500', bg: '#ffdeaa' },
          { label: 'Envoyées', value: sentCount, icon: 'check_circle', color: '#006669', bg: '#dcf1fb' },
          { label: 'Échouées', value: failedCount, icon: 'error', color: '#ba1a1a', bg: '#ffdad6' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: kpi.bg }}>
              <span className="material-symbols-outlined text-[22px]" style={{ color: kpi.color }}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-[10px] text-[#3e4949] font-bold uppercase tracking-wider">{kpi.label}</p>
              <p className="font-mono text-2xl font-semibold text-[#091e25]">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === tab.value
                ? 'bg-[#006669] text-white shadow-md'
                : 'bg-white text-[#3e4949] border border-[#bec9c9]/30 hover:bg-[#dcf1fb] hover:text-[#006669]'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              filter === tab.value ? 'bg-white/20 text-white' : 'bg-[#f2fbff] text-[#3e4949]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(42,127,130,0.08)] border border-[#bec9c9]/10 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-3 border-b border-[#bec9c9]/10 bg-[#f2fbff]">
          <span className="col-span-1 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Type</span>
          <span className="col-span-4 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Titre / Message</span>
          <span className="col-span-2 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Destinataire</span>
          <span className="col-span-1 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Priorité</span>
          <span className="col-span-2 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Statut</span>
          <span className="col-span-1 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider">Date</span>
          <span className="col-span-1 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <span className="material-symbols-outlined text-5xl text-[#ba1a1a]">error_outline</span>
            <p className="text-[#3e4949] text-sm">Erreur lors du chargement des notifications</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#006669] text-white rounded-xl text-sm font-semibold hover:bg-[#2a7f82] transition-all"
            >
              Réessayer
            </button>
          </div>
        ) : notifList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="material-symbols-outlined text-5xl text-[#bec9c9]">notifications_off</span>
            <p className="text-[#3e4949] text-sm italic">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-[#bec9c9]/10">
            {notifList.map((notif: Notification) => (
              <div key={notif.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-[#f2fbff] transition-colors group">
                {/* Type */}
                <div className="col-span-1">
                  <div className="w-8 h-8 rounded-lg bg-[#f2fbff] flex items-center justify-center border border-[#bec9c9]/20">
                    <span className="material-symbols-outlined text-[16px] text-[#006669]">
                      {getTypeIcon(notif.notification_type)}
                    </span>
                  </div>
                </div>
                {/* Titre / Message */}
                <div className="col-span-4 min-w-0 pr-4">
                  <p className="text-sm font-semibold text-[#091e25] truncate">{notif.title}</p>
                  <p className="text-xs text-[#3e4949] truncate mt-0.5">{notif.message}</p>
                </div>
                {/* Destinataire */}
                <div className="col-span-2">
                  <span className="text-sm text-[#091e25] font-mono">{notif.recipient_name || 'Inconnu'}</span>
                </div>
                {/* Priorité */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${getPriorityDot(notif.priority)}`}></div>
                    <span className="text-xs text-[#3e4949] capitalize">{notif.priority}</span>
                  </div>
                </div>
                {/* Statut */}
                <div className="col-span-2">{getStatusBadge(notif.status)}</div>
                {/* Date */}
                <div className="col-span-1">
                  <span className="font-mono text-xs text-[#6f7979]">
                    {new Date(notif.scheduled_time).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {notif.status === 'pending' && (
                    <button
                      onClick={() => handleSendNotification(notif.id)}
                      className="w-8 h-8 rounded-lg bg-[#dcf1fb] text-[#006669] flex items-center justify-center hover:bg-[#006669] hover:text-white transition-all"
                      title="Envoyer maintenant"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center hover:bg-[#ba1a1a] hover:text-white transition-all"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;