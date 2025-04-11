'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PollutionTimeline } from '@/components/PollutionTimeline';
import { usePollutionData } from '@/hooks/usePollutionData';
import { PollutionData } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const popularLocations = [
  { name: 'London', coordinates: { latitude: 51.5074, longitude: -0.1278 } },
  { name: 'New York', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
  { name: 'Tokyo', coordinates: { latitude: 35.6762, longitude: 139.6503 } },
  { name: 'Paris', coordinates: { latitude: 48.8566, longitude: 2.3522 } },
  { name: 'Beijing', coordinates: { latitude: 39.9042, longitude: 116.4074 } },
];

const timePeriods = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
];

export default function TimelinePage() {
  const [selectedLocation, setSelectedLocation] = useState(popularLocations[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [historicalData, setHistoricalData] = useState<PollutionData[]>([]);
  const { data: currentData, isLoading } = usePollutionData(
    selectedLocation.coordinates.latitude,
    selectedLocation.coordinates.longitude
  );

  useEffect(() => {
    if (!currentData) return;

    const generateHistoricalData = () => {
      const now = new Date();
      const data: PollutionData[] = [];
      let hoursToGenerate = 24; // Default to 24 hours

      // Calculate hours to generate based on selected period
      switch (selectedPeriod) {
        case '7d':
          hoursToGenerate = 24 * 7;
          break;
        case '30d':
          hoursToGenerate = 24 * 30;
          break;
        case '3m':
          hoursToGenerate = 24 * 90;
          break;
      }

      // Generate data points with less frequency for longer periods
      const interval = hoursToGenerate > 24 ? Math.ceil(hoursToGenerate / 100) : 1; // Limit to ~100 data points
      for (let i = hoursToGenerate; i >= 0; i -= interval) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = timestamp.getHours();
        const day = timestamp.getDay();
        
        // Base values with daily and hourly variations
        const dailyVariation = Math.sin((day / 7) * Math.PI) * 0.2;
        const hourlyVariation = Math.sin((hour / 24) * Math.PI) * 0.3;
        const randomVariation = (Math.random() - 0.5) * 0.1;
        
        const variation = dailyVariation + hourlyVariation + randomVariation;
        
        const aqi = Math.max(0, Math.min(500, 
          currentData.aqi * (1 + variation)
        ));

        // Generate pollutant values based on AQI
        const basePollutants = {
          pm25: currentData.pollutants.pm25 * (1 + variation),
          pm10: currentData.pollutants.pm10 * (1 + variation),
          o3: currentData.pollutants.o3 * (1 + variation),
          no2: currentData.pollutants.no2 * (1 + variation),
          so2: currentData.pollutants.so2 * (1 + variation),
          co: currentData.pollutants.co * (1 + variation),
        };

        data.push({
          timestamp: timestamp.toISOString(),
          aqi: Math.round(aqi),
          pollutants: {
            ...basePollutants,
            pm25: Math.round(basePollutants.pm25),
            pm10: Math.round(basePollutants.pm10),
            o3: Math.round(basePollutants.o3),
            no2: Math.round(basePollutants.no2),
            so2: Math.round(basePollutants.so2),
            co: Math.round(basePollutants.co),
          },
          location: currentData.location,
          coordinates: currentData.coordinates,
        });
      }

      setHistoricalData(data);
    };

    generateHistoricalData();
  }, [currentData, selectedPeriod]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Pollution Timeline</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Select Location
                  </label>
                  <Select
                    value={selectedLocation.name}
                    onValueChange={(value) => {
                      const location = popularLocations.find(loc => loc.name === value);
                      if (location) setSelectedLocation(location);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularLocations.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Time Period
                  </label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      {timePeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div>Loading pollution data...</div>
                </div>
              ) : currentData ? (
                <div className="mt-4">
                  <PollutionTimeline data={historicalData} location={selectedLocation.name} />
                </div>
              ) : (
                <div className="text-center py-8">
                  No data available for the selected location
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
} 