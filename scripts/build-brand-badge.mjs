import { unlinkSync } from "fs";
import sharp from "sharp";

const tpl = "public/brand-template.png";
const logoPath = "public/logo-mark.png";
const { data, info } = await sharp(tpl).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const ch = info.channels;

const navy = { r: 0, g: 0, b: 0 };

function paint(x, y) {
  const i = (y * W + x) * ch;
  data[i] = navy.r;
  data[i + 1] = navy.g;
  data[i + 2] = navy.b;
  data[i + 3] = 255;
}

// 1) Remove fire/ice crest above the top white bar (bar ~ y 110-112)
const topBarY = 110;
for (let y = 0; y < topBarY; y++) {
  for (let x = Math.round(W * 0.1); x < Math.round(W * 0.9); x++) {
    paint(x, y);
  }
}

// Remove template heart / social mark at top-right
for (let y = 0; y < 55; y++) {
  for (let x = Math.round(W * 0.78); x < W; x++) {
    paint(x, y);
  }
}

// 2) Remove "LOGO TEXT HERE" gold band (y ~128-148), keep bars
for (let y = 124; y <= 150; y++) {
  for (let x = Math.round(W * 0.08); x < Math.round(W * 0.92); x++) {
    paint(x, y);
  }
}

// 3) Remove "SLOGAN HERE" bottom curve/text (keep 2026 trapezoid ~172-176)
for (let y = 178; y < H; y++) {
  for (let x = 0; x < W; x++) {
    paint(x, y);
  }
}
// also clear residual slogan letters beside the year box
for (let y = 168; y < 178; y++) {
  for (let x = 0; x < W; x++) {
    if (x < Math.round(W * 0.34) || x > Math.round(W * 0.66)) paint(x, y);
  }
}

const cleaned = await sharp(data, { raw: { width: W, height: H, channels: ch } }).png().toBuffer();

// Logo rests on the white line
const logoSize = 92;
const logoBuf = await sharp(logoPath)
  .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const logoLeft = Math.round((W - logoSize) / 2);
const logoTop = topBarY - logoSize + 2;

const titleSvg = Buffer.from(`
<svg width="${W}" height="28" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff6cf"/>
      <stop offset="45%" stop-color="#e6bc3d"/>
      <stop offset="100%" stop-color="#9a7210"/>
    </linearGradient>
  </defs>
  <text x="50%" y="70%" text-anchor="middle"
    font-family="Arial Black, Impact, Arial, sans-serif"
    font-size="15" font-weight="800" letter-spacing="0.8"
    fill="url(#g)">SENSITIVITY CODES</text>
</svg>`);
const titlePng = await sharp(titleSvg).png().toBuffer();

const sloganSvg = Buffer.from(`
<svg width="${W}" height="28" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="55%" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="10" font-weight="600" letter-spacing="2.2"
    fill="#ffffff">COMMUNITY SETTINGS</text>
</svg>`);
const sloganPng = await sharp(sloganSvg).png().toBuffer();

await sharp(cleaned)
  .composite([
    { input: logoBuf, left: logoLeft, top: Math.max(0, logoTop) },
    { input: titlePng, left: 0, top: 126 },
    { input: sloganPng, left: 0, top: 184 },
  ])
  .png()
  .toFile("public/brand-badge.png");

await sharp("public/brand-badge.png")
  .extract({ left: 0, top: 105, width: 250, height: 108 })
  .resize(500, 216, { kernel: "lanczos3" })
  .png()
  .toFile("public/brand-frame.tmp.png");

// force pure black backgrounds on exports + trim frame padding
for (const file of ["public/brand-badge.png", "public/brand-frame.tmp.png"]) {
  const img = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = img.data;
  const { width, height, channels } = img.info;
  for (let i = 0; i < buf.length; i += channels) {
    if (buf[i] < 45 && buf[i + 1] < 45 && buf[i + 2] < 70) {
      buf[i] = 0;
      buf[i + 1] = 0;
      buf[i + 2] = 0;
    }
  }
  await sharp(buf, { raw: { width, height, channels } }).png().toFile(file);
}

{
  const { data, info } = await sharp("public/brand-frame.tmp.png")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const ch = info.channels;
  let minX = W;
  let minY = H;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      if (!(data[i] < 8 && data[i + 1] < 8 && data[i + 2] < 8)) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(H - 1, maxY + pad);
  await sharp("public/brand-frame.tmp.png")
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toFile("public/brand-frame.png");
  unlinkSync("public/brand-frame.tmp.png");
}

console.log("done", { logoTop, logoSize });
