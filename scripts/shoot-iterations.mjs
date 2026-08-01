/* Before/after captures for the Iterations section of the portfolio
   case page.
 *
 * The point of these shots is that only the redesign moves between
 * them, so both sides are taken the same way, at the same viewport,
 * device scale, scroll position and crop box. The "before" side comes
 * from a detached worktree at the commit being compared (7d9fd6a for
 * About, the last commit before the pour), served on its own port, so
 * the working tree is never touched.
 *
 * The pour is scroll-scrubbed, so About only exists fully formed at the
 * end of its pin. `frac` is how far through that pin to sit; 1 is the
 * settled state the anchor scrolls to.
 *
 * webp is written through a canvas in the same browser rather than a
 * native encoder, which keeps this to one dependency.
 *
 * Usage, from the repo root:
 *
 *   git worktree add /tmp/old <commit>
 *   ln -s "$PWD/node_modules" /tmp/old/node_modules
 *   npm run dev -- --port 5180 --strictPort
 *   (cd /tmp/old && npm run dev -- --port 5181 --strictPort)
 *   npm i -D playwright && node scripts/shoot-iterations.mjs
 *   git worktree remove --force /tmp/old
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/assets/projects/portfolio/iterations/', import.meta.url);

const SHOTS = [
  { url: 'http://localhost:5181/', name: 'about_before.webp' },
  { url: 'http://localhost:5180/', name: 'about_after.webp' },
];

/* the About block inside the pinned espresso panel, at the viewport
   below. Held identical across shots so the pair registers. */
const CLIP = { x: 88, y: 255, width: 1424, height: 555 };
const VIEWPORT = { width: 1600, height: 1000 };
const SCALE = 2; // capture at 2x, then down to 0.7 for a ~1.4x asset
const DOWNSCALE = 0.7;
const QUALITY = 0.9;

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
  await page.goto(shot.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // hero entrance settles, fonts swap in

  const { top, height } = await page.evaluate(() => {
    const r = document.querySelector('.pour').getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height };
  });
  const y = top + (height - VIEWPORT.height);

  // lenis interpolates, so jump twice with a wait between: the first
  // sets the target, the second lands on it once lenis has caught up
  await page.evaluate((to) => window.scrollTo(0, to), y);
  await page.waitForTimeout(3000);
  await page.evaluate((to) => window.scrollTo(0, to), y);
  await page.waitForTimeout(2500);

  const png = await page.screenshot({ clip: CLIP });
  const webp = await page.evaluate(
    async ({ b64, scale, quality }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/webp', quality);
    },
    { b64: png.toString('base64'), scale: DOWNSCALE, quality: QUALITY },
  );

  await writeFile(new URL(shot.name, OUT), Buffer.from(webp.split(',')[1], 'base64'));
  console.log(shot.name);
  await page.close();
}

await browser.close();
