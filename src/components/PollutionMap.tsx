import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Rectangle, useMapEvents } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNearbyStations } from '@/lib/api';
import { PollutionData } from '@/types';
import { PollutionTimeline } from './PollutionTimeline';
import 'leaflet/dist/leaflet.css';

interface PollutionMapProps {
  center: [number, number];
  zoom: number;
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

function MapClickHandler({ onStationClick }: { onStationClick: (station: PollutionData) => void }) {
  useMapEvents({
    click: (e) => {
      // Handle map click if needed
    }
  });
  return null;
}

export default function PollutionMap({ center, zoom }: PollutionMapProps) {
  const { data: stations = [], isLoading } = useNearbyStations(center[0], center[1]);
  const [pollutionMasks, setPollutionMasks] = useState<Array<{
    bounds: [[number, number], [number, number]];
    opacity: number;
  }>>([]);
  const [selectedStation, setSelectedStation] = useState<PollutionData | null>(null);
  const [historicalData, setHistoricalData] = useState<PollutionData[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Set map as ready after a short delay to ensure container is properly rendered
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (stations.length > 0) {
      const masks = stations.map(station => ({
        bounds: [
          [station.coordinates.latitude - 0.5, station.coordinates.longitude - 0.5],
          [station.coordinates.latitude + 0.5, station.coordinates.longitude + 0.5]
        ] as [[number, number], [number, number]],
        opacity: getMaskOpacity(station.aqi)
      }));
      setPollutionMasks(masks);
    }
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
      <Card className="w-full overflow-hidden rounded-lg">
        <div className="h-[70vh] flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden rounded-lg">
      <div className="h-[70vh] w-full">
        {mapReady && (
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full z-0"
            style={{ height: '100%', width: '100%' }}
          >
            <MapClickHandler onStationClick={handleStationClick} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Station Markers */}
            {stations.map((station, index) => (
              <Circle
                key={`station-${index}`}
                center={[station.coordinates.latitude, station.coordinates.longitude]}
                radius={2000}
                pathOptions={{
                  color: getAQIColor(station.aqi),
                  fillColor: getAQIColor(station.aqi),
                  fillOpacity: 0.2,
                  weight: 0.5,
                }}
                eventHandlers={{
                  click: () => handleStationClick(station)
                }}
              >
                <Popup className="min-w-[200px]">
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">{station.location}</h3>
                    <p className="text-xs">AQI: {station.aqi}</p>
                    <p className="text-xs">Category: {getAQICategory(station.aqi)}</p>
                    <p className="text-xs text-gray-500">
                      Last Updated: {new Date(station.timestamp).toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        )}
      </div>

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
    </Card>
  );
} 