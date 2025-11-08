import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { patientService } from '../services/patientService.ts';
import { toast } from 'react-hot-toast';

interface FollowUpFormProps {
  patientId: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({ 
  patientId, 
  onSubmit, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      follow_up_type: 'follow_up_90',
      scheduled_date: '',
      notes: '',
    },
  });

  const onFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await patientService.scheduleFollowUp(patientId, data);
      onSubmit(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la programmation du suivi');
    } finally {
      setIsLoading(false);
    }
  };

  const followUpTypes = [
    { value: 'screening', label: 'Dépistage' },
    { value: 'follow_up_90', label: 'Suivi à 90 jours' },
    { value: 'follow_up_180', label: 'Suivi à 180 jours' },
    { value: 'annual', label: 'Suivi annuel' },
    { value: 'symptomatic', label: 'Consultation symptomatique' },
  ];

  const getDefaultDate = (type: string) => {
    const today = new Date();
    switch (type) {
      case 'follow_up_90':
        return new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'follow_up_180':
        return new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'annual':
        return new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label className="form-label">Type de suivi *</label>
        <select
          {...register('follow_up_type', { required: 'Type de suivi requis' })}
          className={`input-field ${errors.follow_up_type ? 'input-error' : ''}`}
          onChange={(e) => {
            const defaultDate = getDefaultDate(e.target.value);
            const dateInput = document.getElementById('scheduled_date') as HTMLInputElement;
            if (dateInput) {
              dateInput.value = defaultDate;
            }
          }}
        >
          {followUpTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.follow_up_type && (
          <p className="form-error">{errors.follow_up_type.message}</p>
        )}
      </div>

      <div>
        <label className="form-label">Date prévue *</label>
        <input
          type="date"
          id="scheduled_date"
          {...register('scheduled_date', { required: 'Date prévue requise' })}
          className={`input-field ${errors.scheduled_date ? 'input-error' : ''}`}
          defaultValue={getDefaultDate('follow_up_90')}
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.scheduled_date && (
          <p className="form-error">{errors.scheduled_date.message}</p>
        )}
      </div>

      <div>
        <label className="form-label">Notes (optionnel)</label>
        <textarea
          {...register('notes')}
          rows={4}
          className="input-field"
          placeholder="Ajoutez des notes ou des instructions pour ce suivi..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Programmation...' : 'Programmer le suivi'}
        </button>
      </div>
    </form>
  );
};

export default FollowUpForm;