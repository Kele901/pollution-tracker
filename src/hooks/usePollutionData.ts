import { useState, useEffect } from 'react';
import { PollutionData } from '@/types';
import { getPollutionData } from '@/lib/api';

export function usePollutionData(latitude: number, longitude: number) {
  const [data, setData] = useState<PollutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const pollutionData = await getPollutionData(latitude, longitude);
        setData(pollutionData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pollution data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [latitude, longitude]);

  return { data, isLoading, error };
} 