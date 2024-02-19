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
import useLeaflet from './useLeaflet'
import * as turf from '@turf/turf';
import { FeatureCollection, Polygon, MultiPolygon, GeoJsonObject } from 'geojson';
import { GeoJSONData, LeafletMapContainer, CenterToMarkerButton, LocateButton, LeafletCluster, CustomMarker, DynamicGeoJSON, feasibleStyle, priorityStyle, GeoJSONFeature, GeoJSONFeaturePropertiesPriority, GeoJSONFeaturePropertiesFeasible } from './GeoJSONData'

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
  const [showPriorityData] = useState(true);
  const [showFeasibleData] = useState(true);
  const [ciScoreRange, setCiScoreRange] = useState([0, 0]);
  const [multiFaRange, setMultiFaRange] = useState([0, 0]);
  const [rentersRange, setRentersRange] = useState([0, 0]);
  const [walkableRange, setWalkableRange] = useState([0, 0]);
  const [drivableRange, setDrivableRange] = useState([0, 0]);
  const [neviOption, setNeviOption] = useState({ zero: false, one: false });
  const [pgeOption, setPgeOption] = useState({ zero: false, one: false });
  const [commercialOption, setCommercialOption] = useState({ zero: false, one: false });
  const [showTransitStops, setShowTransitStops] = useState(false);
  const [transitStopsData, setTransitStopsData] = useState<GeoJSONData | null>(null);
  const [showParksAndRecreation, setShowParksAndRecreation] = useState(false);
  const [parksAndRecreationData, setParksAndRecreationData] = useState<GeoJSONData | null>(null);
  const [showHealthcareFacilities, setShowHealthcareFacilities] = useState(false);
  const [healthcareFacilitiesData, setHealthcareFacilitiesData] = useState<GeoJSONData | null>(null);

  // Effects for fetching and filtering data
  const cityBoundaryGeoJSON = useEffectFetchCityBoundary();
  useEffectSetLayerData();
  useEffectSetTransitStopsLayerData(cityBoundaryGeoJSON);
  useEffectSetParksAndRecreationLayerData(cityBoundaryGeoJSON);
  useEffectSetHealthcareFacilitiesLayerData(cityBoundaryGeoJSON);
  useEffectCenterMap();
  useEffectPriorityData();  
  useEffectFeasibleData();
  useEffectTransitStops();
  useEffectParksAndRecreation();
  useEffectHealthCareFacilities(); 

  const mapHtml = <div>
    <div className="map-controls">
      {/* Priority Data Checkbox */}
      <label>
        {/* <input
      type="checkbox"
      checked={showPriorityData}
      onChange={() => setShowPriorityData(!showPriorityData)}
    /> */}
        <b>Priority Data</b>
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
              minDistance={5} />
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
              minDistance={5} />
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
              minDistance={5} />
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
              minDistance={5} />
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
              minDistance={5} />
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
        <b>Feasible Data</b>
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
                  onChange={() => setNeviOption({ ...neviOption, zero: !neviOption.zero })} />
                NEVI 0
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={neviOption.one}
                  onChange={() => setNeviOption({ ...neviOption, one: !neviOption.one })} />
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
                  onChange={() => setPgeOption({ ...pgeOption, zero: !pgeOption.zero })} />
                PGE 0
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={pgeOption.one}
                  onChange={() => setPgeOption({ ...pgeOption, one: !pgeOption.one })} />
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
                  onChange={() => setCommercialOption({ ...commercialOption, zero: !commercialOption.zero })} />
                Commercial 0
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={commercialOption.one}
                  onChange={() => setCommercialOption({ ...commercialOption, one: !commercialOption.one })} />
                Commercial 1
              </label>
            </div>
          </div>
        </>
      )}
      {/* Points of Interest Section */}
      <label>
        <b>Points of Interest</b>
      </label>
      <div className="checkbox-group">
        <div className="checkbox-column">
          <label>
            <input
              type="checkbox"
              checked={showTransitStops}
              onChange={() => setShowTransitStops(!showTransitStops)} />
            Transit Stops
          </label>
          <label>
            <input
              type="checkbox"
              checked={showParksAndRecreation}
              onChange={() => setShowParksAndRecreation(!showParksAndRecreation)} />
            Parks and Recreation
          </label>
          <label>
            <input
              type="checkbox"
              checked={showHealthcareFacilities}
              onChange={() => setShowHealthcareFacilities(!showHealthcareFacilities)} />
            Healthcare Facilities
          </label>
        </div>
      </div>
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
                  zoom={allMarkersBoundCenter.minZoom} />
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
                        position={marker.position} />
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
  return mapHtml;

  function useEffectFetchCityBoundary() {
    const [cityBoundaryGeoJSON, setCityBoundaryGeoJSON] = useState(null);
  
    useEffect(() => {
      const fetchBoundaryData = async () => {
        const boundaryData = await fetchCityBoundary(); 
        setCityBoundaryGeoJSON(boundaryData);
      };
  
      fetchBoundaryData();
    }, []);
  
    return cityBoundaryGeoJSON;
  }

  async function fetchCityBoundary() {
    try {
      const cityBoundaryResponse = await fetch('/oakland_city_limits.geojson');
      if (!cityBoundaryResponse.ok) {
        throw new Error(`Error fetching city boundary: ${cityBoundaryResponse.statusText}`);
      }
      const cityBoundaryGeoJSON = await cityBoundaryResponse.json();
      return cityBoundaryGeoJSON;
    } catch (error) {
      console.error("Could not fetch city boundary:", error);
      return null;
    }
  }  

  function useEffectSetLayerData() {
    useEffect(() => {
      const filterPriorityData = (data: GeoJSONData) => {
        return {
          ...data,
          features: data.features.filter((feature: GeoJSONFeature) => {
            const props = feature.properties as GeoJSONFeaturePropertiesPriority
            return (
              props.CIscoreP >= ciScoreRange[0] && props.CIscoreP <= ciScoreRange[1] &&
              props['# Multi-Fa'] >= multiFaRange[0] && props['# Multi-Fa'] <= multiFaRange[1] &&
              props['# Renters'] >= rentersRange[0] && props['# Renters'] <= rentersRange[1] &&
              props.walkable >= walkableRange[0] && props.walkable <= walkableRange[1] &&
              props.drivable >= drivableRange[0] && props.drivable <= drivableRange[1]
            )
          })
        }
      }

      const filterFeasibleData = (data: GeoJSONData) => {
        return {
          ...data,
          features: data.features.filter((feature: GeoJSONFeature) => {
            const props = feature.properties as GeoJSONFeaturePropertiesFeasible
            return (
              ((neviOption.zero && props.nevi === 0) || (neviOption.one && props.nevi === 1)) &&
              ((pgeOption.zero && props.pge === 0) || (pgeOption.one && props.pge === 1)) &&
              ((commercialOption.zero && props.commercial === 0) || (commercialOption.one && props.commercial === 1))
            )
          })
        }
      }

      const fetchAndFilterData = async () => {
        try {
          // Fetch and filter priority data
          const priorityResponse = await fetch('/priority.geojson')
          const priorityDataJson: GeoJSONData = await priorityResponse.json()
          const filteredPriorityData = filterPriorityData(priorityDataJson)
          setPriorityData(filteredPriorityData)

          // Fetch and filter feasible data
          const feasibleResponse = await fetch('/feasible.geojson')
          const feasibleDataJson: GeoJSONData = await feasibleResponse.json()
          const filteredFeasibleData = filterFeasibleData(feasibleDataJson)
          setFeasibleData(filteredFeasibleData)

        } catch (error) {
          console.error("Error fetching GeoJSON data:", error)
        }
      }
      fetchAndFilterData()
    }, [
      ciScoreRange, multiFaRange, rentersRange, walkableRange, drivableRange,
      neviOption, pgeOption, commercialOption
    ])
  }
  
  function useEffectSetTransitStopsLayerData(cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null) {
    useEffect(() => {
      const fetchAndFilterTransitStopsData = async () => {
        try {
          if (cityBoundaryGeoJSON && cityBoundaryGeoJSON.features.length > 0) {
            const transitStopsResponse = await fetch('./transit_stops.geojson');
            let transitStopsDataJson = await transitStopsResponse.json();
  
            transitStopsDataJson = {
              ...transitStopsDataJson,
              features: transitStopsDataJson.features.filter((feature: { geometry: turf.Coord }) => {
                const cityBoundaryFeature = cityBoundaryGeoJSON.features[0];
                return turf.booleanPointInPolygon(feature.geometry, cityBoundaryFeature.geometry);
              }),
            };
  
            console.log(transitStopsDataJson);
            setShowTransitStops(showTransitStops);
            setTransitStopsData(transitStopsDataJson);
          }
        } catch (error) {
          console.error("Error fetching GeoJSON data:", error);
        }
      };
      fetchAndFilterTransitStopsData();
    }, [showTransitStops, cityBoundaryGeoJSON]);
  }
  
  function useEffectSetParksAndRecreationLayerData(cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null) {
    useEffect(() => {
      const fetchAndFilterParksAndRecreationData = async () => {
        try {
          if (cityBoundaryGeoJSON && cityBoundaryGeoJSON.features.length > 0) {
            const parksAndRecreationResponse = await fetch('./parks_recreation.geojson');
            let parksAndRecreationDataJson = await parksAndRecreationResponse.json();
  
            parksAndRecreationDataJson = {
              ...parksAndRecreationDataJson,
              features: parksAndRecreationDataJson.features.filter((feature: { geometry: turf.Coord }) => {
                const cityBoundaryFeature = cityBoundaryGeoJSON.features[0];
                return turf.booleanPointInPolygon(feature.geometry, cityBoundaryFeature.geometry);
              }),
            };
  
            console.log(parksAndRecreationDataJson);
            setShowParksAndRecreation(showParksAndRecreation);
            setParksAndRecreationData(parksAndRecreationDataJson);
          }
        } catch (error) {
          console.error("Error fetching GeoJSON data:", error);
        }
      };
      fetchAndFilterParksAndRecreationData();
    }, [showParksAndRecreation, cityBoundaryGeoJSON]);
  }  

  function useEffectSetHealthcareFacilitiesLayerData(cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null) {
    useEffect(() => {
      const fetchAndFilterHealthcareFacilitiesData = async () => {
        try {
          if (cityBoundaryGeoJSON && cityBoundaryGeoJSON.features.length > 0) {
            const healthcareFacilitiesResponse = await fetch('./healthcare_facilities.geojson');
            let healthcareFacilitiesDataJson = await healthcareFacilitiesResponse.json();
  
            healthcareFacilitiesDataJson = {
              ...healthcareFacilitiesDataJson,
              features: healthcareFacilitiesDataJson.features.filter((feature: { geometry: turf.Coord }) => {
                const cityBoundaryFeature = cityBoundaryGeoJSON.features[0];
                return turf.booleanPointInPolygon(feature.geometry, cityBoundaryFeature.geometry);
              }),
            };
  
            console.log(healthcareFacilitiesDataJson);
            setShowHealthcareFacilities(showHealthcareFacilities);
            setHealthcareFacilitiesData(healthcareFacilitiesDataJson);
          }
        } catch (error) {
          console.error("Error fetching GeoJSON data:", error);
        }
      };
      fetchAndFilterHealthcareFacilitiesData();
    }, [showHealthcareFacilities, cityBoundaryGeoJSON]);
  }

  function useEffectCenterMap() {
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

  function useEffectPriorityData() {
    useEffect(() => {
      if (!map || !priorityData || !L) {
        return
      }

      let priorityLayerGroup = (map as any).priorityLayerGroup as L.LayerGroup | undefined

      if (!priorityLayerGroup) {
        priorityLayerGroup = new L.LayerGroup().addTo(map);
        (map as any).priorityLayerGroup = priorityLayerGroup
      } else {
        priorityLayerGroup.clearLayers()
      }

      const addGeoJsonLayerToGroup = (geoJsonData: GeoJSONData | GeoJsonObject | GeoJsonObject[] | undefined, style: { color: string; weight: number; opacity: number} ) => {
        if (priorityLayerGroup) {
          const layer = L.geoJSON(geoJsonData, { style })
          priorityLayerGroup.addLayer(layer)
        } else {
          console.error('priorityLayerGroup is not initialized.')
        }
      }

      if (showPriorityData) {
        addGeoJsonLayerToGroup(priorityData, priorityStyle)
      }

      return () => {
        if (priorityLayerGroup) {
          priorityLayerGroup.clearLayers()
          map.removeLayer(priorityLayerGroup);
          (map as any).priorityLayerGroup = undefined
        }
      }
    }, [priorityData])
  }

  function useEffectFeasibleData() {
    useEffect(() => {
      if (!map || !feasibleData || !L) {
        return
      }

      let feasibleLayerGroup = (map as any).feasibleLayerGroup as L.LayerGroup | undefined

      if (!feasibleLayerGroup) {
        feasibleLayerGroup = new L.LayerGroup().addTo(map);
        (map as any).feasibleLayerGroup = feasibleLayerGroup
      } else {
        feasibleLayerGroup.clearLayers()
      }

      const addGeoJsonLayerToGroup = (geoJsonData: GeoJSONData | GeoJsonObject | GeoJsonObject[] | undefined, style: { color: string; weight: number; opacity: number} ) => {
        if (feasibleLayerGroup) {
          const layer = L.geoJSON(geoJsonData, { style })
          feasibleLayerGroup.addLayer(layer)
        } else {
          console.error('feasibleLayerGroup is not initialized.')
        }
      }

      if (showFeasibleData) {
        addGeoJsonLayerToGroup(feasibleData, feasibleStyle)
      }

      return () => {
        if (feasibleLayerGroup) {
          feasibleLayerGroup.clearLayers()
          map.removeLayer(feasibleLayerGroup);
          (map as any).feasibleLayerGroup = undefined
        }
      }
    }, [feasibleData])
  }

  function useEffectTransitStops(): void {
    useEffect(() => {
      if (!map || !transitStopsData || !L) {
        return
      }
      let transitStopsLayerGroup = (map as any).transitStopsLayerGroup as L.LayerGroup | undefined

      if (showTransitStops) {
        const transitStopsIcon = L.icon({
          iconUrl: 'vehicles.png',
          iconSize: [16, 16],
          iconAnchor: [22, 94],
          popupAnchor: [-3, -76]
        })
        if (!transitStopsLayerGroup) {
          transitStopsLayerGroup = new L.LayerGroup().addTo(map);
          (map as any).transitStopsLayerGroup = transitStopsLayerGroup
        } else {
          transitStopsLayerGroup.clearLayers()
        }

        const layer = L.geoJSON(transitStopsData, {
          style: { color: "#ff7800", weight: 1, opacity: 1 },
          pointToLayer: function (_feature, latlng) {
            return L.marker(latlng, { icon: transitStopsIcon })
          }
        })
        transitStopsLayerGroup.addLayer(layer)
      } else {
        if (transitStopsLayerGroup) {
          transitStopsLayerGroup.clearLayers()
          map.removeLayer(transitStopsLayerGroup);
          (map as any).transitStopsLayerGroup = undefined
        }
      }
    }, [showTransitStops, transitStopsData])
  }

  function useEffectParksAndRecreation(): void {
    useEffect(() => {
      if (!map || !parksAndRecreationData || !L) {
        return
      }
      let parksAndRecreationLayerGroup = (map as any).parksAndRecreationLayerGroup as L.LayerGroup | undefined

      if (showParksAndRecreation) {
        const parksAndRecreationIcon = L.icon({
          iconUrl: 'bench.png',
          iconSize: [16, 16],
          iconAnchor: [22, 94],
          popupAnchor: [-3, -76]
        })
        if (!parksAndRecreationLayerGroup) {
          parksAndRecreationLayerGroup = new L.LayerGroup().addTo(map);
          (map as any).parksAndRecreationLayerGroup = parksAndRecreationLayerGroup
        } else {
          parksAndRecreationLayerGroup.clearLayers()
        }

        const layer = L.geoJSON(parksAndRecreationData, {
          style: { color: "#ff7800", weight: 1, opacity: 1 },
          pointToLayer: function (_feature, latlng) {
            return L.marker(latlng, { icon: parksAndRecreationIcon })
          }
        })
        parksAndRecreationLayerGroup.addLayer(layer)
      } else {
        if (parksAndRecreationLayerGroup) {
          parksAndRecreationLayerGroup.clearLayers()
          map.removeLayer(parksAndRecreationLayerGroup);
          (map as any).parksAndRecreationLayerGroup = undefined
        }
      }
    }, [showParksAndRecreation, parksAndRecreationData])
  }

  function useEffectHealthCareFacilities(): void {
    useEffect(() => {
      if (!map || !healthcareFacilitiesData || !L) {
        return
      }
      let healthcareFacilitiesLayerGroup = (map as any).healthcareFacilitiesLayerGroup as L.LayerGroup | undefined

      if (showHealthcareFacilities) {
        const healthcareFacilitiesIcon = L.icon({
          iconUrl: 'first-aid-kit.png',
          iconSize: [16, 16],
          iconAnchor: [22, 94],
          popupAnchor: [-3, -76]
        })
        if (!healthcareFacilitiesLayerGroup) {
          healthcareFacilitiesLayerGroup = new L.LayerGroup().addTo(map);
          (map as any).healthcareFacilitiesLayerGroup = healthcareFacilitiesLayerGroup
        } else {
          healthcareFacilitiesLayerGroup.clearLayers()
        }

        const layer = L.geoJSON(healthcareFacilitiesData, {
          style: { color: "#ff7800", weight: 1, opacity: 1 },
          pointToLayer: function (_feature, latlng) {
            return L.marker(latlng, { icon: healthcareFacilitiesIcon })
          }
        })
        healthcareFacilitiesLayerGroup.addLayer(layer)
      } else {
        if (healthcareFacilitiesLayerGroup) {
          healthcareFacilitiesLayerGroup.clearLayers()
          map.removeLayer(healthcareFacilitiesLayerGroup);
          (map as any).healthcareFacilitiesLayerGroup = undefined
        }
      }
    }, [showHealthcareFacilities, healthcareFacilitiesData])
  }
};

// pass through to get context in <MapInner>
const Map = () => (
  <MapContextProvider>
    <MapInner />
  </MapContextProvider>
)

export default Map
