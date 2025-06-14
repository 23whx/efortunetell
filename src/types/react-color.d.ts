declare module 'react-color' {
  import * as React from 'react';

  export interface ColorResult {
    hex: string;
    rgb: {
      r: number;
      g: number;
      b: number;
      a?: number;
    };
    hsl: {
      h: number;
      s: number;
      l: number;
      a?: number;
    };
  }

  export interface ColorChangeHandler {
    (color: ColorResult): void;
  }

  export interface SketchPickerProps {
    color?: string | ColorResult;
    onChange?: ColorChangeHandler;
    onChangeComplete?: ColorChangeHandler;
    disableAlpha?: boolean;
    presetColors?: string[];
    width?: string | number;
  }

  export const SketchPicker: React.ComponentType<SketchPickerProps>;
} 