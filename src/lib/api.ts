import axios from 'axios';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { AQICNResponse, AQICNMapResponse, PollutionData } from '@/types';

// Check if API key exists
const API_KEY = process.env.NEXT_PUBLIC_AQICN_API_KEY;
if (!API_KEY) {
  console.warn('Warning: NEXT_PUBLIC_AQICN_API_KEY is not set. Please add it to your .env.local file.');
}

const BASE_URL = 'https://api.waqi.info';

export const getPollutionData = async (lat: number, lon: number): Promise<PollutionData> => {
  try {
    const response: AxiosResponse<AQICNResponse> = await axios.get<AQICNResponse>(
      `${BASE_URL}/feed/geo:${lat};${lon}/?token=${API_KEY}`
    );
    const data = response.data.data;

    return {
      location: data.city.name,
      coordinates: {
        latitude: lat,
        longitude: lon,
      },
      aqi: data.aqi,
      pollutants: {
        pm25: data.iaqi.pm25?.v || 0,
        pm10: data.iaqi.pm10?.v || 0,
        o3: data.iaqi.o3?.v || 0,
        no2: data.iaqi.no2?.v || 0,
        so2: data.iaqi.so2?.v || 0,
        co: data.iaqi.co?.v || 0,
      },
      timestamp: data.time.iso,
    };
  } catch (error) {
    console.error('Error fetching pollution data:', error);
    throw error;
  }
};

export const getNearbyStations = async (lat: number, lon: number, radius: number = 100): Promise<PollutionData[]> => {
  try {
    if (!API_KEY) {
      console.error('API key is missing. Please set NEXT_PUBLIC_AQICN_API_KEY environment variable.');
      return [];
    }

    // Construct the API URL with proper parameters
    const url = `${BASE_URL}/map/bounds/?latlng=${lat-radius/111},${lon-radius/111},${lat+radius/111},${lon+radius/111}&token=${API_KEY}`;
    console.log('API Request URL:', url);

    const response = await axios.get<AQICNMapResponse>(url);
    
    // Log the full response for debugging
    console.log('Full API Response:', response);
    
    // Check if the response has the expected structure
    if (!response.data) {
      console.error('Empty API response');
      return [];
    }

    if (response.data.status !== 'ok') {
      console.error('API returned error status:', response.data);
      return [];
    }

    // Check if data exists and is an array
    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.error('Invalid data structure in response:', response.data);
      return [];
    }
    
    // Transform the data
    return response.data.data.map((station: AQICNMapResponse['data'][0]) => ({
      location: station.station.name,
      coordinates: {
        latitude: station.lat,
        longitude: station.lon,
      },
      aqi: station.aqi,
      pollutants: {
        pm25: 0,
        pm10: 0,
        o3: 0,
        no2: 0,
        so2: 0,
        co: 0,
      },
      timestamp: new Date().toISOString(),
    }));
  } catch (error: any) {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return [];
  }
};

export const usePollutionData = (lat: number, lon: number) => {
  return useQuery({
    queryKey: ['pollution', lat, lon],
    queryFn: () => getPollutionData(lat, lon),
  });
};

export const useNearbyStations = (lat: number, lon: number, radius?: number) => {
  return useQuery({
    queryKey: ['stations', lat, lon, radius],
    queryFn: () => getNearbyStations(lat, lon, radius),
  });
};

export async function getGlobalPollutionData(): Promise<PollutionData[]> {
  const apiKey = process.env.NEXT_PUBLIC_AQICN_API_KEY;
  if (!apiKey) {
    console.warn('AQICN API key not found');
    return [];
  }

  try {
    // Fetch data for major cities around the world
    const cities = [
      { lat: 40.7128, lon: -74.0060 },  // New York
      { lat: 51.5074, lon: -0.1278 },   // London
      { lat: 48.8566, lon: 2.3522 },    // Paris
      { lat: 35.6762, lon: 139.6503 },  // Tokyo
      { lat: 22.3193, lon: 114.1694 },  // Hong Kong
      { lat: 1.3521, lon: 103.8198 },   // Singapore
      { lat: -33.8688, lon: 151.2093 }, // Sydney
      { lat: 55.7558, lon: 37.6173 },   // Moscow
      { lat: 19.4326, lon: -99.1332 },  // Mexico City
      { lat: -23.5505, lon: -46.6333 }, // São Paulo
      { lat: 28.6139, lon: 77.2090 },   // Delhi
      { lat: 31.2304, lon: 121.4737 },  // Shanghai
      { lat: -6.2088, lon: 106.8456 },  // Jakarta
      { lat: 25.2048, lon: 55.2708 },   // Dubai
      { lat: -26.2041, lon: 28.0473 },  // Johannesburg
      { lat: 41.9028, lon: 12.4964 },   // Rome
      { lat: 52.5200, lon: 13.4050 },   // Berlin
      { lat: 37.7749, lon: -122.4194 }, // San Francisco
      { lat: 34.0522, lon: -118.2437 }, // Los Angeles
      { lat: 45.4215, lon: -75.6972 },  // Ottawa
      { lat: -34.6037, lon: -58.3816 }, // Buenos Aires
      { lat: 39.9042, lon: 116.4074 },  // Beijing
      { lat: 13.7563, lon: 100.5018 },  // Bangkok
      { lat: 35.6892, lon: 51.3890 },   // Tehran
      { lat: 41.0082, lon: 28.9784 },   // Istanbul
      { lat: 59.9139, lon: 10.7522 },   // Oslo
      { lat: 59.3293, lon: 18.0686 },   // Stockholm
      { lat: -37.8136, lon: 144.9631 }, // Melbourne
      { lat: 43.6532, lon: -79.3832 },  // Toronto
      { lat: 3.1390, lon: 101.6869 },   // Kuala Lumpur
      { lat: 14.5995, lon: 120.9842 },  // Manila
      { lat: 37.5665, lon: 126.9780 },  // Seoul
      { lat: 12.9716, lon: 77.5946 },   // Bangalore
      { lat: 19.0760, lon: 72.8777 },   // Mumbai
      { lat: 30.0444, lon: 31.2357 },   // Cairo
      { lat: -12.0464, lon: -77.0428 }, // Lima
      { lat: -22.9068, lon: -43.1729 }, // Rio de Janeiro
      { lat: 4.7110, lon: -74.0721 },   // Bogota
      { lat: -1.2921, lon: 36.8219 },   // Nairobi
      { lat: 35.1796, lon: 136.9067 },  // Nagoya
      { lat: 50.4501, lon: 30.5234 },   // Kiev
      { lat: 44.4268, lon: 26.1025 },   // Bucharest
      { lat: 48.2082, lon: 16.3738 },   // Vienna
      { lat: 50.0755, lon: 14.4378 },   // Prague
      { lat: 47.4979, lon: 19.0402 },   // Budapest
      { lat: 52.2297, lon: 21.0122 },   // Warsaw
      { lat: 38.7223, lon: -9.1393 },   // Lisbon
      { lat: 40.4168, lon: -3.7038 },   // Madrid
      { lat: 45.4642, lon: 9.1900 },    // Milan
      { lat: -35.2809, lon: 149.1300 }, // Canberra
      { lat: 53.3498, lon: -6.2603 },   // Dublin
      { lat: 55.9533, lon: -3.1883 },   // Edinburgh
      { lat: 53.4808, lon: -2.2426 },   // Manchester
      { lat: 51.4545, lon: -2.5879 },   // Bristol
      { lat: 53.8008, lon: -1.5491 },   // Leeds
      { lat: 42.3601, lon: -71.0589 },  // Boston
      { lat: 41.8781, lon: -87.6298 },  // Chicago
      { lat: 29.7604, lon: -95.3698 },  // Houston
      { lat: 33.7490, lon: -84.3880 },  // Atlanta
      { lat: 39.9526, lon: -75.1652 },  // Philadelphia
      { lat: 25.7617, lon: -80.1918 },  // Miami
      { lat: 36.1627, lon: -86.7816 },  // Nashville
      { lat: 32.7767, lon: -96.7970 },  // Dallas
      { lat: 35.4676, lon: 139.6225 },  // Yokohama
      { lat: 34.6937, lon: 135.5023 },  // Osaka
      { lat: 43.0621, lon: 141.3544 },  // Sapporo
      { lat: 31.0461, lon: 121.3997 },  // Suzhou
      { lat: 30.5928, lon: 114.3055 },  // Wuhan
      { lat: 23.1291, lon: 113.2644 },  // Guangzhou
      { lat: 22.5431, lon: 114.0579 },  // Shenzhen
      { lat: 32.0617, lon: 118.7778 },  // Nanjing
      { lat: 36.0671, lon: 120.3826 },  // Qingdao
      { lat: 45.8038, lon: 126.5340 },  // Harbin
      { lat: 38.9072, lon: 121.6147 },  // Dalian
      { lat: 23.6345, lon: 102.8949 },  // Kunming
      { lat: 29.4316, lon: 106.9123 },  // Chongqing
      { lat: 34.3416, lon: 108.9398 },  // Xi'an
      { lat: 28.2278, lon: 112.9388 },  // Changsha
      { lat: 41.7967, lon: 123.4328 },  // Shenyang
      { lat: 24.8801, lon: 102.8329 },  // Kunming
      { lat: 30.2741, lon: 120.1551 },  // Hangzhou
      { lat: 13.0827, lon: 80.2707 },   // Chennai
      { lat: 17.3850, lon: 78.4867 },   // Hyderabad
      { lat: 23.0225, lon: 72.5714 },   // Ahmedabad
      { lat: 22.5726, lon: 88.3639 },   // Kolkata
      { lat: 18.5204, lon: 73.8567 },   // Pune
      { lat: 26.9124, lon: 75.7873 },   // Jaipur
      { lat: 25.5941, lon: 85.1376 },   // Patna
      { lat: 31.5497, lon: 74.3436 },   // Lahore
      { lat: 24.8607, lon: 67.0011 },   // Karachi
      { lat: 33.6844, lon: 73.0479 },   // Islamabad
      { lat: 23.8103, lon: 90.4125 },   // Dhaka
      { lat: 6.9271, lon: 79.8612 },    // Colombo
      { lat: 27.7172, lon: 85.3240 },   // Kathmandu
      { lat: 21.0285, lon: 105.8542 },  // Hanoi
      { lat: 10.8231, lon: 106.6297 },  // Ho Chi Minh City
      { lat: 16.8661, lon: 96.1951 },   // Yangon
      { lat: 11.5564, lon: 104.9282 },  // Phnom Penh
      { lat: -7.7972, lon: 110.3688 },  // Yogyakarta
      { lat: -6.9175, lon: 107.6191 },  // Bandung
      { lat: -8.6500, lon: 115.2167 },  // Denpasar
      { lat: 4.2105, lon: 117.8963 },    // Balikpapan
      { lat: 6.5244, lon: 3.3792 },     // Lagos
      { lat: 5.5600, lon: -0.2057 },    // Accra
      { lat: 6.3690, lon: 2.4419 },     // Cotonou
      { lat: 14.7167, lon: -17.4677 },  // Dakar
      { lat: 9.0579, lon: 7.4951 },     // Abuja
      { lat: 12.6392, lon: -8.0029 },   // Bamako
      { lat: 3.8480, lon: 11.5021 },    // Yaoundé
      { lat: 4.0511, lon: 9.7679 },     // Douala
      { lat: 0.3476, lon: 32.5825 },    // Kampala
      { lat: -6.7924, lon: 39.2083 },   // Dar es Salaam
      { lat: -4.4419, lon: 15.2663 },   // Kinshasa
      { lat: -8.8383, lon: 13.2344 },   // Luanda
      { lat: -15.4167, lon: 28.2833 },  // Lusaka
      { lat: -17.8216, lon: 31.0492 },  // Harare
      { lat: -25.9682, lon: 32.5729 },  // Maputo
      { lat: -3.3731, lon: 29.3667 },   // Bujumbura
      { lat: -1.9441, lon: 30.0619 },   // Kigali
      { lat: 15.3694, lon: 44.1910 },   // Sana'a
      { lat: 32.8872, lon: 13.1913 },   // Tripoli
      { lat: 36.8065, lon: 10.1815 },   // Tunis
      { lat: 33.5731, lon: -7.5898 },   // Casablanca
      { lat: 36.7538, lon: 3.0588 },    // Algiers
      { lat: 11.8251, lon: 42.5903 },   // Djibouti
      { lat: 15.5007, lon: 32.5599 },   // Khartoum
      { lat: 9.0579, lon: 38.7478 },    // Addis Ababa
      { lat: -12.0464, lon: -77.0428 }, // Lima
      { lat: -22.9068, lon: -43.1729 }, // Rio de Janeiro
      { lat: -23.5505, lon: -46.6333 }, // São Paulo
      { lat: 4.7110, lon: -74.0721 },   // Bogota
      { lat: -34.6037, lon: -58.3816 }, // Buenos Aires
      { lat: -33.4489, lon: -70.6693 }, // Santiago
      { lat: -16.5000, lon: -68.1500 }, // La Paz
      { lat: -0.2295, lon: -78.5243 },  // Quito
      { lat: -25.2867, lon: -57.3333 }, // Asunción
      { lat: -34.9011, lon: -56.1645 }, // Montevideo
      { lat: 10.4806, lon: -66.9036 },  // Caracas
      { lat: -2.1832, lon: -79.8791 },  // Guayaquil
      { lat: -3.7319, lon: -73.2479 },  // Iquitos
      { lat: -7.1663, lon: -78.5107 },  // Cajamarca
      { lat: -13.5320, lon: -71.9675 }, // Cusco
      { lat: -17.7833, lon: -63.1833 }, // Santa Cruz
      { lat: -19.0429, lon: -65.2554 }, // Sucre
      { lat: 6.2442, lon: -75.5812 },   // Medellín
      { lat: 3.4516, lon: -76.5320 },   // Cali
      { lat: -2.9055, lon: -79.0000 },  // Cuenca
      { lat: 5.0700, lon: -73.8500 },   // Tunja
      { lat: -30.0346, lon: -51.2177 }, // Porto Alegre
      { lat: -19.9190, lon: -43.9386 }, // Belo Horizonte
      { lat: -3.7172, lon: -38.5433 },  // Fortaleza
      { lat: -8.0476, lon: -34.8770 },  // Recife
      { lat: -27.5969, lon: -48.5495 }  // Florianópolis
    ];

    const requests = cities.map(async ({ lat, lon }) => {
      const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'ok' && data.data) {
        return {
          coordinates: {
            latitude: lat,
            longitude: lon
          },
          aqi: data.data.aqi,
          pollutants: {
            pm25: data.data.iaqi.pm25?.v || 0,
            pm10: data.data.iaqi.pm10?.v || 0,
            o3: data.data.iaqi.o3?.v || 0,
            no2: data.data.iaqi.no2?.v || 0,
            so2: data.data.iaqi.so2?.v || 0,
            co: data.data.iaqi.co?.v || 0,
          },
          timestamp: new Date().toISOString(),
        };
      }
      return null;
    });

    const results = await Promise.all(requests);
    return results.filter((result): result is PollutionData => result !== null);
  } catch (error) {
    console.error('Error fetching global pollution data:', error);
    return [];
  }
} 