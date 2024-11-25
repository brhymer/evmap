// import { Leaf } from 'lucide-react'
import Head from 'next/head'

import Footer from '@components/common/Footer'
import HomeNavBar from '@components/common/HomeNavBar'

// import { AppConfig } from '@lib/AppConfig'
import About from './about'
import Contact from './contact'
import Data from './data'
import Default from './default'
import Instructions from './instructions'

const Home = ({
  currentView,
  setCurrentView,
}: {
  currentView: string
  setCurrentView: (view: string) => void
}) => {
  const renderView = () => {
    switch (currentView) {
      case 'default':
        return <Default setCurrentView={setCurrentView} />
      case 'instructions':
        return <Instructions />
      case 'about':
        return <About />
      case 'data':
        return <Data />
      case 'contact':
        return <Contact />
      default:
        return <Default setCurrentView={setCurrentView} />
    }
  }
  return (
    <div className="min-h-screen">
      <div className="flex-grow">
        <Head>
          <title>EV Equity Roadmap</title>
          <meta property="og:title" content="EV Equity Roadmap" key="title" />
          <meta name="description" content="" />
          <link rel="icon" href="/favicon.ico" />
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
        {/* <header className="mt-10 items-top gap-4 md:flex" /> */}
        <section>
          <div>
            <HomeNavBar setCurrentView={setCurrentView} />
            <div className="homepage-background">
              <section className="homepage-card sm:mx-8 md:mx-12 lg:mx-16">{renderView()}</section>
            </div>
          </div>
        </section>
        <Footer setCurrentView={setCurrentView} />
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
    </div>
  )
}

export default Home
