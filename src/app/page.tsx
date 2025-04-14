'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import PollutionDetails from '@/components/PollutionDetails';
import { usePollutionData } from '@/lib/api';
import { Card } from '@/components/ui/card';

// Dynamically import the map component to avoid SSR issues with Leaflet
const PollutionMap = dynamic(() => import('@/components/PollutionMap'), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
      </div>
    </Card>
  ),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([51.5074, -0.1278]); // Default to London

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Air Quality Map</h1>
          <div className="space-y-8">
            <PollutionMapWrapper currentLocation={currentLocation} />
            <PollutionDetailsWrapper currentLocation={currentLocation} />
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}

function PollutionMapWrapper({ currentLocation }: { currentLocation: [number, number] }) {
  return <PollutionMap center={currentLocation} zoom={10} />;
}

function PollutionDetailsWrapper({ currentLocation }: { currentLocation: [number, number] }) {
  const { data: pollutionData } = usePollutionData(currentLocation[0], currentLocation[1]);
  
  if (!pollutionData) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Local Air Quality Details</h2>
      <PollutionDetails data={pollutionData} />
    </div>
  );
}