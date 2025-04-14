declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: string]: string };
  }

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: L.LatLngExpression[]): this;
    addLatLng(latlng: L.LatLngExpression): this;
    setOptions(options: HeatLayerOptions): this;
  }

  interface HeatLayerFactory {
    (latlngs: L.LatLngExpression[], options?: HeatLayerOptions): HeatLayer;
  }

  global {
    interface Window {
      L: typeof L & {
        heatLayer: HeatLayerFactory;
      }
    }
  }
} 