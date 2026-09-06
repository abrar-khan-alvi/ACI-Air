/**
 * Client-side passport OCR pipeline using Tesseract.js.
 * All processing occurs strictly in the browser — no image is uploaded to any server.
 *
 * Pipeline:
 *   dataUrl
 *   → Image quality evaluation
 *   → Multi-strategy preprocessing (Percentile contrast stretch, Otsu binarization, Sharpening)
 *   → Multi-band crop detection (bottom 26%, 34%, 42%, 180° rotation fallback)
 *   → Multi-attempt Tesseract OCR
 *   → Structural MRZ validation & check-digit-driven repair
 *   → Highest-reliability candidate selection
 *   → PassportScanResult
 */

import { createWorker, PSM } from "tesseract.js";
import {
  extractAllMrzCandidates,
  extractMrzLines,
  normaliseMrzLine,
  parseMrz,
  scoreMrz,
  type MrzParseResult,
} from "./passport-mrz";
import type { PassportScanResult } from "./passport.functions";

// ---------------------------------------------------------------------------
// Image Quality & Preprocessing
// ---------------------------------------------------------------------------

export type ImageQualityReport = {
  width: number;
  height: number;
  meanLuminance: number;
  contrast: number; // standard deviation of luminance
  isAcceptable: boolean;
  reason?: string;
};

/**
 * Assesses whether the passport image is of sufficient quality for OCR.
 */
export function assessImageQuality(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): ImageQualityReport {
  if (width < 450 || height < 320) {
    return {
      width,
      height,
      meanLuminance: 0,
      contrast: 0,
      isAcceptable: false,
      reason: "Image resolution is too low. Please upload a clearer, higher-resolution photo.",
    };
  }

  const sampleW = Math.min(width, 400);
  const sampleH = Math.min(height, 300);
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sampleW;
  sampleCanvas.height = sampleH;
  const sampleCtx = sampleCanvas.getContext("2d")!;
  sampleCtx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);

  const imgData = sampleCtx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;

  let sum = 0;
  const count = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    sum += lum;
  }
  const mean = sum / count;

  let varianceSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    varianceSum += (lum - mean) ** 2;
  }
  const contrast = Math.sqrt(varianceSum / count);

  if (mean < 30) {
    return {
      width,
      height,
      meanLuminance: mean,
      contrast,
      isAcceptable: false,
      reason: "Passport photo is too dark. Please ensure good lighting and avoid shadows.",
    };
  }

  if (mean > 240) {
    return {
      width,
      height,
      meanLuminance: mean,
      contrast,
      isAcceptable: false,
      reason: "Passport photo is overexposed or has glare. Please avoid direct flash.",
    };
  }

  if (contrast < 18) {
    return {
      width,
      height,
      meanLuminance: mean,
      contrast,
      isAcceptable: false,
      reason: "Image contrast is too low to read text. Please provide a sharper photo.",
    };
  }

  return {
    width,
    height,
    meanLuminance: mean,
    contrast,
    isAcceptable: true,
  };
}

/**
 * Loads an image from a data URL into an HTMLImageElement.
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode the image."));
    img.src = dataUrl;
  });
}

/**
 * Upscales and renders the image onto a full canvas.
 */
function renderFullCanvas(img: HTMLImageElement): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
} {
  const targetW = Math.max(img.naturalWidth, 1400);
  const scale = targetW / img.naturalWidth;
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, ctx, width, height };
}

export type MrzBounds = {
  line1Top: number;
  line1Bottom: number;
  line2Top: number;
  line2Bottom: number;
  blockTop: number;
  blockBottom: number;
  detected: boolean;
};

/**
 * Detects the vertical positions of Line 1 and Line 2 of the MRZ
 * using horizontal high-frequency edge transition density.
 * Excludes the colorful security strip and margins below the MRZ.
 */
export function detectMrzBounds(sourceCanvas: HTMLCanvasElement): MrzBounds {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const ctx = sourceCanvas.getContext("2d", { willReadFrequently: true })!;

  // Scan the bottom 35% of the canvas, stopping at 97% to exclude bottom edge/table
  const scanTop = Math.round(h * 0.65);
  const scanBottom = Math.round(h * 0.97);
  const scanHeight = scanBottom - scanTop;

  const defaultBounds: MrzBounds = {
    line1Top: Math.round(h * 0.77),
    line1Bottom: Math.round(h * 0.865),
    line2Top: Math.round(h * 0.865),
    line2Bottom: Math.round(h * 0.96),
    blockTop: Math.round(h * 0.77),
    blockBottom: Math.round(h * 0.96),
    detected: false,
  };

  if (scanHeight <= 30) return defaultBounds;

  const imgData = ctx.getImageData(0, scanTop, w, scanHeight);
  const data = imgData.data;

  // Compute horizontal edge energy per row across central 80% of width
  const startX = Math.round(w * 0.1);
  const endX = Math.round(w * 0.9);
  const rowEnergy = new Float32Array(scanHeight);

  for (let y = 0; y < scanHeight; y++) {
    const rowOffset = y * w * 4;
    let energy = 0;
    for (let x = startX; x < endX - 2; x += 2) {
      const idx1 = rowOffset + x * 4;
      const idx2 = rowOffset + (x + 2) * 4;
      const lum1 = 0.299 * data[idx1]! + 0.587 * data[idx1 + 1]! + 0.114 * data[idx1 + 2]!;
      const lum2 = 0.299 * data[idx2]! + 0.587 * data[idx2 + 1]! + 0.114 * data[idx2 + 2]!;
      energy += Math.abs(lum1 - lum2);
    }
    rowEnergy[y] = energy;
  }

  // Smooth energy profile with moving average filter
  const smoothed = new Float32Array(scanHeight);
  const kSize = 5;
  for (let y = 0; y < scanHeight; y++) {
    let sum = 0;
    let cnt = 0;
    for (let k = -kSize; k <= kSize; k++) {
      const ny = y + k;
      if (ny >= 0 && ny < scanHeight) {
        sum += rowEnergy[ny]!;
        cnt++;
      }
    }
    smoothed[y] = sum / cnt;
  }

  // Find local maxima
  type Peak = { y: number; val: number };
  const peaks: Peak[] = [];
  for (let y = 2; y < scanHeight - 2; y++) {
    if (
      smoothed[y]! > smoothed[y - 1]! &&
      smoothed[y]! > smoothed[y - 2]! &&
      smoothed[y]! > smoothed[y + 1]! &&
      smoothed[y]! > smoothed[y + 2]!
    ) {
      peaks.push({ y, val: smoothed[y]! });
    }
  }

  // Find two candidate peaks representing Line 1 and Line 2
  let bestPair: [Peak, Peak] | null = null;
  let bestScore = -1;

  for (let i = 0; i < peaks.length; i++) {
    for (let j = i + 1; j < peaks.length; j++) {
      const p1 = peaks[i]!;
      const p2 = peaks[j]!;
      const dist = p2.y - p1.y;
      if (dist >= 20 && dist <= 120) {
        const score = p1.val + p2.val - Math.abs(p1.val - p2.val) * 0.5;
        if (score > bestScore) {
          bestScore = score;
          bestPair = [p1, p2];
        }
      }
    }
  }

  if (!bestPair) return defaultBounds;

  const [peak1, peak2] = bestPair;
  const lineDist = peak2.y - peak1.y;
  const halfDist = Math.round(lineDist / 2);

  // Find valley between peak 1 and peak 2
  let minValleyVal = Infinity;
  let valleyY = peak1.y + halfDist;
  for (let y = peak1.y; y <= peak2.y; y++) {
    if (smoothed[y]! < minValleyVal) {
      minValleyVal = smoothed[y]!;
      valleyY = y;
    }
  }

  const padY = Math.round(lineDist * 0.35);
  const l1Top = Math.max(0, scanTop + peak1.y - padY);
  const l1Bottom = scanTop + valleyY;
  const l2Top = scanTop + valleyY;
  const l2Bottom = Math.min(h, scanTop + peak2.y + padY);

  return {
    line1Top: l1Top,
    line1Bottom: l1Bottom,
    line2Top: l2Top,
    line2Bottom: l2Bottom,
    blockTop: l1Top,
    blockBottom: l2Bottom,
    detected: true,
  };
}

/**
 * Crops a vertical slice of the canvas, excluding margins on left and right.
 */
function cropRegion(
  sourceCanvas: HTMLCanvasElement,
  topY: number,
  bottomY: number,
  paddingXRatio = 0.015,
): HTMLCanvasElement {
  const w = sourceCanvas.width;
  const h = Math.max(1, bottomY - topY);
  const padX = Math.round(w * paddingXRatio);
  const cropW = Math.max(10, w - padX * 2);

  const canvas = document.createElement("canvas");
  canvas.width = cropW;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(sourceCanvas, padX, topY, cropW, h, 0, 0, cropW, h);
  return canvas;
}

/**
 * Crops a vertical band (fraction of height from bottom).
 */
function cropBottomBand(
  sourceCanvas: HTMLCanvasElement,
  bandRatio: number,
  bottomExcludeRatio = 0.03,
): HTMLCanvasElement {
  const bottomMargin = Math.round(sourceCanvas.height * bottomExcludeRatio);
  const h = Math.round(sourceCanvas.height * bandRatio);
  const y = Math.max(0, sourceCanvas.height - h - bottomMargin);
  const crop = document.createElement("canvas");
  crop.width = sourceCanvas.width;
  crop.height = h;
  const cropCtx = crop.getContext("2d", { willReadFrequently: true })!;
  cropCtx.drawImage(sourceCanvas, 0, y, sourceCanvas.width, h, 0, 0, sourceCanvas.width, h);
  return crop;
}

/**
 * Variant 1: Robust Percentile-Stretched Grayscale
 * Ignores extreme outlier pixels to maximize dynamic contrast across characters.
 */
export function applyPercentileContrast(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Build histogram
  const hist = new Int32Array(256);
  const totalPixels = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
    hist[lum]!++;
  }

  // Find 2nd and 98th percentiles
  const pLowThreshold = totalPixels * 0.02;
  const pHighThreshold = totalPixels * 0.98;
  let count = 0;
  let pLow = 0;
  let pHigh = 255;

  for (let i = 0; i < 256; i++) {
    count += hist[i]!;
    if (count >= pLowThreshold && pLow === 0) pLow = i;
    if (count >= pHighThreshold) {
      pHigh = i;
      break;
    }
  }

  const range = Math.max(1, pHigh - pLow);

  // Apply contrast stretch
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
    const stretched = Math.max(0, Math.min(255, Math.round(((lum - pLow) / range) * 255)));
    data[i] = stretched;
    data[i + 1] = stretched;
    data[i + 2] = stretched;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Variant 2: Otsu's Global Binarization
 * Separates dark characters from passport background watermark patterns.
 */
export function applyOtsuBinarization(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // 1. Histogram of grayscale
  const hist = new Int32Array(256);
  const total = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
    hist[lum]!++;
  }

  // 2. Otsu threshold calculation
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i]!;

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t]!;
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t]!;
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const betweenVariance = wB * wF * (mB - mF) * (mB - mF);

    if (betweenVariance > maxVariance) {
      maxVariance = betweenVariance;
      threshold = t;
    }
  }

  // 3. Binarize (black characters on white background)
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    const val = lum <= threshold ? 0 : 255;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Variant 3: Unsharp Mask Sharpening
 * Sharpens character edges to overcome mild camera blur.
 */
export function applySharpening(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const src = imgData.data;
  const output = ctx.createImageData(canvas.width, canvas.height);
  const dst = output.data;

  const w = canvas.width;
  const h = canvas.height;

  // Unsharp kernel: [0, -1, 0; -1, 5, -1; 0, -1, 0]
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const up = ((y - 1) * w + x) * 4;
      const down = ((y + 1) * w + x) * 4;
      const left = (y * w + (x - 1)) * 4;
      const right = (y * w + (x + 1)) * 4;

      const lumCenter = 0.299 * src[idx]! + 0.587 * src[idx + 1]! + 0.114 * src[idx + 2]!;
      const lumUp = 0.299 * src[up]! + 0.587 * src[up + 1]! + 0.114 * src[up + 2]!;
      const lumDown = 0.299 * src[down]! + 0.587 * src[down + 1]! + 0.114 * src[down + 2]!;
      const lumLeft = 0.299 * src[left]! + 0.587 * src[left + 1]! + 0.114 * src[left + 2]!;
      const lumRight = 0.299 * src[right]! + 0.587 * src[right + 1]! + 0.114 * src[right + 2]!;

      const sharpLum = Math.max(
        0,
        Math.min(255, Math.round(5 * lumCenter - (lumUp + lumDown + lumLeft + lumRight))),
      );

      dst[idx] = sharpLum;
      dst[idx + 1] = sharpLum;
      dst[idx + 2] = sharpLum;
      dst[idx + 3] = 255;
    }
  }

  ctx.putImageData(output, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Variant 4: Adaptive Local Thresholding
 * Evaluates local pixel neighborhoods to handle uneven lighting or flash gradients.
 */
export function applyAdaptiveThreshold(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  const gray = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
  }

  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += gray[y * w + x]!;
      integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)]! + rowSum;
    }
  }

  const s = Math.max(8, Math.round(w / 32));
  const s2 = Math.round(s / 2);
  const c = 7;

  for (let y = 0; y < h; y++) {
    const y1 = Math.max(0, y - s2);
    const y2 = Math.min(h, y + s2);
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x - s2);
      const x2 = Math.min(w, x + s2);
      const count = (x2 - x1) * (y2 - y1);
      const sum =
        integral[y2 * (w + 1) + x2]! -
        integral[y1 * (w + 1) + x2]! -
        integral[y2 * (w + 1) + x1]! +
        integral[y1 * (w + 1) + x1]!;
      const mean = sum / count;
      const val = gray[y * w + x]! < mean - c ? 0 : 255;
      const idx = (y * w + x) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Candidate E: Minimal Preprocessing (Grayscale only, no harsh thresholding).
 * Preserves natural character boundaries and prevents artificial bridging between adjacent characters.
 */
export function applyMinimalGrayscale(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
    data[i] = lum;
    data[i + 1] = lum;
    data[i + 2] = lum;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Upscales a cropped line canvas to optimal OCR character height (65-80px).
 * Monospaced OCR-B characters are separated with clear pixel gaps at this scale.
 */
function upscaleForOcr(sourceCanvas: HTMLCanvasElement, targetLineHeight = 75): HTMLCanvasElement {
  if (sourceCanvas.height >= targetLineHeight) return sourceCanvas;
  const scale = targetLineHeight / Math.max(1, sourceCanvas.height);
  const up = document.createElement("canvas");
  up.width = Math.round(sourceCanvas.width * scale);
  up.height = Math.round(sourceCanvas.height * scale);
  const ctx = up.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sourceCanvas, 0, 0, up.width, up.height);
  return up;
}

/**
 * Creates an inverted 180° rotated canvas for upside-down scans.
 */
function rotate180(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const rot = document.createElement("canvas");
  rot.width = sourceCanvas.width;
  rot.height = sourceCanvas.height;
  const rotCtx = rot.getContext("2d")!;
  rotCtx.translate(rot.width / 2, rot.height / 2);
  rotCtx.rotate(Math.PI);
  rotCtx.drawImage(sourceCanvas, -rot.width / 2, -rot.height / 2);
  return rot;
}

// ---------------------------------------------------------------------------
// OCR Worker Lifecycle
// ---------------------------------------------------------------------------

let workerPromise: Promise<Awaited<ReturnType<typeof createWorker>>> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker("eng", 1, {
        workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/worker.min.js",
        langPath: "https://tessdata.projectnaptha.com/4.0.0",
        corePath:
          "https://cdn.jsdelivr.net/npm/tesseract.js-core@6/tesseract-core-simd-lstm.wasm.js",
        logger: () => undefined,
        errorHandler: () => undefined,
      });

      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        // Whitelist standard ICAO MRZ characters
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<",
        // Disable dictionary models to avoid English bias on chevrons
        load_system_dawg: "0",
        load_freq_dawg: "0",
        load_punc_dawg: "0",
        load_number_dawg: "0",
        load_unambig_dawg: "0",
        load_bigram_dawg: "0",
      });

      return worker;
    })();
  }
  return workerPromise;
}

// ---------------------------------------------------------------------------
// Main Scan Pipeline
// ---------------------------------------------------------------------------

/**
 * Scans a passport image locally in the browser using an adaptive, multi-attempt
 * OCR pipeline with ICAO check-digit verification and controlled error correction.
 */
export async function scanPassportLocally(dataUrl: string): Promise<PassportScanResult> {
  const img = await loadImage(dataUrl);
  const { canvas: fullCanvas, ctx: fullCtx, width, height } = renderFullCanvas(img);

  // Quality check
  const quality = assessImageQuality(fullCtx, width, height);
  if (!quality.isAcceptable && quality.reason) {
    throw new Error(quality.reason);
  }

  const worker = await getWorker();

  // Helper for single-line OCR (OCR Line 1 and Line 2 individually)
  const runSingleLineOcr = async (
    line1Url: string,
    line2Url: string,
  ): Promise<{ parsed: MrzParseResult; score: number } | null> => {
    try {
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<",
        load_system_dawg: "0",
        load_freq_dawg: "0",
        load_punc_dawg: "0",
        load_number_dawg: "0",
        load_unambig_dawg: "0",
        load_bigram_dawg: "0",
      });

      const { data: d1 } = await worker.recognize(line1Url);
      const { data: d2 } = await worker.recognize(line2Url);

      const l1 = normaliseMrzLine(d1.text);
      const l2 = normaliseMrzLine(d2.text);

      const parsed = parseMrz(l1, l2);
      return { parsed, score: parsed.confidenceScore };
    } catch {
      return null;
    }
  };

  // Helper for uniform block OCR (OCR 2-line MRZ block)
  const runBlockOcr = async (
    blockUrl: string,
  ): Promise<{ parsed: MrzParseResult; score: number } | null> => {
    try {
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<",
        load_system_dawg: "0",
        load_freq_dawg: "0",
        load_punc_dawg: "0",
        load_number_dawg: "0",
        load_unambig_dawg: "0",
        load_bigram_dawg: "0",
      });

      const { data } = await worker.recognize(blockUrl);
      const candidates = extractAllMrzCandidates(data.text);
      if (candidates.length === 0) return null;

      let bestParsed: MrzParseResult | null = null;
      let highestScore = -1;

      for (const [l1, l2] of candidates) {
        const parsed = parseMrz(l1, l2);
        if (parsed.confidenceScore > highestScore) {
          highestScore = parsed.confidenceScore;
          bestParsed = parsed;
        }
      }

      return bestParsed ? { parsed: bestParsed, score: highestScore } : null;
    } catch {
      return null;
    }
  };

  const candidateResults: Array<{ parsed: MrzParseResult; score: number }> = [];

  // =========================================================================
  // STEP 1: Detect MRZ Region & Individual Lines
  // =========================================================================
  const mrzBounds = detectMrzBounds(fullCanvas);

  // Line 1 and Line 2 crops, upscaled for clear character spacing
  const rawL1 = cropRegion(fullCanvas, mrzBounds.line1Top, mrzBounds.line1Bottom);
  const rawL2 = cropRegion(fullCanvas, mrzBounds.line2Top, mrzBounds.line2Bottom);
  const line1Canvas = upscaleForOcr(rawL1, 75);
  const line2Canvas = upscaleForOcr(rawL2, 75);

  const rawBlock = cropRegion(fullCanvas, mrzBounds.blockTop, mrzBounds.blockBottom);
  const blockCanvas = upscaleForOcr(rawBlock, 150);

  // =========================================================================
  // ATTEMPT 1: Separate Line OCR with Percentile Contrast (Candidate A)
  // =========================================================================
  const l1Url1 = applyPercentileContrast(line1Canvas);
  const l2Url1 = applyPercentileContrast(line2Canvas);
  const res1 = await runSingleLineOcr(l1Url1, l2Url1);

  if (res1) {
    candidateResults.push(res1);
    if (res1.parsed.confidence === "HIGH" && res1.parsed.ok && res1.score >= 95) {
      return buildResult(res1.parsed);
    }
  }

  // =========================================================================
  // ATTEMPT 2: Separate Line OCR with Minimal Grayscale (Candidate E)
  // Prevents over-binarization from creating bridges between adjacent characters
  // =========================================================================
  const l1Url2 = applyMinimalGrayscale(line1Canvas);
  const l2Url2 = applyMinimalGrayscale(line2Canvas);
  const res2 = await runSingleLineOcr(l1Url2, l2Url2);

  if (res2) {
    candidateResults.push(res2);
    if (res2.parsed.confidence === "HIGH" && res2.parsed.ok && res2.score >= 95) {
      return buildResult(res2.parsed);
    }
  }

  // =========================================================================
  // ATTEMPT 3: Separate Line OCR with Otsu Binarization (Candidate C)
  // =========================================================================
  const l1Url3 = applyOtsuBinarization(line1Canvas);
  const l2Url3 = applyOtsuBinarization(line2Canvas);
  const res3 = await runSingleLineOcr(l1Url3, l2Url3);

  if (res3) {
    candidateResults.push(res3);
    if (res3.parsed.confidence === "HIGH" && res3.parsed.ok && res3.score >= 95) {
      return buildResult(res3.parsed);
    }
  }

  // =========================================================================
  // ATTEMPT 4: Adaptive Thresholding on Separate Lines (Candidate B)
  // =========================================================================
  const l1Url4 = applyAdaptiveThreshold(line1Canvas);
  const l2Url4 = applyAdaptiveThreshold(line2Canvas);
  const res4 = await runSingleLineOcr(l1Url4, l2Url4);
  if (res4) {
    candidateResults.push(res4);
  }

  // =========================================================================
  // ATTEMPT 5: Block OCR on tight MRZ region
  // =========================================================================
  const blockUrl5 = applyPercentileContrast(blockCanvas);
  const res5 = await runBlockOcr(blockUrl5);
  if (res5) {
    candidateResults.push(res5);
  }

  // =========================================================================
  // ATTEMPT 6: Sharpened Block OCR (Candidate D)
  // =========================================================================
  const blockUrl6 = applySharpening(blockCanvas);
  const res6 = await runBlockOcr(blockUrl6);
  if (res6) {
    candidateResults.push(res6);
  }

  // =========================================================================
  // ATTEMPT 7: Geometric Fallback Crops (omitting bottom 3.5% security pattern)
  // =========================================================================
  if (candidateResults.length === 0 || candidateResults.every((c) => c.score < 60)) {
    const geoCrop = cropBottomBand(fullCanvas, 0.25, 0.035);
    const geoUrl = applyPercentileContrast(geoCrop);
    const geoRes = await runBlockOcr(geoUrl);
    if (geoRes) {
      candidateResults.push(geoRes);
    }
  }

  // =========================================================================
  // ATTEMPT 8: Upside-down check (180° rotation fallback)
  // =========================================================================
  if (candidateResults.length === 0 || candidateResults.every((c) => c.score < 50)) {
    const rotated = rotate180(fullCanvas);
    const rotBounds = detectMrzBounds(rotated);
    const rotL1 = upscaleForOcr(cropRegion(rotated, rotBounds.line1Top, rotBounds.line1Bottom), 75);
    const rotL2 = upscaleForOcr(cropRegion(rotated, rotBounds.line2Top, rotBounds.line2Bottom), 75);
    const rotRes = await runSingleLineOcr(
      applyPercentileContrast(rotL1),
      applyPercentileContrast(rotL2),
    );
    if (rotRes) {
      candidateResults.push(rotRes);
    }
  }

  // Pick the candidate with the highest structural reliability score
  candidateResults.sort((a, b) => b.score - a.score);
  const best = candidateResults[0];

  if (!best || best.score < 45 || !best.parsed.ok) {
    throw new Error(
      "Passport MRZ could not be read reliably. Please place the passport flat, ensure good lighting, and keep the MRZ fully visible.",
    );
  }

  return buildResult(best.parsed);
}

function buildResult(parsed: MrzParseResult): PassportScanResult {
  if (!parsed.ok && parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]!);
  }

  const res = {
    first: parsed.givenNames.trim().toUpperCase(),
    last: parsed.surname.trim().toUpperCase(),
    dob: parsed.dateOfBirth,
    passport: parsed.passportNumber,
    nationality: parsed.nationality,
    expiry: parsed.expiryDate,
    sex: parsed.sex,
    ...(parsed.lowConfidence ? { _lowConfidence: true } : {}),
    ...(parsed.warnings.length > 0 ? { _warnings: parsed.warnings } : {}),
    confidence: parsed.confidence,
    confidenceScore: parsed.confidenceScore,
    repairedFields: parsed.repairedFields,
  };

  return res as unknown as PassportScanResult;
}
