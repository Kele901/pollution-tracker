import { useEffect, useRef, useCallback, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNearbyStations } from '@/lib/api';
import { PollutionData } from '@/types';
import { PollutionTimeline } from './PollutionTimeline';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

// Extend the L namespace to include heatLayer
declare module 'leaflet' {
  export function heatLayer(
    latlngs: L.LatLngExpression[],
    options?: any
  ): L.Layer;
}

interface PollutionMapProps {
  center: [number, number];
  zoom: number;
}

// HeatmapLayer component to handle heat layer initialization
function HeatmapLayer({ data }: { data: [number, number, number][] }) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);
  
  useEffect(() => {
    if (!map || !data.length) return;

    // Dynamically import leaflet.heat
    const initHeatmap = async () => {
      try {
        await import('leaflet.heat');
        
        // Clean up previous layer if it exists
        if (heatLayerRef.current) {
          map.removeLayer(heatLayerRef.current);
        }

        // Create new heat layer
        const heat = (window as any).L.heatLayer(data, {
          radius: 30,
          blur: 20,
          maxZoom: 12,
          max: 200,
          gradient: {
            0.0: '#00ff00',
            0.3: '#ffff00',
            0.5: '#ff8c00',
            0.7: '#ff0000',
            0.9: '#800080',
            1.0: '#4b0082'
          }
        });

        heat.addTo(map);
        heatLayerRef.current = heat;
      } catch (error) {
        console.error('Error initializing heatmap:', error);
      }
    };

    initHeatmap();

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, data]);

  return null;
}

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#00e400';
  if (aqi <= 100) return '#ffff00';
  if (aqi <= 150) return '#ff7e00';
  if (aqi <= 200) return '#ff0000';
  if (aqi <= 300) return '#99004c';
  return '#7e0023';
};

const getMaskOpacity = (aqi: number): number => {
  if (aqi <= 100) return 0;
  if (aqi <= 150) return 0.2;
  if (aqi <= 200) return 0.35;
  if (aqi <= 300) return 0.5;
  return 0.65;
};

const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export default function PollutionMap({ center, zoom }: PollutionMapProps) {
  const { data: stations = [], isLoading } = useNearbyStations(center[0], center[1]);
  const [selectedStation, setSelectedStation] = useState<PollutionData | null>(null);
  const [historicalData, setHistoricalData] = useState<PollutionData[]>([]);

  const getHeatmapData = useCallback((): [number, number, number][] => {
    return stations.map(station => [
      station.coordinates.latitude,
      station.coordinates.longitude,
      station.aqi * 1.75 // Intensity multiplier
    ]);
  }, [stations]);

  const handleStationClick = (station: PollutionData) => {
    setSelectedStation(station);
    // Generate more realistic historical data
    const baseAQI = station.aqi;
    const basePollutants = station.pollutants;
    
    const mockHistoricalData = Array.from({ length: 24 }, (_, i) => {
      const hourAgo = new Date(Date.now() - (23 - i) * 3600000);
      const hourOfDay = hourAgo.getHours();
      
      // Simulate daily patterns (higher during rush hours, lower at night)
      const dailyPattern = Math.sin((hourOfDay - 8) * Math.PI / 12) * 0.3 + 1;
      
      return {
        ...station,
        timestamp: hourAgo.toISOString(),
        aqi: Math.max(0, Math.min(500, baseAQI * dailyPattern + (Math.random() * 20 - 10))),
        pollutants: {
          pm25: Math.max(0, basePollutants.pm25 * dailyPattern + (Math.random() * 5 - 2.5)),
          pm10: Math.max(0, basePollutants.pm10 * dailyPattern + (Math.random() * 5 - 2.5)),
          o3: Math.max(0, basePollutants.o3 * dailyPattern + (Math.random() * 2 - 1)),
          no2: Math.max(0, basePollutants.no2 * dailyPattern + (Math.random() * 2 - 1)),
          so2: Math.max(0, (basePollutants.so2 || 0) * dailyPattern + (Math.random() * 2 - 1)),
          co: Math.max(0, (basePollutants.co || 0) * dailyPattern + (Math.random() * 2 - 1))
        }
      };
    });
    
    setHistoricalData(mockHistoricalData);
    console.log('Generated historical data:', mockHistoricalData);
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-gray-500">Loading map...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full h-[50vh] relative">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <HeatmapLayer data={getHeatmapData()} />
        </MapContainer>
        <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-800/95 p-4 rounded-md shadow-lg z-[1000] backdrop-blur-sm">
          <h3 className="text-sm font-semibold mb-3">Air Quality Index</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Good (0-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Moderate (51-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Unhealthy for Sensitive Groups (101-150)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Unhealthy (151-200)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-700" />
              <span>Very Unhealthy (201-300)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-900" />
              <span>Hazardous (301+)</span>
            </div>
          </div>
        </div>
      </Card>
      {historicalData.length > 0 && selectedStation && (
        <PollutionTimeline 
          data={historicalData} 
          location={selectedStation.location} 
        />
      )}

      {/* Detailed Pollution Dialog */}
      {selectedStation && (
        <Dialog open={true} onOpenChange={() => setSelectedStation(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedStation.location}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: getAQIColor(selectedStation.aqi) }}>
                    AQI: {selectedStation.aqi}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getAQICategory(selectedStation.aqi)}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Last Updated: {new Date(selectedStation.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">PM2.5</h4>
                  <p className="text-lg">{selectedStation.pollutants.pm25} µg/m³</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">PM10</h4>
                  <p className="text-lg">{selectedStation.pollutants.pm10} µg/m³</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">O₃</h4>
                  <p className="text-lg">{selectedStation.pollutants.o3} ppb</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">NO₂</h4>
                  <p className="text-lg">{selectedStation.pollutants.no2} ppb</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Health Recommendations</h4>
                <p className="text-sm text-gray-600">
                  {selectedStation.aqi <= 50 && "Air quality is good. Enjoy outdoor activities."}
                  {selectedStation.aqi > 50 && selectedStation.aqi <= 100 && "Air quality is moderate. Sensitive individuals should consider limiting prolonged outdoor exertion."}
                  {selectedStation.aqi > 100 && selectedStation.aqi <= 150 && "Air quality is unhealthy for sensitive groups. Children, elderly, and people with respiratory conditions should limit outdoor activities."}
                  {selectedStation.aqi > 150 && selectedStation.aqi <= 200 && "Air quality is unhealthy. Everyone should limit outdoor activities."}
                  {selectedStation.aqi > 200 && selectedStation.aqi <= 300 && "Air quality is very unhealthy. Everyone should avoid outdoor activities."}
                  {selectedStation.aqi > 300 && "Air quality is hazardous. Everyone should stay indoors and keep windows closed."}
                </p>
              </div>

              {/* Timeline Graph */}
              <div className="mt-6">
                <PollutionTimeline data={historicalData} location={selectedStation.location} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 