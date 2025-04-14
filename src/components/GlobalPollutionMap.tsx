'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getGlobalPollutionData } from '@/lib/api';
import { PollutionData } from '@/types';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import type { ComponentType } from 'react';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

interface HeatLayerProps {
  data: Array<[number, number, number]>;
}

// Create a dynamic HeatmapLayer component
const HeatmapLayer = dynamic<HeatLayerProps>(() =>
  Promise.resolve().then(async () => {
    const L = (await import('leaflet')).default;
    await import('leaflet.heat');
    const { useMap } = await import('react-leaflet');

    const HeatLayer: ComponentType<HeatLayerProps> = ({ data }) => {
      const map = useMap();
      const heatLayerRef = useRef<any>(null);

      useEffect(() => {
        if (!map || !data.length) return;

        // Clean up previous layer if it exists
        if (heatLayerRef.current) {
          map.removeLayer(heatLayerRef.current);
        }

        // Ensure the heatLayer function is available
        if (typeof L.heatLayer === 'function') {
          // Create new heat layer
          const heat = L.heatLayer(data, {
            radius: 30,
            blur: 20,
            maxZoom: 15,
            max: 1.0,
            minOpacity: 0.5,
            gradient: {
              0.0: 'rgba(0, 255, 0, 0.75)',
              0.15: 'rgba(150, 255, 0, 0.8)',
              0.3: 'rgba(255, 255, 0, 0.85)',
              0.45: 'rgba(255, 200, 0, 0.87)',
              0.6: 'rgba(255, 100, 0, 0.9)',
              0.75: 'rgba(255, 0, 0, 0.92)',
              0.9: 'rgba(200, 0, 100, 0.94)',
              1.0: 'rgba(100, 0, 100, 0.96)'
            }
          });

          heat.addTo(map);
          heatLayerRef.current = heat;
        } else {
          console.error('L.heatLayer is not available');
        }

        return () => {
          if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
          }
        };
      }, [map, data]);

      return null;
    };

    return HeatLayer;
  }),
  { ssr: false }
);

export function GlobalPollutionMap() {
  const [pollutionData, setPollutionData] = useState<PollutionData[]>([]);
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const data = await getGlobalPollutionData();
        setPollutionData(data);
        const points = data.map((item: PollutionData) => [
          item.coordinates.latitude,
          item.coordinates.longitude,
          Math.min((item.aqi / 200) * 2, 1) * (0.9 + Math.random() * 0.2)
        ]) as Array<[number, number, number]>;
        setHeatmapData(points);
      } catch (error) {
        console.error('Error fetching global pollution data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  const getMarkerColor = (aqi: number): string => {
    if (aqi <= 50) return '#00E400';
    if (aqi <= 100) return '#FFFF00';
    if (aqi <= 150) return '#FF7E00';
    if (aqi <= 200) return '#FF0000';
    if (aqi <= 300) return '#8F3F97';
    return '#7E0023';
  };

  if (loading) {
    return (
      <Card className="w-full h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-gray-500">Loading global pollution data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[70vh] relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <HeatmapLayer data={heatmapData} />
        {pollutionData.map((item, index) => (
          <CircleMarker
            key={`marker-${index}`}
            center={[item.coordinates.latitude, item.coordinates.longitude]}
            radius={1}
            eventHandlers={{
              mouseover: (e) => {
                e.target.setStyle({ weight: 1, opacity: 0.8, fillOpacity: 0.8 });
                e.target.bringToFront();
              },
              mouseout: (e) => {
                e.target.setStyle({ 
                  weight: 0.1,
                  opacity: 0.4,
                  fillOpacity: 0.5
                });
              }
            }}
            pathOptions={{
              fillColor: getMarkerColor(item.aqi),
              color: 'white',
              weight: 0.1,
              opacity: 0.4,
              fillOpacity: 0.5,
              interactive: true,
              bubblingMouseEvents: false
            }}
          >
            <Tooltip 
              direction="top"
              offset={[0, -5]}
              opacity={1}
              permanent={false}
              sticky={true}
            >
              <div className="p-2">
                <div className="font-bold">{item.location}</div>
                <div>AQI: {item.aqi}</div>
                <div className="text-sm">
                  PM2.5: {item.pollutants.pm25} µg/m³<br />
                  PM10: {item.pollutants.pm10} µg/m³<br />
                  O3: {item.pollutants.o3} µg/m³<br />
                  NO2: {item.pollutants.no2} µg/m³
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-800/95 p-4 rounded-md shadow-lg z-[1000] backdrop-blur-sm">
        <h3 className="text-sm font-semibold mb-3">Air Quality Index</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></span>
            <span className="text-xs">Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></span>
            <span className="text-xs">Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-orange-500 rounded-full shadow-sm"></span>
            <span className="text-xs">Unhealthy for Sensitive Groups (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></span>
            <span className="text-xs">Unhealthy (151-200)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-purple-600 rounded-full shadow-sm"></span>
            <span className="text-xs">Very Unhealthy (201+)</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 