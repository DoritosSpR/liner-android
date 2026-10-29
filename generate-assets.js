const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ASSETS_DIR = path.join(__dirname, "assets");

function writePng(filePath, width, height, drawFn) {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4, 0); // filter byte + RGBA pixels
    row[0] = 0; // filter byte = 0 (none)
    for (let x = 0; x < width; x++) {
      const color = drawFn(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = color.r;
      row[offset + 1] = color.g;
      row[offset + 2] = color.b;
      row[offset + 3] = color.a;
    }
    rows.push(row);
  }
  const rawData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crcInput = Buffer.concat([t, data]);
    const crc = zlib.crc32(crcInput) >>> 0;
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, t, data, crcBuf]);
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const png = Buffer.concat([
    pngHeader,
    makeChunk("IHDR", ihdrData),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, png);
  console.log(`Generated: ${filePath} (${width}x${height})`);
}

function drawIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w * 0.2;

  const base = { r: 0x12, g: 0x12, b: 0x12, a: 0xff };

  const dx = x - cx;
  const dy = y - cy;
  if (dx * dx + dy * dy <= r * r) {
    return { r: 0x1d, g: 0xb9, b: 0x54, a: 0xff };
  }

  const triSize = w * 0.1;
  const triX = cx - triSize * 0.3;
  const triY = cy - triSize * 0.5;
  if (
    x >= triX &&
    x <= triX + triSize &&
    y >= triY &&
    y <= triY + triSize
  ) {
    const localX = x - triX;
    const localY = y - triY;
    if (localY >= localX * 0.5 && localY <= triSize - localX * 0.5) {
      return { r: 0xff, g: 0xff, b: 0xff, a: 0xff };
    }
  }

  return base;
}

function main() {
  const sizes = [48, 72, 96, 144, 192, 512, 1024];

  sizes.forEach((size) => {
    writePng(path.join(ASSETS_DIR, `icon-${size}.png`), size, size, drawIcon);
    writePng(
      path.join(ASSETS_DIR, `adaptive-icon-${size}.png`),
      size,
      size,
      drawIcon
    );
  });

  const splashSizes = [640, 750, 828, 1125, 1242, 2048, 2732];
  splashSizes.forEach((size) => {
    writePng(path.join(ASSETS_DIR, `splash-${size}.png`), size, size, drawIcon);
  });

  writePng(path.join(ASSETS_DIR, "favicon.png"), 64, 64, drawIcon);

  // Also create the plain names that app.json references
  fs.copyFileSync(
    path.join(ASSETS_DIR, "icon-1024.png"),
    path.join(ASSETS_DIR, "icon.png")
  );
  fs.copyFileSync(
    path.join(ASSETS_DIR, "adaptive-icon-1024.png"),
    path.join(ASSETS_DIR, "adaptive-icon.png")
  );
  fs.copyFileSync(
    path.join(ASSETS_DIR, "splash-2048.png"),
    path.join(ASSETS_DIR, "splash.png")
  );
  fs.copyFileSync(
    path.join(ASSETS_DIR, "favicon.png"),
    path.join(ASSETS_DIR, "favicon.png")
  );

  console.log("\n✓ All assets generated!");
}

main();
