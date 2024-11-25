import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'semantic-ui-react'

const MobileWarningModal = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true)
        setOpen(true)
      } else {
        setIsMobile(false)
        setOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!isMobile) {
    return null
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} size="small" closeIcon>
      <Modal.Header>App Not Optimized for Mobile</Modal.Header>
      <Modal.Content>
        <p>
          This app is not optimized for mobile devices. For the best experience, please view it on a desktop
          or a larger screen.
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)} primary>
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default MobileWarningModal
