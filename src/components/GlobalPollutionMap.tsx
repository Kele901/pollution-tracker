'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getGlobalPollutionData } from '@/lib/api';
import { PollutionData } from '@/types';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

export function GlobalPollutionMap() {
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const heatLayerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef<number>(0);

  const animateHeatmap = useCallback((map: any, L: any) => {
    const animate = () => {
      // Even smoother, slower animation
      timeRef.current += 0.003;
      
      if (heatLayerRef.current) {
        // More subtle pulsing effect with smaller oscillation
        const pulseScale = Math.sin(timeRef.current) * 0.08 + 1; // oscillates between 0.92 and 1.08
        
        // Refined base values for better visualization
        const baseRadius = 25; // Slightly smaller base radius
        const baseBlur = 15;   // Less blur for sharper definition
        
        // Smooth transitions with easing
        const currentRadius = baseRadius * (pulseScale + Math.sin(timeRef.current * 0.5) * 0.02); // Extra subtle variation
        const currentBlur = baseBlur * pulseScale;

        // Update the heatmap layer with enhanced settings
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = L.heatLayer(heatmapData.map(([lat, lng, intensity]) => {
          // More sophisticated intensity modulation
          const timeOffset = Math.sin(timeRef.current + (lat + lng) * 0.1) * 0.03; // Location-based variation
          const intensityScale = 0.97 + timeOffset; // Subtle intensity variation
          return [
            lat,
            lng,
            intensity * intensityScale
          ];
        }), {
          radius: currentRadius,
          blur: currentBlur,
          maxZoom: 15, // Higher max zoom for more detail
          max: 1.0,
          minOpacity: 0.4, // Slightly higher minimum opacity
          gradient: {
            0.0: 'rgba(0, 255, 0, 0.7)',     // Slightly more opaque green
            0.15: 'rgba(150, 255, 0, 0.75)',  // Yellow-green transition
            0.3: 'rgba(255, 255, 0, 0.8)',    // Yellow
            0.45: 'rgba(255, 200, 0, 0.82)',  // Orange-yellow
            0.6: 'rgba(255, 100, 0, 0.85)',   // Orange
            0.75: 'rgba(255, 0, 0, 0.87)',    // Red
            0.9: 'rgba(200, 0, 100, 0.9)',    // Red-purple
            1.0: 'rgba(100, 0, 100, 0.92)'    // Deep purple
          }
        }).addTo(map);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [heatmapData]);

  const initializeMap = useCallback(async (mapInstance: any) => {
    if (!heatmapData.length) return;

    try {
      const L = (await import('leaflet')).default;
      await import('leaflet.heat');

      // Clear existing layers
      mapInstance.eachLayer((layer: any) => {
        if (layer._url === undefined) {
          mapInstance.removeLayer(layer);
        }
      });

      // Initialize the heatmap layer with refined settings
      heatLayerRef.current = L.heatLayer(heatmapData, {
        radius: 25, // Smaller initial radius
        blur: 15,   // Less blur
        maxZoom: 15,
        max: 1.0,
        minOpacity: 0.4,
        gradient: {
          0.0: 'rgba(0, 255, 0, 0.7)',
          0.15: 'rgba(150, 255, 0, 0.75)',
          0.3: 'rgba(255, 255, 0, 0.8)',
          0.45: 'rgba(255, 200, 0, 0.82)',
          0.6: 'rgba(255, 100, 0, 0.85)',
          0.75: 'rgba(255, 0, 0, 0.87)',
          0.9: 'rgba(200, 0, 100, 0.9)',
          1.0: 'rgba(100, 0, 100, 0.92)'
        }
      }).addTo(mapInstance);

      // Start the animation
      const cleanup = animateHeatmap(mapInstance, L);

      // Cleanup when map is destroyed
      mapInstance.on('unload', cleanup);
    } catch (error) {
      console.error('Error initializing heatmap:', error);
    }
  }, [heatmapData, animateHeatmap]);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const data = await getGlobalPollutionData();
        const points = data.map((item: PollutionData) => [
          item.coordinates.latitude,
          item.coordinates.longitude,
          // More sophisticated intensity calculation
          Math.min((item.aqi / 200) * 2, 1) * // Base scaling
          (0.9 + Math.random() * 0.2) // Small random variation for more natural look
        ]) as Array<[number, number, number]>;
        setHeatmapData(points);
      } catch (error) {
        console.error('Error fetching global pollution data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();

    // Cleanup animation on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        whenReady={({ target: map }) => initializeMap(map)}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors, © CARTO'
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          maxZoom={19}
        />
      </MapContainer>
      <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-800/95 p-4 rounded-md shadow-lg z-[1000] backdrop-blur-sm">
        <h3 className="text-sm font-semibold mb-3">Air Quality Index</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></span>
            <span className="text-xs">Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></span>
            <span className="text-xs">Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-orange-500 rounded-full shadow-sm"></span>
            <span className="text-xs">Unhealthy for Sensitive Groups (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></span>
            <span className="text-xs">Unhealthy (151-200)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-purple-600 rounded-full shadow-sm"></span>
            <span className="text-xs">Very Unhealthy (201+)</span>
          </div>
        </div>
      </div>
    </div>
  );
} 