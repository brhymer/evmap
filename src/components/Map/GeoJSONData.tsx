import dynamic from 'next/dynamic';

export interface GeoJSONFeaturePropertiesPriority {
  CIscoreP: number;
  '# Multi-Fa': number;
  '# Renters': number;
  walkable: number;
  drivable: number;
}
export interface GeoJSONFeaturePropertiesFeasible {
  nevi: number;
  pge: number;
  commercial: number;
}
export interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONFeaturePropertiesPriority | GeoJSONFeaturePropertiesFeasible;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';
    coordinates: number[][] | number[][][] | number[][][][];
  };
}
export interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
export const LeafletCluster = dynamic(async () => (await import('./LeafletCluster')).LeafletCluster(), {
  ssr: false,
});
export const CenterToMarkerButton = dynamic(async () => (await import('./ui/CenterButton')).CenterButton, {
  ssr: false,
});
export const CustomMarker = dynamic(async () => (await import('./Marker')).CustomMarker, {
  ssr: false,
});
export const LocateButton = dynamic(async () => (await import('./ui/LocateButton')).LocateButton, {
  ssr: false,
});
export const LeafletMapContainer = dynamic(async () => (await import('./LeafletMapContainer')).LeafletMapContainer, {
  ssr: false,
});
export const DynamicGeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
export const feasibleStyle = {
  color: "#ff7800",
  weight: 2,
  opacity: 0.65
};
export const priorityStyle = {
  color: "#004cff",
  weight: 2,
  opacity: 0.65
};
