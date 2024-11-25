import useMapContext from '@map/useMapContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Button, Dimmer, Loader, Modal } from 'semantic-ui-react'

import NavBar from '@components/common/NavBar'

import NavBarProps from '@lib/NavBarProps'

import MapSelector from '../common/MapSelector'
import LatLngLogo from './LatLngLogo'

const MapNavBar: React.FC<NavBarProps> = ({ setCurrentView }) => {
  // const [openSettings, setOpenSettings] = useState(false)
  const [openJurisdiction, setOpenJurisdiction] = useState(false)
  const [errorState, setErrorState] = useState(false)
  const [loading, setLoading] = useState(false)
  const startLoading = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }
  const router = useRouter()
  const { cityConfig = {} } = useMapContext()
  const isMapPage = router.pathname === '/map'
  // const handleLoadClick = () => {
  //   // setDummyVar((prevState) => !prevState)
  //   setOpenJurisdiction(false)
  // }
  // const previousSelections = [
  //   { key: 'option1', text: 'Option 1', value: 'option1' },
  //   { key: 'option2', text: 'Option 2', value: 'option2' },
  //   { key: 'option3', text: 'Option 3', value: 'option3' },
  // ]
  useEffect(() => {
    if (!cityConfig || Object.keys(cityConfig).length === 0) {
      setErrorState(true)
    } else {
      setErrorState(false)
    }
  }, [cityConfig])

  return (
    <div
      className="h-20 absolute w-full left-0 top-0 p-3 shadow bg-dark flex items-center"
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between w-full items-center">
        <LatLngLogo />
        <div className="flex-grow" />
        {/* {errorState && (
          <div className="flex items-center text-error font-bold mr-3">
            <p>Error: Map not loaded, please select a jurisdiction</p>
          </div>
        )} */}
        <NavBar setCurrentView={setCurrentView} />
        <div className="flex-grow" />
        {/* <Popup
          content="Under Construction!"
          trigger={
            <Button style={{ opacity: 0.5 }} onClick={() => setOpenJurisdiction(true)}>
              Change Settings
            </Button>
          }
        /> */}
        {/* <Modal
          open={openSettings}
          onClose={() => setOpenSettings(false)}
          onOpen={() => setOpenSettings(true)}
          trigger={<Button disabled onClick={() => setOpenSettings(true)}>Change Settings</Button>}
        >
            <Modal.Header>Change Settings</Modal.Header>
            <Modal.Content>
              <h1 className="homepage-header">Settings will go here</h1>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => setOpenSettings(false)} negative>
                Cancel
              </Button>
              <Button onClick={() => setOpenSettings(false)} positive>
                Done
              </Button>
            </Modal.Actions>
          </Modal> */}
        {/* <Dropdown
            placeholder='Select a previous map'
            fluid
            selection
            options={previousSelections}
          /> */}
        {/* <Popup
            content="Under Construction!"
            trigger={
              <Button style={{ opacity: 0.5 }} onClick={() => setOpenJurisdiction(true)}>
                Select New Jurisdiction
              </Button>
            }
          /> */}
        <Modal
          open={openJurisdiction}
          onClose={() => setOpenJurisdiction(false)}
          onOpen={() => setOpenJurisdiction(true)}
          trigger={
            <Button onClick={() => setOpenJurisdiction(true)} className={errorState ? 'glow-effect' : ''}>
              Select New Jurisdiction
            </Button>
          }
        >
          <Modal.Header>Select Jurisdiction</Modal.Header>
          <Modal.Content>
            <MapSelector startLoading={startLoading} />
            {loading && isMapPage && (
              <Dimmer active>
                <Loader />
              </Dimmer>
              // <Loader active size='medium' inline='centered' className='custom-loader' />
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button className="bg-primary text-white" onClick={() => setOpenJurisdiction(false)} negative>
              Close
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    </div>
    // </div>
  )
}

export default MapNavBar
