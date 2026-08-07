# Verify — sharonc-portfolio

How to observe changes running in this repo (Vite + React SPA, no tests).

## Build / launch
- `npm run lint` then `npm run build` for static confidence.
- `npm run dev` (background). **Port 5173 is often taken by Sharon's own dev
  server — Vite falls back to 5174; read the task output for the real port.**

## Drive (headless browser)
- No playwright in repo deps. In the scratchpad: `npm i playwright-core`,
  then `chromium.launch({ channel: 'msedge', headless: true })` — uses the
  system Edge, no browser download.
- Screenshot with `page.screenshot(...)`; capture mid-animation frames with
  plain `sleep()`s — page.screenshot does not freeze CSS transitions.

## Flows worth driving
- **Project case studies**: `.work-item` click → `.pp` overlay; check meta
  rows (Team only on Little Wonder/Dishcovery), `.pp-nav-btn` / arrow keys
  page between projects with scroll reset, single browser-back closes even
  after paging. Both overlays share `useOverlayPage` — history/Esc/inert
  probes apply to each. Focus-return uses rAF (focus into an inert subtree
  is silently ignored — never focus synchronously with the unmount).
- **Play section spill**: scroll `.bag-scene` to viewport center (trigger is
  the middle 20% band), wait for `.bag-scene.is-spilled`, then ~1.8s for the
  scatter transition. The knock gif takes ~2.5s before items spill.
- **Hobby mini-pages**: `.bag-item-btn` hover (dot + handwritten label),
  click → `.hp` overlay iris; check `.hp-scroll` scrolls, `html` overflow
  is locked, `#root` has `inert`. Close via `.hp-back`, Escape, and
  `page.goBack()` — all must reverse the iris and remove `.hp`; rapid
  double-Escape must not navigate off the site (history guard).
- Variants: `reducedMotion: 'reduce'` context (everything instant),
  375×812 mobile context with `hasTouch`.

## Gotchas
- Lenis owns window scroll; programmatic `scrollBy`/`scrollIntoView` works.
- `?all` query reveals all `.reveal` elements at once (preview escape hatch).
- Overlay scroll-lock relies on `scrollbar-gutter: stable` on `html` — when
  touching overlays, probe layout shift: sample an element's
  `getBoundingClientRect().left` right before and ~60ms after opening; the
  delta must be 0px (a delta ≈17px means the scrollbar gutter regressed).
- The hobby iris is transform-scaled circles, NOT clip-path — clip-path
  animation repaints every frame and stutters; keep it on the compositor.
