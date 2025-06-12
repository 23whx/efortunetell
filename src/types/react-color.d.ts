declare module 'react-color' {
  import * as React from 'react';

  export interface ColorResult {
    hex: string;
    rgb: { r: number; g: number; b: number; a?: number };
    hsl: { h: number; s: number; l: number; a?: number };
  }

  export interface ColorPickerProps {
    color?: string | { [key: string]: any };
    onChange?: (color: ColorResult) => void;
    onChangeComplete?: (color: ColorResult) => void;
  }

  export class SketchPicker extends React.Component<ColorPickerProps> {}
} 