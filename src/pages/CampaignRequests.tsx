import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import screeningService from '../services/screeningService.ts';
import { CampaignRequest } from '../types';

const CampaignRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Action modal
  const [selectedReq, setSelectedReq] = useState<CampaignRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await screeningService.getCampaignRequests();
      setRequests(data.results || (Array.isArray(data) ? data : []));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des demandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async () => {
    if (!selectedReq || !actionType) return;
    setProcessing(true);
    setActionSuccess('');

    try {
      if (actionType === 'approve') {
        const res = await screeningService.approveCampaignRequest(selectedReq.id!, responseNotes);
        setActionSuccess(res.detail || 'Campagne approuvée avec succès.');
      } else {
        await screeningService.rejectCampaignRequest(selectedReq.id!, responseNotes);
        setActionSuccess('Demande rejetée.');
      }
      setSelectedReq(null);
      setActionType(null);
      setResponseNotes('');
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Échec du traitement.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#bec9c9]/20 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#091e25]">Demandes de Campagnes (B2B)</h1>
          <p className="text-xs text-[#3e4949]">
            Demandes transmises par les ONG, Associations de Femmes, Centres de santé et l'État.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                statusFilter === st
                  ? 'bg-[#006669] text-white shadow-sm'
                  : 'bg-[#f2fbff] text-[#3e4949] hover:bg-[#dcf1fb]'
              }`}
            >
              {st === 'all' ? 'Toutes' : st === 'pending' ? 'En attente' : st === 'approved' ? 'Approuvées' : 'Rejetées'}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-[#006669]/10 border border-[#006669]/30 text-[#006669] rounded-xl text-xs font-bold">
          {actionSuccess}
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#e02020]/10 border border-[#e02020]/30 text-[#e02020] rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#3e4949]">Chargement des demandes...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-[#bec9c9]/20 text-[#3e4949] text-sm">
          Aucune demande de campagne trouvée pour ce filtre.
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-6 border border-[#bec9c9]/20 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full bg-[#9013fe]">
                    {req.org_type_display || req.org_type}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      req.status === 'approved'
                        ? 'bg-[#006669] text-white'
                        : req.status === 'rejected'
                        ? 'bg-[#e02020] text-white'
                        : 'bg-[#795500] text-white'
                    }`}
                  >
                    {req.status_display || req.status}
                  </span>
                  <span className="text-xs text-[#3e4949]">Reçu le {new Date(req.created_at || '').toLocaleDateString('fr-FR')}</span>
                </div>

                <h3 className="text-xl font-bold text-[#091e25]">{req.org_name}</h3>

                <div className="grid sm:grid-cols-3 gap-3 text-xs text-[#3e4949]">
                  <div>
                    <strong>Contact :</strong> {req.contact_name} ({req.contact_phone})
                  </div>
                  <div>
                    <strong>Email :</strong> {req.contact_email}
                  </div>
                  <div>
                    <strong>Région :</strong> {req.region_display || req.region || 'Non spécifiée'} {req.district ? `(${req.district})` : ''}
                  </div>
                  <div>
                    <strong>Lieu/Centre :</strong> {req.health_center_name || 'Non spécifié'}
                  </div>
                  <div>
                    <strong>Target :</strong> {req.expected_patients || 'N/A'} patients
                  </div>
                  <div>
                    <strong>Cancers :</strong>{' '}
                    {[req.covers_col && 'Col', req.covers_sein && 'Sein', req.covers_prostate && 'Prostate'].filter(Boolean).join(', ')}
                  </div>
                </div>

                {req.notes && (
                  <p className="text-xs text-[#3e4949] bg-[#f8fcfd] p-3 rounded-xl border border-[#bec9c9]/20 italic">
                    « {req.notes} »
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
                {req.status === 'pending' || req.status === 'reviewing' ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('approve');
                      }}
                      className="bg-[#006669] hover:bg-[#2a7f82] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Approuver & Créer
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('reject');
                      }}
                      className="bg-white border border-[#e02020] text-[#e02020] hover:bg-[#e02020]/5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Rejeter
                    </button>
                  </>
                ) : (
                  <div className="text-xs font-bold text-[#006669] bg-[#dcf1fb] px-3 py-1.5 rounded-xl">
                    Traitée
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#091e25]">
              {actionType === 'approve' ? 'Approuver la demande & Générer la campagne' : 'Rejeter la demande'}
            </h3>
            <p className="text-xs text-[#3e4949]">
              Organisation : <strong>{selectedReq.org_name}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-[#3e4949] mb-1">Notes de réponse / Instructions (optionnel)</label>
              <textarea
                rows={3}
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Ex: Campagne validée pour 500 personnes à Popenguine..."
                className="w-full px-3 py-2 rounded-xl border border-[#bec9c9] text-xs focus:outline-hidden"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                }}
                className="px-4 py-2 text-xs font-bold text-[#3e4949] hover:bg-gray-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl ${
                  actionType === 'approve' ? 'bg-[#006669] hover:bg-[#2a7f82]' : 'bg-[#e02020]'
                }`}
              >
                {processing ? 'Traitement...' : actionType === 'approve' ? 'Confirmer & Créer Campagne' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignRequestsPage;
