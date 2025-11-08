import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Notification } from '../types/notification.ts';
import { 
  BellIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { notificationService } from '../services/notificationService.ts';

import LoadingSpinner from '../components/LoadingSpinner.tsx';
import DataTable from '../components/DataTable.tsx';
//import { formatDistanceToNow } from 'date-fns';
//import { fr } from 'date-fns/locale';
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
      onError: (error: any) => {
        console.error('Error loading notifications:', error);
      }
    }
  );

  console.log('Notifications data:', notifications);
  console.log('Notifications error:', error);

  const handleSendNotification = async (id: number) => {
    try {
      await notificationService.sendNotification(id);
      toast.success('Notification envoyée avec succès !');
      refetch();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      try {
        await notificationService.deleteNotification(id);
        toast.success('Notification supprimée avec succès !');
        refetch();
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Erreur lors de la suppression de la notification');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-success-100 text-success-800';
      case 'failed':
        return 'bg-error-100 text-error-800';
      case 'delivered':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error-100 text-error-800';
      case 'high':
        return 'bg-warning-100 text-warning-800';
      case 'medium':
        return 'bg-primary-100 text-primary-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <InformationCircleIcon className="w-4 h-4" />;
      case 'email':
        return <BellIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (notification: Notification) => (
        <div className="flex items-center">
          {getTypeIcon(notification.notification_type)}
          <span className="ml-2">#{notification.id}</span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Titre',
      render: (notification: Notification) => (
        <div>
          <p className="font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-600 truncate max-w-xs">
            {notification.message}
          </p>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Destinataire',
      render: (notification: Notification) => (
        <span className="text-sm text-gray-900">
          {notification.recipient_name || 'Inconnu'}
        </span>
      ),
    },
    {
      key: 'notification_type',
      header: 'Type',
      render: (notification: Notification) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {notification.notification_type.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priorité',
      render: (notification: Notification) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
            notification.priority
          )}`}
        >
          {notification.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (notification: Notification) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            notification.status
          )}`}
        >
          {notification.status === 'pending' && 'En attente'}
          {notification.status === 'sent' && 'Envoyée'}
          {notification.status === 'failed' && 'Échouée'}
          {notification.status === 'delivered' && 'Livrée'}
        </span>
      ),
    },
    {
      key: 'scheduled_time',
      header: 'Date prévue',
      render: (notification: Notification) => (
        <span className="text-sm text-gray-900">
          {new Date(notification.scheduled_time).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (notification: Notification) => (
        <div className="flex items-center space-x-2">
          {notification.status === 'pending' && (
            <button
              onClick={() => handleSendNotification(notification.id)}
              className="text-primary-600 hover:text-primary-700 p-1"
              title="Envoyer maintenant"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteNotification(notification.id)}
            className="text-error-600 hover:text-error-700 p-1"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Calculer les statistiques en gérant les cas où notifications est undefined
  const pendingCount = notifications?.results?.filter((n) => n.status === 'pending').length || 0;
  const sentCount = notifications?.results?.filter((n) => n.status === 'sent').length || 0;
  const failedCount = notifications?.results?.filter((n) => n.status === 'failed').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications et Rappels</h1>
          <p className="text-gray-600">Gérez les notifications et rappels automatiques</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="input-field"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">Toutes les notifications</option>
            <option value="pending">En attente</option>
            <option value="sent">Envoyées</option>
            <option value="failed">Échouées</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BellIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications?.count || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BellIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckIcon className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Envoyées</p>
              <p className="text-2xl font-bold text-gray-900">{sentCount}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-error-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-error-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Échouées</p>
              <p className="text-2xl font-bold text-gray-900">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-error-500 mb-4" />
            <p className="text-gray-600 mb-2">Erreur lors du chargement des notifications</p>
            <button 
              onClick={() => refetch()} 
              className="btn-primary"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={notifications?.results || []}
            pagination={{
              current: 1,
              total: notifications?.count || 0,
              pageSize: 20,
              onChange: () => {},
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;