import React from 'react'
import { Link } from 'react-router-dom'
import { RecentPatientsProps } from '../types/components.ts'
import { Patient } from '../types/dashboard.ts'

const RecentPatients: React.FC<RecentPatientsProps> = ({ patients, showActions = true }) => {
  if (!patients || patients.length === 0) {
    return (
      <p className="text-sm text-[#3e4949] text-center py-8 bg-[#f2fbff]/30 rounded-xl border border-dashed border-[#bec9c9]">
        Aucun rendez-vous pour le moment
      </p>
    )
  }

  // Fonction pour formater l'heure de création ou mettre une heure par défaut
  const getFormattedTime = (dateStr?: string) => {
    if (!dateStr) return "09:00";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', { hour: '2d-digit', minute: '2d-digit' });
    } catch {
      return "09:00";
    }
  };

  return (
    <div className="space-y-2">
      {/* Table Header */}
      <div className="grid grid-cols-4 px-4 py-2 text-[#3e4949] font-bold text-xs uppercase tracking-wider border-b border-[#bec9c9]/30 mb-2">
        <span>Heure</span>
        <span>Patiente</span>
        <span>Type</span>
        <span>Status</span>
      </div>

      <div className="space-y-1">
        {patients.slice(0, 5).map((patient: Patient) => (
          <div 
            key={patient.id} 
            className="grid grid-cols-4 px-4 py-4 items-center border-b border-[#bec9c9]/10 hover:bg-[#f2fbff] transition-all rounded-xl group"
          >
            <span className="font-mono text-sm text-[#091e25] font-medium">
              {getFormattedTime(patient.created_at)}
            </span>
            <span className="font-semibold text-[#091e25]">
              {`${patient.prenom} ${patient.nom}`}
            </span>
            <span className="text-[#3e4949] text-sm">
              Screening HPV
            </span>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                patient.status === 'normal' 
                  ? 'bg-[#006669]/10 text-[#006669]' 
                  : patient.status === 'abnormal' 
                    ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]' 
                    : 'bg-[#9a4523]/10 text-[#9a4523]'
              }`}>
                {patient.status === 'normal' ? 'Effectué' : patient.status === 'abnormal' ? 'Urgente' : 'Suivi'}
              </span>
              <Link 
                to={`/patients/${patient.id}`} 
                className="opacity-0 group-hover:opacity-100 text-[#006669] hover:underline text-xs font-bold transition-all"
              >
                Détails
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showActions && (
        <div className="mt-6 pt-4 border-t border-[#bec9c9]/20 text-center">
          <Link to="/patients" className="text-[#006669] hover:text-[#2a7f82] text-sm font-bold flex items-center justify-center gap-1 group">
            Gérer toutes les patientes 
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default RecentPatients