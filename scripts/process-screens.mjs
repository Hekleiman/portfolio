// One-off: turn raw project screenshots into 640x400 "cartridge label art".
// Desktop captures (1280x800, 1.6 aspect) resize cleanly to 640x400.
// The Trade-Up phone capture (390x844) is centered on a lavender pad so it
// reads as a phone screen while sharing the same 640x400 landscape box.
// Output is palette PNG (retro, pixelated-friendly) targeting <150KB each.
import sharp from 'sharp';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = process.argv[2];
const OUT = join(__dirname, '..', 'public', 'images', 'projects');

const W = 640;
const H = 400;
const PAD = { r: 233, g: 230, b: 250 }; // lavender, echoes the Trade-Up app bg

for (const file of readdirSync(RAW)) {
  if (!file.endsWith('.png')) continue;
  const src = join(RAW, file);
  const dest = join(OUT, file);
  const meta = await sharp(src).metadata();
  const landscape = meta.width / meta.height >= W / H;

  let pipeline;
  if (landscape) {
    // fill the box from the top of the page (hero / header is the best part)
    pipeline = sharp(src).resize(W, H, { fit: 'cover', position: 'top' });
  } else {
    // fit the phone inside the box and pad the sides
    pipeline = sharp(src).resize(W, H, {
      fit: 'contain',
      background: PAD,
    });
  }

  await pipeline
    .png({ palette: true, colors: 256, dither: 1.0, compressionLevel: 9, effort: 10 })
    .toFile(dest);

  const kb = (statSync(dest).size / 1024).toFixed(0);
  console.log(`${file.padEnd(16)} ${W}x${H}  ${kb}KB`);
}
