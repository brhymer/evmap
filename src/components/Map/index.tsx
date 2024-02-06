import dynamic from 'next/dynamic'
import React, { useState, useEffect, useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import Slider from 'react-slider'

import MapTopBar from '@components/TopBar'
import { AppConfig } from '@lib/AppConfig'
import MarkerCategories, { Category } from '@lib/MarkerCategories'
import { Places } from '@lib/Places'
import MapContextProvider from './MapContextProvider'
import useLeafletWindow from './useLeafletWindow'
import useMapContext from './useMapContext'
import useMarkerData from './useMarkerData'
import useLeaflet from './useLeaflet'
import { Layer } from 'leaflet'
import { GeoJsonObject } from 'geojson'

interface GeoJSONFeaturePropertiesPriority {
  CIscoreP: number;
  '# Multi-Fa': number;
  '# Renters': number;
  walkable: number;
  drivable: number;
}

interface GeoJSONFeaturePropertiesFeasible {
  nevi: number;
  pge: number;
  commercial: number;
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONFeaturePropertiesPriority | GeoJSONFeaturePropertiesFeasible;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';
    coordinates: number[][] | number[][][] | number[][][][]; 
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

const LeafletCluster = dynamic(async () => (await import('./LeafletCluster')).LeafletCluster(), {
  ssr: false,
})
const CenterToMarkerButton = dynamic(async () => (await import('./ui/CenterButton')).CenterButton, {
  ssr: false,
})
const CustomMarker = dynamic(async () => (await import('./Marker')).CustomMarker, {
  ssr: false,
})
const LocateButton = dynamic(async () => (await import('./ui/LocateButton')).LocateButton, {
  ssr: false,
})
const LeafletMapContainer = dynamic(async () => (await import('./LeafletMapContainer')).LeafletMapContainer, {
  ssr: false,
})
const DynamicGeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });

const feasibleStyle = {
  color: "#ff7800",
  weight: 2,
  opacity: 0.65
};

const priorityStyle = {
  color: "#004cff",
  weight: 2,
  opacity: 0.65
};


const MapInner = () => {
  const { map } = useMapContext()
  const L = useLeaflet();
  const leafletWindow = useLeafletWindow()

  const {
    width: viewportWidth,
    height: viewportHeight,
    ref: viewportRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 200,
  })

  const { clustersByCategory, allMarkersBoundCenter } = useMarkerData({
    locations: Places,
    map,
    viewportWidth,
    viewportHeight,
  })

  const isLoading = !map || !leafletWindow || !viewportWidth || !viewportHeight
  const [priorityData, setPriorityData] = useState<GeoJSONData | null>(null);
  const [feasibleData, setFeasibleData] = useState<GeoJSONData | null>(null);
  const [showPriorityData, setShowPriorityData] = useState(true);
  const [showFeasibleData, setShowFeasibleData] = useState(true);
  const [ciScoreRange, setCiScoreRange] = useState([0, 0]);
  const [multiFaRange, setMultiFaRange] = useState([0, 0]);
  const [rentersRange, setRentersRange] = useState([0, 0]);
  const [walkableRange, setWalkableRange] = useState([0, 0]);
  const [drivableRange, setDrivableRange] = useState([0, 0]);
  const [neviOption, setNeviOption] = useState({ zero: false, one: false });
  const [pgeOption, setPgeOption] = useState({ zero: false, one: false });
  const [commercialOption, setCommercialOption] = useState({ zero: false, one: false });

  // Effect for fetching and filtering data
  useEffect(() => {
          // Function to filter the priority data

        const filterPriorityData = (data: GeoJSONData) => {
          return {
            ...data,
            features: data.features.filter((feature: GeoJSONFeature) => {
              const props = feature.properties as GeoJSONFeaturePropertiesPriority;
              return (
                props.CIscoreP >= ciScoreRange[0] && props.CIscoreP <= ciScoreRange[1] &&
                props['# Multi-Fa'] >= multiFaRange[0] && props['# Multi-Fa'] <= multiFaRange[1] &&
                props['# Renters'] >= rentersRange[0] && props['# Renters'] <= rentersRange[1] &&
                props.walkable >= walkableRange[0] && props.walkable <= walkableRange[1] &&
                props.drivable >= drivableRange[0] && props.drivable <= drivableRange[1]
              );
            })
          };
        };
          
        // Function to filter the feasible data
          const filterFeasibleData = (data: GeoJSONData) => {
          return {
            ...data,
            features: data.features.filter((feature: GeoJSONFeature) => {
              const props = feature.properties as GeoJSONFeaturePropertiesFeasible;
              return (
                ((neviOption.zero && props.nevi === 0) || (neviOption.one && props.nevi === 1)) &&
                ((pgeOption.zero && props.pge === 0) || (pgeOption.one && props.pge === 1)) &&
                ((commercialOption.zero && props.commercial === 0) || (commercialOption.one && props.commercial === 1))
              );
            })
          };
        };

        const fetchAndFilterData = async () => {
          try {
            // Fetch and filter priority data
              const priorityResponse = await fetch('/priority.geojson');
              const priorityDataJson: GeoJSONData = await priorityResponse.json();
              const filteredPriorityData = filterPriorityData(priorityDataJson);
            setPriorityData(filteredPriorityData);

              // Fetch and filter feasible data
              const feasibleResponse = await fetch('/feasible.geojson');
              const feasibleDataJson: GeoJSONData = await feasibleResponse.json();
              const filteredFeasibleData = filterFeasibleData(feasibleDataJson);
            setFeasibleData(filteredFeasibleData);
          } catch (error) {
            console.error("Error fetching GeoJSON data:", error);
          }
        };

          fetchAndFilterData();
  }, [
    ciScoreRange, multiFaRange, rentersRange, walkableRange, drivableRange,
    neviOption, pgeOption, commercialOption
  ]);
      
  useEffect(() => {
        if (!allMarkersBoundCenter || !map) return;

        const moveEnd = () => {
          map.setMinZoom(allMarkersBoundCenter.minZoom - 1);
          map.off('moveend', moveEnd);
        };

        map.setMinZoom(0);
        map.flyTo(allMarkersBoundCenter.centerPos, allMarkersBoundCenter.minZoom, { animate: false });
        map.once('moveend', moveEnd);
  }, [allMarkersBoundCenter, map]);

  const havePriorityFiltersChanged = (newRanges: { ciScoreRange: any[]; multiFaRange: any[]; rentersRange: any[]; walkableRange: any[]; drivableRange: any[] }, oldRanges: { ciScoreRange: any[]; multiFaRange: any[]; rentersRange: any[]; walkableRange: any[]; drivableRange: any[] }) => {
    return (
      newRanges.ciScoreRange[0] !== oldRanges.ciScoreRange[0] ||
      newRanges.ciScoreRange[1] !== oldRanges.ciScoreRange[1] ||
      newRanges.multiFaRange[0] !== oldRanges.multiFaRange[0] ||
      newRanges.multiFaRange[1] !== oldRanges.multiFaRange[1] ||
      newRanges.rentersRange[0] !== oldRanges.rentersRange[0] ||
      newRanges.rentersRange[1] !== oldRanges.rentersRange[1] ||
      newRanges.walkableRange[0] !== oldRanges.walkableRange[0] ||
      newRanges.walkableRange[1] !== oldRanges.walkableRange[1] ||
      newRanges.drivableRange[0] !== oldRanges.drivableRange[0] ||
      newRanges.drivableRange[1] !== oldRanges.drivableRange[1]
    );
  };

  const haveFeasibleFiltersChanged = (newOptions: { neviOption: { zero: any; one: any }; pgeOption: { zero: any; one: any }; commercialOption: { zero: any; one: any } }, oldOptions: { neviOption: { zero: any; one: any }; pgeOption: { zero: any; one: any }; commercialOption: { zero: any; one: any } }) => {
    return (
      newOptions.neviOption.zero !== oldOptions.neviOption.zero ||
      newOptions.neviOption.one !== oldOptions.neviOption.one ||
      newOptions.pgeOption.zero !== oldOptions.pgeOption.zero ||
      newOptions.pgeOption.one !== oldOptions.pgeOption.one ||
      newOptions.commercialOption.zero !== oldOptions.commercialOption.zero ||
      newOptions.commercialOption.one !== oldOptions.commercialOption.one
    );
  };

  useEffect(() => {
    if (!map || !priorityData || !L) {
      return;
    }
  
    let priorityLayerGroup = (map as any).priorityLayerGroup as L.LayerGroup | undefined;
  
    if (!priorityLayerGroup) {
      priorityLayerGroup = new L.LayerGroup().addTo(map);
      (map as any).priorityLayerGroup = priorityLayerGroup;
    } else {
      priorityLayerGroup.clearLayers();
    }
  
    const addGeoJsonLayerToGroup = (geoJsonData: GeoJSONData | GeoJsonObject | GeoJsonObject[] | undefined, style: { color: string; weight: number; opacity: number }) => {
      if (priorityLayerGroup) {
        const layer = L.geoJSON(geoJsonData, { style });
        priorityLayerGroup.addLayer(layer);
      } else {
        console.error('priorityLayerGroup is not initialized.');
      }
    };
  
    if (showPriorityData) {
      addGeoJsonLayerToGroup(priorityData, priorityStyle);
    }
  
    return () => {
      if (priorityLayerGroup) {
        priorityLayerGroup.clearLayers();
        map.removeLayer(priorityLayerGroup);
        (map as any).priorityLayerGroup = undefined;
      }
    };  
  }, [priorityData]);
  
  
  useEffect(() => {
    if (!map || !feasibleData || !L) {
      return;
    }
  
    let feasibleLayerGroup = (map as any).feasibleLayerGroup as L.LayerGroup | undefined;
  
    if (!feasibleLayerGroup) {
      feasibleLayerGroup = new L.LayerGroup().addTo(map);
      (map as any).feasibleLayerGroup = feasibleLayerGroup; 
    } else {
      feasibleLayerGroup.clearLayers(); 
    }
  
    const addGeoJsonLayerToGroup = (geoJsonData: GeoJSONData | GeoJsonObject | GeoJsonObject[] | undefined, style: { color: string; weight: number; opacity: number }) => {
      if (feasibleLayerGroup) {
        const layer = L.geoJSON(geoJsonData, { style });
        feasibleLayerGroup.addLayer(layer);
      } else {
        console.error('feasibleLayerGroup is not initialized.');
      }
    };
  
    if (showFeasibleData) {
      addGeoJsonLayerToGroup(feasibleData, feasibleStyle);
    }
  
    return () => {
      if (feasibleLayerGroup) {
        feasibleLayerGroup.clearLayers();
        map.removeLayer(feasibleLayerGroup);
        (map as any).feasibleLayerGroup = undefined;
      }
    };  
  }, [feasibleData]); 
  

  return (
    <div>
      <div className="map-controls">
        {/* Priority Data Checkbox */}
        <label>
          {/* <input
            type="checkbox"
            checked={showPriorityData}
            onChange={() => setShowPriorityData(!showPriorityData)}
          /> */}
          Priority Data
        </label>
        {showPriorityData && (
          <>
            {/* CI Score Slider */}
            <label>
              CI Score: {ciScoreRange[0]} to {ciScoreRange[1]}
              <Slider 
                min={0} 
                max={100} 
                value={ciScoreRange} 
                onChange={setCiScoreRange} 
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling 
                minDistance={5} 
              />
            </label>
            {/* Multi-Fa Slider */}
            <label>
              # Multi-Fa: {multiFaRange[0]} to {multiFaRange[1]}
              <Slider 
                min={0} 
                max={100} 
                value={multiFaRange} 
                onChange={setMultiFaRange} 
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling 
                minDistance={5} 
              />
            </label>
            {/* Renters Slider */}
            <label>
              # Renters: {rentersRange[0]} to {rentersRange[1]}
              <Slider 
                min={0} 
                max={100} 
                value={rentersRange} 
                onChange={setRentersRange} 
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling 
                minDistance={5} 
              />
            </label>
            {/* Walkable Slider */}
            <label>
              Walkable: {walkableRange[0]} to {walkableRange[1]}
              <Slider 
                min={0} 
                max={100} 
                value={walkableRange} 
                onChange={setWalkableRange} 
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling 
                minDistance={5} 
              />
            </label>
            {/* Drivable Slider */}
            <label>
              Drivable: {drivableRange[0]} to {drivableRange[1]}
              <Slider 
                min={0} 
                max={100} 
                value={drivableRange} 
                onChange={setDrivableRange} 
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling 
                minDistance={5} 
              />
            </label>
          </>
        )}
        <br />
  
        {/* Feasible Data Checkbox */}
        <label>
          {/* <input
            type="checkbox"
            checked={showFeasibleData}
            onChange={() => setShowFeasibleData(!showFeasibleData)}
          /> */}
          Feasible Data
        </label>
        {showFeasibleData && (
          <>
            <div className="checkbox-group">
              {/* NEVI Checkboxes */}
              <div className="checkbox-column">
                <label>
                  <input
                    type="checkbox"
                    checked={neviOption.zero}
                    onChange={() => setNeviOption({ ...neviOption, zero: !neviOption.zero })}
                  />
                  NEVI 0
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={neviOption.one}
                    onChange={() => setNeviOption({ ...neviOption, one: !neviOption.one })}
                  />
                  NEVI 1
                </label>
              </div>
            </div>

            <div className="checkbox-group">
              {/* PGE Checkboxes */}
              <div className="checkbox-column">
                <label>
                  <input
                    type="checkbox"
                    checked={pgeOption.zero}
                    onChange={() => setPgeOption({ ...pgeOption, zero: !pgeOption.zero })}
                  />
                  PGE 0
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={pgeOption.one}
                    onChange={() => setPgeOption({ ...pgeOption, one: !pgeOption.one })}
                  />
                  PGE 1
                </label>
              </div>
            </div>

            <div className="checkbox-group">
              {/* Commercial Checkboxes */}
              <div className="checkbox-column">
                <label>
                  <input
                    type="checkbox"
                    checked={commercialOption.zero}
                    onChange={() => setCommercialOption({ ...commercialOption, zero: !commercialOption.zero })}
                  />
                  Commercial 0
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={commercialOption.one}
                    onChange={() => setCommercialOption({ ...commercialOption, one: !commercialOption.one })}
                  />
                  Commercial 1
                </label>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="h-full w-full absolute overflow-hidden" ref={viewportRef}>
        <MapTopBar />
        <div
          className={`absolute w-full left-0 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-1 '}`}
          style={{
            top: AppConfig.ui.topBarHeight,
            width: viewportWidth ?? '100%',
            height: viewportHeight ? viewportHeight - AppConfig.ui.topBarHeight : '100%',
          }}
        >
          {allMarkersBoundCenter && clustersByCategory && (
            <LeafletMapContainer
              center={allMarkersBoundCenter.centerPos}
              zoom={allMarkersBoundCenter.minZoom}
              maxZoom={AppConfig.maxZoom}
              minZoom={AppConfig.minZoom}
            >
              {!isLoading ? (
                <>
                  <CenterToMarkerButton
                    center={allMarkersBoundCenter.centerPos}
                    zoom={allMarkersBoundCenter.minZoom}
                  />
                  <LocateButton />
                  {Object.values(clustersByCategory).map(item => (
                    <LeafletCluster
                      key={item.category}
                      icon={MarkerCategories[item.category as Category].icon}
                      color={MarkerCategories[item.category as Category].color}
                      chunkedLoading
                    >
                      {item.markers.map(marker => (
                        <CustomMarker
                          icon={MarkerCategories[marker.category].icon}
                          color={MarkerCategories[marker.category].color}
                          key={(marker.position as number[]).join('')}
                          position={marker.position}
                        />
                      ))}
                    </LeafletCluster>
                  ))}
                  {/* GeoJSON layers */}
                  {showFeasibleData && feasibleData && <DynamicGeoJSON data={feasibleData} style={feasibleStyle} />}
                  {showPriorityData && priorityData && <DynamicGeoJSON data={priorityData} style={priorityStyle} />}
                </>
              ) : (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <></>
              )}
            </LeafletMapContainer>
          )}
        </div>
      </div>
    </div>
  );
};

// pass through to get context in <MapInner>
const Map = () => (
  <MapContextProvider>
    <MapInner />
  </MapContextProvider>
)

export default Map
