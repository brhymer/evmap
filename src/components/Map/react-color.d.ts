/* eslint-disable react/prefer-stateless-function */
declare module 'react-color' {
  import * as React from 'react'

  export class SketchPicker extends React.Component<SketchPickerProps> {}

  interface SketchPickerProps {
    color?: string | object
    onChangeComplete?: (color: ColorResult) => void
  }

  interface ColorResult {
    hex: string
  }
}
