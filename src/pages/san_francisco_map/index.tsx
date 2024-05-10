import Head from 'next/head'

import Map from '@components/Map'

const SanFranciscoMapPage = () => {
  const sanfranciscoConfig = {
    boundaryUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/SF_CityBoundary.geojson',
    priorityDataUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/sf_priorityMay24.json',
    feasibleDataUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/sf_priorityMay24.json',
    transitStopsUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/bart_oakland.geojson',
    parksAndRecreationUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/SF_parks-2.geojson',
    healthcareFacilitiesUrl:
      'https://ev-charging-mapviewer-assets.s3.amazonaws.com/San_Francisco_Healthcare_Facilities.geojson',
    lihtcUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/SF_LIHTC_converted.geojson',
    schoolsUrl:
      'https://ev-charging-mapviewer-assets.s3.amazonaws.com/SchoolSites1920_-8485697552074815990.geojson',
    libraryUrl: 'https://ev-charging-mapviewer-assets.s3.amazonaws.com/sf_libraries.geojson',
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
