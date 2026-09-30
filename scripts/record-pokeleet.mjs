/* Walkthrough recordings for the PokeLeet case page.
 *
 * Drives the PokeLeet demo build the way a person would — a drawn cursor
 * that eases between targets, turns into a hand over anything clickable,
 * and presses on click — and captures every repaint through the CDP
 * screencast. Nothing here zooms: the script only logs where the
 * camera *should* look (`cam(...)`) next to the frames, and
 * render-walkthrough.py does the framing afterwards, so a camera move can
 * be retimed without driving the app again.
 *
 * The demo build keeps its save in localStorage, so a recording never
 * touches a real data/ folder, and every run starts from the same seeded
 * library. Math.random is swapped for a seeded one so the gacha pull is
 * the same pull every time (SEED below picks it).
 *
 * Usage, from the repo root:
 *
 *   (cd ../Leetcode-Pokemon && npx vite --mode demo --port 5199 --strictPort)
 *   npm i --no-save playwright
 *   node scripts/record-pokeleet.mjs add-problem /tmp/rec/add-problem
 *   node scripts/record-pokeleet.mjs gacha /tmp/rec/gacha
 *   python3 scripts/render-walkthrough.py /tmp/rec/add-problem src/assets/projects/pokeleet/walkthrough-add-problem 17
 *   python3 scripts/render-walkthrough.py /tmp/rec/gacha src/assets/projects/pokeleet/walkthrough-gacha 13.5
 */
import { chromium } from 'playwright';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const URL = process.env.POKELEET_URL || 'http://localhost:5199/Leetcode-Pokemon/';
/* The app draws a fixed 1280x800 screen and scales it to fit the window.
   The screencast only ever delivers CSS pixels (a device scale factor is
   ignored), so the 2x capture comes from a window twice the size, which
   the app fills by re-rasterizing at scale(2). Scenario coordinates stay
   in the app's own 1280x800 units; S converts at the mouse. */
const VIEWPORT = { width: 1280, height: 800 };
const S = 2;
// 40 pulls one of every tier and a shiny: luckier than the odds, but
// it's the pull that shows what the rarity tints mean
const SEED = Number(process.env.SEED || 40);

const [scenarioName, outDir] = process.argv.slice(2);

/* ---------- the drawn cursor ----------
   Two shapes drawn at the app's scale, so the camera's zoom enlarges them
   along with the UI the way the reference does. Each shape is drawn
   twice — the outline stroked wide underneath, the fill on top — so
   overlapping parts read as one silhouette. The hotspot is the arrow's
   tip / the index fingertip. */
const CURSOR_SVG = {
  arrow: `<svg viewBox="0 0 24 30" width="24" height="30" style="--hx:3px;--hy:2px">
    <path d="M3 2v21.5l5.4-5.1 3.7 8.4 3.6-1.6-3.7-8.2H19z" fill="#1b1b1b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  hand: `<svg viewBox="0 0 30 32" width="30" height="32" style="--hx:11.5px;--hy:2px">
    <g stroke="#1b1b1b" stroke-width="2.6" stroke-linejoin="round">
      <rect x="9" y="1.5" width="5" height="17" rx="2.5"/><rect x="13.6" y="10" width="5" height="10" rx="2.5"/>
      <rect x="18.2" y="11.5" width="4.6" height="9" rx="2.3"/><rect x="22.4" y="13.2" width="4.2" height="8" rx="2.1"/>
      <path d="M9 15.5h17.6v5.5c0 5-3.2 9-8 9h-2.2c-3.2 0-5.4-1.6-7-4.2l-5-7.2c-.9-1.4.9-3 2.2-1.8L9 19.6z"/>
    </g>
    <g fill="#fff">
      <rect x="9" y="1.5" width="5" height="17" rx="2.5"/><rect x="13.6" y="10" width="5" height="10" rx="2.5"/>
      <rect x="18.2" y="11.5" width="4.6" height="9" rx="2.3"/><rect x="22.4" y="13.2" width="4.2" height="8" rx="2.1"/>
      <path d="M9 15.5h17.6v5.5c0 5-3.2 9-8 9h-2.2c-3.2 0-5.4-1.6-7-4.2l-5-7.2c-.9-1.4.9-3 2.2-1.8L9 19.6z"/>
    </g>
    <path d="M14 14v4.6M18.6 14.5v4.6M22.8 16v3.6" stroke="#1b1b1b" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`,
};

function cursorInit({ svgs, scale }) {
  addEventListener('DOMContentLoaded', () => {
    const el = document.createElement('div');
    el.id = '__cursor';
    el.innerHTML = `<b><i data-k="arrow">${svgs.arrow}</i><i data-k="hand">${svgs.hand}</i></b>`;
    const css = document.createElement('style');
    css.textContent = `
      #__cursor { position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none;
        will-change: transform; filter: drop-shadow(0 ${scale}px ${1.5 * scale}px rgba(0,0,0,.28)); }
      #__cursor b { display: block; transform: scale(${scale}); transform-origin: 0 0; }
      #__cursor i { position: absolute; left: 0; top: 0; display: none; transform-origin: 0 0; }
      #__cursor svg { display: block; transform: translate(calc(-1 * var(--hx)), calc(-1 * var(--hy))); }
      #__cursor[data-k="arrow"] i[data-k="arrow"], #__cursor[data-k="hand"] i[data-k="hand"] { display: block; }
      #__cursor i { transition: transform .12s ease-out; }
      #__cursor.down i { transform: scale(.86); }`;
    document.documentElement.append(css, el);
    el.dataset.k = 'arrow';
    let x = -100, y = -100;
    const place = () => { el.style.transform = `translate(${x}px, ${y}px)`; };
    const pointerAt = () => {
      const t = document.elementFromPoint(x, y);
      if (!t) return false;
      const c = getComputedStyle(t).cursor;
      if (c === 'pointer') return true;
      const b = t.closest('button, a[href], select, [role=button], label');
      return !!b && !b.disabled && c !== 'not-allowed' && c !== 'text';
    };
    addEventListener('mousemove', (ev) => { x = ev.clientX; y = ev.clientY; place(); }, true);
    addEventListener('mousedown', () => el.classList.add('down'), true);
    addEventListener('mouseup', () => el.classList.remove('down'), true);
    // re-read every frame: a modal opening under a still cursor changes
    // what's beneath it without a mousemove
    const tick = () => { el.dataset.k = pointerAt() ? 'hand' : 'arrow'; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    place();
  });
}

function seededRandom(seed) {
  let s = seed >>> 0;
  Math.random = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- the director ----------
   Everything a scenario does goes through here, so pacing is set in one
   place: moves take time proportional to distance on an eased arc,
   clicks settle on the target before pressing, typing has a human
   rhythm. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

function director(page, events) {
  // pos is in window px; everything a scenario passes in is app units
  let pos = { x: VIEWPORT.width * 0.55 * S, y: VIEWPORT.height * 0.6 * S };
  let bend = 1;
  const now = () => Date.now() / 1000;

  async function at(target) {
    if (typeof target.x === 'number') return { x: target.x * S, y: target.y * S };
    const loc = typeof target === 'string' ? page.locator(target).first() : target;
    await loc.waitFor({ state: 'visible' });
    const b = await loc.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }

  const d = {
    async start() { await page.mouse.move(pos.x, pos.y); },
    hold: (ms) => sleep(ms),
    /* where the renderer should frame: `zoom` over the full screen,
       centered on (cx, cy) in viewport px, arriving over `ms` */
    cam(zoom, cx = VIEWPORT.width / 2, cy = VIEWPORT.height / 2, ms = 1100) {
      events.push({ ts: now(), type: 'cam', zoom, cx, cy, ms });
    },
    /* frame an element: centered on it, zoomed until it fills about
       1/pad of the screen, but never past `max` */
    async camOn(target, { pad = 1.35, max = 2.1, ms } = {}) {
      const loc = typeof target === 'string' ? page.locator(target).first() : target;
      const b = await loc.boundingBox();
      const w = b.width / S, h = b.height / S;
      const zoom = Math.min(max, VIEWPORT.width / (w * pad), VIEWPORT.height / (h * pad));
      d.cam(Math.max(1, zoom), (b.x + b.width / 2) / S, (b.y + b.height / 2) / S, ms);
    },
    async moveTo(target, { ms, dx = 0, dy = 0 } = {}) {
      const p = await at(target);
      const to = { x: p.x + dx * S, y: p.y + dy * S };
      const from = { ...pos };
      const dist = Math.hypot(to.x - from.x, to.y - from.y) / S;
      if (dist < 1) return;
      ms ??= Math.min(1150, Math.max(520, 380 + dist * 0.85));
      // a slight bow, alternating sides, reads as a hand rather than a tween
      bend = -bend;
      const off = Math.min(60, dist * 0.12) * bend;
      const ctrl = {
        x: (from.x + to.x) / 2 - ((to.y - from.y) / dist) * off,
        y: (from.y + to.y) / 2 + ((to.x - from.x) / dist) * off,
      };   // (to - from) / dist is a unit vector times S, so off lands in window px
      const t0 = Date.now();
      for (;;) {
        const k = Math.min(1, (Date.now() - t0) / ms);
        const e = ease(k);
        const x = (1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * ctrl.x + e * e * to.x;
        const y = (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * ctrl.y + e * e * to.y;
        await page.mouse.move(x, y);
        if (k >= 1) break;
        await sleep(10);
      }
      pos = to;
    },
    async click(target, opts = {}) {
      await d.moveTo(target, opts);
      await sleep(opts.settle ?? 280);
      await page.mouse.down();
      await sleep(110);
      await page.mouse.up();
      await sleep(opts.after ?? 350);
    },
    async type(text, { base = 70 } = {}) {
      for (const ch of text) {
        await page.keyboard.type(ch);
        await sleep(base * (0.55 + Math.random() * 0.9) + (ch === ' ' ? 40 : 0));
      }
    },
    paste: (text) => page.keyboard.insertText(text),
  };
  return d;
}

/* ---------- scenarios ---------- */
const SOLUTION = `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        out = [1] * len(nums)
        left = 1
        for i in range(len(nums)):
            out[i] = left
            left *= nums[i]
        right = 1
        for i in reversed(range(len(nums))):
            out[i] *= right
            right *= nums[i]
        return out
`;

const SCENARIOS = {
  async 'add-problem'(page, d) {
    d.cam(1);
    await d.hold(1100);
    // in on the list header while the cursor heads for New Problem
    d.cam(1.6, 700, 250, 1300);
    await d.click('button:has-text("+ New Problem")', { after: 500 });

    // the editor's top half: title and difficulty
    d.cam(1.75, 610, 230, 1000);
    await d.hold(450);
    await d.type('Product of Array Except Self');
    await d.hold(250);
    await d.click('.seg-btn.medium', { after: 250 });
    await d.click('.field input[placeholder^="https://"]', { after: 200 });
    await d.paste('https://leetcode.com/problems/product-of-array-except-self/');
    await d.hold(450);

    d.cam(1.75, 580, 360, 1000);
    await d.click('.tag-toggle:has-text("Arrays")', { after: 300 });
    await d.click('.tag-toggle:has-text("Two Pointers")', { after: 250 });

    // down to the solution box
    d.cam(1.55, 610, 540, 1100);
    await d.click('textarea.code-input', { after: 250 });
    await d.paste(SOLUTION);
    await d.hold(700);
    await d.click('.modal button.btn.green', { after: 700 });

    // the new row opens at the top of the list with its reward
    d.cam(1.45, 610, 360, 1200);
    await d.hold(600);
    await d.click('.prow.open .coin', { after: 600 });
    // back out so the shard total in the header is in frame
    d.cam(1, 640, 400, 1400);
    await d.moveTo({ x: 1040, y: 330 }, { ms: 1100 });
    await d.hold(1800);
  },

  async gacha(page, d) {
    d.cam(1);
    await d.hold(900);
    await d.click('nav button:has-text("Gacha"), button:has-text("Gacha")', { after: 700 });

    // the right rail: pick a legendary to chase
    d.cam(1.65, 1030, 470, 1200);
    await d.hold(300);
    await d.click('button.iconbtn:has-text("Choose")', { after: 150 });
    // the picker opens tall (every legendary), so frame its search box,
    // then the whole modal once the search has shrunk it
    await d.camOn('.modal input', { pad: 1.4, max: 1.8, ms: 900 });
    await d.hold(300);
    await d.type('rayq', { base: 110 });
    await d.camOn('.modal', { ms: 800 });
    await d.hold(600);
    await d.click('.modal button[title="Rayquaza"]', { after: 600 });

    d.cam(1.7, 1080, 560, 1000);
    await d.hold(900);

    // summon
    d.cam(1.5, 900, 260, 1100);
    await d.click('button:has-text("x5 Draw")', { after: 0 });
    // over to the ball while it shakes, then in on the cards
    await d.camOn('.bigball-wrap', { pad: 3.2, max: 1.7, ms: 900 });
    await d.moveTo({ x: 700, y: 610 }, { ms: 1000 });
    const cards = page.locator('.gacha-result').first().locator('..');
    await cards.waitFor();
    await d.camOn(cards, { pad: 1.25, ms: 800 });
    await d.hold(900);
    // drift toward Continue while the cards sit, then take it
    await d.moveTo('button.btn.lav:has-text("Continue")', { dx: 70, dy: 34, ms: 1300 });
    await d.hold(1500);
    await d.click('button.btn.lav:has-text("Continue")', { after: 500 });
    d.cam(1, 640, 400, 1200);
    await d.hold(1400);
  },
};

/* ---------- capture ---------- */
const scenario = SCENARIOS[scenarioName];
if (!scenario || !outDir) {
  console.error(`usage: node scripts/record-pokeleet.mjs <${Object.keys(SCENARIOS).join('|')}> <outDir>`);
  process.exit(1);
}
await rm(outDir, { recursive: true, force: true });
await mkdir(join(outDir, 'frames'), { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({
  viewport: { width: VIEWPORT.width * S, height: VIEWPORT.height * S }, deviceScaleFactor: 1,
});
await ctx.addInitScript(() => localStorage.setItem('pokeleet:demo:welcome-seen', '1'));
await ctx.addInitScript(seededRandom, SEED);
await ctx.addInitScript(cursorInit, { svgs: CURSOR_SVG, scale: S });
const page = await ctx.newPage();
await page.goto(URL);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1200);   // sprites decoded, fit() settled

const events = [];
const frames = [];
const cdp = await ctx.newCDPSession(page);
const writes = [];
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  const file = `f${String(frames.length).padStart(5, '0')}.jpg`;
  frames.push({ file, ts: metadata.timestamp, arrived: Date.now() / 1000 });
  writes.push(writeFile(join(outDir, 'frames', file), Buffer.from(data, 'base64')));
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});

const d = director(page, events);
await d.start();
await cdp.send('Page.startScreencast', {
  format: 'jpeg', quality: 92, everyNthFrame: 1,
  maxWidth: VIEWPORT.width * S, maxHeight: VIEWPORT.height * S,
});
const started = Date.now() / 1000;
try {
  await scenario(page, d);
} catch (err) {
  // leave the screen that broke the run next to its frames
  await page.screenshot({ path: join(outDir, 'failed.png') });
  await browser.close();
  throw err;
}
const ended = Date.now() / 1000;
await cdp.send('Page.stopScreencast');
await Promise.all(writes);
await browser.close();

await writeFile(join(outDir, 'manifest.json'), JSON.stringify({
  viewport: VIEWPORT, dsf: S, started, ended, frames, events,
}, null, 1));
const span = ended - started;
console.log(`${scenarioName}: ${frames.length} frames over ${span.toFixed(1)}s (${(frames.length / span).toFixed(1)} fps avg)`);
