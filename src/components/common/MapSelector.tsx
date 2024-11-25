import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { Dropdown, DropdownProps } from 'semantic-ui-react'

import counties from '../../../public/jurisdictions.json'
import { MapContext } from '../Map/MapContextProvider'

type County = {
  id: string
  name: string
  available: boolean
  cities: City[]
}

type City = {
  id: string
  name: string
  available: boolean
  noUtilityData?: boolean
}

type MapSelectorProps = {
  startLoading?: () => void
}

const MapSelector = ({ startLoading }: MapSelectorProps) => {
  const context = useContext(MapContext)
  if (!context) throw new Error('MapSelector must be used within a MapContextProvider')
  const { setCityConfig } = context
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const router = useRouter()
  const isMapPage = router.pathname === '/map'

  const getCityConfig = async (county: string, city: string) => {
    const cityConfig = {
      city,
      county,
      boundaryUrl: `https://ev-map.s3.amazonaws.com/CA/${county}/${city}/${city}_city_boundary.geojson`,
      priorityDataUrl: `https://ev-map.s3.amazonaws.com/CA/${county}/${city}/${city}_priority.json`,
      feasibleDataUrl: `https://ev-map.s3.amazonaws.com/CA/${county}/${city}/${city}_feasibility.json`,
      transitStopsUrl: `https://ev-map.s3.amazonaws.com/CA/Co-location_points/CA_transit.geojson`,
      // parksAndRecreationUrl: `https://ev-map.s3.amazonaws.com/CA/${county}/${city}/${city}_parks.geojson`,
      parksAndRecreationUrl: `https://ev-map.s3.amazonaws.com/CA/Co-location_points/CA_parks/${county}_parks.geojson`,
      healthcareFacilitiesUrl: `https://ev-map.s3.amazonaws.com/CA/Co-location_points/CA_healthcare.geojson`,
      lihtcUrl: `https://ev-map.s3.amazonaws.com/CA/Co-location_points/CA_lihtc.geojson`,
      schoolsUrl: `https://ev-map.s3.amazonaws.com/CA/Co-location_points/CA_schools.geojson`,
      libraryUrl: `https://ev-map.s3.amazonaws.com/CA/Co-location_points/CA_libraries.geojson`,
    }
    setCityConfig(cityConfig)
  }

  const handleCountyChange = (_event: React.SyntheticEvent, data: DropdownProps) => {
    const currentCounty = counties.find(county => county.name === data.value)
    if (currentCounty) {
      setSelectedCounty(currentCounty)
      setCities(currentCounty.cities)

      if (currentCounty.name === 'San Francisco County') {
        const sanFranciscoCity = currentCounty.cities.find(city => city.name === 'San Francisco')
        if (sanFranciscoCity) {
          setSelectedCity(sanFranciscoCity)
        }
      }
    }
  }

  const handleCityChange = (_event: React.SyntheticEvent, data: DropdownProps) => {
    const currentCity = cities.find(city => city.name === data.value)
    if (currentCity) {
      setSelectedCity(currentCity)
    }
  }

  const handleButtonClick = async () => {
    if (selectedCounty && selectedCity) {
      await getCityConfig(
        selectedCounty.name.replace(/\s+/g, '_').toLowerCase(),
        selectedCity.name.replace(/\s+/g, '_').toLowerCase(),
      )
    }

    if (!isMapPage) {
      router.push('/map')
    } else {
      startLoading!()
    }
  }

  const showButton = selectedCounty && (selectedCounty.name === 'San Francisco County' || selectedCity)

  return (
    <div className="flex">
      <div className="w-1/3 pr-2">
        <Dropdown
          placeholder="Select County"
          fluid
          selection
          options={counties.map(county => ({
            key: county.id,
            text: county.name,
            value: county.name,
            disabled: !county.available,
          }))}
          onChange={handleCountyChange}
          className="text-primary"
        />
      </div>
      <div className="w-1/3 pr-2">
        {selectedCounty && selectedCounty?.name !== 'San Francisco County' && (
          <Dropdown
            placeholder="Select City"
            fluid
            selection
            options={cities.map(city => ({
              key: city.id,
              text: (
                <>
                  {city.name.startsWith('un_') ? 'Unincorporated' : city.name}
                  {city.noUtilityData && (
                    <span style={{ color: '#ffa500' }}> (utility data not yet available)</span>
                  )}
                </>
              ),
              value: city.name,
              disabled: !city.available,
            }))}
            onChange={handleCityChange}
          />
        )}
      </div>
      <div className="w-1/3 flex items-center justify-center">
        {showButton && (
          <button type="button" className="custom-button bg-primary text-white" onClick={handleButtonClick}>
            {isMapPage ? 'Load Map' : 'Go to Map'}
          </button>
        )}
      </div>
    </div>
  )
}

export default MapSelector
