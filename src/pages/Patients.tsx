import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon as SearchIcon, FunnelIcon as FilterIcon, ArrowDownTrayIcon as DownloadIcon } from '@heroicons/react/24/outline';
import { patientService } from '../services/patientService.ts';
import { Patient, PatientFilters } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import DataTable from '../components/DataTable.tsx';
import PatientFormWizard from '../components/PatientForm.tsx';
import Modal from '../components/Modal.tsx';
import { toast } from 'react-hot-toast';

const Patients: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<PatientFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer la liste des patientes
  const { data: patients, isLoading, refetch } = useQuery(
    ['patients', filters, currentPage, searchTerm],
    () => patientService.getPatients({ ...filters, search: searchTerm }, currentPage),
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: PatientFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePatientCreated = () => {
    setShowForm(false);
    refetch();
    toast.success('Patiente enregistrée avec succès !');
  };

  const handleExport = async () => {
    try {
      const blob = await patientService.exportPatientsData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patientes_cervicare_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Données exportées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'exportation des données');
    }
  };

  const columns = [
    { key: 'id_patient', header: 'ID Patient', sortable: true },
    {
      key: 'full_name',
      header: 'Nom complet',
      sortable: true,
      render: (patient: Patient) => (
        <Link
          to={`/patients/${patient.record_id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {patient.full_name}
        </Link>
      ),
    },
    { key: 'age', header: 'Âge', sortable: true, render: (p: Patient) => `${p.age} ans` },
    { key: 'num_phone', header: 'Téléphone' },
    { key: 'region_name', header: 'Région', sortable: true },
    {
      key: 'resultat_examen',
      header: 'Résultat',
      render: (patient: Patient) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            patient.resultat_examen === 1
              ? 'bg-success-100 text-success-800'
              : patient.resultat_examen === 2
              ? 'bg-error-100 text-error-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {patient.resultat_examen_display || 'En attente'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (patient: Patient) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            patient.status === 'completed'
              ? 'bg-success-100 text-success-800'
              : patient.status === 'follow_up'
              ? 'bg-warning-100 text-warning-800'
              : 'bg-primary-100 text-primary-800'
          }`}
        >
          {patient.status === 'new' && 'Nouvelle'}
          {patient.status === 'screened' && 'Dépistée'}
          {patient.status === 'follow_up' && 'À revoir'}
          {patient.status === 'completed' && 'Terminé'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date d\'enregistrement',
      sortable: true,
      render: (patient: Patient) =>
        new Date(patient.created_at).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Patientes</h1>
          <p className="text-gray-600">Gérez les informations des patientes du programme CerviCare+</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleExport} className="btn-secondary">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Exporter
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvelle patiente
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une patiente..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <FilterIcon className="w-5 h-5 text-gray-400" />
            <select
              className="input-field"
              value={filters.region || ''}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  region: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            >
              <option value="">Toutes les régions</option>
              <option value="1">Thiès</option>
              <option value="2">Diourbel</option>
              <option value="3">Fatick</option>
              <option value="4">Kaolack</option>
              <option value="5">Louga</option>
              <option value="6">Saint-Louis</option>
              <option value="7">Matam</option>
              <option value="8">Tambacounda</option>
              <option value="9">Kolda</option>
              <option value="10">Ziguinchor</option>
              <option value="11">Kédougou</option>
              <option value="12">Sédhiou</option>
            </select>
          </div>
          <div>
            <select
              className="input-field"
              value={filters.resultat_examen || ''}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  resultat_examen: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            >
              <option value="">Tous les résultats</option>
              <option value="1">Normal</option>
              <option value="2">Anormal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={patients?.results || []}
            pagination={{
              current: currentPage,
              total: patients?.count || 0,
              pageSize: 20,
              onChange: setCurrentPage,
            }}
          />
        )}
      </div>

      {/* Modal for new patient */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Enregistrer une nouvelle patiente"
        size="xl"
      >
        <PatientFormWizard
          onSubmit={handlePatientCreated}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

export default Patients;
