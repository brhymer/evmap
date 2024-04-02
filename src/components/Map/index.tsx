/* eslint-disable @typescript-eslint/no-shadow */

/* eslint-disable @next/next/no-img-element */

/* eslint-disable react/jsx-no-bind */

/* eslint-disable jsx-a11y/alt-text */

/* eslint-disable react/button-has-type */

/* eslint-disable jsx-a11y/control-has-associated-label */

/* eslint-disable @typescript-eslint/no-use-before-define */

/* eslint-disable import/no-cycle */

/* eslint-disable import/no-extraneous-dependencies */

/* eslint-disable jsx-a11y/label-has-associated-control */
import * as turf from '@turf/turf'
import { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson'
import React, { useEffect, useState } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import 'react-toggle/style.css'

import MapTopBar from '@components/TopBar'

import { AppConfig } from '@lib/AppConfig'
import MarkerCategories, { Category } from '@lib/MarkerCategories'
import { Places } from '@lib/Places'

import ConfigurationPanel from './ConfigurationPanel'
import { DataControls } from './DataControls'
import {
  CenterToMarkerButton,
  CustomMarker,
  GeoJSONData,
  LeafletCluster,
  LeafletMapContainer,
  LocateButton,
} from './GeoJSONData'
import MapContextProvider from './MapContextProvider'
import useLeaflet from './useLeaflet'
import useLeafletWindow from './useLeafletWindow'
import useMapContext from './useMapContext'
import useMarkerData from './useMarkerData'

export type Range = [number, number]

interface UseLayerGroupEffectParams {
  map: any
  data: GeoJSONData | null
  showLayer: boolean
  layerGroupName: string
  iconUrl: string
}

export type DataConfig = {
  togglePopRange: boolean
  toggleCiRange: boolean
  toggleLevRange: boolean
  toggleMultiFaRange: boolean
  toggleRentersRange: boolean
  toggleWalkableRange: boolean
  toggleDrivableRange: boolean
  toggleCommercialRange: boolean
  toggleResidentialRange: boolean
  toggleNeviFilterActive: boolean
  togglePgeFilterActive: boolean
}

const MapInner = (): JSX.Element => {
  const [priorityData, setPriorityData] = useState<FeatureCollection<
    Polygon | MultiPolygon,
    GeoJsonProperties
  > | null>(null)
  const [feasibleData, setFeasibleData] = useState<FeatureCollection<
    Polygon | MultiPolygon,
    GeoJsonProperties
  > | null>(null)
  const { map } = useMapContext()
  const L = useLeaflet()
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

  // const [showTransitStops, setShowTransitStops] = useState(false);
  // const [transitStopsData, setTransitStopsData] = useState<GeoJSONData | null>(null);
  const [showParksAndRecreation, setShowParksAndRecreation] = useState(false)
  const [parksAndRecreationData, setParksAndRecreationData] = useState<GeoJSONData | null>(null)
  const [showHealthcareFacilities, setShowHealthcareFacilities] = useState(false)
  const [healthcareFacilitiesData, setHealthcareFacilitiesData] = useState<GeoJSONData | null>(null)

  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false)
  const [priorityDataConfig, setPriorityDataConfig] = useState<DataConfig>({
    togglePopRange: true,
    toggleCiRange: true,
    toggleLevRange: true,
    toggleMultiFaRange: true,
    toggleRentersRange: true,
    toggleWalkableRange: true,
    toggleDrivableRange: true,
    toggleCommercialRange: false,
    toggleResidentialRange: false,
    toggleNeviFilterActive: false,
    togglePgeFilterActive: false,
  })
  const [feasibleDataConfig, setFeasibleDataConfig] = useState<DataConfig>({
    togglePopRange: false,
    toggleCiRange: false,
    toggleLevRange: false,
    toggleMultiFaRange: false,
    toggleRentersRange: false,
    toggleWalkableRange: false,
    toggleDrivableRange: false,
    toggleCommercialRange: true,
    toggleResidentialRange: true,
    toggleNeviFilterActive: true,
    togglePgeFilterActive: true,
  })

  const cityBoundaryGeoJSON = useEffectFetchCityBoundary()

  interface CachedType {
    cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> | null
    simplifiedCityBoundary: Feature<Polygon | MultiPolygon, GeoJsonProperties> | null
  }

  const cached: CachedType = {
    cityBoundaryGeoJSON,
    simplifiedCityBoundary: null,
  }

  // useEffectSetTransitStopsLayerData({ cityBoundaryGeoJSON });
  useEffectSetParksAndRecreationLayerData({ cityBoundaryGeoJSON })
  useEffectSetHealthcareFacilitiesLayerData({ cityBoundaryGeoJSON })
  useEffectCenterMap()
  // useEffectTransitStops();
  useEffectParksAndRecreation()
  useEffectHealthCareFacilities()

  const mapHtml = (
    <div>
      <div className="map-controls">
        <button onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}>
          <img
            src="https://ev-charging-mapviewer-assets.s3.amazonaws.com/settings.png"
            className="settings-icon"
          />
        </button>

        {isConfigPanelOpen && (
          <ConfigurationPanel
            priorityDataConfig={priorityDataConfig}
            feasibleDataConfig={feasibleDataConfig}
            setPriorityDataConfig={setPriorityDataConfig}
            setFeasibleDataConfig={setFeasibleDataConfig}
            closePanel={function (): void {
              setIsConfigPanelOpen(false)
            }}
          />
        )}
        <DataControls
          dataControlsTitle="Priority Data"
          map={map}
          L={L}
          cityBoundaryGeoJSON={cityBoundaryGeoJSON}
          color="#3388ff"
          geojsonUrl="https://ev-charging-mapviewer-assets.s3.amazonaws.com/oakland_priority.geojson"
          onDataUpdate={setPriorityData}
          config={priorityDataConfig}
        />
        <DataControls
          dataControlsTitle="Feasible Data"
          map={map}
          L={L}
          cityBoundaryGeoJSON={cityBoundaryGeoJSON}
          color="#ffa500"
          geojsonUrl="https://ev-charging-mapviewer-assets.s3.amazonaws.com/oakland_priority.geojson"
          onDataUpdate={setFeasibleData}
          config={feasibleDataConfig}
        />
        <br />
        <label>
          <b>Points of Interest</b>
        </label>
        <div className="checkbox-group">
          <div className="checkbox-column">
            {/* <label>
            <input
              type="checkbox"
              checked={showTransitStops}
              onChange={() => setShowTransitStops(!showTransitStops)} />
            Transit Stops
          </label> */}
            <label>
              <input
                type="checkbox"
                checked={showParksAndRecreation}
                onChange={() => setShowParksAndRecreation(!showParksAndRecreation)}
              />
              City/County Parks
            </label>
            <label>
              <input
                type="checkbox"
                checked={showHealthcareFacilities}
                onChange={() => setShowHealthcareFacilities(!showHealthcareFacilities)}
              />
              Healthcare Facilities
            </label>
          </div>
        </div>
        {/* <label>
        <input
          type="checkbox"
          checked={showIntersection}
          onChange={() => setShowIntersection(!showIntersection)}
        />
        Show Computed Intersection
      </label>

      {showIntersection && map && priorityData && feasibleData && (
        <LayerIntersection
          map={map}
          priorityData={priorityData}
          feasibleData={feasibleData}
          onIntersectionChange={setIntersectionData}
          showIntersection={true}
        />
      )} */}
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
  )
  return mapHtml

  function useEffectFetchCityBoundary(): null {
    const [cityBoundaryGeoJSON, setCityBoundaryGeoJSON] = useState(null)

    useEffect(() => {
      const fetchBoundaryData = async () => {
        const boundaryData = await fetchCityBoundary()
        setCityBoundaryGeoJSON(boundaryData)
      }

      fetchBoundaryData()
    }, [])

    return cityBoundaryGeoJSON
  }

  async function fetchCityBoundary(): Promise<any> {
    try {
      const cityBoundaryResponse = await fetch(
        'https://ev-charging-mapviewer-assets.s3.amazonaws.com/oakland_city_limits.geojson',
      )
      if (!cityBoundaryResponse.ok) {
        throw new Error(`Error fetching city boundary: ${cityBoundaryResponse.statusText}`)
      }
      const cityBoundaryGeoJSON = await cityBoundaryResponse.json()
      return cityBoundaryGeoJSON
    } catch (error) {
      console.error('Could not fetch city boundary:', error)
      return null
    }
  }

  async function fetchAndFilterLayerData({
    url,
    cityBoundaryGeoJSON,
    setLayerData,
    tolerance = 0.01,
  }: {
    url: RequestInfo | URL
    cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> | null
    _setShowLayer: {
      (value: React.SetStateAction<boolean>): void
      (value: React.SetStateAction<boolean>): void
      (value: React.SetStateAction<boolean>): void
      (arg0: boolean): void
    }
    setLayerData: {
      (value: React.SetStateAction<GeoJSONData | null>): void
      (value: React.SetStateAction<GeoJSONData | null>): void
      (value: React.SetStateAction<GeoJSONData | null>): void
      (arg0: any): void
    }
    tolerance: number
  }): Promise<void> {
    try {
      const response = await fetch(url)
      let dataJson = await response.json()

      if (cached.simplifiedCityBoundary != null || cached.cityBoundaryGeoJSON !== cityBoundaryGeoJSON) {
        if (cityBoundaryGeoJSON && cityBoundaryGeoJSON.features.length > 0) {
          cached.simplifiedCityBoundary = turf.simplify(cityBoundaryGeoJSON.features[0], {
            tolerance,
            highQuality: false,
          })
          cached.cityBoundaryGeoJSON = cityBoundaryGeoJSON
        } else {
          cached.simplifiedCityBoundary = null
        }
      }

      if (cached.simplifiedCityBoundary && cached.simplifiedCityBoundary.geometry) {
        dataJson = {
          ...dataJson,
          features: dataJson.features.filter((feature: { geometry: turf.Coord }) =>
            turf.booleanPointInPolygon(feature.geometry, cached.simplifiedCityBoundary!.geometry),
          ),
        }
      }

      setLayerData(dataJson)
    } catch (error) {
      console.error('Error fetching GeoJSON data:', error)
    }
  }

  function useEffectCenterMap(): void {
    useEffect(() => {
      if (!allMarkersBoundCenter || !map) return

      const moveEnd = () => {
        map.setMinZoom(allMarkersBoundCenter.minZoom - 1)
        map.off('moveend', moveEnd)
      }

      map.setMinZoom(0)
      map.flyTo(allMarkersBoundCenter.centerPos, allMarkersBoundCenter.minZoom, { animate: false })
      map.once('moveend', moveEnd)
    }, [allMarkersBoundCenter, map])
  }

  function useLayerGroupEffect({
    map,
    data,
    showLayer,
    layerGroupName,
    iconUrl,
  }: UseLayerGroupEffectParams): void {
    useEffect(() => {
      if (!map || !data || !L) {
        return
      }

      let layerGroup = (map as any)[layerGroupName] as L.LayerGroup | undefined

      if (showLayer) {
        const icon = L.icon({
          iconUrl,
          iconSize: [16, 16],
          iconAnchor: [0, 0],
          popupAnchor: [0, 0],
        })

        if (!layerGroup) {
          layerGroup = new L.LayerGroup().addTo(map)
          ;(map as any)[layerGroupName] = layerGroup
        } else {
          layerGroup.clearLayers()
        }

        const layer = L.geoJSON(data, {
          style: { color: '#ff7800', weight: 1, opacity: 1 },
          pointToLayer(_feature, latlng) {
            return L.marker(latlng, { icon })
          },
        })

        layerGroup.addLayer(layer)
      } else if (layerGroup) {
        layerGroup.clearLayers()
        map.removeLayer(layerGroup)
        ;(map as any)[layerGroupName] = undefined
      }
    }, [showLayer, data, map, layerGroupName, iconUrl])
  }

  // function useEffectSetTransitStopsLayerData({ cityBoundaryGeoJSON }: { cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null; }): void {
  //   useEffect(() => {
  //     fetchAndFilterLayerData({ url: './transit_stops.geojson', cityBoundaryGeoJSON, _setShowLayer: setShowTransitStops, setLayerData: setTransitStopsData, tolerance: 0.05 });
  //   }, [cityBoundaryGeoJSON]);
  // }

  function useEffectSetParksAndRecreationLayerData({
    cityBoundaryGeoJSON,
  }: {
    cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null
  }): void {
    useEffect(() => {
      fetchAndFilterLayerData({
        url: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/parks_recreation.geojson',
        cityBoundaryGeoJSON,
        _setShowLayer: setShowParksAndRecreation,
        setLayerData: setParksAndRecreationData,
        tolerance: 0.05,
      })
    }, [cityBoundaryGeoJSON])
  }

  function useEffectSetHealthcareFacilitiesLayerData({
    cityBoundaryGeoJSON,
  }: {
    cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null
  }): void {
    useEffect(() => {
      fetchAndFilterLayerData({
        url: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/healthcare_facilities.geojson',
        cityBoundaryGeoJSON,
        _setShowLayer: setShowHealthcareFacilities,
        setLayerData: setHealthcareFacilitiesData,
        tolerance: 0.05,
      })
    }, [cityBoundaryGeoJSON])
  }

  // function useEffectTransitStops(): void {
  //   useLayerGroupEffect({
  //     map: map,
  //     data: transitStopsData,
  //     showLayer: showTransitStops,
  //     layerGroupName: 'transitStopsLayerGroup',
  //     iconUrl: 'vehicles.png'
  //   });
  // }

  function useEffectParksAndRecreation(): void {
    useLayerGroupEffect({
      map,
      data: parksAndRecreationData,
      showLayer: showParksAndRecreation,
      layerGroupName: 'parksAndRecreationLayerGroup',
      iconUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/bench.png',
    })
  }

  function useEffectHealthCareFacilities(): void {
    useLayerGroupEffect({
      map,
      data: healthcareFacilitiesData,
      showLayer: showHealthcareFacilities,
      layerGroupName: 'healthcareFacilitiesLayerGroup',
      iconUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/first-aid-kit.png',
    })
  }
}

const Map = () => (
  <MapContextProvider>
    <MapInner />
  </MapContextProvider>
)

export default Map
