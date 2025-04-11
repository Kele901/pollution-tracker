import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PollutionData } from '@/types';

interface PollutionDetailsProps {
  data: PollutionData;
}

const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-green-500';
  if (aqi <= 100) return 'bg-yellow-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-purple-800';
  return 'bg-purple-900';
};

export default function PollutionDetails({ data }: PollutionDetailsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{data.location}</h2>
          <p className="text-sm text-gray-500">
            Last Updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Air Quality Index: {data.aqi}</h3>
            <span className={`px-3 py-1 rounded-full text-white text-sm ${getAQIColor(data.aqi)}`}>
              {getAQICategory(data.aqi)}
            </span>
          </div>
          <Progress
            value={Math.min((data.aqi / 300) * 100, 100)}
            className={`h-2 ${getAQIColor(data.aqi)}`}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Pollutants</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">PM2.5</p>
              <p className="text-2xl font-bold">{data.pollutants.pm25}</p>
              <p className="text-xs text-gray-500">µg/m³</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">PM10</p>
              <p className="text-2xl font-bold">{data.pollutants.pm10}</p>
              <p className="text-xs text-gray-500">µg/m³</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">O₃</p>
              <p className="text-2xl font-bold">{data.pollutants.o3}</p>
              <p className="text-xs text-gray-500">ppb</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">NO₂</p>
              <p className="text-2xl font-bold">{data.pollutants.no2}</p>
              <p className="text-xs text-gray-500">ppb</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">SO₂</p>
              <p className="text-2xl font-bold">{data.pollutants.so2}</p>
              <p className="text-xs text-gray-500">ppb</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">CO</p>
              <p className="text-2xl font-bold">{data.pollutants.co}</p>
              <p className="text-xs text-gray-500">ppm</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 