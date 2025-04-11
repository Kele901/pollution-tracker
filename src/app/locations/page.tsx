'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LocationComparison from '@/components/LocationComparison';

const queryClient = new QueryClient();

export default function LocationsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Location Comparison</h1>
          <LocationComparison />
        </div>
      </main>
    </QueryClientProvider>
  );
} 