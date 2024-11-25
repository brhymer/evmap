import React, { useState } from 'react'
import Slider from 'react-slider'

import LayerControl from './LayerControl'

interface LayerSliderControlProps {
  mainText: string
  hoverText: string
  accordionText: string
  min: number
  max: number
}

const LayerSliderControl: React.FC<LayerSliderControlProps> = ({
  mainText,
  hoverText,
  accordionText,
  min,
  max,
}) => {
  const [range, setRange] = useState<[number, number]>([min, min])

  return (
    // <label>
    <>
      <br />
      <LayerControl mainText={mainText} hoverText={hoverText} accordionText={accordionText} />
      <Slider
        min={min}
        max={max}
        value={range}
        onAfterChange={setRange}
        thumbClassName="slider-thumb"
        trackClassName="slider-track"
        renderThumb={(
          props: JSX.IntrinsicAttributes &
            React.ClassAttributes<HTMLDivElement> &
            React.HTMLAttributes<HTMLDivElement>,
          state: {
            valueNow:
              | string
              | number
              | boolean
              | React.ReactElement<any, string | React.JSXElementConstructor<any>>
              | React.ReactFragment
              | React.ReactPortal
              | null
              | undefined
          },
        ) => <div {...props}>{state.valueNow}</div>}
        pearling
        minDistance={0}
      />
    </>
    // </label>
  )
}

export default LayerSliderControl
