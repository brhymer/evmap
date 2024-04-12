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

  const [popRange, setPopRange] = useState<Range>([0, 0])
  const [ciScoreRange, setCiScoreRange] = useState<Range>([0, 0])
  const [levRange, setLevRange] = useState<Range>([0, 0])
  const [multiFaRange, setMultiFaRange] = useState<Range>([0, 0])
  const [rentersRange, setRentersRange] = useState<Range>([0, 0])
  const [walkableRange, setWalkableRange] = useState<Range>([0, 0])
  const [drivableRange, setDrivableRange] = useState<Range>([0, 0])
  const [commercialRange, setCommercialRange] = useState<Range>([0, 0])
  const [residentialRange, setResidentialRange] = useState<Range>([0, 0])
  const [neviFilterActive, setNeviFilterActive] = useState({ zero: true, one: true })
  const [pgeFilterActive, setPgeFilterActive] = useState({ zero: true, one: true })
  const resetSliders = () => {
    setPopRange([0, 200])
    setCiScoreRange([0, 100])
    setLevRange([0, 2000])
    setMultiFaRange([0, 100])
    setRentersRange([0, 100])
    setWalkableRange([0, 100])
    setDrivableRange([0, 100])
    setCommercialRange([0, 100])
    setResidentialRange([0, 100])
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
        const tolerance = 0.01 // Adjust for performance vs accuracy
        const simplifiedCityBoundary =
          cityBoundaryGeoJSON && cityBoundaryGeoJSON.features.length > 0
            ? turf.simplify(cityBoundaryGeoJSON.features[0], { tolerance, highQuality: false })
            : null

        return {
          ...data,
          features: data.features.filter((feature: GeoJSONFeature) => {
            const props = feature.properties
            const withinPropertyCriteria =
              props.Pop >= multiFaRange[0] &&
              props.Pop <= popRange[1] &&
              props.CIscoreP >= ciScoreRange[0] &&
              props.CIscoreP <= ciScoreRange[1] &&
              props.lev_10000 >= levRange[0] &&
              props.lev_10000 <= levRange[1] &&
              props['# Multi-Fa'] >= multiFaRange[0] &&
              props['# Multi-Fa'] <= multiFaRange[1] &&
              props['# Renters'] >= rentersRange[0] &&
              props['# Renters'] <= rentersRange[1] &&
              props.zoning_com >= commercialRange[0] / 100 &&
              props.zoning_com <= commercialRange[1] / 100 &&
              props.zoning_res >= residentialRange[0] / 100 &&
              props.zoning_res <= residentialRange[1] / 100 &&
              props.walkable >= walkableRange[0] &&
              props.walkable <= walkableRange[1] &&
              props.drivable >= drivableRange[0] &&
              props.drivable <= drivableRange[1] &&
              ((neviFilterActive.zero && props.nevi === 0) || (neviFilterActive.one && props.nevi === 1)) &&
              ((pgeFilterActive.zero && props.pge === 0) || (pgeFilterActive.one && props.pge === 1))

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
      pgeFilterActive,
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
                  onChangeComplete={(color: { hex: any }) =>
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
          {/* CI Score Slider */}
          {toggleCiRange && (
            <label>
              <br />
              {/* CalEnviroScreen4.0 percentile: {ciScoreRange[0]} to {ciScoreRange[1]} */}
              CalEnviroScreen4.0 percentile
              <Slider
                min={0}
                max={100}
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
                minDistance={5}
              />
            </label>
          )}
          {/* LEV Slider */}
          {toggleLevRange && (
            <label>
              <br />
              LEVs/10000: {levRange[0]} to {levRange[1]}
              <Slider
                min={0}
                max={2000}
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
                minDistance={50}
              />
            </label>
          )}
          {/* Multi-Fa Slider */}
          {toggleMultiFaRange && (
            <label>
              {/* <br /># Multi-Fa: {multiFaRange[0]} to {multiFaRange[1]} */}
              <br /># Multifamily residents/pixel
              <Slider
                min={0}
                max={100}
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
                minDistance={5}
              />
            </label>
          )}
          {/* Renters Slider */}
          {toggleRentersRange && (
            <label>
              {/* <br /># Renters: {rentersRange[0]} to {rentersRange[1]} */}
              <br /># Renters/pixel
              <Slider
                min={0}
                max={100}
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
                minDistance={5}
              />
            </label>
          )}
          {/* Walkable Slider */}
          {toggleWalkableRange && (
            <label>
              <br />
              {/* Walkable: {walkableRange[0]} to {walkableRange[1]} */}
              Walk score: L2 charger
              <Slider
                min={0}
                max={100}
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
                minDistance={5}
              />
            </label>
          )}
          {/* Drivable Slider */}
          {toggleDrivableRange && (
            <label>
              <br />
              {/* Drivable: {drivableRange[0]} to {drivableRange[1]} */}
              Drive score: DC fast charger
              <Slider
                min={0}
                max={100}
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
                minDistance={5}
              />
            </label>
          )}
          {/* Population Slider */}
          {togglePopRange && (
            <label>
              <br />
              {/* Population in pixels: {popRange[0]} to {popRange[1]} */}
              Total population/pixel
              <Slider
                min={0}
                max={200}
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
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined
                  },
                ) => <div {...props}>{state.valueNow}</div>}
                pearling
                minDistance={5}
              />
            </label>
          )}
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
          {togglePgeFilterActive && (
            <div className="checkbox-group">
              {/* PGE Checkboxes */}
              <div className="checkbox-column">
                <br />
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <Toggle
                    checked={pgeFilterActive.one && !pgeFilterActive.zero}
                    onChange={() => {
                      const currentlyShowingOnlyOne = pgeFilterActive.one && !pgeFilterActive.zero
                      if (currentlyShowingOnlyOne) {
                        setPgeFilterActive({ zero: true, one: true })
                      } else {
                        setPgeFilterActive({ zero: false, one: true })
                      }
                    }}
                    icons={false}
                  />
                  <span style={{ marginLeft: '20px' }}>Grid Capacity (200ft/600kw)</span>
                </label>
              </div>
            </div>
          )}
          {/* Commercial Zoning Slider */}
          {toggleCommercialRange && (
            <label>
              <br />
              {/* Commercial Zoning %: {commercialRange[0]} to {commercialRange[1]} */}
              Commercial zoning %/pixel
              <Slider
                min={0}
                max={100}
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
                minDistance={5}
              />
            </label>
          )}
          {/* Residential Zoning Slider */}
          {toggleResidentialRange && (
            <label>
              <br />
              {/* Multifamily Residential Zoning %: {residentialRange[0]} to {residentialRange[1]} */}
              Multifamily zoning %/pixel
              <Slider
                min={0}
                max={100}
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
                minDistance={5}
              />
            </label>
          )}
        </>
      )}
      {/* {showLayerData && layerData && (
              <DynamicGeoJSON data={layerData} style={layerStyle} />
            )} */}
    </div>
  )
}
