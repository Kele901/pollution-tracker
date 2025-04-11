'use client';

import React, { useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { PollutionData } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Info } from 'lucide-react';

interface PollutionTimelineProps {
  data: PollutionData[];
  location: string;
}

// Memoize utility functions
const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#00E400'; // Good
  if (aqi <= 100) return '#FFFF00'; // Moderate
  if (aqi <= 150) return '#FF7E00'; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return '#FF0000'; // Unhealthy
  if (aqi <= 300) return '#8F3F97'; // Very Unhealthy
  return '#7E0023'; // Hazardous
};

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// Memoize the tooltip component
const CustomTooltip = memo(({ active, payload, label, is24HourView }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const date = new Date(label);
  const formattedTime = is24HourView
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    : date.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

  return (
    <div className="bg-background p-4 rounded-lg shadow-lg border">
      <p className="font-semibold">{formattedTime}</p>
      <p className="text-sm">AQI: {data.aqi}</p>
      <p className="text-sm">Category: {getAQICategory(data.aqi)}</p>
      <div className="mt-2">
        <p className="text-sm font-medium">Pollutants:</p>
        <p className="text-sm">PM2.5: {data.pm25.toFixed(1)} µg/m³</p>
        <p className="text-sm">PM10: {data.pm10.toFixed(1)} µg/m³</p>
        <p className="text-sm">O3: {data.o3.toFixed(1)} µg/m³</p>
        <p className="text-sm">NO2: {data.no2.toFixed(1)} µg/m³</p>
      </div>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

export const PollutionTimeline = memo(function PollutionTimeline({ data, location }: PollutionTimelineProps) {
  // Always calculate is24HourView first since other hooks depend on it
  const is24HourView = data.length <= 24;

  // Memoize the time formatter - now called unconditionally
  const formatTime = useMemo(() => (date: Date) => {
    if (is24HourView) {
      return date.toLocaleTimeString([], { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true
    });
  }, [is24HourView]);

  // Memoize data transformation - now called unconditionally
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    return data.map(item => ({
      timestamp: new Date(item.timestamp),
      aqi: item.aqi,
      pm25: item.pollutants.pm25,
      pm10: item.pollutants.pm10,
      o3: item.pollutants.o3,
      no2: item.pollutants.no2,
      so2: item.pollutants.so2,
      co: item.pollutants.co,
    }));
  }, [data]);

  // Early return for empty data
  if (!data.length) {
    return (
      <Card className="p-6">
        <div className="h-[400px] flex items-center justify-center">
          <p>No historical data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Air Quality Timeline</h2>
        <p>Location: {location}</p>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatTime}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip is24HourView={is24HourView} />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="aqi"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              name="AQI"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pm25"
              stroke="#82ca9d"
              strokeWidth={1}
              dot={false}
              name="PM2.5"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pm10"
              stroke="#ffc658"
              strokeWidth={1}
              dot={false}
              name="PM10"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="o3"
              stroke="#ff7300"
              strokeWidth={1}
              dot={false}
              name="O3"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="no2"
              stroke="#0088fe"
              strokeWidth={1}
              dot={false}
              name="NO2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">PM2.5</h3>
          <p className="text-2xl font-bold text-foreground">
            {data[data.length - 1].pollutants.pm25.toFixed(1)}
            <span className="text-sm ml-1 text-muted-foreground">µg/m³</span>
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">PM10</h3>
          <p className="text-2xl font-bold text-foreground">
            {data[data.length - 1].pollutants.pm10.toFixed(1)}
            <span className="text-sm ml-1 text-muted-foreground">µg/m³</span>
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">O3</h3>
          <p className="text-2xl font-bold text-foreground">
            {data[data.length - 1].pollutants.o3.toFixed(1)}
            <span className="text-sm ml-1 text-muted-foreground">µg/m³</span>
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">NO2</h3>
          <p className="text-2xl font-bold text-foreground">
            {data[data.length - 1].pollutants.no2.toFixed(1)}
            <span className="text-sm ml-1 text-muted-foreground">µg/m³</span>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Understanding Air Quality Parameters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Air Quality Index (AQI)</h4>
              <p className="text-sm text-muted-foreground">
                AQI is a standardized measure of air quality, ranging from 0 to 500. Higher values indicate worse air quality.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>0-50: Good - Air quality is satisfactory</li>
                <li>51-100: Moderate - Acceptable air quality</li>
                <li>101-150: Unhealthy for Sensitive Groups</li>
                <li>151-200: Unhealthy - Everyone may experience health effects</li>
                <li>201-300: Very Unhealthy - Health warnings of emergency conditions</li>
                <li>301-500: Hazardous - Health alert: everyone may experience serious health effects</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Pollutant Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>PM2.5:</strong> Fine particles that can penetrate deep into the lungs.</p>
                <p><strong>PM10:</strong> Larger particles that can irritate the respiratory system.</p>
                <p><strong>O3 (Ozone):</strong> A gas that can cause breathing problems.</p>
                <p><strong>NO2:</strong> A gas that can irritate airways and worsen respiratory conditions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}); 