import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionTitle,
  AccordionTitleProps,
  Icon,
  Popup,
} from 'semantic-ui-react'

interface LayerControlProps {
  mainText: string
  hoverText: string
  accordionText: string
}

const LayerControl: React.FC<LayerControlProps> = ({ mainText, hoverText, accordionText }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleClick = (_e: React.MouseEvent, titleProps: AccordionTitleProps) => {
    const { index } = titleProps
    const newIndex = activeIndex === index ? null : (index as number)
    setActiveIndex(newIndex)
  }

  return (
    <Accordion fluid>
      <div className="flex justify-between flex-wrap relative">
        <Popup content={hoverText} trigger={<p>{mainText}</p>} />
        <AccordionTitle active={activeIndex === 0} index={0} onClick={_e => handleClick(_e, { index: 0 })}>
          <Icon name="info circle" />
        </AccordionTitle>
        <AccordionContent className="w-full" active={activeIndex === 0}>
          <p className="text-sm" dangerouslySetInnerHTML={{ __html: accordionText }} />
          {/* <p>
            Enter range:
            <input
              type="number"
              // value={inputValue}
              // onChange={handleInputChange}
              className="border rounded"
              min={0}
              max={100}
            />
            &nbsp;to&nbsp;
            <input
              type="number"
              // value={inputValue}
              // onChange={handleInputChange}
              className="border rounded"
              min={0}
              max={100}
            />
          </p> */}
        </AccordionContent>
      </div>
    </Accordion>
  )
}

export default LayerControl
