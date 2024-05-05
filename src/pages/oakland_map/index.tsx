import Head from 'next/head'

import Map from '@components/Map'

const OaklandMapPage = () => {
  const oaklandConfig = {
    boundaryUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/oakland_city_limits.geojson',
    priorityDataUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/Oakland_Pixels.geojson',
    feasibleDataUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/Oakland_Pixels.geojson',
    transitStopsUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/bart_oakland.geojson',
    parksAndRecreationUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/parks_recreation.geojson',
    healthcareFacilitiesUrl:
      'https://ev-charging-mapviewer-assets.s3.amazonaws.com/healthcare_facilities.geojson',
    lihtcUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/LIHTC.geojson',
    schoolsUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/SchoolSites.geojson',
    position: [37.8044, -122.2712] as [number, number],
  }
  console.log('oaklandConfig', oaklandConfig)
  return (
    <div>
      <Head>
        <title>EV Charging Locations - Map 🤩</title>
        <meta property="og:title" content="Oakland EV Charging Locations - Map" key="title" />
        <meta
          name="description"
          content="Explore electric vehicle (EV) charging locations in Oakland. View priority and feasible areas for new installations and existing infrastructure."
        />
      </Head>
      <Map cityConfig={oaklandConfig} />
    </div>
  )
}

export default OaklandMapPage
