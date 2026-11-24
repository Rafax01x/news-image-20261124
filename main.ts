// News-image entry: ship the rendered front page to the output folder,
// after proving it is a genuine PNG inside the competition's limits.
// Node 22, standard library only. No network, no input, deterministic:
// the same entry.png bytes leave on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const IMAGE = new URL("./entry.png", import.meta.url);

const data = readFileSync(IMAGE);

function bad(msg: string): never {
  throw new Error(msg);
}

// A PNG always opens with these eight bytes.
const MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
for (let i = 0; i < MAGIC.length; i++) {
  if (data[i] !== MAGIC[i]) bad("entry.png is not a PNG file");
}

// The IHDR chunk stores width then height, big-endian, at bytes 16 and 20.
// Bytes 12..15 must spell IHDR, or this is not a PNG at all.
if (data.toString("latin1", 12, 16) !== "IHDR") bad("entry.png has no IHDR chunk");
const w = data.readUInt32BE(16);
const h = data.readUInt32BE(20);
if (w !== h) bad(`image is ${w}x${h}, it must be square`);
if (w > 1024) bad(`image is ${w}x${h}, over the 1024x1024 limit`);
if (data.length > 1048576) bad(`image is ${data.length} bytes, over the 1 MiB limit`);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "entry.png"), data);
console.log(`wrote entry.png: ${w}x${h}, ${data.length} bytes`);
