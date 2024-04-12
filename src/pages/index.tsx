import { Leaf } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'

import NavMenu from '@components/common/NavMenu'

import { AppConfig } from '@lib/AppConfig'

const Home = () => (
  <div className="container mx-auto max-w-2xl max-md:max-w-none p-3">
    <Head>
      <title>Jumpstart your new leaflet mapping Project with next.js and typescript 🤩</title>
      <meta
        property="og:title"
        content="Jumpstart your new leaflet mapping Project with next.js and typescript 🤩"
        key="title"
      />
      <meta
        name="description"
        content="next-leaflet-starter-typescript is an extensible next.js starter template for the leaflet-maps-react plugin. Written in typescript,
      visually enhanced by tailwind and lucide-react icons."
      />
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
          This tool is designed as a free, open-access platform to inform local government and stakeholder
          decision making on EV and mobility infrastructure investments.{' '}
        </span>
        <footer className="mt-16 flex justify-between p-3 rounded bg-light text-sm">
          {' '}
          This tool is a joint project of UC Berkeley's Renewable and Appropriate Energy Laboratory and Center
          for Law, Energy & the Environment (CLEE) as part of CLEE's EV Equity Initiative. This is a
          demonstration tool for review and data verification purposes and is not intended for public use. All
          data acquired from public sources except as noted. Zoning data courtesy of Replica. Lead designers:
          Ari Ball-Burack and Ankita Suresh Shanbhag. Other research credits: Eleanor Adachi, Radhika Agarwal,
          Aki Konno. Initial funding provided by UC Berkeley Institute for Transportation studies. Contact:
          tlamm@law.berkeley.edu, kammen@berkeley.edu.{' '}
        </footer>
      </p>
    </section>
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div>
        <h3 className="text-xl my-5">Demo Content</h3>
        <NavMenu />
      </div>
    </section>
    <footer className="mt-16 flex justify-between p-3 rounded bg-light text-sm">
      <div>
        2023, some rights reserved <br />
        <Link
          href="https://github.com/richard-unterberg/typescript-next-leaflet-starter"
          className="text-primary"
        >
          typescript-next-leaflet-starter
        </Link>
      </div>
      <div className="text-primary">
        <Leaf size={AppConfig.ui.mapIconSize} className="mt-2" />
      </div>
    </footer>
  </div>
)

export default Home
