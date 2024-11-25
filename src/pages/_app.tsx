import MapContextProvider from '@map/MapContextProvider'
import 'leaflet/dist/leaflet.css'
import type { AppProps } from 'next/app'
import { Catamaran } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import 'semantic-ui-css/semantic.min.css'

import MobileWarningModal from '@components/common/MobileWarning'

import '@src/globals.css'

const catamaran = Catamaran({
  subsets: ['latin'],
  variable: '--font-catamaran',
})

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [currentView, setCurrentView] = useState('home')

  const handleSetViewAndRoute = (view: string) => {
    setCurrentView(view)
    router.push('/')
  }
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem('viewedWelcomeModal')
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])
  return (
    <>
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={`${catamaran.variable} font-sans text-base`}>
        <MobileWarningModal />
        <MapContextProvider>
          <Component {...pageProps} currentView={currentView} setCurrentView={handleSetViewAndRoute} />
        </MapContextProvider>
      </main>
    </>
  )
}

export default App
