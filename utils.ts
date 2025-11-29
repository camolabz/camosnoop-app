import { GOLDEN_HEAVY_BODY_ACRYLICS, AcrylicPaint } from "./data/goldenAcrylics";
import { PANTONE_COLORS, PantoneColor } from "./data/pantoneColors";
import { ColorItem } from "./types";

// Helper to calculate contrast color (black or white) based on background hex
export function getContrastColor(hex: string): string {
  // Remove hash if present
  const cleanHex = hex.replace('#', '');
  
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  
  // Calculate luminance
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

// --- Color Space Conversions for Perceptual Matching ---

interface RGB { r: number; g: number; b: number; }
interface XYZ { x: number; y: number; z: number; }
interface LAB { l: number; a: number; b: number; }

function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16)
  };
}

function rgbToXyz(rgb: RGB): XYZ {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  // Observer = 2°, Illuminant = D65
  return {
    x: r * 0.4124 + g * 0.3576 + b * 0.1805,
    y: r * 0.2126 + g * 0.7152 + b * 0.0722,
    z: r * 0.0193 + g * 0.1192 + b * 0.9505
  };
}

function xyzToLab(xyz: XYZ): LAB {
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let x = xyz.x / refX;
  let y = xyz.y / refY;
  let z = xyz.z / refZ;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  };
}

// CIE76 Delta E calculation
// Much better for perceptual matching than Euclidean RGB distance
function calculateDeltaE(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const xyz1 = rgbToXyz(rgb1);
  const xyz2 = rgbToXyz(rgb2);

  const lab1 = xyzToLab(xyz1);
  const lab2 = xyzToLab(xyz2);

  const dl = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;

  return Math.sqrt(dl * dl + da * da + db * db);
}

export function findClosestGoldenAcrylic(targetHex: string): AcrylicPaint {
  let closestPaint = GOLDEN_HEAVY_BODY_ACRYLICS[0];
  let minDistance = Infinity;

  for (const paint of GOLDEN_HEAVY_BODY_ACRYLICS) {
    const distance = calculateDeltaE(targetHex, paint.hex);
    if (distance < minDistance) {
      minDistance = distance;
      closestPaint = paint;
    }
  }

  return closestPaint;
}

export function findClosestPantone(targetHex: string): PantoneColor {
  let closestPantone = PANTONE_COLORS[0];
  let minDistance = Infinity;

  for (const color of PANTONE_COLORS) {
    const distance = calculateDeltaE(targetHex, color.hex);
    if (distance < minDistance) {
      minDistance = distance;
      closestPantone = color;
    }
  }

  return closestPantone;
}

export function processResponseColors(rawPalette: any[]): ColorItem[] {
  return rawPalette.map(item => {
    const paintMatch = findClosestGoldenAcrylic(item.hex);
    const pantoneMatch = findClosestPantone(item.hex);
    return {
      ...item,
      textColor: getContrastColor(item.hex),
      matchingPaint: paintMatch,
      matchingPantone: pantoneMatch
    };
  });
}

export function encodePalette(colors: ColorItem[]): string {
  return btoa(encodeURIComponent(JSON.stringify(colors)));
}

export function decodePalette(encoded: string): ColorItem[] {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch (e) {
    console.error("Failed to decode palette", e);
    return [];
  }
}

export const createCroppedImage = (
  base64Image: string, 
  crop: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Calculate pixel coordinates from percentages
      const pixelX = (crop.x / 100) * img.width;
      const pixelY = (crop.y / 100) * img.height;
      const pixelWidth = (crop.width / 100) * img.width;
      const pixelHeight = (crop.height / 100) * img.height;

      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(
        img,
        pixelX, pixelY, pixelWidth, pixelHeight,
        0, 0, pixelWidth, pixelHeight
      );
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};