// Generates simple colored shield icons for the extension
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '../public/icons');

function createPNG(width, height, r, g, b) {
  // Build raw pixel data (RGBA): 1 filter byte + width*4 bytes per row
  const rowBytes = 1 + width * 4;
  const raw = Buffer.alloc(height * rowBytes);
  for (let y = 0; y < height; y++) {
    raw[y * rowBytes] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const cx = x - width / 2;
      const cy = y - height / 2;
      const radius = width * 0.4;
      const dist = Math.sqrt(cx * cx + cy * cy);

      const inShield =
        dist < radius &&
        !(dist > radius * 0.75 && cy > 0 && Math.abs(cx) < radius * 0.3);

      const offset = y * rowBytes + 1 + x * 4;
      if (inShield) {
        raw[offset] = r;
        raw[offset + 1] = g;
        raw[offset + 2] = b;
        raw[offset + 3] = 255;
      } else if (dist < radius) {
        raw[offset] = 255;
        raw[offset + 1] = 255;
        raw[offset + 2] = 255;
        raw[offset + 3] = 255;
      } else {
        raw[offset] = 0;
        raw[offset + 1] = 0;
        raw[offset + 2] = 0;
        raw[offset + 3] = 0;
      }
    }
  }

  // Compress the raw data
  const deflated = zlib.deflateSync(raw);

  // Build PNG file
  function createChunk(type, data) {
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = crc32(typeAndData);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([length, typeAndData, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', deflated),
    createChunk('IEND', iend),
  ]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons: green shield
const sizes = [16, 32, 48, 128];
for (const size of sizes) {
  const png = createPNG(size, size, 34, 139, 34); // Green
  writeFileSync(resolve(iconsDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png`);
}
