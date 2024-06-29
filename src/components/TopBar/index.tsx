import LatLngLogo from '@components/TopBar/LatLngLogo'

import { MapSelectorVariant } from '@lib/AppConfig'

import MapSelector from '../common/MapSelector'

const MapTopBar = () => (
  <div
    className="h-20 absolute w-full left-0 top-0 p-3 shadow bg-dark flex items-center"
    style={{ zIndex: 1000 }}
  >
    <div className="flex justify-between w-full">
      <LatLngLogo />
      <div className="flex flex-col justify-center">
        <MapSelector variant={MapSelectorVariant.TOPNAV} />
      </div>
    </div>
  </div>
)

export default MapTopBar
