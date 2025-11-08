import React from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../types/notification.ts';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RecentAlertsProps {
  alerts: Alert[];
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-error-100 text-error-800';
      case 'high':
        return 'bg-warning-100 text-warning-800';
      case 'medium':
        return 'bg-primary-100 text-primary-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return ExclamationTriangleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  if (alerts.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Aucune alerte récente
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = getPriorityIcon(alert.priority);
        
        return (
          <div
            key={alert.id}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={`w-5 h-5 ${getPriorityColor(alert.priority).split(' ')[1]}`} />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.title}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      alert.priority
                    )}`}
                  >
                    {alert.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {alert.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                  <Link
                    to={`/notifications`}
                    className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="pt-3 border-t border-gray-200">
        <Link
          to="/notifications"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Voir toutes les alertes →
        </Link>
      </div>
    </div>
  );
};

export default RecentAlerts;