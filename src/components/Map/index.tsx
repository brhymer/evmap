import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'

import MapTopBar from '@components/TopBar'

import { AppConfig } from '@lib/AppConfig'
import MarkerCategories, { Category } from '@lib/MarkerCategories'
import { Places } from '@lib/Places'

import MapContextProvider from './MapContextProvider'
import useLeafletWindow from './useLeafletWindow'
import useMapContext from './useMapContext'
import useMarkerData from './useMarkerData'
import L from 'leaflet';

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
  const [priorityData, setPriorityData] = useState(null);
  const [feasibleData, setFeasibleData] = useState(null);
  const [showPriorityData, setShowPriorityData] = useState(true);
  const [showFeasibleData, setShowFeasibleData] = useState(true);

  /** watch position & zoom of all markers */
  useEffect(() => {
    if (!allMarkersBoundCenter || !map) return

    const moveEnd = () => {
      map.setMinZoom(allMarkersBoundCenter.minZoom - 1)
      map.off('moveend', moveEnd)
    }
    fetch('/priority.geojson')
      .then(response => response.json())
      .then(data => setPriorityData(data));

    fetch('/feasible.geojson')
      .then(response => response.json())
      .then(data => setFeasibleData(data));
    map.setMinZoom(0)
    map.flyTo(allMarkersBoundCenter.centerPos, allMarkersBoundCenter.minZoom, { animate: false })
    map.once('moveend', moveEnd)
  }, [allMarkersBoundCenter])

  return (
    <div>
      <div className="map-controls">
      <label>
        <input
          type="checkbox"
          checked={showPriorityData}
          onChange={() => setShowPriorityData(!showPriorityData)}
        />
        Show Priority Data
      </label>
      <br></br>
      <label>
        <input
          type="checkbox"
          checked={showFeasibleData}
          onChange={() => setShowFeasibleData(!showFeasibleData)}
        />
        Show Feasible Data
      </label>
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
