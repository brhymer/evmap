import { useEffect, useState } from 'react'

const useLoadingTimer = () => {
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [loadingDuration, setLoadingDuration] = useState(0)

  useEffect(() => {
    setStartTime(performance.now())
    return () => {
      if (startTime && endTime) {
        setLoadingDuration(endTime - startTime)
      }
    }
  }, [startTime, endTime])

  const stopLoadingTimer = () => {
    setEndTime(performance.now())
  }

  return { stopLoadingTimer, loadingDuration }
}

export default useLoadingTimer
