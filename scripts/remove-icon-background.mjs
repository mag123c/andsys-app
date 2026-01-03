import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '../public/icons');

const icons = [
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'icon-maskable-512.png'
];

async function removeWhiteBackground(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Create new buffer with alpha channel
  const newData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    // Check if pixel is white or near-white (background)
    const isWhite = r > 250 && g > 250 && b > 250;

    newData[dstIdx] = r;     // R
    newData[dstIdx + 1] = g; // G
    newData[dstIdx + 2] = b; // B
    newData[dstIdx + 3] = isWhite ? 0 : 255; // A (transparent if white)
  }

  await sharp(newData, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png()
    .toFile(outputPath);

  console.log(`Processed: ${path.basename(outputPath)}`);
}

async function main() {
  for (const icon of icons) {
    const inputPath = path.join(iconsDir, icon);
    const outputPath = inputPath; // Overwrite original

    try {
      await removeWhiteBackground(inputPath, outputPath);
    } catch (err) {
      console.error(`Error processing ${icon}:`, err.message);
    }
  }

  console.log('Done! All icons now have transparent backgrounds.');
}

main();
