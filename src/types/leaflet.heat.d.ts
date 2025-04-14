declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  global {
    namespace L {
      function heatLayer(
        latlngs: L.LatLngExpression[],
        options?: L.HeatLayerOptions
      ): L.HeatLayer;
    }
  }
} 