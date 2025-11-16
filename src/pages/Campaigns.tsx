import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { analyticsService } from '../services/analyticsService.ts';
import { Campaign } from '../types/analytics.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  MegaphoneIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { format, isPast, isFuture, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

// Types
interface CampaignFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  region: string;
  target_population: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

// Composant Hero Section
const HeroSection: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-8 md:p-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
            <MegaphoneIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-yellow-300" />
            <span className="text-yellow-300 font-semibold text-sm">Ensemble contre le cancer</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Campagnes de Dépistage
          <br />
          <span className="text-gradient-primary">CerviCare+</span>
        </h1>

        <p className="text-xl text-purple-100 mb-8 max-w-2xl">
          Rejoignez nos campagnes de dépistage du cancer du col de l'utérus et contribuez à sauver des vies dans toutes les régions du Sénégal.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <MegaphoneIcon className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200 text-sm">Campagnes</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.total || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-green-300" />
              <span className="text-green-200 text-sm">Actives</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.active || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-5 h-5 text-blue-300" />
              <span className="text-blue-200 text-sm">Personnes dépistées</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.screened || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <HeartIcon className="w-5 h-5 text-pink-300" />
              <span className="text-pink-200 text-sm">Vies sauvées</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.livesSaved || Math.floor((stats?.screened || 0) * 0.15)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const badges: Record<string, { label: string; className: string; icon: any }> = {
    active: {
      label: 'Active',
      className: 'status-success',
      icon: CheckCircleIcon,
    },
    planned: {
      label: 'Planifiée',
      className: 'status-info',
      icon: ClockIcon,
    },
    completed: {
      label: 'Terminée',
      className: 'status-badge bg-gray-500/20 text-gray-300',
      icon: CheckCircleIcon,
    },
    cancelled: {
      label: 'Annulée',
      className: 'status-error',
      icon: XCircleIcon,
    },
  };

  const badge = badges[status] || badges.planned;
  const Icon = badge.icon;

  return (
    <span className={`status-badge ${badge.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {badge.label}
    </span>
  );
};

// Composant Campaign Card
const CampaignCard: React.FC<{
  campaign: Campaign;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ campaign, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const startDate = parseISO(campaign.start_date);
  const endDate = parseISO(campaign.end_date);
  const isActive = campaign.status === 'active';
  const daysRemaining = isActive ? differenceInDays(endDate, new Date()) : 0;

  const progress = campaign.target_population > 0 
    ? (campaign.actual_screenings / campaign.target_population) * 100 
    : 0;

  return (
    <div className="card group cursor-pointer">
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={campaign.status} />
            {isActive && daysRemaining <= 7 && (
              <span className="status-badge status-warning">
                <ClockIcon className="w-3 h-3" />
                {daysRemaining} jours restants
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-gradient-primary transition-all">
            {campaign.name}
          </h3>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <PencilIcon className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <TrashIcon className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {campaign.description}
      </p>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="w-4 h-4 text-purple-400" />
          <span className="text-gray-300">
            {format(startDate, 'dd MMM', { locale: fr })} - {format(endDate, 'dd MMM yyyy', { locale: fr })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="w-4 h-4 text-pink-400" />
          <span className="text-gray-300">{campaign.region}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <UsersIcon className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            {campaign.actual_screenings} / {campaign.target_population}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <ChartBarIcon className="w-4 h-4 text-green-400" />
          <span className="text-gray-300">{progress.toFixed(0)}% atteint</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <span>Créée le {format(parseISO(campaign.created_at), 'dd MMM yyyy', { locale: fr })}</span>
        {campaign.coverage_rate !== undefined && (
          <span className="text-purple-400 font-semibold">
            Couverture: {campaign.coverage_rate.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

// Composant Form Modal
const CampaignFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign;
}> = ({ isOpen, onClose, campaign }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CampaignFormData>({
    name: campaign?.name || '',
    description: campaign?.description || '',
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || '',
    region: campaign?.region || 'Dakar',
    target_population: campaign?.target_population || 100,
    status: campaign?.status || 'planned',
  });

  const mutation = useMutation(
    (data: CampaignFormData) =>
      campaign
        ? analyticsService.updateCampaign(campaign.id, data)
        : analyticsService.createCampaign(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
        toast.success(campaign ? 'Campagne mise à jour' : 'Campagne créée');
        onClose();
      },
      onError: () => {
        toast.error('Erreur lors de la sauvegarde');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  const regions = [
    'Dakar', 'Thiès', 'Diourbel', 'Kaolack', 'Fatick', 'Louga',
    'Saint-Louis', 'Matam', 'Tambacounda', 'Kolda', 'Ziguinchor',
    'Kédougou', 'Sédhiou'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={campaign ? 'Modifier la campagne' : 'Nouvelle campagne'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label">Nom de la campagne *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            required
            placeholder="Ex: Campagne de dépistage Dakar 2024"
          />
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows={3}
            placeholder="Décrivez les objectifs et le déroulement de la campagne..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Date de début *</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="form-label">Date de fin *</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Région *</label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="input-field"
              required
            >
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Population cible *</label>
            <input
              type="number"
              value={formData.target_population}
              onChange={(e) => setFormData({ ...formData, target_population: parseInt(e.target.value) })}
              className="input-field"
              required
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Statut</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="input-field"
          >
            <option value="planned">Planifiée</option>
            <option value="active">Active</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={mutation.isLoading}>
            {mutation.isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                {campaign ? 'Mettre à jour' : 'Créer la campagne'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Composant Principal
const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>();

  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const { data: campaigns, isLoading } = useQuery(
    ['campaigns', filter],
    () => analyticsService.getCampaigns({ status: filter !== 'all' ? filter : undefined }),
    {
      refetchInterval: 30000,
    }
  );

  const deleteMutation = useMutation(
    (id: number) => analyticsService.deleteCampaign(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
        toast.success('Campagne supprimée');
      },
      onError: () => {
        toast.error('Erreur lors de la suppression');
      },
    }
  );

  const handleDelete = (campaign: Campaign) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${campaign.name}" ?`)) {
      deleteMutation.mutate(campaign.id);
    }
  };

  const campaignsList = Array.isArray(campaigns) ? campaigns : campaigns?.results || [];

  const stats = {
    total: campaignsList.length,
    active: campaignsList.filter((c: Campaign) => c.status === 'active').length,
    screened: campaignsList.reduce((sum: number, c: Campaign) => sum + (c.actual_screenings || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Actives
          </button>
          <button
            onClick={() => setFilter('planned')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'planned'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Planifiées
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'completed'
                ? 'bg-gray-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Terminées
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedCampaign(undefined);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle campagne
          </button>
        )}
      </div>

      {/* Campaigns Grid */}
      {campaignsList.length === 0 ? (
        <div className="card text-center py-12">
          <ShieldCheckIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucune campagne</h3>
          <p className="text-gray-400">
            {filter === 'all'
              ? 'Aucune campagne pour le moment'
              : `Aucune campagne ${filter === 'active' ? 'active' : filter === 'planned' ? 'planifiée' : 'terminée'}`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaignsList.map((campaign: Campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => {
                setSelectedCampaign(campaign);
                setShowModal(true);
              }}
              onDelete={() => handleDelete(campaign)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CampaignFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCampaign(undefined);
        }}
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default Campaigns;