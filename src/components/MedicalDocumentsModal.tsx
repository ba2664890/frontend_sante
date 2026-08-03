import React, { useState } from 'react';
import { Patient } from '../types';
import { patientService } from '../services/patientService.ts';
import { toast } from 'react-hot-toast';

interface MedicalDocumentsModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  initialDocType?: 'anapath' | 'fcv' | 'hpv' | 'colposcopie' | 'reference';
}

type DocType = 'anapath' | 'fcv' | 'hpv' | 'colposcopie' | 'reference';

const DOC_TYPES: { id: DocType; label: string; number: string; icon: string; color: string }[] = [
  { id: 'anapath', label: "Anatomopathologie (Biopsie)", number: "Fiche 1", icon: 'biotech', color: '#006669' },
  { id: 'fcv', label: "Cytologie (FCV)", number: "Fiche 2", icon: 'microscope', color: '#2a7f82' },
  { id: 'hpv', label: "Test HPV (ADN-HPV)", number: "Fiche 3", icon: 'dna', color: '#006669' },
  { id: 'colposcopie', label: "Demande Colposcopie", number: "Fiche 4", icon: 'stethoscope', color: '#795500' },
  { id: 'reference', label: "Bulletin de Référence", number: "Fiche 5", icon: 'emergency_share', color: '#9a4523' },
];

export const MedicalDocumentsModal: React.FC<MedicalDocumentsModalProps> = ({
  patient,
  isOpen,
  onClose,
  initialDocType = 'anapath',
}) => {
  const [activeDoc, setActiveDoc] = useState<DocType>(initialDocType);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !patient) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await patientService.generateDocumentBlob(patient.record_id, activeDoc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiche_${activeDoc}_patient_${patient.id_patient}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Document PDF téléchargé !');
    } catch {
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const regions: Record<number, string> = {
    1: 'Dakar', 2: 'Diourbel', 3: 'Fatick', 4: 'Kaffrine', 5: 'Kaolack',
    6: 'Kédougou', 7: 'Kolda', 8: 'Louga', 9: 'Matam', 10: 'Saint-Louis',
    11: 'Sédhiou', 12: 'Tambacounda', 13: 'Thiès', 14: 'Ziguinchor'
  };

  const regionName = patient.geo_region ? regions[patient.geo_region] : (patient.region_name || 'Dakar');
  const dateFormatted = patient.dep_date 
    ? new Date(patient.dep_date).toLocaleDateString('fr-FR')
    : new Date(patient.created_at).toLocaleDateString('fr-FR');

  const getIvaText = () => {
    switch(patient.dep_resultat_iva) {
      case 1: return 'Négatif';
      case 2: return 'Positif (Lésion acéto-blanche)';
      case 3: return 'Polype';
      case 4: return 'Suspicion de cancer invasif';
      case 5: return 'Non concluant (ZT3)';
      default: return patient.resultat_examen_display || 'Non réalisé';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-medical-document, #printable-medical-document * { visibility: visible; }
          #printable-medical-document { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#bec9c9]/20">
        {/* Modal Header */}
        <div className="bg-[#f2fbff] px-6 py-4 border-b border-[#bec9c9]/20 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006669] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">description</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#091e25]" style={{ fontFamily: 'Literata, serif' }}>
                Documents & Bulletins Médicaux — {patient.full_name}
              </h2>
              <p className="text-xs text-[#3e4949]">Génération et impression des 5 fiches officielles MSAS (Col de l'Utérus)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#3e4949] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#e4f7ff]/40 border-b border-[#bec9c9]/20 px-6 overflow-x-auto no-print">
          {DOC_TYPES.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-xs transition-all border-b-2 whitespace-nowrap ${
                activeDoc === doc.id
                  ? 'border-[#006669] text-[#006669] bg-white rounded-t-xl shadow-sm'
                  : 'border-transparent text-[#3e4949] hover:text-[#006669]'
              }`}
            >
              <span className="px-1.5 py-0.5 rounded bg-[#006669]/10 text-[#006669] text-[9px] font-mono">{doc.number}</span>
              {doc.label}
            </button>
          ))}
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-3 bg-white border-b border-[#bec9c9]/10 flex items-center justify-between no-print">
          <span className="text-xs text-[#3e4949] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[#006669] text-[18px]">verified</span>
            Formulaire pré-rempli automatiquement avec les données MSAS du patient ID: <strong className="font-mono">{patient.id_patient}</strong>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#bec9c9]/30 rounded-xl text-xs font-bold text-[#3e4949] hover:bg-[#dcf1fb] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Imprimer
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 bg-[#006669] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2a7f82] transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              {downloading ? 'Téléchargement...' : 'Télécharger PDF'}
            </button>
          </div>
        </div>

        {/* Document Preview Container (Printable Zone) */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100/50">
          <div 
            id="printable-medical-document"
            className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200 text-[#091e25] space-y-6 font-sans"
          >
            {/* Header MSAS */}
            <div className="text-center border-b-2 border-[#006669] pb-4">
              <p className="font-bold text-xs uppercase tracking-wider text-gray-700">RÉPUBLIQUE DU SÉNÉGAL</p>
              <p className="text-[10px] italic text-gray-500">Un Peuple - Un But - Une Foi</p>
              <p className="font-bold text-xs uppercase tracking-wider text-[#006669] mt-1">
                MINISTÈRE DE LA SANTÉ ET DE L'ACTION SOCIALE (MSAS)
              </p>
              <p className="text-[11px] font-semibold text-gray-600">PROGRAMME NATIONAL DE LUTTE CONTRE LES CANCERS (PNLC)</p>
            </div>

            {/* Document Title Banner */}
            <div className="bg-[#f2fbff] border border-[#006669]/20 p-4 rounded-xl text-center">
              <span className="px-2 py-0.5 bg-[#006669] text-white rounded font-mono font-bold text-[10px] uppercase">
                {DOC_TYPES.find(d => d.id === activeDoc)?.number}
              </span>
              <h3 className="text-lg font-bold text-[#006669] uppercase mt-1">
                {DOC_TYPES.find(d => d.id === activeDoc)?.label}
              </h3>
            </div>

            {/* Structure info table */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p><span className="text-gray-500 font-bold uppercase text-[10px]">Région Médicale :</span> <strong>{regionName}</strong></p>
                <p className="mt-1"><span className="text-gray-500 font-bold uppercase text-[10px]">Structure de Santé :</span> <strong>{patient.geo_structure || 'Centre de Santé'}</strong></p>
              </div>
              <div>
                <p><span className="text-gray-500 font-bold uppercase text-[10px]">District Sanitaire :</span> <strong>{patient.geo_district || 'District'}</strong></p>
                <p className="mt-1"><span className="text-gray-500 font-bold uppercase text-[10px]">Date du Bulletin :</span> <strong>{dateFormatted}</strong></p>
              </div>
            </div>

            {/* Section 1: Patiente */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-[#006669] uppercase tracking-wider border-b border-gray-200 pb-1">
                1. Identification de la Patiente
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-gray-500">ID Patient :</span> <strong className="font-mono text-sm">{patient.id_patient}</strong></div>
                <div><span className="text-gray-500">Nom & Prénom :</span> <strong className="text-sm">{patient.full_name}</strong></div>
                <div><span className="text-gray-500">Âge :</span> <strong>{patient.age} ans</strong></div>
                <div><span className="text-gray-500">Téléphone :</span> <strong className="font-mono">{patient.num_phone || '—'}</strong></div>
                <div><span className="text-gray-500">NIN (CNI) :</span> <strong className="font-mono">{patient.pat_nin || '—'}</strong></div>
                <div><span className="text-gray-500">Adresse :</span> <strong>{patient.pat_adresse || '—'}</strong></div>
              </div>
            </div>

            {/* Section 2: Données Cliniques */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-[#006669] uppercase tracking-wider border-b border-gray-200 pb-1">
                2. Renseignements Cliniques & Gynéco-Obstétriques
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-gray-500">Enfants vivants (Parité) :</span> <strong>{patient.gyn_parite_simple !== undefined ? `${patient.gyn_parite_simple} enfants` : '—'}</strong></div>
                <div><span className="text-gray-500">Grossesse en cours :</span> <strong>{patient.phy_statut === 2 ? 'Oui' : 'Non'}</strong></div>
                <div><span className="text-gray-500">Statut Ménopausique :</span> <strong>{patient.phy_statut === 5 ? 'Oui' : 'Non'}</strong></div>
                <div><span className="text-gray-500">Statut VIH :</span> <strong>{patient.ris_vih_statut ? {1:'Négatif', 2:'Positif sous TARV', 3:'Positif sans TARV', 9:'Inconnu'}[patient.ris_vih_statut] : '—'}</strong></div>
                <div className="col-span-2 p-2 bg-[#f2fbff] rounded-lg border border-[#006669]/20">
                  <span className="text-gray-600 font-bold">Résultat du Dépistage (IVA/IVL) :</span>{' '}
                  <strong className="text-[#006669]">{getIvaText()}</strong>
                </div>
              </div>
            </div>

            {/* Section 3: Motifs & Spécifications */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-[#006669] uppercase tracking-wider border-b border-gray-200 pb-1">
                3. Motifs et Spécifications de l'Examen
              </h4>
              <div className="p-4 bg-[#f8fcfc] rounded-xl border border-gray-200 text-xs space-y-2 leading-relaxed">
                {activeDoc === 'anapath' && (
                  <>
                    <p><strong>Organe prélevé :</strong> Col de l'utérus (Biopsie dirigée sous colposcopie)</p>
                    <p><strong>Nombre de fragments :</strong> {patient.dep_biopsie_sites || 1} flacon(s) conservé(s) dans le formol 10%</p>
                    <p><strong>Motif de la biopsie :</strong> Lésion IVA positive / Aspect atypique de la zone de transformation (ZT)</p>
                    <p><strong>Renseignements macroscopiques :</strong> {patient.dep_ia_deep_learning_result || 'Prélèvement sur zone acéto-blanche suspecte.'}</p>
                  </>
                )}

                {activeDoc === 'fcv' && (
                  <>
                    <p><strong>Type d'examen :</strong> Frottis Cervico-Vaginal (FCV) / Examen Cytologique</p>
                    <p><strong>Technique :</strong> Etalement sur lame (Fixation alcool 95°)</p>
                    <p><strong>Indication :</strong> Dépistage systématique du col utérin / Contrôle cytologique post-traitement</p>
                    <p><strong>Aspect clinique du col :</strong> Col sain ou présentant des signes d'inflammation/cervicite</p>
                  </>
                )}

                {activeDoc === 'hpv' && (
                  <>
                    <p><strong>Type d'examen :</strong> Détection et génotypage des Papillomavirus Humains à haut risque (HPV-HR)</p>
                    <p><strong>Prélèvement :</strong> Écouvillon cervical / Milieu de transport</p>
                    <p><strong>Recherche ciblée :</strong> HPV 16, HPV 18 et autres génotypes à haut risque (31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 68)</p>
                  </>
                )}

                {activeDoc === 'colposcopie' && (
                  <>
                    <p><strong>Examen demandé :</strong> Colposcopie de diagnostic avec cartographie du col</p>
                    <p><strong>Indication :</strong> Résultat IVA positif / Test HPV positif / Suspicion clinique de dysplasie</p>
                    <p><strong>Recherche spécifique :</strong> Type de Zone de Transformation (ZT1, ZT2, ZT3), ponctulations, mosaïques et vaisseaux atypiques</p>
                  </>
                )}

                {activeDoc === 'reference' && (
                  <>
                    <p><strong>Structure d'orientation recommandée :</strong> <strong className="text-[#006669]">{patient.sui_reference_structure || 'Service de Gynécologie-Obstétrique (EPS Niveau 2/3)'}</strong></p>
                    <p><strong>Motif principal de référence :</strong> {patient.sui_reference_motif || patient.trt_non_eligible_autre || 'Lésion non éligible au traitement immédiat / Avis gynéco-oncologique requis.'}</p>
                    <p><strong>Conduite à tenir recommandée :</strong> Prise en charge chirurgicale / Conisation (LEEP) / Traitement spécialisé</p>
                  </>
                )}
              </div>
            </div>

            {/* Section 4: Signature & Stamp */}
            <div className="pt-6 border-t border-gray-300 grid grid-cols-2 gap-8 text-xs">
              <div>
                <p className="font-bold text-[#006669] uppercase">Agent de Santé Demandeur :</p>
                <p className="mt-1">Nom : <strong>{patient.created_by_name || 'Agent de Santé CerviCare+'}</strong></p>
                <p>Structure : <strong>{patient.geo_structure || 'Structure MSAS'}</strong></p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700 uppercase">Cachet de la Structure & Signature :</p>
                <div className="h-20 border-2 border-dashed border-gray-300 rounded-xl mt-2 flex items-center justify-center text-gray-400 italic">
                  Emplacement Cachet & Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDocumentsModal;
