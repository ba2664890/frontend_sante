import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { prostateService } from '../services/prostateService.ts';
import type { ProstatePatient } from '../types';

const opt = (value: number | string, label: string) => ({ value, label });

const GEO_REGIONS = [
  opt(1, 'Dakar'), opt(2, 'Diourbel'), opt(3, 'Fatick'), opt(4, 'Kaffrine'),
  opt(5, 'Kaolack'), opt(6, 'Kédougou'), opt(7, 'Kolda'), opt(8, 'Louga'),
  opt(9, 'Matam'), opt(10, 'Saint-Louis'), opt(11, 'Sédhiou'),
  opt(12, 'Tambacounda'), opt(13, 'Thiès'), opt(14, 'Ziguinchor'),
];
const GEO_TYPE_STRUCTURE = [
  opt(1, 'Poste de santé'), opt(2, 'Centre de santé'), opt(3, 'Hôpital de district'),
  opt(4, 'EPS niveau 2'), opt(5, 'EPS niveau 3'), opt(6, 'Caravane mobile'),
];
const META_QUALIF = [
  opt(1, 'Médecin généraliste'), opt(2, 'Urologue'), opt(3, 'Infirmier(ère)'),
  opt(4, 'Sage-femme'), opt(5, 'Autre'),
];
const SOC_PROF = [
  opt(1, 'Salarié'), opt(2, 'Commerçant'), opt(3, 'Cultivateur/Éleveur'),
  opt(4, 'Pêcheur'), opt(5, 'Retraité'), opt(6, 'Sans emploi'), opt(7, 'Autre (préciser)'),
];
const SOC_INSTRUCTION = [
  opt(0, 'Aucun'), opt(1, 'Primaire'), opt(2, 'Secondaire'),
  opt(3, 'Supérieur'), opt(4, 'École coranique/Daara'), opt(5, 'Alphabétisation'),
];
const SOC_STATUT_MATRIM = [
  opt(1, 'Célibataire'), opt(2, 'Marié monogame'), opt(3, 'Marié polygame'),
  opt(4, 'Veuf'), opt(5, 'Divorcé/Séparé'),
];
const SOC_MODE_ENTREE = [
  opt(1, 'Venue spontanée'), opt(2, 'Mobilisation communautaire'),
  opt(3, 'Orientation par agent de santé'), opt(4, 'Référence inter-structure'),
  opt(5, 'Caravane'),
];

const OUI_NON = [opt(1, 'Oui'), opt(0, 'Non'), opt(9, 'Ne sait pas')];

const TR_RESULT = [
  opt(1, 'Normal — lisse, élastique, symétrique'),
  opt(2, 'Augmenté de volume — régulier (HBP probable)'),
  opt(3, 'Nodule suspect — dur, irrégulier'),
  opt(4, 'Envahissement vésicule séminale suspect'),
  opt(5, 'Envahissement extra-prostatique suspect'),
  opt(9, 'Non réalisé / Non concluant'),
];

const PSA_INTERPRETATION = [
  opt(1, 'Normal (< 4 ng/mL)'),
  opt(2, 'Zone grise (4-10 ng/mL)'),
  opt(3, 'Élevé (10-20 ng/mL)'),
  opt(4, 'Très élevé (> 20 ng/mL)'),
];

const RES_GLOBAL = [
  opt(1, 'Normal — pas de signe de malignité'),
  opt(2, 'Suspect — surveillance renforcée (PSA 6 mois)'),
  opt(3, 'Référence urologue — biopsie indiquée'),
  opt(4, 'Cancer confirmé — prise en charge oncologique'),
  opt(5, 'HBP — traitement médical initié'),
];

interface ProstateFormWizardProps {
  patient?: ProstatePatient | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Identité & Géo', icon: 'person' },
  { id: 2, title: 'Antécédents', icon: 'medical_information' },
  { id: 3, title: 'Symptômes IPSS', icon: 'quiz' },
  { id: 4, title: 'Examen Clinique & PSA', icon: 'biotech' },
  { id: 5, title: 'Résultats & Consentement', icon: 'assignment_turned_in' },
];

export const ProstateFormWizard: React.FC<ProstateFormWizardProps> = ({ patient, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Partial<ProstatePatient>>({
    defaultValues: patient || {
      id_patient: Math.floor(1000000 + Math.random() * 9000000),
      age: 50,
      status: 'new',
      con_depistage: true,
    }
  });

  const handleFormSubmit = async (data: Partial<ProstatePatient>) => {
    setLoading(true);
    try {
      if (patient?.record_id) {
        await prostateService.updatePatient(patient.record_id, data);
        toast.success('Dossier prostate mis à jour avec succès !');
      } else {
        await prostateService.createPatient(data);
        toast.success('Fiche dépistage prostate créée avec succès !');
      }
      onSubmit();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Wizard Steps Header */}
      <div className="bg-[#f2fbff] border-b border-[#bec9c9]/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {STEPS.map((step) => (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                currentStep === step.id
                  ? 'text-[#006669] font-bold'
                  : currentStep > step.id
                  ? 'text-[#3e4949]'
                  : 'text-[#6f7979]/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step.id
                    ? 'bg-[#006669] text-white shadow-md'
                    : currentStep > step.id
                    ? 'bg-[#006669]/10 text-[#006669]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
              </div>
              <span className="hidden md:inline text-xs">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Step 1: Identité & Géo */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#091e25] border-b pb-2">Identité & Géographie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">ID Patient *</label>
                <input
                  type="number"
                  {...register('id_patient', { required: true })}
                  className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Prénom *</label>
                <input
                  type="text"
                  {...register('prenom', { required: true })}
                  className="w-full p-3 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Nom *</label>
                <input
                  type="text"
                  {...register('nom', { required: true })}
                  className="w-full p-3 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Âge (ans) *</label>
                <input
                  type="number"
                  {...register('age', { required: true, min: 40, max: 99 })}
                  className="w-full p-3 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Téléphone</label>
                <input
                  type="text"
                  {...register('num_phone')}
                  className="w-full p-3 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Région Sanitaire</label>
                <select {...register('geo_region')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {GEO_REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Profession</label>
                <select {...register('soc_profession')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {SOC_PROF.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Statut Matrimonial</label>
                <select {...register('soc_statut_matrimonial')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {SOC_STATUT_MATRIM.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Niveau d'instruction</label>
                <select {...register('soc_niveau_instruction')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {SOC_INSTRUCTION.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Antécédents */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#091e25] border-b pb-2">Antécédents & Facteurs de Risque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Antécédent familial de cancer prostate ?</label>
                <select {...register('ris_atcd_fam_prostate')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Lien de parenté (si oui)</label>
                <input type="text" placeholder="Ex: Père, Frère..." {...register('ris_atcd_fam_prostate_lien')} className="w-full p-3 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">PSA déjà dosé auparavant ?</label>
                <select {...register('ris_psa_anterieur')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Dernière valeur PSA connue (ng/mL)</label>
                <input type="number" step="0.01" {...register('ris_psa_anterieur_valeur')} className="w-full p-3 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Statut VIH</label>
                <select {...register('ris_vih_statut')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  <option value="1">Négatif</option>
                  <option value="2">Positif sous TARV</option>
                  <option value="3">Positif sans TARV</option>
                  <option value="9">Inconnu</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Diabète / HTA</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#3e4949]">
                    <input type="checkbox" {...register('ris_diabete')} className="rounded text-[#006669]" /> Diabétique
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#3e4949]">
                    <input type="checkbox" {...register('ris_hta')} className="rounded text-[#006669]" /> Hypertendu
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Symptômes IPSS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#091e25] border-b pb-2">Symptômes Urinaires (LUTS / IPSS)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Pollakiurie (fréquence diurne élevée)</label>
                <select {...register('sym_pollakiurie')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Nycturie (levers nocturnes)</label>
                <select {...register('sym_nycturie')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Jet urinaire faible / intermittent</label>
                <select {...register('sym_jet_faible')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Urgence mictionnelle</label>
                <select {...register('sym_urgence_mictionnelle')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Hématurie (sang dans les urines)</label>
                <select {...register('sym_hematurie')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Douleurs osseuses (bassin, lombes)</label>
                <select {...register('sym_douleur_osseuse')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Examen Clinique & PSA */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#091e25] border-b pb-2">Examen Clinique & Résultats Biologiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Toucher Rectal (TR) Réalisé ?</label>
                <input type="checkbox" {...register('dep_tr_realise')} className="w-5 h-5 accent-[#006669]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Résultat du Toucher Rectal</label>
                <select {...register('dep_tr_resultat')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {TR_RESULT.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Valeur PSA total (ng/mL)</label>
                <input type="number" step="0.01" {...register('dep_psa_valeur')} className="w-full p-3 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Interprétation du PSA</label>
                <select {...register('dep_psa_interpretation')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {PSA_INTERPRETATION.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Résultats & Consentement */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#091e25] border-b pb-2">Résultat Global & Consentement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#3e4949] uppercase mb-1">Résultat Global du Dépistage *</label>
                <select {...register('res_resultat_global', { required: true })} className="w-full p-3 border rounded-xl text-sm bg-white font-bold text-[#006669]">
                  <option value="">Sélectionner...</option>
                  {RES_GLOBAL.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="col-span-2 p-4 bg-gray-50 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#006669] uppercase">Consentements éclairés</h4>
                <label className="flex items-center gap-2 text-xs font-bold text-[#3e4949]">
                  <input type="checkbox" {...register('con_depistage')} className="rounded text-[#006669]" /> Consentement au dépistage prostatique
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-[#3e4949]">
                  <input type="checkbox" {...register('con_donnees_anonymisees')} className="rounded text-[#006669]" /> Consentement pour l'utilisation des données anonymisées
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => currentStep > 1 ? setCurrentStep(v => v - 1) : onCancel()}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#3e4949] hover:bg-gray-50"
          >
            {currentStep === 1 ? 'Annuler' : 'Précédent'}
          </button>
          
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(v => v + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#006669] text-white text-xs font-bold hover:bg-[#005255]"
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#006669] text-white text-xs font-bold hover:bg-[#005255] disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la fiche'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
export default ProstateFormWizard;
