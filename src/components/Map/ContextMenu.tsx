import { useEffect, useRef, useState } from 'react'
import { Button, Popup } from 'semantic-ui-react'

interface ContextMenuProps {
  contextMenuVisible: boolean
  setContextMenuVisible: (value: boolean) => void
  clickedLatLng: { lat: number; lng: number } | null
  menuPosition: { x: number; y: number }
  // getImage: () => void
}

const ContextMenu = ({
  contextMenuVisible,
  setContextMenuVisible,
  clickedLatLng,
  menuPosition,
}: ContextMenuProps) => {
  const [viewportWidth, setViewportWidth] = useState(0)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth)
      const handleResize = () => {
        setViewportWidth(window.innerWidth)
      }
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
    return undefined
  }, [])

  const popupWidth = 260
  const adjustedX = menuPosition.x - viewportWidth / 2 - popupWidth / 2 + 4
  const adjustedY = menuPosition.y - 190
  return (
    <Popup
      open={contextMenuVisible}
      onClose={() => setContextMenuVisible(false)}
      position="top center"
      style={{
        position: 'absolute',
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        zIndex: 1000,
        width: `${popupWidth}px`,
        height: '175px',
      }}
      trigger={<div />}
    >
      <Popup.Header>
        <p>User-selected priority location</p>
      </Popup.Header>
      <Popup.Content>
        <p>
          <b>Latitude:</b> {clickedLatLng?.lat.toFixed(4)}
        </p>
        <p>
          <b>Longitude:</b> {clickedLatLng?.lng.toFixed(4)}
        </p>
        <p>Contact the appropriate city department to request an EV connection at this point</p>
        {/* <div>{contextMenuVisible && <Button onClick={getImage}>Take Map Snapshot</Button>} */}
      </Popup.Content>
    </Popup>
  )
}

export default ContextMenu
