import React from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../types/notification.ts';
import { ExclamationTriangleIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RecentAlertsProps {
  alerts: Alert[];
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-[#3e4949] text-center py-8 bg-[#f2fbff]/30 rounded-xl border border-dashed border-[#bec9c9]">
        Aucune alerte de zone
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.slice(0, 3).map((alert, index) => {
        // Alternance de style basée sur l'index pour simuler le design (Zone vs Rappel)
        const isZoneAlert = index % 2 === 0;
        
        return (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex gap-4 transition-all hover:shadow-md ${
              isZoneAlert 
                ? 'bg-[#ffdeaa] text-[#271900] border-[#795500]/20' 
                : 'bg-[#ffdbcf] text-[#380d00] border-[#9a4523]/20'
            }`}
          >
            <div className="flex-shrink-0">
              {isZoneAlert ? (
                <ExclamationTriangleIcon className="h-6 w-6 text-[#795500]" />
              ) : (
                <UserMinusIcon className="h-6 w-6 text-[#9a4523]" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{alert.title}</p>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">
                {alert.description}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase opacity-60">
                  {formatDistanceToNow(new Date(alert.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
                <Link
                  to={`/notifications`}
                  className="text-[10px] font-bold underline uppercase"
                >
                  Agir
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="pt-4 border-t border-[#bec9c9]/20">
        <Link
          to="/notifications"
          className="text-[#006669] hover:text-[#2a7f82] text-xs font-bold flex items-center justify-center gap-1 group"
        >
          Voir toutes les alertes régionales
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
};

export default RecentAlerts;