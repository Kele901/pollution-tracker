import axios from 'axios';
import { PollutionData } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_AQICN_API_KEY;
const BASE_URL = 'https://api.waqi.info/v2';

export async function fetchNearbyStations(lat: number, lon: number, radius: number = 100): Promise<PollutionData[]> {
  try {
    const response = await axios.get(`${BASE_URL}/map/bounds`, {
      params: {
        latlng: `${lat},${lon},${lat + radius / 111},${lon + radius / 111}`,
        token: API_KEY
      }
    });

    if (response.data.status !== 'ok') {
      throw new Error(response.data.data);
    }

    return response.data.data.map((station: any) => ({
      location: station.station.name,
      coordinates: {
        latitude: station.lat,
        longitude: station.lon
      },
      aqi: station.aqi,
      timestamp: new Date().toISOString() // API doesn't provide timestamp, using current time
    }));
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    throw error;
  }
} 