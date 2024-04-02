import Head from 'next/head'

import Map from '@components/Map'

const MapPage = () => (
  <div>
    <Head>
      <title>EV Charging Locations - Map 🤩</title>
      <meta property="og:title" content="EV Charging Locations - Map 🤩" key="title" />
      <meta name="description" content="EV Charging Locations - Map" />
    </Head>
    <Map />
  </div>
)

export default MapPage
