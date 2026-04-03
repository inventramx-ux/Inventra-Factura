/**
 * Image Processor Utility
 * Handles resizing, format conversion and background removal integration.
 */

import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

export interface ImageProcessOptions {
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
  quality?: number;
}

/**
 * Resizes and converts an image (base64 or URL) using the Canvas API.
 */
export async function processImage(
  source: string,
  options: ImageProcessOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const targetWidth = options.width || img.width;
      const targetHeight = options.height || img.height;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Convert to desired format
      const mimeType = `image/${options.format || 'jpeg'}`;
      const dataUrl = canvas.toDataURL(mimeType, options.quality || 0.9);
      resolve(dataUrl);
    };
    img.onerror = (err) => reject(err);
    img.src = source;
  });
}

/**
 * Removes the background of an image using @imgly/background-removal.
 */
export async function removeBackground(source: string, options: { bgColor?: 'transparent' | 'white' | 'black' } = {}): Promise<string> {
  try {
    // Final check for browser context
    if (typeof window === 'undefined') {
      throw new Error('This function can only be run in the browser.');
    }

    // Use absolute URL for dynamic resolution if you host locally.
    // For now, we omit publicPath to use the official CDN for zero-config.
    // const absolutePublicPath = `${window.location.origin}/bg-removal/`;

    const blob = await imglyRemoveBackground(source, {
      progress: (key: string, current: number, total: number) => {
        console.log(`Downloading ${key}: ${current}/${total}`);
      },
      // publicPath: absolutePublicPath
    });
    
    const processedBlob = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    if (options.bgColor && options.bgColor !== 'transparent') {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context error'));

          canvas.width = img.width;
          canvas.height = img.height;

          // Fill background
          ctx.fillStyle = options.bgColor === 'white' ? '#FFFFFF' : '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw processed image on top
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = reject;
        img.src = processedBlob;
      });
    }
    
    return processedBlob;
  } catch (error) {
    console.error('Failed to remove background:', error);
    throw error;
  }
}

/**
 * Upscales an image (2x) and applies a sharpening pass.
 */
export async function upscaleImage(source: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      canvas.width = img.width * 2;
      canvas.height = img.height * 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Simple sharpening after upscale
      const sharpened = applyConvolution(canvas, [
        0, -0.2, 0,
        -0.2, 1.8, -0.2,
        0, -0.2, 0
      ]);
      
      resolve(sharpened);
    };
    img.onerror = reject;
    img.src = source;
  });
}

/**
 * Adjusts brightness, contrast and saturation for better product photography.
 */
export async function autoEnhanceColors(source: string, intensity: 'natural' | 'vivid' | 'crisp' = 'natural'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      canvas.width = img.width;
      canvas.height = img.height;

      // Apply filters based on intensity
      if (intensity === 'vivid') {
        ctx.filter = 'brightness(1.08) contrast(1.2) saturate(1.4)';
      } else if (intensity === 'crisp') {
        ctx.filter = 'brightness(1.05) contrast(1.3) saturate(1.1) grayscale(0.1)';
      } else {
        ctx.filter = 'brightness(1.05) contrast(1.1) saturate(1.2)';
      }
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = reject;
    img.src = source;
  });
}

/**
 * Applies a convolution matrix (sharpening) to the image.
 */
export async function sharpenImage(source: string, level: 'subtle' | 'standard' | 'extra' = 'standard'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sharpening kernel based on level
      let kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ];

      if (level === 'subtle') {
        kernel = [
          0, -0.2, 0,
          -0.2, 1.8, -0.2,
          0, -0.2, 0
        ];
      } else if (level === 'extra') {
        kernel = [
          -1, -1, -1,
          -1, 9, -1,
          -1, -1, -1
        ];
      }

      const sharpened = applyConvolution(canvas, kernel);
      
      resolve(sharpened);
    };
    img.onerror = reject;
    img.src = source;
  });
}

/**
 * Helper to apply convolution matrix to a canvas.
 */
function applyConvolution(canvas: HTMLCanvasElement, weights: number[]): string {
  const ctx = canvas.getContext('2d')!;
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);
  const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sw = src.width;
  const sh = src.height;
  const dst = ctx.createImageData(sw, sh);
  
  const srcData = src.data;
  const dstData = dst.data;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const dstOff = (y * sw + x) * 4;
      let r = 0, g = 0, b = 0;
      
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(sh - 1, Math.max(0, y + cy - halfSide));
          const scx = Math.min(sw - 1, Math.max(0, x + cx - halfSide));
          const srcOff = (scy * sw + scx) * 4;
          const wt = weights[cy * side + cx];
          
          r += srcData[srcOff] * wt;
          g += srcData[srcOff + 1] * wt;
          b += srcData[srcOff + 2] * wt;
        }
      }
      
      dstData[dstOff] = r;
      dstData[dstOff + 1] = g;
      dstData[dstOff + 2] = b;
      dstData[dstOff + 3] = srcData[dstOff + 3]; // Opacity
    }
  }
  
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = sw;
  resultCanvas.height = sh;
  resultCanvas.getContext('2d')!.putImageData(dst, 0, 0);
  return resultCanvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Preset for Mercado Libre: 1200x1200px, JPEG
 */
export async function formatForMercadoLibre(source: string): Promise<string> {
  return processImage(source, {
    width: 1200,
    height: 1200,
    format: 'jpeg',
    quality: 0.95
  });
}
