// src/pages/HealthCenters.tsx
import React, { useEffect, useState } from 'react';
import screeningService from '../services/screeningService.ts';
import { HealthCenter, User } from '../types';
import api from '../services/api.ts';

const HealthCenters: React.FC = () => {
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null);
  const [adminsList, setAdminsList] = useState<User[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<number | string>('');

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState(1);
  const [district, setDistrict] = useState('');
  const [typeStructure, setTypeStructure] = useState(1);
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [coversCol, setCoversCol] = useState(true);
  const [coversSein, setCoversSein] = useState(false);
  const [coversProstate, setCoversProstate] = useState(false);

  useEffect(() => {
    fetchCenters();
    fetchPotentialAdmins();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await screeningService.getHealthCenters();
      setCenters(res.results || []);
    } catch (err: any) {
      setError(err.message || 'Impossible de récupérer les centres de santé.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPotentialAdmins = async () => {
    try {
      const res = await api.get('/accounts/users/');
      // On filtre les utilisateurs pour ne garder que ceux qui peuvent être admins de centre
      const users: User[] = res.data.results || res.data || [];
      const potential = users.filter((u) => u.role === 'center_admin' || u.role === 'health_agent' || u.role === 'global_admin');
      setAdminsList(potential);
    } catch (err) {
      console.error('Erreur lors du chargement des admins potentiels', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<HealthCenter> = {
        name,
        code,
        region,
        district,
        type_structure: typeStructure,
        adresse,
        telephone,
        covers_col: coversCol,
        covers_sein: coversSein,
        covers_prostate: coversProstate,
      };

      if (selectedCenter) {
        await screeningService.updateHealthCenter(selectedCenter.id, payload);
      } else {
        await screeningService.createHealthCenter(payload);
      }

      fetchCenters();
      closeFormModal();
    } catch (err: any) {
      alert(err.message || "Erreur d'enregistrement.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce centre de santé ?')) {
      try {
        await screeningService.deleteHealthCenter(id);
        fetchCenters();
      } catch (err: any) {
        alert(err.message || 'Erreur de suppression.');
      }
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter || !selectedAdminId) return;
    try {
      await screeningService.assignCenterAdmin(selectedCenter.id, Number(selectedAdminId));
      fetchCenters();
      setShowAdminModal(false);
      setSelectedCenter(null);
      setSelectedAdminId('');
    } catch (err: any) {
      alert(err.message || "Erreur d'affectation.");
    }
  };

  const openFormModal = (center?: HealthCenter) => {
    if (center) {
      setSelectedCenter(center);
      setName(center.name);
      setCode(center.code || '');
      setRegion(center.region || 1);
      setDistrict(center.district || '');
      setTypeStructure(center.type_structure || 1);
      setAdresse(center.adresse || '');
      setTelephone(center.telephone || '');
      setCoversCol(center.covers_col);
      setCoversSein(center.covers_sein);
      setCoversProstate(center.covers_prostate);
    } else {
      setSelectedCenter(null);
      setName('');
      setCode('');
      setRegion(1);
      setDistrict('');
      setTypeStructure(1);
      setAdresse('');
      setTelephone('');
      setCoversCol(true);
      setCoversSein(false);
      setCoversProstate(false);
    }
    setShowModal(true);
  };

  const closeFormModal = () => {
    setShowModal(false);
    setSelectedCenter(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#006669]" style={{ fontFamily: 'Literata, serif' }}>
            Centres de Santé Permanents
          </h1>
          <p className="text-[#3e4949] text-sm">
            Gestion du pipeline structurel : centres fixes, administrateurs et cancers couverts.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="bg-[#006669] hover:bg-[#2a7f82] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition duration-250 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Créer un centre
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl border border-[#ba1a1a]/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[#006669] font-medium">Chargement des structures fixes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center) => (
            <div
              key={center.id}
              className="bg-white rounded-2xl border border-[#bec9c9]/30 p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#006669] bg-[#dcf1fb] px-2.5 py-1 rounded-full">
                    {center.type_structure_display || 'Centre'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openFormModal(center)}
                      className="p-1.5 hover:bg-[#e4f7ff] rounded-lg text-[#006669] transition"
                      title="Modifier"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(center.id)}
                      className="p-1.5 hover:bg-[#ffdad6] rounded-lg text-[#ba1a1a] transition"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-[#091e25] text-lg mb-1">{center.name}</h3>
                {center.code && (
                  <p className="text-[12px] text-[#3e4949] font-mono mb-2">Code: {center.code}</p>
                )}

                <div className="space-y-2 mt-4 text-[13px] text-[#3e4949]">
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {center.region_display} {center.district ? `· ${center.district}` : ''}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">supervisor_account</span>
                    <span>
                      Admin:{' '}
                      {center.admin ? (
                        <span className="font-semibold text-[#091e25]">
                          {center.admin.first_name} {center.admin.last_name}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCenter(center);
                            setShowAdminModal(true);
                          }}
                          className="text-[#9a4523] underline font-semibold"
                        >
                          Assigner un admin
                        </button>
                      )}
                    </span>
                  </p>
                  {center.telephone && (
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {center.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-[#bec9c9]/20 mt-5 pt-4">
                <p className="text-[11px] font-bold text-[#3e4949] uppercase tracking-wider mb-2">
                  Cancers Dépistés
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {center.covers_col && (
                    <span className="text-[11px] font-semibold text-[#9013fe] bg-[#9013fe]/10 px-2 py-0.5 rounded">
                      Col Utérin
                    </span>
                  )}
                  {center.covers_sein && (
                    <span className="text-[11px] font-semibold text-[#e02020] bg-[#e02020]/10 px-2 py-0.5 rounded">
                      Sein
                    </span>
                  )}
                  {center.covers_prostate && (
                    <span className="text-[11px] font-semibold text-[#006669] bg-[#006669]/10 px-2 py-0.5 rounded">
                      Prostate
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Création/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-[#091e25]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#bec9c9]/30">
            <h2 className="text-xl font-bold text-[#006669] mb-4" style={{ fontFamily: 'Literata, serif' }}>
              {selectedCenter ? 'Modifier' : 'Créer'} un centre de santé
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                  Nom de la structure
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                    Code structure (DHIS2)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                    Région médicale
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669]"
                  >
                    <option value={1}>Dakar</option>
                    <option value={2}>Diourbel</option>
                    <option value={3}>Fatick</option>
                    <option value={4}>Kaffrine</option>
                    <option value={5}>Kaolack</option>
                    <option value={13}>Thiès</option>
                    <option value={14}>Ziguinchor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                  Type de structure
                </label>
                <select
                  value={typeStructure}
                  onChange={(e) => setTypeStructure(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669]"
                >
                  <option value={1}>Poste de santé</option>
                  <option value={2}>Centre de santé</option>
                  <option value={3}>Hôpital de district</option>
                  <option value={4}>EPS niveau 2</option>
                  <option value={5}>EPS niveau 3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                  Adresse
                </label>
                <textarea
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669] h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-2">
                  Cancers pris en charge
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#091e25]">
                    <input
                      type="checkbox"
                      checked={coversCol}
                      onChange={(e) => setCoversCol(e.target.checked)}
                      className="rounded text-[#006669] focus:ring-[#006669]"
                    />
                    Col de l'utérus
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#091e25]">
                    <input
                      type="checkbox"
                      checked={coversSein}
                      onChange={(e) => setCoversSein(e.target.checked)}
                      className="rounded text-[#006669] focus:ring-[#006669]"
                    />
                    Sein
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#091e25]">
                    <input
                      type="checkbox"
                      checked={coversProstate}
                      onChange={(e) => setCoversProstate(e.target.checked)}
                      className="rounded text-[#006669] focus:ring-[#006669]"
                    />
                    Prostate
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#bec9c9]/20">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 rounded-xl border border-[#bec9c9]/50 text-[#3e4949] text-sm font-semibold hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#006669] hover:bg-[#2a7f82] text-white text-sm font-semibold shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assigner Admin */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-[#091e25]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#bec9c9]/30">
            <h2 className="text-xl font-bold text-[#006669] mb-4" style={{ fontFamily: 'Literata, serif' }}>
              Assigner un Administrateur
            </h2>
            <p className="text-sm text-[#3e4949] mb-4">
              Sélectionnez l'utilisateur qui administrera le centre{' '}
              <span className="font-bold text-[#091e25]">{selectedCenter?.name}</span>.
            </p>
            <form onSubmit={handleAssignAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase tracking-wider mb-1">
                  Sélectionner un admin
                </label>
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bec9c9]/40 focus:outline-none focus:border-[#006669]"
                  required
                >
                  <option value="">-- Choisir un utilisateur --</option>
                  {adminsList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.username}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#bec9c9]/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setSelectedCenter(null);
                    setSelectedAdminId('');
                  }}
                  className="px-4 py-2 rounded-xl border border-[#bec9c9]/50 text-[#3e4949] text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#006669] hover:bg-[#2a7f82] text-white text-sm font-semibold"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCenters;
