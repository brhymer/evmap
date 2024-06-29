import { Compass, Home } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AppConfig, MapSelectorVariant } from '@lib/AppConfig'

import MapSelectorItem from './MapSelectorItem'

interface MapSelectorProps {
  variant?: MapSelectorVariant
}

const MapSelector = ({ variant = MapSelectorVariant.INTRO }: MapSelectorProps) => {
  const navIconSize =
    variant === MapSelectorVariant.TOPNAV ? AppConfig.ui.topBarIconSize : AppConfig.ui.menuIconSize

  const listStyle =
    variant === MapSelectorVariant.TOPNAV
      ? `flex text-white gap-4 text-lg text-white text-sm md:text-base`
      : `flex flex-col justify-between gap-1 w-fit text-primary`

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    const authState = localStorage.getItem('isAuthenticated')
    if (authState === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const correctPassword = '2024access' // Replace with your desired password
    if (password === correctPassword) {
      setIsAuthenticated(true)
      localStorage.setItem('isAuthenticated', 'true')
    } else {
      alert('Incorrect password')
    }
  }

  return (
    <>
      {!isAuthenticated && (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-2">
          <p>Enter password to access the demo</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-2 border rounded"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Submit
          </button>
        </form>
      )}
      {isAuthenticated && (
        <ul className={`${listStyle}`}>
          <MapSelectorItem href="/" label="Home" icon={<Home size={navIconSize} />} />
          <MapSelectorItem href="/oakland_map" label="Oakland Demo" icon={<Compass size={navIconSize} />} />
          <MapSelectorItem
            href="/san_francisco_map"
            label="San Francisco Demo"
            icon={<Compass size={navIconSize} />}
          />
        </ul>
      )}
    </>
  )
}

export default MapSelector
