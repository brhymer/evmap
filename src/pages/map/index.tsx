/* eslint-disable func-names */

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

/* eslint-disable jsx-a11y/click-events-have-key-events */

/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as turf from '@turf/turf'
import ConfigurationPanel from '@map/ConfigurationPanel'
import ContextMenu from '@map/ContextMenu'
import { DataControls } from '@map/DataControls'
import {
  CenterToMarkerButton,
  CustomMarker,
  GeoJSONData,
  LeafletCluster,
  LeafletMapContainer,
  LocateButton,
} from '@map/GeoJSONData'
import WelcomeModal from '@map/WelcomeModal'
import useLeaflet from '@map/useLeaflet'
import useLeafletWindow from '@map/useLeafletWindow'
import useMapContext from '@map/useMapContext'
import useMarkerData from '@map/useMarkerData'
// import MarkerCategories, { Category } from '@lib/MarkerCategories'
import { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import 'react-toggle/style.css'

import ColocationPoint from '@components/Map/ColocationPoint'
import MapNavBar from '@components/MapNavBar'

import { AppConfig } from '@lib/AppConfig'
import MapProps from '@lib/MapProps'
import NavBarProps from '@lib/NavBarProps'
import { Places } from '@lib/Places'

// import { useScreenshot } from 'use-react-screenshot'
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
  toggleirs30cFilterActive: boolean
  togglePgeFilterActive: boolean
}

interface MapComponentProps extends NavBarProps {
  map: any
  cityConfig: any
}

// const Map: React.FC<MapComponentProps> = ({ setCurrentView, map, cityConfig }) => {
const Map: React.FC<NavBarProps> = ({ setCurrentView }) => {
  const [priorityData, setPriorityData] = useState<FeatureCollection<
    Polygon | MultiPolygon,
    GeoJsonProperties
  > | null>(null)
  const [feasibleData, setFeasibleData] = useState<FeatureCollection<
    Polygon | MultiPolygon,
    GeoJsonProperties
  > | null>(null)
  // const [lihtcData, setLihtcData] = useState<FeatureCollection<
  //   Polygon | MultiPolygon,
  //   GeoJsonProperties
  // > | null>(null) // Added LIHTC data state
  const { map, cityConfig = {} as MapProps } = useMapContext()
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
  const [showTransitStops, setShowTransitStops] = useState(false)
  const [transitStopsData, setTransitStopsData] = useState<GeoJSONData | null>(null)
  const [showLihtc, setShowLihtc] = useState(false)
  const [lihtcData, setLihtcData] = useState<GeoJSONData | null>(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [LibraryData, setLibraryData] = useState<GeoJSONData | null>(null)
  const [showSchool, setShowSchool] = useState(false)
  const [schoolsData, setSchoolData] = useState<GeoJSONData | null>(null)
  const [showParksAndRecreation, setShowParksAndRecreation] = useState(false)
  const [parksAndRecreationData, setParksAndRecreationData] = useState<GeoJSONData | null>(null)
  const [showHealthcareFacilities, setShowHealthcareFacilities] = useState(false)
  const [healthcareFacilitiesData, setHealthcareFacilitiesData] = useState<GeoJSONData | null>(null)
  const [openWelcomeModal, setOpenWelcomeModal] = useState(false)
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
    toggleirs30cFilterActive: false,
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
    toggleCommercialRange: false,
    toggleResidentialRange: false,
    toggleNeviFilterActive: true,
    toggleirs30cFilterActive: true,
    togglePgeFilterActive: true,
  })
  const [contextMenuVisible, setContextMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [clickedLatLng, setClickedLatLng] = useState<L.LatLng | null>(null)
  // const [image, takeScreenshot] = useScreenshot()
  // const getImage = () => {
  //   if (ref.current) {
  //     takeScreenshot(ref.current).then((img: string) => {
  //       console.log("Screenshot taken:", ref.current)
  //       const link = document.createElement('a')
  //       link.href = img
  //       link.download = 'map-screensdhot.png'
  //       link.click()
  //     }).catch((error: Error) => {
  //       console.error("Screenshot failed:", error)
  //     })
  //   }
  //   else {console.log("not working")}
  // }
  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault()
    if (map && L) {
      const latLng = map.mouseEventToLatLng(event.nativeEvent as MouseEvent)
      setClickedLatLng(latLng)
    }
    setMenuPosition({
      x: event.clientX,
      y: event.clientY,
    })
    setContextMenuVisible(true)
  }

  const handleClick = () => {
    setContextMenuVisible(false)
  }

  const cityBoundaryGeoJSON = useEffectFetchCityBoundary()

  interface CachedType {
    cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> | null
    simplifiedCityBoundary: Feature<Polygon | MultiPolygon, GeoJsonProperties> | null
  }

  const cached: CachedType = {
    cityBoundaryGeoJSON,
    simplifiedCityBoundary: null,
  }
  const ref = useRef<HTMLDivElement>(null)

  useEffectSetTransitStopsLayerData()
  useEffectSetParksAndRecreationLayerData()
  useEffectSetHealthcareFacilitiesLayerData()
  useEffectSetLihtcLayerData()
  useEffectSetLibraryLayerData()
  useEffectSetSchoolLayerData()

  useEffectCenterMap()

  useEffectTransitStops()
  useEffectParksAndRecreation()
  useEffectHealthCareFacilities()
  useEffectLihtc()
  useEffectLibrary()
  useEffectSchool()
  useEffectWelcomeModal()
  // useEffect(() => {
  //   if (!L) return
  // }, [L])
  // useEffectCenterMap()

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
          dataControlsTitle="Priority Pixels"
          map={map}
          L={L}
          cityBoundaryGeoJSON={cityBoundaryGeoJSON}
          color="#3388ff"
          geojsonUrl={cityConfig.priorityDataUrl}
          onDataUpdate={setPriorityData}
          config={priorityDataConfig}
        />
        <DataControls
          dataControlsTitle="Feasibility Pixels"
          map={map}
          L={L}
          cityBoundaryGeoJSON={cityBoundaryGeoJSON}
          color="#ffa500"
          geojsonUrl={cityConfig.feasibleDataUrl}
          onDataUpdate={setFeasibleData}
          config={feasibleDataConfig}
        />
        <label>
          <b>Co-location Points</b>
        </label>
        <div className="checkbox-group">
          <div className="checkbox-column" style={{ width: '340px' }}>
            <ColocationPoint
              mainText="Low-income housing"
              hoverText="Select to show residential multifamily buildings eligible for the federal Low-Income Housing Tax Credit."
              accordionText="The federal Low-Income Housing Tax Credit is available for residential property owners who set aside a minimum percentage of rental units for tenants at different levels of below-average area income. It is used as an indicator of buildings whose lower-income tenants are most likely to need access to public charging."
              value={showLihtc}
              setValue={setShowLihtc}
              image="https://ev-map.s3.amazonaws.com/icons/home.png"
              imgAlt="home icon"
            />
            <ColocationPoint
              mainText="Transit stops"
              hoverText="Select to show commuter rail stations. California rail systems included: ACE, BART, Caltrain, Capitol Corridor, Coaster, LA Metro, Metrolink, SMART."
              accordionText="Commuter rail stations are potential high-value locations for publicly accessible charging, at station parking lots or surrounding street parking where commuters leave their vehicles before transfering to the train for the second part of a commute. Local bus and trolley networks are not shown."
              value={showTransitStops}
              setValue={setShowTransitStops}
              image="https://ev-map.s3.amazonaws.com/icons/vehicles.png"
              imgAlt="vehicles icon"
            />
            <ColocationPoint
              mainText="Public libraries"
              hoverText="Select to show public library locations."
              accordionText="Public libraries can serve as charging hubs due to their public ownership, community uses, typical length of visit, access by employees and the public, and (often) availability of parking."
              value={showLibrary}
              setValue={setShowLibrary}
              image="https://ev-map.s3.amazonaws.com/icons/library.png"
              imgAlt="library icon"
            />
            <ColocationPoint
              mainText="Public schools"
              hoverText="Select to show public school locations."
              accordionText="Public schools can serve as charging hubs due to their public ownership, community uses, typical length of visit, access by employees and the public, and (often) availability of parking."
              value={showSchool}
              setValue={setShowSchool}
              image="https://ev-map.s3.amazonaws.com/icons/school-bag.png"
              imgAlt="school-bag icon"
            />
            <ColocationPoint
              mainText="City/county parks"
              hoverText="Select to show city and county park locations."
              accordionText="City and county parks can serve as charging hubs due to their public ownership, community uses, typical length of visit, and (often) availability of parking. Regional, state, and national parks are not shown."
              value={showParksAndRecreation}
              setValue={setShowParksAndRecreation}
              image="https://ev-map.s3.amazonaws.com/icons/bench.png"
              imgAlt="bench icon"
            />
            <ColocationPoint
              mainText="Hospitals"
              hoverText="Select to show hospitals."
              accordionText="Hospitals can serve as charging hubs due to their community uses, typical length of visit, access by employees and the public, and availability of parking."
              value={showHealthcareFacilities}
              setValue={setShowHealthcareFacilities}
              image="https://ev-map.s3.amazonaws.com/icons/first-aid-kit.png"
              imgAlt="first aid icon"
            />
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
        <MapNavBar setCurrentView={setCurrentView} />
        <ContextMenu
          contextMenuVisible={contextMenuVisible}
          setContextMenuVisible={setContextMenuVisible}
          clickedLatLng={clickedLatLng}
          menuPosition={menuPosition}
          // getImage={getImage}
        />
        <div
          className={`absolute w-full left-0 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-1 '}`}
          onContextMenu={handleRightClick}
          onClick={handleClick}
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
              {/* {!isLoading ? (
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
              )} */}
            </LeafletMapContainer>
          )}
        </div>
      </div>
    </div>
  )
  // console.log("map called~~")
  return (
    <>
      <WelcomeModal
        openModal={openWelcomeModal}
        setOpenModal={setOpenWelcomeModal}
        city={cityConfig.city}
        county={cityConfig.county}
        setCurrentView={setCurrentView}
      />
      {mapHtml}
    </>
  )

  function useEffectFetchCityBoundary(): null {
    const [cityBoundaryGeoJSON, setCityBoundaryGeoJSON] = useState(null)
    // console.log("useEffectFetchCityBoundary called~~", cityConfig)
    const debounceDelay = 500
    // useEffect(() => {
    //   const fetchBoundaryData = async () => {
    //     const boundaryData = await fetchCityBoundary()
    //     setCityBoundaryGeoJSON(boundaryData)
    //   }
    //   fetchBoundaryData()
    // }, [cityConfig])
    useEffect(() => {
      const fetchBoundaryData = async () => {
        const boundaryData = await fetchCityBoundary()
        setCityBoundaryGeoJSON(boundaryData)
      }
      const handler = setTimeout(() => {
        fetchBoundaryData()
      }, debounceDelay)
      return () => clearTimeout(handler)
    }, [cityConfig])
    return cityBoundaryGeoJSON
  }

  async function fetchCityBoundary(): Promise<any> {
    // console.log("fetchCityBoundary called~~")
    try {
      const cityBoundaryResponse = await fetch(cityConfig.boundaryUrl)
      if (!cityBoundaryResponse.ok) {
        throw new Error(`Error fetching city boundary: ${cityBoundaryResponse.statusText}`)
      }
      return await cityBoundaryResponse.json()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Could not fetch city boundary:', error)
      return null
    }
  }

  async function fetchAndFilterLayerData({
    url,
    cityBoundaryGeoJSON,
    setLayerData,
    tolerance = 0.00001,
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
    // console.log("fetchAndFilterLayerData called~~")
    // const thing = url.toString().slice(25)
    try {
      const response = await fetch(url)
      let dataJson = await response.json()

      if (cached.simplifiedCityBoundary === null || cached.cityBoundaryGeoJSON !== cityBoundaryGeoJSON) {
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
      // console.log("&&&&", thing, cached.simplifiedCityBoundary)
      if (cached.simplifiedCityBoundary && cached.simplifiedCityBoundary.geometry) {
        // dataJson = {
        //   ...dataJson,
        //   features: dataJson.features.filter((feature: { geometry: turf.Coord }) =>
        //     turf.booleanPointInPolygon(feature.geometry, cached.simplifiedCityBoundary!.geometry),
        //   ),
        // }
        dataJson = {
          ...dataJson,
          features: dataJson.features.filter((feature: { geometry: GeoJSON.Geometry }) => {
            if (feature.geometry.type === 'Point') {
              return turf.booleanPointInPolygon(feature.geometry, cached.simplifiedCityBoundary!.geometry)
            }
            if (feature.geometry.type === 'Polygon') {
              return turf.booleanContains(cached.simplifiedCityBoundary!.geometry, feature.geometry)
              //  turf.booleanOverlap(cityBoundary, feature.geometry)
            }
            return false
          }),
        }
      }
      // console.log("###", thing, dataJson)
      setLayerData(dataJson)
    } catch (error) {
      console.error('Error fetching GeoJSON data:', error)
    }
  }

  function useEffectCenterMap(): void {
    // console.log("useEffectCenterMap called~~")
    useEffect(() => {
      if (!map || !L || !cityBoundaryGeoJSON || !cityConfig) return
      const jsonGroup = L.geoJson(cityBoundaryGeoJSON)
      map.fitBounds(jsonGroup.getBounds())
      // }, [allMarkersBoundCenter, map, cityBoundaryGeoJSON])
    }, [cityBoundaryGeoJSON])
  }

  function useLayerGroupEffect({
    map,
    data,
    showLayer,
    layerGroupName,
    iconUrl,
  }: UseLayerGroupEffectParams): void {
    // console.log("useLayerGroupEffect called~~")
    useEffect(() => {
      if (!map || !data || !L) {
        return
      }

      let layerGroup = (map as any)[layerGroupName] as L.LayerGroup | undefined
      if (showLayer) {
        const icon = L.icon({
          iconUrl,
          iconSize: [20, 20],
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
          style: { color: '#72DD5A', weight: 1, opacity: 1 }, // old color = #ff7800
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
    // }, [showLayer]) // FIXME: doesn't update when new jurisdiction is selected
  }

  function useEffectSetParksAndRecreationLayerData() {
    // console.log("useEffectSetParksAndRecreation called~~")
    useEffect(() => {
      if (cityConfig.parksAndRecreationUrl) {
        fetchAndFilterLayerData({
          url: cityConfig.parksAndRecreationUrl,
          cityBoundaryGeoJSON,
          _setShowLayer: setShowParksAndRecreation,
          setLayerData: setParksAndRecreationData,
          tolerance: 0.05,
        })
      }
    }, [cityConfig.parksAndRecreationUrl, cityBoundaryGeoJSON])
  }

  function useEffectSetHealthcareFacilitiesLayerData() {
    // console.log("useEffectSetHealthcare called~~")
    useEffect(() => {
      if (cityConfig.healthcareFacilitiesUrl) {
        fetchAndFilterLayerData({
          url: cityConfig.healthcareFacilitiesUrl,
          cityBoundaryGeoJSON,
          _setShowLayer: setShowHealthcareFacilities,
          setLayerData: setHealthcareFacilitiesData,
          tolerance: 0.00001,
        })
      }
    }, [cityConfig.healthcareFacilitiesUrl, cityBoundaryGeoJSON])
  }

  function useEffectSetTransitStopsLayerData() {
    // console.log("useEffectTransitStops called~~")
    useEffect(() => {
      if (cityConfig.transitStopsUrl) {
        fetchAndFilterLayerData({
          url: cityConfig.transitStopsUrl,
          cityBoundaryGeoJSON,
          _setShowLayer: setShowTransitStops,
          setLayerData: setTransitStopsData,
          tolerance: 0.0001,
        })
      }
    }, [cityConfig.transitStopsUrl, cityBoundaryGeoJSON])
  }

  function useEffectSetLihtcLayerData() {
    // console.log("useEffectSetLihtc called~~")
    useEffect(() => {
      if (cityConfig.lihtcUrl) {
        fetchAndFilterLayerData({
          url: cityConfig.lihtcUrl,
          cityBoundaryGeoJSON,
          _setShowLayer: setShowLihtc,
          setLayerData: setLihtcData,
          tolerance: 0.05,
        })
      }
    }, [cityConfig.lihtcUrl, cityBoundaryGeoJSON])
  }

  function useEffectSetLibraryLayerData() {
    // console.log("useEffectSetLibrary called~~")
    useEffect(() => {
      if (cityConfig.libraryUrl) {
        fetchAndFilterLayerData({
          url: cityConfig.libraryUrl,
          cityBoundaryGeoJSON,
          _setShowLayer: setShowLibrary,
          setLayerData: setLibraryData,
          tolerance: 0.05,
        })
      }
    }, [cityConfig.libraryUrl, cityBoundaryGeoJSON])
  }

  function useEffectSetSchoolLayerData() {
    // console.log("useEffectSetSchool called~~")
    useEffect(() => {
      if (cityConfig.schoolsUrl) {
        fetchAndFilterLayerData({
          url: cityConfig.schoolsUrl,
          cityBoundaryGeoJSON,
          _setShowLayer: setShowSchool,
          setLayerData: setSchoolData,
          tolerance: 0.00001,
        })
      }
    }, [cityConfig.schoolsUrl, cityBoundaryGeoJSON])
  }

  function useEffectTransitStops(): void {
    useLayerGroupEffect({
      map,
      data: transitStopsData,
      showLayer: showTransitStops,
      layerGroupName: 'transitStopsLayerGroup',
      iconUrl: 'https://ev-map.s3.amazonaws.com/icons/vehicles.png',
    })
  }

  function useEffectParksAndRecreation(): void {
    useLayerGroupEffect({
      map,
      data: parksAndRecreationData,
      showLayer: showParksAndRecreation,
      layerGroupName: 'parksAndRecreationLayerGroup',
      iconUrl: 'https://ev-map.s3.amazonaws.com/icons/bench.png',
    })
  }

  function useEffectHealthCareFacilities(): void {
    useLayerGroupEffect({
      map,
      data: healthcareFacilitiesData,
      showLayer: showHealthcareFacilities,
      layerGroupName: 'healthcareFacilitiesLayerGroup',
      iconUrl: 'https://ev-map.s3.amazonaws.com/icons/first-aid-kit.png',
    })
  }

  function useEffectLihtc(): void {
    useLayerGroupEffect({
      map,
      data: lihtcData,
      showLayer: showLihtc,
      layerGroupName: 'lihtcLayerGroup',
      iconUrl: 'https://ev-map.s3.amazonaws.com/icons/home.png',
    })
  }

  function useEffectLibrary(): void {
    useLayerGroupEffect({
      map,
      data: LibraryData,
      showLayer: showLibrary,
      layerGroupName: 'libraryLayerGroup',
      iconUrl: 'https://ev-map.s3.amazonaws.com/icons/library.png',
    })
  }

  function useEffectSchool(): void {
    useLayerGroupEffect({
      map,
      data: schoolsData,
      showLayer: showSchool,
      layerGroupName: 'schoolLayerGroup',
      iconUrl: 'https://ev-map.s3.amazonaws.com/icons/school-bag.png',
    })
  }

  function useEffectWelcomeModal(): void {
    // console.log("useEffectWelcomModal called~~")
    useEffect(() => {
      const viewedWelcomeModal = sessionStorage.getItem('viewedWelcomeModal')
      if (!viewedWelcomeModal) {
        setOpenWelcomeModal(true)
        sessionStorage.setItem('viewedWelcomeModal', 'true')
      }
      const handleUnload = () => {
        sessionStorage.removeItem('viewedWelcomeModal')
      }
      window.addEventListener('beforeunload', handleUnload)
      return () => {
        window.removeEventListener('beforeunload', handleUnload)
      }
    }, [])
  }
}

export default Map

// const MemoizedMap = React.memo(Map)

// // Memoized MapWrapper Component
// const MapWrapper: React.FC = () => {
//   const { map, cityConfig } = useMapContext()
//   console.log("MapWrapper rendered")

//   return <MemoizedMap map={map} cityConfig={cityConfig} setCurrentView={() => {}} />
// }

// export default React.memo(MapWrapper)
