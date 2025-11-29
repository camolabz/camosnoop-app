
export interface PaintMatch {
  name: string;
  hex: string;
}

export interface PantoneMatch {
  code: string;
  name: string;
  hex: string;
}

export interface ColorItem {
  hex: string;
  name: string;
  description: string;
  textColor: string; // Calculated on frontend for contrast
  matchingPaint?: PaintMatch; // Closest Golden Acrylic match
  matchingPantone?: PantoneMatch; // Closest Pantone match
}

export interface PaletteResponse {
  palette: {
    hex: string;
    name: string;
    description: string;
  }[];
}

export interface SavedPalette {
  id: string;
  name: string;
  date: number;
  colors: ColorItem[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
