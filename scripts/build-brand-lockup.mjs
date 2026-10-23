import { unlinkSync } from "fs";
import sharp from "sharp";

const logoPath = "public/logo-mark.png";
const framePath = "public/brand-frame.png";

async function contentBox(file, threshold = 20) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
      if (data[i] > threshold || data[i + 1] > threshold || data[i + 2] > threshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { minX, minY, maxX, maxY, W, H };
}

/** Blue top → orange bottom (badge body, no COMMUNITY SETTINGS) */
async function flowBand(left, top, width, height) {
  const { data, info } = await sharp(framePath)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const ch = info.channels;
  const scanW = Math.max(10, Math.round(W * 0.2));
  let blueTop = H;
  let orangeBot = 0;
  for (let y = 0; y < Math.round(H * 0.75); y++) {
    let blue = 0;
    let orange = 0;
    for (let x = 0; x < scanW; x++) {
      const i = (y * W + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r + g + b < 50) continue;
      if (b > r + 15 && b > g + 5) blue++;
      else if (r > g + 15 && r > b + 30) orange++;
    }
    if (blue >= 4) blueTop = Math.min(blueTop, y);
    if (orange >= 6) orangeBot = Math.max(orangeBot, y);
  }
  return { top: blueTop, bot: orangeBot };
}

/**
 * Max overlap before covering first letter of SENSITIVITY.
 * Returns px in outFrameW space.
 */
async function safeOverlapPx(left, top, width, height, outFrameW, outFrameH) {
  const { data, info } = await sharp(framePath)
    .extract({ left, top, width, height })
    .resize(outFrameW, outFrameH, { fit: "fill", kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const ch = info.channels;
  let letterX = W;
  for (let x = 0; x < Math.round(W * 0.45); x++) {
    let maxRun = 0;
    let run = 0;
    for (let y = Math.round(H * 0.34); y < Math.round(H * 0.52); y++) {
      const i = (y * W + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gold = r > 170 && g > 130 && b < 160 && r > b + 40;
      if (gold) {
        run++;
        maxRun = Math.max(maxRun, run);
      } else run = 0;
    }
    if (maxRun >= 4) {
      letterX = x;
      break;
    }
  }
  // kiss bar/swoosh tips only — keep SENSITIVITY stems clear
  return Math.max(6, Math.min(letterX - 2, Math.round(outFrameW * 0.05)));
}

async function logoTransparent(left, top, width, height, outW, outH) {
  const { data, info } = await sharp(logoPath)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    if (data[i] < 28 && data[i + 1] < 28 && data[i + 2] < 28) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .resize(outW, outH, { fit: "fill", kernel: "lanczos3" })
    .png()
    .toBuffer();
}

/** Bottom Y of badge body — cuts off COMMUNITY SETTINGS subtitle */
async function frameBadgeBottom(left, top, width, height) {
  const { data, info } = await sharp(framePath)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const ch = info.channels;
  // First lower row that is mostly flat white text → subtitle start
  let subtitleY = -1;
  for (let y = Math.round(H * 0.55); y < H; y++) {
    let white = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) white++;
    }
    if (white > W * 0.12) {
      subtitleY = y;
      break;
    }
  }
  if (subtitleY < 0) return height;
  // keep a little pad under orange swoosh; drop subtitle + gap
  return Math.max(40, subtitleY - 4);
}

const logoBox = await contentBox(logoPath);
const frameBox = await contentBox(framePath);

const logoPad = 0;
const logoLeft = Math.max(0, logoBox.minX - logoPad);
const logoTop = Math.max(0, logoBox.minY - logoPad);
const logoW = Math.min(logoBox.W - logoLeft, logoBox.maxX - logoBox.minX + 1 + logoPad * 2);
const logoH = Math.min(logoBox.H - logoTop, logoBox.maxY - logoBox.minY + 1 + logoPad * 2);

const framePad = 2;
const frameLeft = Math.max(0, frameBox.minX - framePad);
const frameTop = Math.max(0, frameBox.minY - framePad);
const frameW = Math.min(frameBox.W - frameLeft, frameBox.maxX - frameBox.minX + 1 + framePad * 2);
const frameHFull = Math.min(frameBox.H - frameTop, frameBox.maxY - frameBox.minY + 1 + framePad * 2);
const frameH = await frameBadgeBottom(frameLeft, frameTop, frameW, frameHFull);

const outFrameH = 120;
const outFrameW = Math.round((frameW / frameH) * outFrameH);

const band = await flowBand(frameLeft, frameTop, frameW, frameH);
const flowTop = Math.round((band.top / frameH) * outFrameH);
const flowBot = Math.round((band.bot / frameH) * outFrameH);
const flowH = Math.max(50, flowBot - flowTop + 1);

// Larger SC: S tip into top bar/blue, C into bottom bar/orange
const outLogoH = Math.round(outFrameH * 0.72);
const outLogoW = Math.round((logoW / logoH) * outLogoH);

const overlap = await safeOverlapPx(frameLeft, frameTop, frameW, frameH, outFrameW, outFrameH);
const outH = outFrameH + 6;
const outW = outLogoW + outFrameW - overlap;
const logoX = 2;
const frameX = logoX + outLogoW - overlap;
const frameY = Math.round((outH - outFrameH) / 2);
// Vertically center on badge flow (not community settings line)
const logoY = frameY + flowTop + Math.round((flowH - outLogoH) / 2);

const logoBuf = await logoTransparent(logoLeft, logoTop, logoW, logoH, outLogoW, outLogoH);

const frameRaw = await sharp(framePath)
  .extract({ left: frameLeft, top: frameTop, width: frameW, height: frameH })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
{
  const ch = frameRaw.info.channels;
  const data = frameRaw.data;
  for (let i = 0; i < data.length; i += ch) {
    if (data[i] < 28 && data[i + 1] < 28 && data[i + 2] < 28) data[i + 3] = 0;
  }
}
const frameBuf = await sharp(frameRaw.data, {
  raw: {
    width: frameRaw.info.width,
    height: frameRaw.info.height,
    channels: frameRaw.info.channels,
  },
})
  .resize(outFrameW, outFrameH, { fit: "fill", kernel: "lanczos3" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: outW + 2,
    height: outH,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: frameBuf, left: frameX, top: frameY },
    { input: logoBuf, left: logoX, top: logoY },
  ])
  .png()
  .toFile("public/brand-lockup.tmp.png");

{
  const box = await contentBox("public/brand-lockup.tmp.png", 12);
  const pad = 3;
  const left = Math.max(0, box.minX - pad);
  const top = Math.max(0, box.minY - pad);
  const width = Math.min(box.W - left, box.maxX - box.minX + 1 + pad * 2);
  const height = Math.min(box.H - top, box.maxY - box.minY + 1 + pad * 2);
  await sharp("public/brand-lockup.tmp.png")
    .extract({ left, top, width, height })
    .png()
    .toFile("public/brand-lockup.png");
  unlinkSync("public/brand-lockup.tmp.png");
}

const meta = await sharp("public/brand-lockup.png").metadata();
console.log("lockup", meta.width, meta.height, {
  outLogoW,
  outLogoH,
  outFrameW,
  overlap,
  flowTop,
  flowBot,
  flowH,
});
