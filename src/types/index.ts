export interface PollutionData {
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  aqi: number;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  timestamp: string;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface AQICNResponse {
  status: string;
  data: {
    aqi: number;
    idx: number;
    city: {
      name: string;
      geo: [number, number];
    };
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
    };
    time: {
      iso: string;
    };
  };
}

export interface AQICNMapResponse {
  status: string;
  data: Array<{
    lat: number;
    lon: number;
    aqi: number;
    station: {
      name: string;
    };
  }>;
} 