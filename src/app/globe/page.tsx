'use client';

import { GlobalPollutionMap } from '@/components/GlobalPollutionMap';

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