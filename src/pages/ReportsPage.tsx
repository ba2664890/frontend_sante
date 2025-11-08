import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { analyticsService } from '../services/analyticsService.ts';
import { Report } from '../types/analytics.ts';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner.tsx';

// ---------- Types ----------
type ReportForm = {
  name: string;
  title: string;
  report_type: Report['report_type'];
  status: string;
  start_date: string;
  end_date: string;
  region: string;
  filters: Record<string, any>;
};

// ---------- Constantes ----------
const REGIONS = [
  'Toutes',
  'Dakar',
  'Thiès',
  'Diourbel',
  'Kaolack',
  'Fatick',
  'Louga',
  'Saint-Louis',
  'Matam',
  'Tambacounda',
  'Kolda',
  'Ziguinchor',
  'Kédougou',
  'Sédhiou',
];

const REPORT_TYPES = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'annual', label: 'Annuel' },
  { value: 'custom', label: 'Personnalisé' },
];

// ---------- StatusBadge Component ----------
const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-800',
    generating: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const labels = {
    pending: 'En attente',
    generating: 'En génération',
    completed: 'Terminé',
    failed: 'Échoué',
  };

  const className = badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  const label = labels[status as keyof typeof labels] || 'Inconnu';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
};

// ---------- CreateReportDrawer Component ----------
const CreateReportDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState<ReportForm>({
    name: '',
    title: '',
    report_type: 'custom',
    status: 'pending',
    start_date: '',
    end_date: '',
    region: 'Toutes',
    filters: {},
  });

  const createMutation = useMutation(
    (payload: Partial<Report>) => analyticsService.createReport(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
        toast.success('Rapport créé avec succès !');
        onCreated();
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Erreur lors de la création du rapport');
      },
    }
  );

  useEffect(() => {
    if (!isOpen) {
      setForm({
        name: '',
        title: '',
        report_type: 'custom',
        status: 'pending',
        start_date: '',
        end_date: '',
        region: 'Toutes',
        filters: {},
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      toast.error('Veuillez saisir un nom pour le rapport');
      return;
    }

    if (!form.start_date || !form.end_date) {
      toast.error('Veuillez sélectionner une période');
      return;
    }

    if (new Date(form.start_date) > new Date(form.end_date)) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: form.name,
        title: form.title || form.name,
        report_type: form.report_type,
        status: 'pending',
        start_date: form.start_date,
        end_date: form.end_date,
        region: form.region === 'Toutes' ? undefined : form.region,
        filters: form.filters,
      } as any);
    } catch (error) {
      // L'erreur est déjà gérée par onError
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Créer un rapport</h3>
            <p className="text-sm text-gray-600 mt-1">Définissez les paramètres du rapport</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom du rapport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du rapport <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full input-field"
              placeholder="Ex: Rapport hebdomadaire Dakar"
              required
            />
          </div>

          {/* Titre (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du rapport (optionnel)
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full input-field"
              placeholder="Titre personnalisé"
            />
          </div>

          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport <span className="text-red-500">*</span>
            </label>
            <select
              value={form.report_type}
              onChange={(e) => setForm({ ...form, report_type: e.target.value as Report['report_type'] })}
              className="w-full input-field"
              required
            >
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date début</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date fin</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Région */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Région
            </label>
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="w-full input-field"
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={createMutation.isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary inline-flex items-center"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Création...
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Créer le rapport
                </>
              )}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

// ---------- ReportTable Component ----------
const ReportTable: React.FC<{
  reports: Report[];
  isLoading: boolean;
  onGenerate: (id: number) => Promise<void>;
  onDownload: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = ({ reports, isLoading, onGenerate, onDownload, onDelete }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rapport
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Région
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun rapport disponible</p>
                  <p className="text-sm text-gray-400 mt-1">Créez votre premier rapport pour commencer</p>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                        <div className="text-xs text-gray-500">
                          Créé le {new Date(report.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {REPORT_TYPES.find(t => t.value === report.report_type)?.label || report.report_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{new Date(report.start_date).toLocaleDateString('fr-FR')}</span>
                      <span className="mx-1">→</span>
                      <span>{new Date(report.end_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.region || 'Toutes'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => onGenerate(report.id)}
                          className="btn-primary inline-flex items-center"
                          title="Générer le rapport"
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-1" />
                          Générer
                        </button>
                      )}

                      {report.status === 'generating' && (
                        <span className="inline-flex items-center text-indigo-600">
                          <LoadingSpinner size="sm" className="mr-2" />
                          En cours...
                        </span>
                      )}

                      {report.status === 'completed' && (
                        <button
                          onClick={() => onDownload(report.id)}
                          className="btn-success inline-flex items-center"
                          title="Télécharger le rapport"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                          Télécharger
                        </button>
                      )}

                      {report.status === 'failed' && (
                        <button
                          onClick={() => onGenerate(report.id)}
                          className="btn-warning inline-flex items-center"
                          title="Réessayer"
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-1" />
                          Réessayer
                        </button>
                      )}

                      <button
                        onClick={() => onDelete(report.id)}
                        className="text-error-600 hover:text-error-700 p-2 rounded-lg hover:bg-error-50 transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- ReportsPage (Main Component) ----------
export default function ReportsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState('Toutes');
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reportsResponse, isLoading } = useQuery(
    ['reports', regionFilter],
    () => analyticsService.getReports({ region: regionFilter === 'Toutes' ? undefined : regionFilter }),
    {
      refetchInterval: 10000, // Rafraîchir toutes les 10 secondes pour voir les statuts
    }
  );

  // Normaliser la réponse (peut être paginée ou un tableau)
  const reports: Report[] = Array.isArray(reportsResponse)
    ? reportsResponse
    : reportsResponse?.results || [];

  // Mutation pour générer un rapport
  const generateMutation = useMutation(
    (id: number) => analyticsService.generateReport(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
        toast.success('Génération du rapport lancée !');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Erreur lors de la génération');
      },
    }
  );

  // Mutation pour télécharger un rapport
  const downloadMutation = useMutation(
    async (id: number) => {
      const blob = await analyticsService.downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${id}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    {
      onSuccess: () => {
        toast.success('Rapport téléchargé avec succès !');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Erreur lors du téléchargement');
      },
    }
  );

  // Mutation pour supprimer un rapport
  const deleteMutation = useMutation(
    (id: number) => analyticsService.deleteReport(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
        toast.success('Rapport supprimé avec succès !');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Erreur lors de la suppression');
      },
    }
  );

  // Handlers
  const handleGenerate = async (id: number) => {
    try {
      await generateMutation.mutateAsync(id);
    } catch (error) {
      // Erreur déjà gérée par onError
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await downloadMutation.mutateAsync(id);
    } catch (error) {
      // Erreur déjà gérée par onError
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // Erreur déjà gérée par onError
      }
    }
  };

  // Statistiques rapides
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    generating: reports.filter(r => r.status === 'generating').length,
    completed: reports.filter(r => r.status === 'completed').length,
    failed: reports.filter(r => r.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports d'Analyse</h1>
          <p className="text-gray-600 mt-1">
            Créez, générez et téléchargez des rapports personnalisés
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filtre par région */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="input-field"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {/* Bouton créer rapport */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-primary inline-flex items-center"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Nouveau rapport
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Cog6ToothIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Génération</p>
              <p className="text-2xl font-bold text-gray-900">{stats.generating}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-error-100 rounded-lg">
              <ExclamationCircleIcon className="w-6 h-6 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Échoués</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <ReportTable
        reports={reports}
        isLoading={isLoading}
        onGenerate={handleGenerate}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      {/* Drawer */}
      <CreateReportDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => {
          setDrawerOpen(false);
          queryClient.invalidateQueries('reports');
        }}
      />
    </div>
  );
}