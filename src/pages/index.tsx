import { Leaf } from 'lucide-react'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

import MapSelector from '@components/common/MapSelector'
import Navbar from '@components/common/Navbar'

import { AppConfig } from '@lib/AppConfig'
import About from './about'
import Contact from './contact'
// import Navbar from '@components/common/NavBar'

const Home = () => {

  const [currentView, setCurrentView] = useState<string>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <MapSelector />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <MapSelector />;
    }
  }
  return (
    <div className="container mx-auto max-w-2xl max-md:max-w-none p-3">
      <Head>
        <title>EV Equity Mapping Platform</title>
        <meta property="og:title" content="EV Equity Mapping Platform" key="title" />
        <meta name="description" content="" />
        {/* <style>{`
          .bullet-list {
            margin-left: 20px;
          }
          .bullet-list li::before {
            content: '•';
            color: black;
            display: inline-block; 
            width: 1em;
            margin-left: -1em;
          }
          p, ul {
            text-align: justify;
          }
        `}</style> */}
      </Head>
      <header className="mt-10 items-top gap-4 md:flex" />
      <section>
        <div>
          <br />
          <Navbar setCurrentView={setCurrentView} />
          {renderView()}
        </div>
      </section>
      <br />
      <span>
        <p>
          This tool is designed as a free, open-access platform to inform local government and stakeholder
          decision making on EV and mobility infrastructure investments. The demonstration maps available here
          are intended to facilitate review, data refinement, and feedback in advance of a California statewide
          launch.
        </p>
        <br />
        <p>
          The tool uses a pixel-grid approach to integrate multiple data sets and geographic scales into
          &quot;priority&quot; and &quot;feasibility&quot; layers to identify best-fit locations to prioritize
          in planning processes:
        </p>
        <ul className="bullet-list">
          <li>
            “Priority” layers include population demographics, environmental justice indicators, and EV/charging
            access data to identify where charging investment is a high priority as a matter of public policy.
          </li>
          <li>
            “Feasibility” layers include funding availability and electrical grid capacity data to identify
            where charging investment is most possible.
          </li>
          <li>
            “Co-location points” identify community resources where mobility investment should be most desirable
            within a high-priority, high-feasibility zone. Each pixel is 100x100 meters.
          </li>
          <br />
        </ul>
        <br />
        <p>
          The tool enables users to a) select which criteria are included in the “priority” and “feasibility”
          layers (via the settings wheel) and b) adjust the intensity of the criteria as appropriate to the
          local context (via sliders). These selections and adjustments will yield unique combinations of pixels
          using “AND” logic - i.e., only pixels that meet all selected criteria will remain on the map. Areas
          with high concentrations or overlap of both “priority” and “feasibility” pixels are likely candidate
          zones for investment. For example:
        </p>

      </span>
      <footer className="mt-16 flex justify-between p-3 rounded bg-light text-sm">
        This tool is a joint project of UC Berkeley&apos;s Renewable and Appropriate Energy Laboratory and
        Center for Law, Energy &amp; the Environment (CLEE) as part of CLEE&apos;s EV Equity Initiative. This is
        a demonstration tool for review and data verification purposes and is not intended for public use. All
        data acquired from public sources except as noted. Zoning data courtesy of Replica. Lead designers: Ari
        Ball-Burack and Ankita Suresh Shanbhag. Other research credits: Eleanor Adachi, Radhika Agarwal, Aki
        Konno. Initial funding provided by UC Berkeley Institute for Transportation studies. 
      </footer>
      {/* <footer className="mt-16 flex justify-between p-3 rounded bg-light text-sm">
        <div>
          Created by Ankita Shanbhag <br />
          <Link href="https://linkedin.com/in/ankitashanbhag" className="text-primary">
            Contact Me
          </Link>
        </div>
        <div className="text-primary">
          <Leaf size={AppConfig.ui.mapIconSize} className="mt-2" />
        </div>
      </footer> */}
    </div>
  )
}

export default Home
