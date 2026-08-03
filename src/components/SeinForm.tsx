import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { seinService } from '../services/seinService.ts';
import type { SeinPatient } from '../types';

const opt = (value: number | string, label: string) => ({ value, label });

const GEO_REGIONS = [
  opt(1, 'Dakar'), opt(2, 'Diourbel'), opt(3, 'Fatick'), opt(4, 'Kaffrine'),
  opt(5, 'Kaolack'), opt(6, 'Kédougou'), opt(7, 'Kolda'), opt(8, 'Louga'),
  opt(9, 'Matam'), opt(10, 'Saint-Louis'), opt(11, 'Sédhiou'),
  opt(12, 'Tambacounda'), opt(13, 'Thiès'), opt(14, 'Ziguinchor'),
];
const SOC_PROF = [
  opt(1, 'Ménagère'), opt(2, 'Salariée'), opt(3, 'Étudiante/Élève'),
  opt(4, 'Commerçante'), opt(5, 'Couturière/Coiffeuse'), opt(6, 'Paysanne'),
  opt(7, 'Sans emploi'), opt(8, 'Autre'),
];

const OUI_NON = [opt(1, 'Oui'), opt(0, 'Non'), opt(9, 'Ne sait pas')];

const BIRADS_CHOICES = [
  opt(0, 'BIRADS 0 — Incomplet'),
  opt(1, 'BIRADS 1 — Normal'),
  opt(2, 'BIRADS 2 — Bénin'),
  opt(3, 'BIRADS 3 — Probablement bénin'),
  opt(4, 'BIRADS 4 — Suspect'),
  opt(5, 'BIRADS 5 — Très suspect'),
  opt(6, 'BIRADS 6 — Cancer prouvé'),
];

const RES_GLOBAL = [
  opt(1, 'Normal — pas de signe de malignité'),
  opt(2, 'Surveillance rapprochée — probablement bénin (BIRADS 3)'),
  opt(3, 'Référence pour examens complémentaires (BIRADS 4)'),
  opt(4, 'Référence urgente — forte suspicion (BIRADS 5)'),
  opt(5, 'Cancer confirmé — prise en charge oncologique'),
  opt(6, 'Lésion bénigne traitée'),
];

interface SeinFormWizardProps {
  patient?: SeinPatient | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Identité & Géo', icon: 'person' },
  { id: 2, title: 'Antécédents & Hormonal', icon: 'medical_information' },
  { id: 3, title: 'Examen Clinique Seins', icon: 'stethoscope' },
  { id: 4, title: 'Examens (Mammo/Écho)', icon: 'biotech' },
  { id: 5, title: 'Résultats & Consentement', icon: 'assignment_turned_in' },
];

export const SeinFormWizard: React.FC<SeinFormWizardProps> = ({ patient, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm<Partial<SeinPatient>>({
    defaultValues: patient || {
      id_patient: Math.floor(1000000 + Math.random() * 9000000),
      age: 40,
      status: 'new',
      con_depistage: true,
    }
  });

  const handleFormSubmit = async (data: Partial<SeinPatient>) => {
    setLoading(true);
    try {
      if (patient?.record_id) {
        await seinService.updatePatient(patient.record_id, data);
        toast.success('Dossier cancer du sein mis à jour !');
      } else {
        await seinService.createPatient(data);
        toast.success('Fiche dépistage cancer du sein créée !');
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
      <div className="bg-[#fff5f7] border-b border-[#fbcfe8]/40 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {STEPS.map((step) => (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                currentStep === step.id
                  ? 'text-[#be185d] font-bold'
                  : currentStep > step.id
                  ? 'text-[#831843]'
                  : 'text-[#9d174d]/40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step.id
                    ? 'bg-[#be185d] text-white shadow-md'
                    : currentStep > step.id
                    ? 'bg-[#be185d]/10 text-[#be185d]'
                    : 'bg-pink-50 text-gray-400'
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
            <h3 className="text-lg font-bold text-[#831843] border-b pb-2">Identité & Géographie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">ID Patiente *</label>
                <input type="number" {...register('id_patient', { required: true })} className="w-full p-3 border rounded-xl bg-gray-50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Prénom *</label>
                <input type="text" {...register('prenom', { required: true })} className="w-full p-3 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Nom *</label>
                <input type="text" {...register('nom', { required: true })} className="w-full p-3 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Âge *</label>
                <input type="number" {...register('age', { required: true, min: 18, max: 99 })} className="w-full p-3 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Téléphone</label>
                <input type="text" {...register('num_phone')} className="w-full p-3 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Région Sanitaire</label>
                <select {...register('geo_region')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {GEO_REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Profession</label>
                <select {...register('soc_profession')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {SOC_PROF.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Antécédents */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#831843] border-b pb-2">Antécédents & Facteurs Hormonaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Antécédent familial de cancer du sein (1er degré)</label>
                <select {...register('ris_atcd_fam_sein')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Statut Ménopausique</label>
                <select {...register('ris_menopause')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  <option value="1">Non ménopausée</option>
                  <option value="2">Ménopausée naturellement</option>
                  <option value="3">Ménopause chirurgicale</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Allaitement au moins un enfant ?</label>
                <select {...register('ris_allaitement')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Mutation BRCA connue ?</label>
                <select {...register('ris_mutation_brca')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {OUI_NON.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Examen Clinique */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#831843] border-b pb-2">Examen Clinique des Seins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Masse palpable à la consultation ?</label>
                <input type="checkbox" {...register('exam_masse_palpee')} className="w-5 h-5 accent-[#be185d]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Sein concerné</label>
                <select {...register('exam_masse_sein')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  <option value="D">Sein Droit</option>
                  <option value="G">Sein Gauche</option>
                  <option value="B">Bilatéral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Quadrant</label>
                <select {...register('exam_masse_quadrant')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  <option value="QSE">Supéro-Externe (QSE)</option>
                  <option value="QSI">Supéro-Interne (QSI)</option>
                  <option value="QIE">Inféro-Externe (QIE)</option>
                  <option value="QII">Inféro-Interne (QII)</option>
                  <option value="RC">Région centrale / mamelonnaire</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Taille estimée (cm)</label>
                <input type="number" step="0.1" {...register('exam_masse_taille_cm')} className="w-full p-3 border rounded-xl text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Examens Complémentaires */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#831843] border-b pb-2">Examens Complémentaires (Mammographie / Échographie)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Mammographie réalisée ?</label>
                <input type="checkbox" {...register('dep_mammo_realisee')} className="w-5 h-5 accent-[#be185d]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">BIRADS Mammographie Sein Droit</label>
                <select {...register('dep_mammo_birads_droit')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {BIRADS_CHOICES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">BIRADS Mammographie Sein Gauche</label>
                <select {...register('dep_mammo_birads_gauche')} className="w-full p-3 border rounded-xl text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {BIRADS_CHOICES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Biopsie effectuée ?</label>
                <input type="checkbox" {...register('dep_biopsie_realisee')} className="w-5 h-5 accent-[#be185d]" />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Résultats & Consentement */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#831843] border-b pb-2">Résultat Global & Consentement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#831843] uppercase mb-1">Résultat Global du Dépistage *</label>
                <select {...register('res_resultat_global', { required: true })} className="w-full p-3 border rounded-xl text-sm bg-white font-bold text-[#be185d]">
                  <option value="">Sélectionner...</option>
                  {RES_GLOBAL.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="col-span-2 p-4 bg-pink-50/50 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#be185d] uppercase">Consentements éclairés</h4>
                <label className="flex items-center gap-2 text-xs font-bold text-[#831843]">
                  <input type="checkbox" {...register('con_depistage')} className="rounded text-[#be185d]" /> Consentement au dépistage des seins
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-[#831843]">
                  <input type="checkbox" {...register('con_donnees_anonymisees')} className="rounded text-[#be185d]" /> Consentement pour l'utilisation des données anonymisées
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
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#831843] hover:bg-pink-50"
          >
            {currentStep === 1 ? 'Annuler' : 'Précédent'}
          </button>
          
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(v => v + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#be185d] text-white text-xs font-bold hover:bg-[#9d174d]"
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#be185d] text-white text-xs font-bold hover:bg-[#9d174d] disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la fiche'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
export default SeinFormWizard;
