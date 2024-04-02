import * as L from 'leaflet'
import { useEffect, useState } from 'react'

const useLeaflet = () => {
  const [leaflet, setLeaflet] = useState<typeof L | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then(leafletModule => {
        setLeaflet(leafletModule.default)
      })
    }
  }, [])

  return leaflet
}

export default useLeaflet
