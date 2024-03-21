import dynamic from 'next/dynamic';

export interface GeoJSONFeatureProperties {
  Pop: number;
  CIscoreP: number;
  '# Multi-Fa': number;
  '# Renters': number;
  walkable: number;
  drivable: number;
  nevi: number;
  pge: number;
  commercial: number;
  zoning_tot: number;
  zoning_res: number;
  zoning_r_1: number;
  zoning_com: number;
  zoning_c_1: number;
  zoning_c_2: number;
  zoning_mix: number;
  zoning_m_1: number;
  zoning_m_2: number;
  zoning_m_3: number;
  zoning_ind: number;
  zoning_civ: number;
  zoning_c_3: number;
  zoning_c_4: number;
  zoning_tra: number;
  zoning_ope: number;
  zoning_agr: number;
  zoning_oth: number;
  zoning_unk: number;
  nonurb: number;
  nmtc: number;
  lev_10000: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONFeatureProperties;
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
