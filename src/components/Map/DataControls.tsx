/* eslint-disable no-console */

/* eslint-disable jsx-a11y/label-has-associated-control */

/* eslint-disable react/button-has-type */

/* eslint-disable jsx-a11y/control-has-associated-label */

/* eslint-disable consistent-return */

/* eslint-disable @typescript-eslint/no-shadow */

/* eslint-disable import/no-cycle */

/* eslint-disable import/no-extraneous-dependencies */
import * as turf from '@turf/turf'
import { FeatureCollection, MultiPolygon, Point, Polygon } from 'geojson'
import React, { useEffect, useRef, useState } from 'react'
import { SketchPicker } from 'react-color'
import Slider from 'react-slider'
import Toggle from 'react-toggle'

import { Range } from '.'
import { GeoJSONData, GeoJSONFeature } from './GeoJSONData'

interface DataControlsProps {
  dataControlsTitle: string
  map: any
  L: any
  cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null
  color: any
  geojsonUrl: string
  onDataUpdate: any
  config: any
}
export const DataControls: React.FC<DataControlsProps> = ({
  dataControlsTitle,
  map,
  L,
  cityBoundaryGeoJSON,
  color,
  geojsonUrl,
  onDataUpdate,
  config,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const [layerData, setLayerData] = useState<GeoJSONData | null>(null)
  const [showLayerData] = useState(true)
  const layerGroupId = useRef(`layerGroup-${dataControlsTitle}`).current
  const [layerStyle, setLayerStyle] = useState<{ color: any; weight?: number; opacity?: number }>({
    color,
    weight: 1,
    opacity: 0.5,
  })
  const [showColorPicker, setShowColorPicker] = useState(false)

  const popMax = 200
  const ciScoreMax = 100
  const levMax = 1000
  const multiFaMax = 100
  const rentersMax = 100
  const walkableMax = 100
  const drivableMax = 100
  const commercialMax = 100
  const residentialMax = 100
  const pgeMax = 3000
  const [popRange, setPopRange] = useState<Range>([0, popMax])
  const [ciScoreRange, setCiScoreRange] = useState<Range>([0, ciScoreMax])
  const [levRange, setLevRange] = useState<Range>([0, levMax])
  const [multiFaRange, setMultiFaRange] = useState<Range>([0, multiFaMax])
  const [rentersRange, setRentersRange] = useState<Range>([0, rentersMax])
  const [walkableRange, setWalkableRange] = useState<Range>([0, walkableMax])
  const [drivableRange, setDrivableRange] = useState<Range>([0, drivableMax])
  const [commercialRange, setCommercialRange] = useState<Range>([0, commercialMax])
  const [residentialRange, setResidentialRange] = useState<Range>([0, residentialMax])
  const [neviFilterActive, setNeviFilterActive] = useState({ zero: true, one: true })
  const [irs30cFilterActive, setIrs30cFilterActive] = useState({ zero: true, one: true })
  const [pgeRange, setPgeRange] = useState<Range>([0, 0])

  const resetSliders = () => {
    setPopRange([0, popMax])
    setCiScoreRange([0, ciScoreMax])
    setLevRange([0, levMax])
    setMultiFaRange([0, multiFaMax])
    setRentersRange([0, rentersMax])
    setWalkableRange([0, walkableMax])
    setDrivableRange([0, drivableMax])
    setCommercialRange([0, commercialMax])
    setResidentialRange([0, residentialMax])
    setPgeRange([0, pgeMax])
  }

  const {
    togglePopRange,
    toggleCiRange,
    toggleLevRange,
    toggleMultiFaRange,
    toggleRentersRange,
    toggleWalkableRange,
    toggleDrivableRange,
    toggleCommercialRange,
    toggleResidentialRange,
    toggleNeviFilterActive,
    toggleirs30cFilterActive,
    togglePgeFilterActive,
  } = config

  useEffect(() => {
    if (isFirstLoad) {
      resetSliders()
      setLayerStyle({ ...layerStyle, color })
      setIsFirstLoad(false)
    }
  }, [isFirstLoad, resetSliders])

  const toggleExpand = () => setIsExpanded(!isExpanded)

  function useEffectSetLayerData(cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null) {
    useEffect(() => {
      const filterData = (
        data: GeoJSONData,
        cityBoundaryGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null,
      ): GeoJSONData => {
        const tolerance = 0.00001 // Adjust for performance vs accuracy
        const simplifiedCityBoundary = // cityBoundaryGeoJSON
          cityBoundaryGeoJSON && cityBoundaryGeoJSON.features.length > 0
            ? turf.simplify(cityBoundaryGeoJSON.features[0], { tolerance, highQuality: false })
            : null

        return {
          ...data,
          features: data.features.filter((feature: GeoJSONFeature) => {
            const props = feature.properties
            const withinPropertyCriteria =
              props.pop >= popRange[0] &&
              (props.pop <= popRange[1] || popRange[1] === popMax) &&
              props.CIscoreP >= ciScoreRange[0] &&
              (props.CIscoreP <= ciScoreRange[1] || ciScoreRange[1] === ciScoreMax) &&
              props.lev_10000 >= levRange[0] &&
              (props.lev_10000 <= levRange[1] || levRange[1] === levMax) &&
              props['Multi-Family Housing Residents'] >= multiFaRange[0] &&
              (props['Multi-Family Housing Residents'] <= multiFaRange[1] ||
                multiFaRange[1] === multiFaMax) &&
              props.Renters >= rentersRange[0] &&
              (props.Renters <= rentersRange[1] || rentersRange[1] === rentersMax) &&
              props.zoning_commercial >= commercialRange[0] / 100 &&
              (props.zoning_commercial <= commercialRange[1] / 100 || commercialRange[1] === commercialMax) &&
              props.zoning_residential_multi_family >= residentialRange[0] / 100 &&
              (props.zoning_residential_multi_family <= residentialRange[1] / 100 ||
                residentialRange[1] === residentialMax) &&
              props.chg_walk >= walkableRange[0] &&
              (props.chg_walk <= walkableRange[1] || walkableRange[1] === walkableMax) &&
              props.chg_drive >= drivableRange[0] &&
              (props.chg_drive <= drivableRange[1] || drivableRange[1] === drivableMax) &&
              ((neviFilterActive.zero && props.nevi === 0) || (neviFilterActive.one && props.nevi === 1)) &&
              ((irs30cFilterActive.zero && props.irs30c === 0) ||
                (irs30cFilterActive.one && props.irs30c === 1)) &&
              props.pge >= pgeRange[0] &&
              (props.pge <= pgeRange[1] || pgeRange[1] === pgeMax)
            if (!withinPropertyCriteria) {
              return false
            }

            if (simplifiedCityBoundary) {
              const { geometry } = feature
              if (geometry.type === 'Point') {
                return turf.booleanPointInPolygon(geometry as unknown as Point, simplifiedCityBoundary)
              }
              if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                const simplifiedGeometry = turf.simplify(geometry, { tolerance, highQuality: false })
                return (
                  turf.booleanOverlap(simplifiedGeometry, simplifiedCityBoundary) ||
                  turf.booleanContains(simplifiedCityBoundary, simplifiedGeometry) ||
                  turf.booleanWithin(simplifiedGeometry, simplifiedCityBoundary)
                )
              }
              return false
            }
            return true
          }),
        }
      }

      const fetchAndFilterData = async () => {
        try {
          const response = await fetch(geojsonUrl)
          const dataJson: GeoJSONData = await response.json()
          const filteredData = filterData(dataJson, cityBoundaryGeoJSON)
          onDataUpdate(filteredData)
          setLayerData(filteredData)
        } catch (error) {
          console.error('Error fetching GeoJSON data:', error)
        }
      }
      fetchAndFilterData()
    }, [
      popRange,
      ciScoreRange,
      levRange,
      multiFaRange,
      rentersRange,
      walkableRange,
      drivableRange,
      neviFilterActive,
      irs30cFilterActive,
      pgeRange,
      commercialRange,
      residentialRange,
      cityBoundaryGeoJSON,
    ])
  }

  function useEffectLayerData() {
    useEffect(() => {
      if (!map || !layerData || !L) {
        return
      }

      const layerGroupName = `${dataControlsTitle.replace(/\s+/g, '')}LayerGroup`
      let layerGroup = map[layerGroupName] as L.LayerGroup | undefined

      if (!layerGroup) {
        layerGroup = new L.LayerGroup().addTo(map)
        map[layerGroupName] = layerGroup
      } else {
        layerGroup.clearLayers()
      }

      const addGeoJsonLayerToGroup = () => {
        if (layerGroup) {
          layerGroup.clearLayers()
          const layer = L.geoJSON(layerData, { style: layerStyle })
          layerGroup.addLayer(layer)
        }
      }

      if (showLayerData && layerData) {
        addGeoJsonLayerToGroup()
      }

      return () => {
        if (layerGroup) {
          layerGroup.clearLayers()
          map.removeLayer(layerGroup)
          delete map[layerGroupName]
        }
      }
    }, [map, L, layerData, showLayerData, layerStyle, dataControlsTitle])
  }

  useEffectSetLayerData(cityBoundaryGeoJSON)
  useEffectLayerData()
  return (
    <div className="priority-data-controls">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowColorPicker(show => !show)}
              style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              <div className="color-picker" style={{ backgroundColor: layerStyle.color }} />
            </button>
            {showColorPicker && (
              <div className="sketch-picker">
                <SketchPicker
                  color={layerStyle.color}
                  onChangeComplete={(color: { hex: unknown }) =>
                    setLayerStyle({ ...layerStyle, color: color.hex })
                  }
                />
              </div>
            )}
          </div>
          <b style={{ marginLeft: '10px' }}>{dataControlsTitle}</b>
        </div>
        {isExpanded && (
          <button
            onClick={resetSliders}
            className="reset-sliders-btn"
            style={{ backgroundColor: layerStyle.color }}
          >
            Reset Sliders
          </button>
        )}
        <button onClick={toggleExpand} style={{ padding: '5px 10px' }}>
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      {showLayerData && isExpanded && (
        <>
          {/* {layerData && (
                      <GeoJSONLayer data={layerData} style={{ color: color }} />
                    )} */}
          {/* Population Slider */}
          {togglePopRange && (
            <label>
              <br />
              Population in pixel: {popRange[0]} to {popRange[1] === popMax ? '∞' : popRange[1]}
              <Slider
                min={0}
                max={popMax}
                value={popRange}
                onChange={setPopRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* CI Score Slider */}
          {toggleCiRange && (
            <label>
              <br />
              {/* CalEnviroScreen4.0 percentile: {ciScoreRange[0]} to {ciScoreRange[1]} */}
              CalEnviroScreen4.0 percentile: {ciScoreRange[0]} to {ciScoreRange[1]}
              <Slider
                min={0}
                max={ciScoreMax}
                value={ciScoreRange}
                onChange={setCiScoreRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* LEV Slider */}
          {toggleLevRange && (
            <label>
              <br />
              LEVs/10000: {levRange[0]} to {levRange[1] === levMax ? '∞' : levRange[1]}
              <Slider
                min={0}
                max={levMax}
                value={levRange}
                onChange={setLevRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* Multi-Fa Slider */}
          {toggleMultiFaRange && (
            <label>
              <br /># Multifamily residents/pixel: {multiFaRange[0]} to{' '}
              {multiFaRange[1] === multiFaMax ? '∞' : multiFaRange[1]}
              <Slider
                min={0}
                max={multiFaMax}
                value={multiFaRange}
                onChange={setMultiFaRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* Renters Slider */}
          {toggleRentersRange && (
            <label>
              <br /># Renters/pixel: {rentersRange[0]} to{' '}
              {rentersRange[1] === rentersMax ? '∞' : rentersRange[1]}
              <Slider
                min={0}
                max={rentersMax}
                value={rentersRange}
                onChange={setRentersRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* Walkable Slider */}
          {toggleWalkableRange && (
            <label>
              <br />
              L2 chargers within 10 min walk: {walkableRange[0]} to{' '}
              {walkableRange[1] === walkableMax ? '∞' : walkableRange[1]}
              <Slider
                min={0}
                max={walkableMax}
                value={walkableRange}
                onChange={setWalkableRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* Drivable Slider */}
          {toggleDrivableRange && (
            <label>
              <br />
              DCF chargers within 10 min drive: {drivableRange[0]} to{' '}
              {drivableRange[1] === drivableMax ? '∞' : drivableRange[1]}
              <Slider
                min={0}
                max={drivableMax}
                value={drivableRange}
                onChange={setDrivableRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* Commercial Zoning Slider */}
          {toggleCommercialRange && (
            <label>
              <br />
              Commercial Zoning %: {commercialRange[0]} to {commercialRange[1]}
              <Slider
                min={0}
                max={commercialMax}
                value={commercialRange}
                onChange={setCommercialRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* Residential Zoning Slider */}
          {toggleResidentialRange && (
            <label>
              <br />
              Multifamily Residential Zoning %: {residentialRange[0]} to {residentialRange[1]}
              <Slider
                min={0}
                max={residentialMax}
                value={residentialRange}
                onChange={setResidentialRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          {/* Pge Slider */}
          {togglePgeFilterActive && (
            <label>
              <br />
              PG&E load capacity through pixel (kW): {pgeRange[0]} to{' '}
              {pgeRange[1] === pgeMax ? '∞' : pgeRange[1]}
              <Slider
                min={0}
                max={pgeMax}
                value={pgeRange}
                onChange={setPgeRange}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                renderThumb={(
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLDivElement> &
                    React.HTMLAttributes<HTMLDivElement>,
                  state: {
                    valueNow:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={0}
              />
            </label>
          )}
          <br />
          {toggleNeviFilterActive && (
            <div className="checkbox-group">
              {/* NEVI Checkboxes */}
              <div className="checkbox-column">
                <br />
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <Toggle
                    checked={neviFilterActive.one && !neviFilterActive.zero}
                    onChange={() => {
                      const currentlyShowingOnlyOne = neviFilterActive.one && !neviFilterActive.zero
                      if (currentlyShowingOnlyOne) {
                        setNeviFilterActive({ zero: true, one: true })
                      } else {
                        setNeviFilterActive({ zero: false, one: true })
                      }
                    }}
                    icons={false}
                  />
                  <span style={{ marginLeft: '20px' }}>NEVI Eligible</span>
                </label>
              </div>
            </div>
          )}
          {toggleirs30cFilterActive && (
            <div className="checkbox-group">
              {/* IRS Checkboxes */}
              <div className="checkbox-column">
                <br />
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <Toggle
                    checked={irs30cFilterActive.one && !irs30cFilterActive.zero}
                    onChange={() => {
                      const currentlyShowingOnlyOne = irs30cFilterActive.one && !irs30cFilterActive.zero
                      if (currentlyShowingOnlyOne) {
                        setIrs30cFilterActive({ zero: true, one: true })
                      } else {
                        setIrs30cFilterActive({ zero: false, one: true })
                      }
                    }}
                    icons={false}
                  />
                  <span style={{ marginLeft: '20px' }}>IRS 30C Eligible</span>
                </label>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
