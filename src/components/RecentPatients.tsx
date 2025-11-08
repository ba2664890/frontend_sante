import React from 'react'
import { Link } from 'react-router-dom'
import { UserIcon } from '@heroicons/react/24/outline'

import { RecentPatientsProps } from '../types/components.ts'
import { Patient } from '../types/dashboard.ts'

const RecentPatients: React.FC<RecentPatientsProps> = ({ patients, showActions = true }) => {
  if (!patients || patients.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">Aucune patiente récente</p>
    )
  }

  return (
    <div className="space-y-3">
      {patients.map((patient: Patient) => (
        <div key={patient.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary-600" />
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{`${patient.prenom} ${patient.nom}`}</p>
            <p className="text-sm text-gray-500">{patient.status} • {patient.age} ans</p>
          </div>
          <div className="ml-3 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'normal' ? 'bg-success-100 text-success-800' : patient.status === 'abnormal' ? 'bg-warning-100 text-warning-800' : 'bg-gray-100 text-gray-800'}`}>
              {patient.status}
            </span>
            <Link to={`/patients/${patient.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Voir</Link>
          </div>
        </div>
      ))}

      {showActions && (
        <div className="pt-3 border-t border-gray-200">
          <Link to="/patients" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Voir toutes les patientes →</Link>
        </div>
      )}
    </div>
  )
}

export default RecentPatients