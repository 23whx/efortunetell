export type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  mimeType?: 'image/webp' | 'image/jpeg';
  quality?: number; // 0..1
};

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<CompressedImage> {
  const maxWidth = opts.maxWidth ?? 2000;
  const maxHeight = opts.maxHeight ?? 2000;
  const mimeType = opts.mimeType ?? 'image/webp';
  const quality = clamp(opts.quality ?? 0.82, 0.1, 0.95);

  // Decode
  const bitmap = await createImageBitmap(file);
  const inW = bitmap.width;
  const inH = bitmap.height;

  // Scale down (never scale up)
  const scale = Math.min(1, maxWidth / inW, maxHeight / inH);
  const outW = Math.max(1, Math.round(inW * scale));
  const outH = Math.max(1, Math.round(inH * scale));

  // Draw to canvas
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, outW, outH);
  bitmap.close?.();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      mimeType,
      quality
    );
  });

  return { blob, width: outW, height: outH, mimeType: blob.type || mimeType };
}


