import Head from 'next/head'

import Map from '@components/Map'

const SanFranciscoMapPage = () => {
  const sanfranciscoConfig = {
    boundaryUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/oakland_city_limits.geojson',
    priorityDataUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/oakland_priority.geojson',
    feasibleDataUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/oakland_feasible.geojson',
    transitStopsUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/bart_oakland.geojson',
    parksAndRecreationUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/parks_recreation.geojson',
    healthcareFacilitiesUrl:
      'https://ev-charging-mapviewer-assets.s3.amazonaws.com/healthcare_facilities.geojson',
    lihtcUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/LIHTC.geojson',
    schoolsUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/SchoolSites.geojson',
    position: [37.7749, -122.4194] as [number, number],
    // 🚨 position for San Francisco needs to be updated
  }

  return (
    <div>
      <Head>
        <title>EV Charging Locations - Map 🤩</title>
        <meta property="og:title" content="San Francisco EV Charging Locations - Map" key="title" />
        <meta
          name="description"
          content="Explore electric vehicle (EV) charging locations in San Francisco. View priority and feasible areas for new installations and existing infrastructure."
        />
      </Head>
      <Map cityConfig={sanfranciscoConfig} />
    </div>
  )
}

export default SanFranciscoMapPage
