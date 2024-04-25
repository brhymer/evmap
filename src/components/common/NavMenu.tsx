import { Compass, Home } from 'lucide-react'

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

  return (
    <ul className={`${listStyle}`}>
      <NavMenuItem href="/" label="About the Project" icon={<Home size={navIconSize} />} />
      <NavMenuItem href="/oakland_map" label="Oakland Map" icon={<Compass size={navIconSize} />} />
      <NavMenuItem
        href="/san_francisco_map"
        label="San Francisco Map"
        icon={<Compass size={navIconSize} />}
      />
    </ul>
  )
}

export default NavMenu
