import { Leaf } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'

import NavMenu from '@components/common/NavMenu'

import { AppConfig } from '@lib/AppConfig'

const Home = () => (
  <div className="container mx-auto max-w-2xl max-md:max-w-none p-3">
    <Head>
      <title>EV Equity Mapping Platform</title>
      <meta property="og:title" content="EV Equity Mapping Platform" key="title" />
      <meta name="description" content="" />
    </Head>
    <header className="mt-10 items-top gap-4 md:flex">
      {/* <span className="text-primary">
        <Leaf size={AppConfig.ui.bigIconSize} className="mt-2" />
      </span> */}
      <div>
        {/* <h2 className="text-4xl font-bold ">Next.js starter for leaflet-react</h2>
        <h3 className="text-3xl mb-16">written in Typescript</h3> */}
      </div>
    </header>
    <section>
      {/* <p className="mb-2">
        <span>An extensible </span>
        <Link className="text-primary" target="_blank" href="https://nextjs.org/">
          next.js
        </Link>
        <span> starter for the </span>
        <Link className="text-primary" target="_blank" href="https://react-leaflet.js.org/">
          leaflet-react
        </Link>
        <span> plugin. Written in </span>
        <Link className="text-primary" target="_blank" href="https://www.typescriptlang.org/">
          typescript
        </Link>
        <span>, visually enhanced by </span>
        <Link className="text-primary" target="_blank" href="https://tailwindcss.com/">
          tailwind
        </Link>
        <span> and </span>
        <Link className="text-primary" target="_blank" href="https://lucide.dev/">
          lucide icons
        </Link>
        <span>. ✨</span>
      </p> */}
      <p className="my-3">
        {/* <span> 🤝 Feel free to contribute on </span>
        <Link
          href="https://github.com/richard-unterberg/typescript-next-leaflet-starter"
          className="text-primary"
        >
          Github
        </Link> */}
        <h3 className="text-3xl mb-16">EV Equity Mapping Platform</h3>
        <span>
          {' '}
          <p>
            This tool is designed as a free, open-access platform to inform local government and stakeholder
            decision making on EV and mobility infrastructure investments. The tool uses a pixel-grid approach
            to integrate multiple data sets into &quot;priority&quot; and &quot;feasibility&quot; layers to
            identify best-fit locations to prioritize in planning processes. Users can adjust the content of
            these layers via intensity sliders and on/off toggles, for example:
          </p>{' '}
          <br />
          <ol>
            <li>
              - CalEnviroScreen4.0 percentile: slide to define the range of CalEnviroScreen percentile scores
              include in the &quot;priority&quot; pixel set. A higher range (e.g., 70-100) will limit the set
              scoring highest across the CES4.0 environmental vulnerability indicators.
            </li>
            <li>
              - Walk Score: L2 charger: slide to reflect existing access to public Level 2 chargers. A lower
              range will exclude areas with current access.
            </li>
            <li>
              - Grid Capacity: toggle on to include only areas that are within 200ft of a distribution line
              with with 600kW available capacity in the &quot;feasible&quot; pixel set.
            </li>
          </ol>{' '}
          This tool is a demonstration using data for the City of Oakland; more data layers, functions, and
          refinements will be added. Click the &quot;Map&quot; link below to explore the demo.{' '}
        </span>
        <footer className="mt-16 flex justify-between p-3 rounded bg-light text-sm">
          {' '}
          This tool is a joint project of UC Berkeley&apos;s Renewable and Appropriate Energy Laboratory and
          Center for Law, Energy & the Environment (CLEE) as part of CLEE&apos;s EV Equity Initiative. This is
          a demonstration tool for review and data verification purposes and is not intended for public use.
          All data acquired from public sources except as noted. Zoning data courtesy of Replica. Lead
          designers: Ari Ball-Burack and Ankita Suresh Shanbhag. Other research credits: Eleanor Adachi,
          Radhika Agarwal, Aki Konno. Initial funding provided by UC Berkeley Institute for Transportation
          studies. Contact: tlamm@law.berkeley.edu, kammen@berkeley.edu.{' '}
        </footer>
      </p>
    </section>
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div>
        <br />
        <NavMenu />
      </div>
    </section>
    <footer className="mt-16 flex justify-between p-3 rounded bg-light text-sm">
      <div>
        Created by Ankita Shanbhag <br />
        <Link href="https://linkedin.com/in/ankitashanbhag" className="text-primary">
          Contact Me
        </Link>
      </div>
      <div className="text-primary">
        <Leaf size={AppConfig.ui.mapIconSize} className="mt-2" />
      </div>
    </footer>
  </div>
)

export default Home
