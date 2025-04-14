'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';

// Dynamically import the GlobalPollutionMap component
const GlobalPollutionMap = dynamic(
  () => import('@/components/GlobalPollutionMap').then((mod) => mod.GlobalPollutionMap),
  {
    ssr: false,
    loading: () => (
      <Card className="w-full h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-gray-500">Loading map...</p>
        </div>
      </Card>
    ),
  }
);

export default function GlobePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Global Air Quality Map</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Real-time visualization of air quality levels around the world. The heatmap shows pollution levels
        where red indicates hazardous conditions and green indicates good air quality.
      </p>
      <div className="rounded-lg overflow-hidden shadow-lg">
        <GlobalPollutionMap />
      </div>
    </div>
  );
} 