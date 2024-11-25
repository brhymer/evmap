// import { Compass, Home } from 'lucide-react'
// import { AppConfig, MapSelectorVariant } from '@lib/AppConfig'
import { Icon } from 'semantic-ui-react'

import { openInNewWindow } from '@src/utils/openInNewWindow'

import NavBarProps from '@lib/NavBarProps'

import MapSelector from '../components/common/MapSelector'

const Default: React.FC<NavBarProps> = ({ setCurrentView }) => (
  // const [isAuthenticated, setIsAuthenticated] = useState(false)
  // const [password, setPassword] = useState('')

  // useEffect(() => {
  //   const authState = localStorage.getItem('isAuthenticated')
  //   if (authState === 'true') {
  //     setIsAuthenticated(true)
  //   }
  // }, [])

  // const handlePasswordSubmit = (event: React.FormEvent) => {
  //   event.preventDefault()
  //   const correctPassword = process.env.NEXT_PUBLIC_PASSWORD
  //   if (password === correctPassword) {
  //     setIsAuthenticated(true)
  //     localStorage.setItem('isAuthenticated', 'true')
  //   } else {
  //     alert('Incorrect password') // show error message instead
  //   }
  // }
  <>
    <h1 className="homepage-header">Welcome</h1>
    <p className="mb-4">
      This tool is designed as a free, open-access platform to inform local government and stakeholder
      decision making on EV and mobility infrastructure investments.
    </p>
    <p className="mb-4">
      The tool enables users to identify &ldquo;priority&rdquo; and &ldquo;feasibility&rdquo; zones within a
      jurisdiction based on a pixel-grid that integrates multiple data sets into color-coded 100x100 meter
      pixels, overlaid on the map.
    </p>
    <p>Users can:</p>
    <ul className="list-disc pl-6 mb-4">
      <li>
        Modulate the criteria as appropriate to the jurisdiction to identify areas of highest priority for
        public policy and investment priority
      </li>
      <li>
        Add co-location points to identify community resources where mobility investment should be most
        desirable within a high-priority zone
      </li>
      <li>
        Download a snapshot of their selections and highlighted coordinates to share with stakeholders and
        decision makers
      </li>
    </ul>
    <p className="mb-4">
      For detailed user instructions, see
      <button
        // onClick={() => setCurrentView('instructions')}
        onClick={() => openInNewWindow('/instructions')}
        className="mx-1 bg-transparent border-none text-primary underline cursor-pointer"
        type="button"
      >
        {/* How to Use */}
        How to Use
        <span className="superscript">
          <Icon fitted size="small" disabled name="external alternate" />
        </span>
      </button>
      . For more information on data and sources, see
      <button
        onClick={() => setCurrentView('about')}
        className="mx-1 bg-transparent border-none text-primary underline cursor-pointer"
        type="button"
      >
        Data
      </button>
      .
    </p>
    <p className="mb-4">
      To access the tool, select a county and then a city (or unincorporated areas) from the drop-down menus
      below.
    </p>
    <br />
    {/* {!isAuthenticated && (
        <form onSubmit={handlePasswordSubmit} className="flex gap-2">
          <input
            type="password"
            placeholder="Enter password to access the map"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-2 border rounded sm:w-1/2 md:w-1/3"
          />
          <Button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Submit
          </Button>
        </form>
      )} */}
    {/* {isAuthenticated && (
        <>
          <h1 className="homepage-header">Select a jurisdiction</h1>
          <MapSelector />
        </>
    )} */}
    <h1 className="homepage-header">Select a jurisdiction</h1>
    <MapSelector />
    <br />
    <h1 className="homepage-header">Media</h1>
    <div className="flex justify-center">
      <p>&#8212;Coming soon&#8212;</p>
    </div>
  </>
)

export default Default
