/* Walkthrough recordings for the PokeLeet case page.
 *
 * Drives the PokeLeet app the way a person would: a drawn cursor that
 * eases between targets, turns into a hand over anything clickable, and
 * presses on click. Every repaint is captured through the CDP screencast.
 * Nothing here zooms: the script only logs where the camera *should* look
 * (`cam(...)`) next to the frames, and render-walkthrough.py does the
 * framing afterwards, so a camera move can be retimed without driving the
 * app again.
 *
 * Keep camera moves to two to four per take. A move earns its place by
 * revealing something the current framing can't show, so several fields
 * inside one dialog share one framing rather than each getting a pan.
 *
 * Records the local working tree (not the deployed site), against a
 * scratch data folder, so a take never touches the real data/ and can show
 * work that hasn't shipped. Each take reseeds that folder through the API,
 * and Math.random is seeded so a take plays the same way every time.
 *
 * Usage, from the repo root:
 *
 *   (cd ../Leetcode-Pokemon && POKELEET_DATA_DIR=/tmp/pl-data npx vite --port 5199 --strictPort)
 *   npm i --no-save playwright
 *   node scripts/record-pokeleet.mjs log /tmp/rec/log
 *   python3 scripts/render-walkthrough.py /tmp/rec/log src/assets/projects/pokeleet/feature-log 20
 *
 * Takes: log, summon, upgrade, focus.
 *
 * `focus` needs two browser windows on screen at once, which a screencast
 * of one page can't see. So it builds them on a stage page: PokeLeet runs
 * for real in an iframe on the left, and the right window is a drawn tab
 * strip over real screenshots of LeetCode and another site. The Tracker
 * extension can't run there, so the stage plays its part, sending the same
 * { leetcode, since } messages as extension/bridge.js when a tab changes.
 * The timer, the pause and the battle are all the app's own response.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const APP = process.env.POKELEET_URL || 'http://localhost:5199/';
const SEED = Number(process.env.SEED || 40);

/* The app draws a fixed 1280x800 screen and scales it to fit the window.
   The screencast only ever delivers CSS pixels (a device scale factor is
   ignored), so the sharp capture comes from a larger window, which the app
   fills by re-rasterizing. Scenario coordinates stay in viewport units; S
   converts at the mouse. The focus take overrides both for its stage. */
let VIEWPORT = { width: 1280, height: 800 };
let S = 2;

const [scenarioName, outDir] = process.argv.slice(2);

/* ---------- the save each take starts from ---------- */
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const ROSTER = [
  ['charizard', 34], ['gengar', 28], ['lucario', 31], ['greninja', 26], ['snorlax', 22], ['dragapult', 24],
  ['pikachu', 18], ['eevee', 12], ['squirtle', 14], ['bulbasaur', 15], ['magikarp', 6], ['caterpie', 4],
  ['togepi', 9], ['psyduck', 11], ['jigglypuff', 10], ['mudkip', 13], ['ralts', 8], ['riolu', 12],
  ['decidueye', 19], ['cinderace', 21], ['sylveon', 17], ['mimikyu', 16], ['corviknight', 20], ['umbreon', 23],
];
function progress(over = {}) {
  const owned = ROSTER.map(([sp, level], i) => ({
    iid: `m${i}`, sp, level, exp: 0, shiny: false, form: null, unlocked: {}, copies: 0,
  }));
  return {
    onboarded: true, trainer: { name: 'Sharon' }, createdAt: daysAgo(40), preferredLanguage: 'python',
    shards: 4200, coins: 18400, megaStones: 1, gmaxStones: 0,
    items: { rateBooster: 1, greatBall: 2, ultraBall: 1, genTicket: 0 },
    owned, team: owned.slice(0, 6).map((o) => o.iid),
    quests: {}, recallBest: 0, recallToday: false, recallShardsToday: 0,
    pity: 12, epicPity: 6, totalPulls: 58,
    guaranteedLegendary: null, guaranteedEpic: null, legendaryTargetPity: 0, epicTargetPityCount: 0,
    stats: { evolutions: 3, pityHits: 1, recalls: 4, perfectDays: 1, lastPerfectDay: null },
    achievements: {},
    meadow: { coinsToday: 0, kills: 0, studyToday: 0, studyTotal: 0 },
    lastDay: today, v: 6, ...over,
  };
}
const STUB = 'class Solution:\n    def solve(self, nums):\n        return nums\n';
const solved = (i, title, difficulty, tags, days, slug) => ({
  id: `seed-${i}`, title, difficulty, tags, language: 'python', code: STUB,
  url: `https://leetcode.com/problems/${slug}/`,
  createdAt: `${daysAgo(days)}T12:00:0${i}.000Z`, solvedAt: daysAgo(days), claimed: true, claimedAt: daysAgo(days),
});
const library = () => ({
  customTags: [],
  problems: [
    solved(1, 'Two Sum', 'Easy', ['arrays', 'hash-table'], 20, 'two-sum'),
    solved(2, 'Valid Parentheses', 'Easy', ['stack', 'strings'], 16, 'valid-parentheses'),
    solved(3, 'Number of Islands', 'Medium', ['graphs', 'dfs', 'bfs'], 11, 'number-of-islands'),
    solved(4, 'Merge Intervals', 'Medium', ['arrays', 'intervals', 'sorting'], 7, 'merge-intervals'),
    solved(5, 'Longest Substring Without Repeating Characters', 'Medium', ['sliding-window', 'hash-table', 'strings'], 4, 'longest-substring-without-repeating-characters'),
    solved(6, 'Climbing Stairs', 'Easy', ['dp', 'math'], 2, 'climbing-stairs'),
  ],
});
async function seed(over) {
  const cur = await (await fetch(`${APP}api/data`)).json();
  const put = async (doc, rev, data) => {
    const r = await fetch(`${APP}api/${doc}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rev, data }),
    });
    if (!r.ok) throw new Error(`seeding ${doc}: ${r.status} ${await r.text()}`);
  };
  await put('progress', cur.progress?.rev ?? 0, progress(over));
  await put('library', cur.library?.rev ?? 0, library());
}

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
  /* Inside the stage's iframe there's no cursor of its own: mouse events
     over an iframe never reach the page around it, so it hands them up. */
  if (window.top !== window) {
    const up = (fn) => (ev) => {
      const r = window.frameElement?.getBoundingClientRect();
      if (r) window.top.__cursor?.[fn](ev.clientX + r.left, ev.clientY + r.top);
    };
    addEventListener('mousemove', up('move'), true);
    addEventListener('mousedown', up('down'), true);
    addEventListener('mouseup', up('up'), true);
    return;
  }
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
    const clickable = (t) => {
      if (!t) return false;
      const c = t.ownerDocument.defaultView.getComputedStyle(t).cursor;
      if (c === 'pointer') return true;
      const b = t.closest('button, a[href], select, [role=button], label');
      return !!b && !b.disabled && c !== 'not-allowed' && c !== 'text';
    };
    const pointerAt = () => {
      const t = document.elementFromPoint(x, y);
      if (t?.tagName === 'IFRAME') {
        const r = t.getBoundingClientRect();
        return clickable(t.contentDocument?.elementFromPoint(x - r.left, y - r.top));
      }
      return clickable(t);
    };
    window.__cursor = {
      move(nx, ny) { x = nx; y = ny; place(); },
      down() { el.classList.add('down'); },
      up() { el.classList.remove('down'); },
    };
    addEventListener('mousemove', (ev) => window.__cursor.move(ev.clientX, ev.clientY), true);
    addEventListener('mousedown', () => window.__cursor.down(), true);
    addEventListener('mouseup', () => window.__cursor.up(), true);
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
    // tall dialogs scroll, and a target below the fold isn't a click away
    await loc.scrollIntoViewIfNeeded();
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

/* ---------- the focus take's stage ---------- */
const WINDOW_CHROME = 78;
const STAGE = { width: 1760, height: 840, scale: 1.5 };
const LEFT_W = 1760; // the app's own window, in real px: 1.375x its 1280x800 screen
const APP_H = 1100;

function stageHtml() {
  const tab = (id, icon, title, on) => `
    <div class="tab ${on ? 'on' : ''}" id="tab-${id}" data-tab="${id}" role="button">
      <span class="ico">${icon}</span><span class="ttl">${title}</span>
      <span class="x" data-close="${id}" role="button">×</span>
    </div>`;
  return `<!doctype html><meta charset="utf-8"><title>stage</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    html, body { height: 100%; background: #e9e6df; overflow: hidden; font: 26px/1 "Segoe UI", system-ui, sans-serif; color: #1b1b1b; }
    .stage { display: flex; gap: 28px; align-items: center; justify-content: center; height: 100%; }
    .win { border-radius: 18px; overflow: hidden; background: #fff; box-shadow: 0 0 0 2px rgba(27,27,27,.1), 0 18px 44px rgba(27,27,27,.14); flex: none; }
    .chrome { height: ${WINDOW_CHROME}px; background: #dfdcd5; display: flex; flex-direction: column; }
    .tabs { display: flex; gap: 4px; height: 44px; padding: 8px 12px 0; }
    .tab { display: flex; align-items: center; gap: 10px; padding: 0 14px; min-width: 0; flex: 0 1 300px; height: 36px; border-radius: 10px 10px 0 0; font-size: 19px; color: #57524c; cursor: pointer; }
    #tab-lc { animation: tab-in .22s ease-out; }
    @keyframes tab-in { from { flex-basis: 0; opacity: 0; } }
    .tab.on { background: #f7f5f1; color: #1b1b1b; }
    .tab:not(.on):hover { background: #d3cfc7; }
    .ico { width: 20px; height: 20px; border-radius: 50%; flex: none; display: grid; place-items: center; font: 700 13px/1 Georgia, serif; }
    .ico > span { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; }
    .ttl { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; flex: 1; }
    .x { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 19px; color: #8c867d; cursor: pointer; }
    .x:hover { background: #c9c5bc; color: #1b1b1b; }
    .bar { flex: 1; background: #f7f5f1; display: flex; align-items: center; padding: 0 16px; }
    .url { flex: 1; height: 24px; border-radius: 12px; background: #ebe8e2; padding: 0 14px; font-size: 16px; display: flex; align-items: center; color: #57524c; }
    iframe { display: block; border: 0; width: ${LEFT_W}px; height: ${APP_H}px; }
    .page { width: 796px; height: ${APP_H}px; overflow: hidden; background: #fff; }
    .page img { display: none; width: 100%; }
    .page img.on { display: block; }
  </style>
  <div class="stage">
    <div class="win"><div class="chrome">
      <div class="tabs">${tab('app', '<span style="background:linear-gradient(#e4645c 47%,#2b2b2b 47% 55%,#fff 55%)"></span>', 'PokéLeet', true)}</div>
      <div class="bar"><div class="url">localhost:5173</div></div>
    </div><iframe id="app" src="/"></iframe></div>
    <div class="win" id="other"><div class="chrome">
      <div class="tabs" id="other-tabs">
        ${tab('wiki', '<span style="color:#1b1b1b;background:#fff;box-shadow:0 0 0 1px #c9c5bc">W</span>', 'Pikachu - Wikipedia', true)}
      </div>
      <div class="bar"><div class="url" id="url">en.wikipedia.org/wiki/Pikachu</div></div>
    </div><div class="page"><img id="page-wiki" class="on" src="/__wiki.png" alt=""><img id="page-lc" src="/__lc.png" alt=""></div></div>
  </div>
  <script>
    const URLS = { wiki: 'en.wikipedia.org/wiki/Pikachu', lc: 'leetcode.com/problemset' };
    const LC_TAB = ${JSON.stringify(tab('lc', '<span style="color:#fff;background:#f89f1b">L</span>', 'Problems - LeetCode', false))};
    const report = () => {
      const on = document.querySelector('#other .tab.on');
      document.getElementById('app').contentWindow.__tracker?.(on?.dataset.tab === 'lc');
    };
    function show(id) {
      document.querySelectorAll('#other .tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === id));
      document.querySelectorAll('.page img').forEach((i) => i.classList.toggle('on', i.id === 'page-' + id));
      document.getElementById('url').textContent = URLS[id];
      report();
    }
    document.addEventListener('click', (ev) => {
      const close = ev.target.closest('#other [data-close]');
      if (close) {
        document.getElementById('tab-' + close.dataset.close).remove();
        show('wiki');
        return;
      }
      const tab = ev.target.closest('#other .tab');
      if (tab) show(tab.dataset.tab);
    });
    /* What the extension does on "open" when no LeetCode tab exists: a new
       tab on the problem list, active straight away. The page takes a beat
       to paint, so it reads as a tab opening rather than a picture swapping. */
    addEventListener('message', (ev) => {
      if (!ev.data?.__openLeetCode) return;
      document.getElementById('other-tabs').insertAdjacentHTML('beforeend', LC_TAB);
      const page = document.getElementById('page-lc');
      page.style.visibility = 'hidden';
      show('lc');
      setTimeout(() => { page.style.visibility = ''; }, 550);
    });
  </script>`;
}

// The app's half of extension/bridge.js, installed inside the stage's iframe.
function trackerStub(version) {
  if (window.top === window) return;
  const post = (m) => window.postMessage({ source: 'pokeleet-tracker', ...m }, location.origin);
  let cur = { leetcode: false, since: Date.now() };
  window.__tracker = (leetcode) => {
    if (leetcode === cur.leetcode) return;
    cur = { leetcode, since: Date.now() };
    post({ type: 'state', ...cur });
  };
  addEventListener('message', (ev) => {
    const m = ev.data;
    if (ev.source !== window || !m || m.source !== 'pokeleet-app') return;
    if (m.type === 'hello') {
      post({ type: 'hello', version });
      post({ type: 'state', ...cur });
    } else if (m.type === 'get') {
      post({ type: 'state', ...cur });
    } else if (m.type === 'open') {
      window.parent.postMessage({ __openLeetCode: true }, '*');
    }
  });
}

/* ---------- scenarios ---------- */
const SOLUTION = `class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        rows, cols = len(matrix), len(matrix[0])

        @cache
        def dfs(r, c):
            best = 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))
            return best

        return max(dfs(r, c) for r in range(rows) for c in range(cols))
`;

const SCENARIOS = {
  /* A Hard problem with a long list of topics, so the difficulty visibly
     moves off its Medium default and tags light up all over the grid. The
     link goes in without a paste event, which would look it up on its own,
     so the press of Find is what visibly causes the fill. */
  log: {
    seed: { shards: 1200 },
    async run(page, d) {
      d.cam(1);
      await d.hold(1000);
      await d.click('button:has-text("+ New Problem")', { after: 450 });

      // move 1: in on the editor, which holds for every field in it
      await d.camOn('.modal', { pad: 1.06, max: 1.55, ms: 1000 });
      await d.hold(650);
      await d.click('.field input[placeholder^="https://"]', { after: 280 });
      await d.paste('https://leetcode.com/problems/longest-increasing-path-in-a-matrix/');
      await d.hold(700);
      await d.click('.modal button:has-text("Find")', { after: 0 });
      await page.locator('text=/Found #329/').waitFor({ timeout: 15000 });
      await d.hold(2200);
      await d.click('textarea.code-input', { after: 250 });
      await d.paste(SOLUTION);
      await d.hold(900);
      await d.click('.modal button.btn.green', { after: 600 });

      // move 2: to the new row and the shards it's worth
      const row = page.locator('.prow.open').first();
      await row.waitFor();
      await d.camOn(row, { pad: 1.5, max: 1.5, ms: 1100 });
      await d.hold(800);
      await d.click('.prow.open .coin', { after: 500 });

      // move 3: back out, so the new shard total is in frame
      d.cam(1, 640, 400, 1300);
      await d.moveTo({ x: 1100, y: 170 }, { ms: 1100 });
      await d.hold(1900);
    },
  },

  /* A target at 95 of its 100-draw guarantee lands on the fifth card of a
     x5 draw, so the legendary is the last one to turn up. */
  summon: {
    rng: 41, // draws the target as the only legendary of the five
    seed: { guaranteedLegendary: 'rayquaza', legendaryTargetPity: 95, shards: 4200 },
    async run(page, d) {
      d.cam(1);
      await d.hold(800);
      await d.click('button:has-text("Summon")', { after: 700 });
      await d.hold(500);
      await d.click('button:has-text("x5 Draw")', { after: 0 });

      // no camera moves: the reveal's frame is part of the effect, and any
      // zoom tall enough to help crops its border
      await d.moveTo('.bigball-wrap', { ms: 1000, dx: 14, dy: 18 });
      await page.locator('.bigball-wrap.tappable').waitFor();
      await d.hold(650);
      await d.click('.bigball-wrap.tappable', { dx: 14, dy: 18, after: 0 });

      const cards = page.locator('.gacha-result').first().locator('..');
      await cards.waitFor({ timeout: 8000 });
      // what this seed drew, for picking one where the target is the only legendary
      console.log('drew:', (await cards.innerText()).replace(/\s+/g, ' '));
      await d.moveTo({ x: 640, y: 610 }, { ms: 1100 });
      await d.hold(4600);
      await d.click('button.btn.lav:has-text("Continue")', { after: 400 });
      await d.hold(1300);
    },
  },

  /* Starts with no stones, so the one in the bag is the one just bought. A
     Mega Stone is a two-step upgrade, bought in the shop and then spent on a
     Pokémon's own card, which is the part worth seeing. */
  upgrade: {
    seed: { megaStones: 0 },
    async run(page, d) {
      d.cam(1);
      await d.hold(800);
      await d.click('button:has-text("Shop")', { after: 900 });
      await d.click('.chip-card:has-text("Mega Stone") button', { after: 400 });
      await page.locator('text=/added to your bag/i').first().waitFor({ timeout: 4000 });
      await d.hold(1300);
      await d.click('button:has-text("Team")', { after: 900 });
      await d.click('.team-chip:has-text("Charizard")', { after: 450 });

      // move 1: in on the card, which holds through the evolution
      await d.camOn('.modal', { pad: 1.08, max: 1.6, ms: 1000 });
      await d.hold(1000);
      await d.click('.modal button:has-text("Use Mega Stone")', { after: 0 });
      await page.locator('text=/Mega Evolution unlocked/i').first().waitFor({ timeout: 12000 });
      await d.moveTo({ x: 1090, y: 700 }, { ms: 1000 });
      await d.hold(3200);
    },
  },

  focus: {
    stage: true,
    async run(page, d) {
      const app = page.frameLocator('#app');
      // no camera moves: the whole point is seeing both windows at once
      d.cam(1, STAGE.width / 2, STAGE.height / 2, 1);
      await d.hold(900);
      await d.click(app.locator('button:has-text("Focus")').first(), { after: 1000 });
      await app.locator('text=/Tracker connected/i').first().waitFor({ timeout: 5000 });
      await d.hold(500);
      // LeetCode isn't open yet: deploying is what opens its tab
      await d.click(app.locator('button:has-text("Deploy Team")').first(), { after: 300 });
      await page.locator('#tab-lc').waitFor({ timeout: 5000 });
      await app.locator('.study-clock').first().waitFor({ timeout: 8000 });
      await d.hold(6800);

      await d.click('#tab-wiki', { after: 200 });
      await app.locator('.paused-notice').first().waitFor({ timeout: 5000 });
      await d.hold(3400);

      await d.click('#tab-lc', { after: 200 });
      await d.hold(4000);

      await d.click('#tab-lc .x', { after: 200 });
      await app.locator('.paused-notice').first().waitFor({ timeout: 5000 });
      await d.hold(3600);
    },
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
await seed(scenario.seed);

const browser = await chromium.launch({ channel: 'msedge', headless: true });

/* Real pages for the drawn window to show. Captured at a desktop width
   and scaled down, so they read as the sites they are. */
async function sitePictures() {
  const ctx = await browser.newContext({
    viewport: { width: 1040, height: 1437 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0',
  });
  const page = await ctx.newPage();
  const shot = async (url) => {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);
    // site-wide banners date the recording and pull focus from the page
    await page.addStyleTag({ content: '#siteNotice, #centralNotice { display: none !important; }' });
    await page.waitForTimeout(300);
    return page.screenshot();
  };
  const pictures = {
    lc: await shot('https://leetcode.com/problemset/'),
    wiki: await shot('https://en.wikipedia.org/wiki/Pikachu'),
  };
  await ctx.close();
  return pictures;
}

if (scenario.stage) {
  VIEWPORT = { width: STAGE.width, height: STAGE.height };
  S = STAGE.scale;
}
const ctx = await browser.newContext({
  viewport: { width: VIEWPORT.width * S, height: VIEWPORT.height * S }, deviceScaleFactor: 1,
});
await ctx.addInitScript(seededRandom, scenario.rng ?? SEED);
await ctx.addInitScript(cursorInit, { svgs: CURSOR_SVG, scale: S });
if (scenario.stage) {
  const pictures = await sitePictures();
  // the app refuses a Tracker older than the copy in its repo, so claim that one
  const manifest = await (await fetch(`${APP}extension/manifest.json`)).json();
  await ctx.addInitScript(trackerStub, manifest.version);
  await ctx.route(`${APP}__stage`, (r) => r.fulfill({ contentType: 'text/html', body: stageHtml() }));
  await ctx.route(`${APP}__lc.png`, (r) => r.fulfill({ contentType: 'image/png', body: pictures.lc }));
  await ctx.route(`${APP}__wiki.png`, (r) => r.fulfill({ contentType: 'image/png', body: pictures.wiki }));
}
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('pageerror:', e.message));
await page.goto(scenario.stage ? `${APP}__stage` : APP);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);   // sprites decoded, fit() settled

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
  await scenario.run(page, d);
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

const moves = events.filter((e) => e.type === 'cam').length - 1;
await writeFile(join(outDir, 'manifest.json'), JSON.stringify({
  viewport: VIEWPORT, dsf: S, started, ended, frames, events,
  // an optional output size for takes that aren't the app's own 16:10
  ...(scenario.stage ? { out: { width: 1600, height: 764 } } : {}),
}, null, 1));
const span = ended - started;
console.log(`${scenarioName}: ${frames.length} frames over ${span.toFixed(1)}s (${(frames.length / span).toFixed(1)} fps avg), ${moves} camera moves`);
