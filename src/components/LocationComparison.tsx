'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { usePollutionData } from '@/lib/api';

interface Location {
  name: string;
  coordinates: [number, number];
  type: 'city' | 'region' | 'country';
}

const popularLocations: Location[] = [
  { name: 'London, UK', coordinates: [51.5074, -0.1278], type: 'city' },
  { name: 'New York, USA', coordinates: [40.7128, -74.0060], type: 'city' },
  { name: 'Tokyo, Japan', coordinates: [35.6762, 139.6503], type: 'city' },
  { name: 'Delhi, India', coordinates: [28.6139, 77.2090], type: 'city' },
  { name: 'Beijing, China', coordinates: [39.9042, 116.4074], type: 'city' },
  { name: 'Paris, France', coordinates: [48.8566, 2.3522], type: 'city' },
  { name: 'Los Angeles, USA', coordinates: [34.0522, -118.2437], type: 'city' },
  { name: 'Mumbai, India', coordinates: [19.0760, 72.8777], type: 'city' },
  { name: 'Shanghai, China', coordinates: [31.2304, 121.4737], type: 'city' },
  { name: 'Berlin, Germany', coordinates: [52.5200, 13.4050], type: 'city' },
  { name: 'Rome, Italy', coordinates: [41.9028, 12.4964], type: 'city' },
  { name: 'Sydney, Australia', coordinates: [-33.8688, 151.2093], type: 'city' },
  { name: 'São Paulo, Brazil', coordinates: [-23.5505, -46.6333], type: 'city' },
  { name: 'Cairo, Egypt', coordinates: [30.0444, 31.2357], type: 'city' },
  { name: 'Mexico City, Mexico', coordinates: [19.4326, -99.1332], type: 'city' },
  { name: 'California, USA', coordinates: [36.7783, -119.4179], type: 'region' },
  { name: 'Maharashtra, India', coordinates: [19.7515, 75.7139], type: 'region' },
  { name: 'Lombardy, Italy', coordinates: [45.4668, 9.1905], type: 'region' },
  { name: 'Bavaria, Germany', coordinates: [48.7904, 11.4979], type: 'region' },
  { name: 'Catalonia, Spain', coordinates: [41.5912, 1.5209], type: 'region' },
  { name: 'New South Wales, Australia', coordinates: [-31.8402, 145.6128], type: 'region' },
  { name: 'Ontario, Canada', coordinates: [51.2538, -85.3232], type: 'region' },
  { name: 'São Paulo State, Brazil', coordinates: [-22.1500, -48.9000], type: 'region' },
  { name: 'United States', coordinates: [37.0902, -95.7129], type: 'country' },
  { name: 'China', coordinates: [35.8617, 104.1954], type: 'country' },
  { name: 'India', coordinates: [20.5937, 78.9629], type: 'country' },
  { name: 'United Kingdom', coordinates: [55.3781, -3.4360], type: 'country' },
  { name: 'Germany', coordinates: [51.1657, 10.4515], type: 'country' },
  { name: 'France', coordinates: [46.2276, 2.2137], type: 'country' },
  { name: 'Italy', coordinates: [41.8719, 12.5674], type: 'country' },
  { name: 'Spain', coordinates: [40.4637, -3.7492], type: 'country' },
  { name: 'Brazil', coordinates: [-14.2350, -51.9253], type: 'country' },
  { name: 'Australia', coordinates: [-25.2744, 133.7751], type: 'country' },
  { name: 'Canada', coordinates: [56.1304, -106.3468], type: 'country' },
  { name: 'Japan', coordinates: [36.2048, 138.2529], type: 'country' },
  { name: 'South Korea', coordinates: [35.9078, 127.7669], type: 'country' },
  { name: 'Russia', coordinates: [61.5240, 105.3188], type: 'country' },
  { name: 'South Africa', coordinates: [-30.5595, 22.9375], type: 'country' }
];

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-green-500';
  if (aqi <= 100) return 'bg-yellow-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-purple-800';
  return 'bg-purple-900';
};

const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export default function LocationComparison() {
  const [selectedType, setSelectedType] = useState<'city' | 'region' | 'country'>('city');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [locationsData, setLocationsData] = useState<Array<{ location: Location; aqi: number }>>([]);

  const filteredLocations = popularLocations.filter(loc => loc.type === selectedType);

  // Create a component to handle individual location data
  const LocationWithData = ({ location, index }: { location: Location; index: number }) => {
    const { data: pollutionData, isLoading, error } = usePollutionData(
      location.coordinates[0],
      location.coordinates[1]
    );

    // Update the locations data when pollution data is loaded
    React.useEffect(() => {
      if (pollutionData) {
        setLocationsData(prev => {
          const newData = [...prev];
          const existingIndex = newData.findIndex(item => item.location.name === location.name);
          if (existingIndex >= 0) {
            newData[existingIndex] = { location, aqi: pollutionData.aqi };
          } else {
            newData.push({ location, aqi: pollutionData.aqi });
          }
          return newData;
        });
      }
    }, [pollutionData, location]);

    if (isLoading) {
      return (
        <Card className="p-4">
          <p>Loading data for {location.name}...</p>
        </Card>
      );
    }

    if (error || !pollutionData) {
      return (
        <Card className="p-4">
          <p className="text-red-500">Error loading data for {location.name}</p>
        </Card>
      );
    }

    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{location.name}</h3>
              <p className="text-sm text-gray-500">{location.type}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Rank: {index + 1}</span>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm ${getAQIColor(pollutionData.aqi)}`}
              >
                {getAQICategory(pollutionData.aqi)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold">AQI: {pollutionData.aqi}</p>
            <p className="text-sm text-gray-500">
              Last Updated: {new Date(pollutionData.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">PM2.5</p>
              <p>{pollutionData.pollutants.pm25} µg/m³</p>
            </div>
            <div>
              <p className="font-medium">PM10</p>
              <p>{pollutionData.pollutants.pm10} µg/m³</p>
            </div>
            <div>
              <p className="font-medium">O₃</p>
              <p>{pollutionData.pollutants.o3} ppb</p>
            </div>
            <div>
              <p className="font-medium">NO₂</p>
              <p>{pollutionData.pollutants.no2} ppb</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Sort the locations based on AQI values
  const sortedLocations = React.useMemo(() => {
    return [...filteredLocations].sort((a, b) => {
      const aData = locationsData.find(item => item.location.name === a.name);
      const bData = locationsData.find(item => item.location.name === b.name);
      const aAqi = aData?.aqi || 0;
      const bAqi = bData?.aqi || 0;
      return sortOrder === 'desc' ? bAqi - aAqi : aAqi - bAqi;
    });
  }, [filteredLocations, locationsData, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedType('city')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'city' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            Cities
          </button>
          <button
            onClick={() => setSelectedType('region')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'region' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            Regions
          </button>
          <button
            onClick={() => setSelectedType('country')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'country' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            Countries
          </button>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setSortOrder('desc')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortOrder === 'desc' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            Most Polluted
          </button>
          <button
            onClick={() => setSortOrder('asc')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortOrder === 'asc' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            Least Polluted
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedLocations.map((location, index) => (
          <LocationWithData key={location.name} location={location} index={index} />
        ))}
      </div>
    </div>
  );
} 