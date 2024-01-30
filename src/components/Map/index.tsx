import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'
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
  type: string;
  properties: GeoJSONFeaturePropertiesPriority | GeoJSONFeaturePropertiesFeasible;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoJSONData {
  type: string;
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
  const [ciScoreRange, setCiScoreRange] = useState([0, 100]);
  const [multiFaRange, setMultiFaRange] = useState([0, 100]);
  const [rentersRange, setRentersRange] = useState([0, 100]);
  const [walkableRange, setWalkableRange] = useState([0, 10]);
  const [drivableRange, setDrivableRange] = useState([0, 10]);
  const [neviChecked, setNeviChecked] = useState(false);
  const [pgeChecked, setPgeChecked] = useState(false);
  const [commercialChecked, setCommercialChecked] = useState(false);


  // Effect for fetching and filtering data
  useEffect(() => {
      // Function to filter the priority data
      const filterPriorityData = (data: GeoJSONData) => {
      return {
        ...data,
        features: data.features.filter((feature: { properties: any }) => {
          const props = feature.properties;
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
        features: data.features.filter((feature: { properties: any }) => {
          const props = feature.properties;
          return (
            (!neviChecked || (neviChecked && props.nevi === 1)) &&
            (!pgeChecked || (pgeChecked && props.pge === 1)) &&
            (!commercialChecked || (commercialChecked && props.commercial === 1))
          );
        })
      };
    };
    
    const fetchAndFilterData = async () => {
      try {
        const priorityResponse = await fetch('/priority.geojson');
        const priorityDataJson = await priorityResponse.json();
        setPriorityData(filterPriorityData(priorityDataJson));

        const feasibleResponse = await fetch('/feasible.geojson');
        const feasibleDataJson = await feasibleResponse.json();
        setFeasibleData(filterFeasibleData(feasibleDataJson));
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    };

    fetchAndFilterData();
  }, [
    ciScoreRange, multiFaRange, rentersRange, walkableRange, drivableRange,
    neviChecked, pgeChecked, commercialChecked
  ]);

  // Effect for setting the initial map view
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

  return (
    <div>
      <div className="map-controls">
        {/* Priority Data Checkbox */}
        <label>
          <input
            type="checkbox"
            checked={showPriorityData}
            onChange={() => setShowPriorityData(!showPriorityData)}
          />
          Show Priority Data
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
                minDistance={10} 
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
                minDistance={10} 
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
                minDistance={10} 
              />
            </label>
            {/* Walkable Slider */}
            <label>
              Walkable: {walkableRange[0]} to {walkableRange[1]}
              <Slider 
                min={0} 
                max={10} 
                value={walkableRange} 
                onChange={setWalkableRange} 
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling 
                minDistance={1} 
              />
            </label>
            {/* Drivable Slider */}
            <label>
              Drivable: {drivableRange[0]} to {drivableRange[1]}
              <Slider 
                min={0} 
                max={10} 
                value={drivableRange} 
                onChange={setDrivableRange} 
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling 
                minDistance={1} 
              />
            </label>
          </>
        )}
        <br />
  
        {/* Feasible Data Checkbox */}
        <label>
          <input
            type="checkbox"
            checked={showFeasibleData}
            onChange={() => setShowFeasibleData(!showFeasibleData)}
          />
          Show Feasible Data
        </label>
        {showFeasibleData && (
          <>
            {/* NEVI Checkbox */}
            <label>
              <input
                type="checkbox"
                checked={neviChecked}
                onChange={() => setNeviChecked(!neviChecked)}
              />
              NEVI
            </label>
            {/* PGE Checkbox */}
            <label>
              <input
                type="checkbox"
                checked={pgeChecked}
                onChange={() => setPgeChecked(!pgeChecked)}
              />
              PGE
            </label>
            {/* Commercial Checkbox */}
            <label>
              <input
                type="checkbox"
                checked={commercialChecked}
                onChange={() => setCommercialChecked(!commercialChecked)}
              />
              Commercial
            </label>
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
