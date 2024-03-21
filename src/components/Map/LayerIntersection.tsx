import React, { useState, useEffect } from 'react';
import { FeatureCollection, Polygon, MultiPolygon, GeoJsonProperties } from 'geojson';
import * as turf from '@turf/turf';
import { SketchPicker } from 'react-color';
import { GeoJSON } from 'react-leaflet';
import useLeaflet from './useLeaflet'; // Adjust the path as necessary

interface LayerIntersectionProps {
  map?: L.Map;
  priorityData: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> | null;
  feasibleData: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> | null;
  showIntersection: boolean;
  onIntersectionChange: (intersection: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> | null) => void;
}

const LayerIntersection: React.FC<LayerIntersectionProps> = ({
  map,
  priorityData,
  feasibleData,
  showIntersection,
  onIntersectionChange
}) => {
  const [intersectionColor, setIntersectionColor] = useState('#ff0000');
  const L = useLeaflet();

  useEffect(() => {
    if (!showIntersection || !priorityData || !feasibleData || !L || !map) {
      onIntersectionChange(null);
      return;
    }

    const intersectionFeatures: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> = {
      type: 'FeatureCollection',
      features: []
    };

    priorityData.features.forEach(priorityFeature => {
      feasibleData.features.forEach(feasibleFeature => {
        const intersection = turf.intersect(priorityFeature, feasibleFeature);
        if (intersection) {
          intersectionFeatures.features.push(intersection);
        }
      });
    });

    onIntersectionChange(intersectionFeatures);
  }, [priorityData, feasibleData, showIntersection, onIntersectionChange, L, map]);

  if (!L || !map) return null;

  return (
    <div>
      {showIntersection && (
        <GeoJSON
          data={priorityData}
          style={() => ({
            color: intersectionColor,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
          })}
        />
      )}
      <div style={{ position: 'absolute', bottom: '50px', right: '10px', zIndex: 1000 }}>
        <SketchPicker
          color={intersectionColor}
          onChangeComplete={(color) => setIntersectionColor(color.hex)}
        />
      </div>
    </div>
  );
};

export default LayerIntersection;