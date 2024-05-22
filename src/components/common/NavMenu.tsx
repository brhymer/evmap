import { Compass, Home } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AppConfig, NavMenuVariant } from '@lib/AppConfig'

import NavMenuItem from './NavMenuItem'

interface NavMenuProps {
  variant?: NavMenuVariant
}

const NavMenu = ({ variant = NavMenuVariant.INTRO }: NavMenuProps) => {
  const navIconSize =
    variant === NavMenuVariant.TOPNAV ? AppConfig.ui.topBarIconSize : AppConfig.ui.menuIconSize

  const listStyle =
    variant === NavMenuVariant.TOPNAV
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
          <p>Type the password below to get access to the maps</p>
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
          <NavMenuItem href="/" label="About the Project" icon={<Home size={navIconSize} />} />
          <NavMenuItem href="/oakland_map" label="Oakland Map" icon={<Compass size={navIconSize} />} />
          <NavMenuItem
            href="/san_francisco_map"
            label="San Francisco Map"
            icon={<Compass size={navIconSize} />}
          />
        </ul>
      )}
    </>
  )
}

export default NavMenu
