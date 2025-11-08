import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SenegalMapProps {
  // Accept either a map of regionId -> count, or an array of geographic points
  data: Record<string, number> | { region: string; count: number; coordinates: [number, number] }[];
  height?: number;
  className?: string;
}

const SenegalMap: React.FC<SenegalMapProps> = ({
  data,
  height = 400,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // Coordonnées des régions du Sénégal
  const regions = {
    1: { name: 'Thiès', coords: [14.85, -16.9] },
    2: { name: 'Diourbel', coords: [14.65, -16.23] },
    3: { name: 'Fatick', coords: [14.35, -16.58] },
    4: { name: 'Kaolack', coords: [14.18, -16.08] },
    5: { name: 'Louga', coords: [15.62, -16.22] },
    6: { name: 'Saint-Louis', coords: [16.03, -16.5] },
    7: { name: 'Matam', coords: [15.66, -13.26] },
    8: { name: 'Tambacounda', coords: [13.77, -13.67] },
    9: { name: 'Kolda', coords: [12.9, -14.95] },
    10: { name: 'Ziguinchor', coords: [12.56, -16.27] },
    11: { name: 'Kédougou', coords: [12.56, -12.18] },
    12: { name: 'Sédhiou', coords: [12.71, -15.56] },
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialiser la carte
    mapInstance.current = L.map(mapRef.current).setView([14.5, -14.5], 6);

    // Ajouter les tuiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    // Normalize incoming data to a map keyed by regionId (strings)
    const countsById: Record<string, number> = {}
    // initialize with zeros
    Object.keys(regions).forEach((id) => (countsById[id] = 0))

    if (Array.isArray(data)) {
      // data is array of { region, count, coordinates }
      data.forEach((item) => {
        // try to match by region name (case-insensitive)
        const match = Object.entries(regions).find(([, r]) => r.name.toLowerCase() === item.region.toLowerCase())
        if (match) {
          const id = match[0]
          countsById[id] = (countsById[id] || 0) + (item.count || 0)
        }
      })
    } else {
      // data is a record: keys may be regionId or region name
      Object.entries(data).forEach(([key, val]) => {
        if (key in regions) {
          countsById[key] = Number(val) || 0
        } else {
          // try to match key as region name
          const match = Object.entries(regions).find(([, r]) => r.name.toLowerCase() === key.toLowerCase())
          if (match) {
            countsById[match[0]] = Number(val) || 0
          }
        }
      })
    }

    // Ajouter les marqueurs pour chaque région
    Object.entries(regions).forEach(([regionId, region]) => {
      const count = countsById[regionId] || 0;
      const maxCount = Math.max(...Object.values(countsById), 1);
      const intensity = count / maxCount;

      // Déterminer la couleur selon l'intensité
      const getColor = (intensity: number) => {
        if (intensity === 0) return '#e5e7eb';
        if (intensity < 0.2) return '#fef3c7';
        if (intensity < 0.4) return '#fde68a';
        if (intensity < 0.6) return '#fbbf24';
        if (intensity < 0.8) return '#f59e0b';
        return '#d97706';
      };

      // Créer le marqueur circulaire
  const marker = L.circleMarker(region.coords as L.LatLngExpression, {
        radius: 8 + (intensity * 12),
        fillColor: getColor(intensity),
        color: '#6b7280',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstance.current!);

      // Ajouter le popup
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-gray-900">${region.name}</h3>
          <p class="text-sm text-gray-600">${count} patiente${count !== 1 ? 's' : ''}</p>
        </div>
      `);
    });

    // Nettoyage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [data , regions]);

  return (
    <div className={className}>
      <div
        ref={mapRef}
        style={{ height: `${height}px` }}
        className="w-full rounded-lg overflow-hidden"
      />
      
      {/* Légende */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <span className="text-gray-600">Légende:</span>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full border border-gray-400"></div>
          <span>0</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 rounded-full border border-gray-400"></div>
          <span>Faible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full border border-gray-400"></div>
          <span>Moyen</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-600 rounded-full border border-gray-400"></div>
          <span>Élevé</span>
        </div>
      </div>
    </div>
  );
};

export default SenegalMap;