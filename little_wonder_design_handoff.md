# Little Wonder — design section handoff

Session date: 2026-07-27 (session 2). Hand this file back to continue.

---

## Session 2 — verified in a browser, and what changed

Everything below the "session 1" line was written blind. It has now been
run in Chromium at 1440 / 700 / 390 px, light and dark. Build and lint
pass; the one lint error (`ProjectPage.jsx:341`) is still the
pre-existing one.

**Geometry bugs found by measuring, not by eye:**

- The banner cell was `7 / 2` (3.50) against a 4.55 painting — a quarter
  of the corridor's width was cropped away. Now `4 / 1`, which also
  happens to set the two row heights the nexus spans: it lands at 0.775
  against the portrait's own 0.766. **Both crops are now ~1%.** Changing
  the banner ratio re-crops the nexus — recompute, don't eyeball.
- Mobile (≤760) dropped the nexus into a `16 / 9` band: a **57% crop of a
  3:4 painting**, so the spire lost its top and base and the panel
  captioned TALL read as a wide slab. Now `4 / 5` (~4% crop).

**Other fixes:**

- `ProjectPage`'s window keydown listener paged to the next *project*
  when you arrowed through the zone tabs — the panel unmounted under
  you. It now ignores `e.defaultPrevented`, so inner widgets that steer
  with ←/→ get first refusal.
- The tabs claimed `role="tab"` but had no panel and no arrow keys.
  Added roving tabindex, ←/→/Home/End with wrap, `aria-controls`, and
  `role="tabpanel"` on the grid. Verified by driving it keyboard-only.
- Palette swatches had no edge, so on dark paper the near-black first
  step (`06111F`, `010508`) dissolved into `--paper` and each ramp looked
  like it began at step two. Hairline on top/bottom only, plus the outer
  verticals on the end caps, so the strip keeps reading continuous.
- Section 5 went from four points to three. Its 2×2 sat directly above
  the shared Challenges 2×2, and its fourth point was the art-side
  restatement of that block's scrapped-systems point.
- **Git hygiene done.** `.gitignore` now excludes
  `src/assets/little_wonder/*.png` + `*.jpeg`. What git would take went
  from 81 MB to **784 KB** (the 20 webp exports), verified.

**Confirmed working, no change needed:** tab switching causes zero
layout shift (grid height constant at 1290 on mobile across all four
tabs) and zero undecoded images — the preload does its job. Tabs wrap to
two rows at 390px with no overflow.

---

## Session 2 — artwork and palette revision

Sharon lost access to the newer cavern export; the one in the repo was an
older pass that no longer matched the nexus beside it.

- **`overgrown_cave2048` re-graded** by
  `src/assets/little_wonder/regrade_overgrown_cave.py` — hue −35°,
  saturation ×1.18. Lit areas moved 157° → 121° against the nexus's 82°,
  saturation 92 → 108 (target 131). Roughly half way, per "a bit". `DEG`
  and `SAT` at the top of that script are the whole control surface; it
  writes both the graded master and the shipped webp. The original master
  is untouched.
- **Overgrown and Bioluminescent ramps re-sampled off the finished
  paintings.** Crystal and Intermittent deliberately left alone.
  - Overgrown `0F3728 1A5E45 2A765A 399450 68BA7A 9ED190`
  - Biolum `06111F 102238 28497A 375D98 459BC4 5AB9D6`
  - Method that worked (three earlier ones didn't): median-cut the art
    for distinct colours, score on `sat × √coverage` so a step is vivid
    *and* real, restrict to the zone's hue family, then pick all six
    together by DP paying for hue drift and chroma spikes. Taking the
    most *common* colour per luminance band just gives mud — these
    paintings are mostly dark rock.
- **The standalone palette block is gone**, at Sharon's request. That was
  the only `s.palette` in the data, so the renderer branch in `Section`
  and the `.pp-palette-block` / `.pp-palette-label` rules were removed
  with it. `.pp-palette` itself stays — ZoneStudy uses it for all four
  ramps. Re-adding the block type later is a small paste.
- Copy that the above invalidated: Intermittent's note used to read *"the
  same six colours as Overgrown"*, which stopped being true once
  Overgrown got its own green ramp. Overgrown's note no longer says
  "cool and wet". Tab dots moved to `#399450` / `#459BC4`.

**Open, needs Sharon's eye:** within the Overgrown layer the corridor is
now the odd one out — corridor 171°, cavern 135°, grove 122°, nexus 92°.
Only the cavern was re-graded, as asked. The set reads as a smoother
spread than before (it used to be 171/171/122/92), but the corridor is
the only cyan panel left. Grading `overgrown_stalactites` by about −25°
would bring it to ~146° if that reads better.

---

## What was asked

Design and write the **Design** half of the Little Wonder project subpage
(`Code | Design` toggle), using the assets in `src/assets/little_wonder/`
and the content braindump in `little_wonder_design_readme.md`. Text
straightforward, not cluttered, engaging but skimmable for recruiters.

---

## State: done, builds clean, not yet seen in a browser

`npx vite build` passes. `npx eslint` on the touched files is clean —
the one error it reports (`ProjectPage.jsx:341`, setState in effect) is
**pre-existing** in the toggle-reset effect and was not introduced here.

**Nothing has been visually verified.** There was no browser tooling in
that session (no Playwright/Puppeteer). First thing to do next time:
`npm run dev`, open Little Wonder → Design, and check the layout — see
"Verify first" below.

---

## Files changed / added

| File | What |
| --- | --- |
| `src/components/ZoneStudy.jsx` | **new** — the centerpiece interactive panel |
| `src/components/ZoneStudy.css` | **new** |
| `src/components/ProjectPage.jsx` | wired `s.zones` → `<ZoneStudy>`, added a `s.palette` block type |
| `src/components/ProjectPage.css` | added `.pp-palette*` (shared colour ramp), added a `fit` override inside `.pp-gallery` |
| `src/data/content.js` | replaced the placeholder `design:` array with 5 real sections; added 20 asset imports; updated the Little Wonder `Skills` meta row |
| `src/assets/little_wonder/web/*.webp` | **new** — 20 optimised exports (see Assets) |

Also in the working tree from the same session, unrelated: email
changed to `sharonc.czx@gmail.com` in `src/data/content.js` (`meta.email`
and `links.email`). Nothing else referenced the old address.

---

## Assets — important

The source art in `src/assets/little_wonder/` is **80 MB** (single PNGs
up to 17 MB). Unshippable as-is.

A script converted all of it to sized webp in
`src/assets/little_wonder/web/`: **83 MB → 760 KB**, no visible quality
loss. Targets used: banners 2200 w, squares 1100 w, nexus 880 w, concept
sheets ~1400 w, board 1600 w, quality 82.

- `content.js` imports **only** from `web/`. The originals are masters
  and are never bundled by Vite.
- The whole `src/assets/little_wonder/` folder is currently **untracked**
  in git. **Decide before committing**: either commit only `web/` and
  gitignore the masters, or accept an 80 MB repo. Recommendation: add
  `src/assets/little_wonder/*.png` + `*.jpeg` to `.gitignore` and keep
  the masters locally / in cloud storage.
- The `*_color.png` palette strips are deliberately **not** exported —
  their hex values were read off and hardcoded (see below), per the
  braindump's "don't just paste the images".

Palette hexes extracted from the strips:

- Overworld — `132D21 1D5242 648651 ABC575 E1EEC9 F29A84`
- Overgrown **and** Intermittent (they share one strip) — `06131C 1C325B 297072 54A18F 73D0BD 8AFEF7`
- Crystal — `1E0C25 422267 9E4FBC 7DA9DD 48539A 1F224E`
- Bioluminescent — `010508 0F2F4C 135677 1D6F9F 3AAFC8 A2E5CC`

---

## The design decision that drives the section

Looking at the 16 backgrounds together, the story is obvious visually:
**they are four compositions, re-graded four times.** Same stalactite
corridor, same cavern, same grove, same nexus — different colour.

So the centerpiece is a panel that makes you *see* that instead of
reading it: `ZoneStudy`. Four layer tabs; switching a tab holds the
layout perfectly still and changes only the grade. The composition not
moving **is** the argument.

Layout is asymmetric on purpose (per `CLAUDE.md`), not a uniform grid:

```
┌ THE FOUR LAYERS ──────── [Overgrown][Intermittent][Crystal][Biolum] ┐
│ ┌───────────────────────────┬─────────┐                            │
│ │ wide corridor (spans 2)   │         │                            │
│ ├─────────────┬─────────────┤  nexus  │                            │
│ │   cavern    │    grove    │ (tall)  │                            │
│ └─────────────┴─────────────┴─────────┘                            │
│ ▬▬▬▬▬▬ six-swatch ramp ▬▬▬▬▬▬   one line on this layer's grade     │
└─────────────────────────────────────────────────────────────────────┘
```

Two things in there that are easy to break if edited:

1. **`grid-template-columns: 1fr 1fr 1.2fr` is derived, not taste.**
   With equal row heights, the nexus column has to be ≈1.2× a square
   column for the 3:4 portrait to land at its own ratio. Change the
   banner's `aspect-ratio` (currently `7 / 2`) and this needs
   recomputing or the nexus starts center-cropping.
2. **All four layers are preloaded on mount** (`new Image()` in a
   `useEffect`). Without it the cross-fade decodes mid-transition and
   reads as two pictures dissolving — the exact thing the panel exists
   to disprove. All 16 together are smaller than one source PNG, so the
   cost is nil. Don't "optimise" this away.

Tab dots use a per-layer `tone` field rather than a palette index,
because Overgrown and Intermittent share a ramp and would otherwise get
identical dots.

---

## The five design sections (re-ordered in session 2)

All in `content.js` under `page.toggle.sections.design`. The running
order is chronological and was wrong before: planning → concept art →
the two sections of finished assets → reflection.

1. **Setting the direction** — reference board first, then the decision
   (acorns/fungi, 12 levels → 4 layers of 3 dungeons), then the first
   landscape painting, which existed to pin down style and standardise
   lineart/colouring rather than to be used. Images: board (media) +
   landscape sketch and the grass/prop sheet (gallery). Limitations:
   came out above ground / style only half-standardised / variations,
   not a system.
2. **Concept art and the environment kit** — the vocabulary pass:
   labelled sheets of plants, grasses, pebbles, rocks, trunks, plus the
   full-colour ACORNIA village. Images: `early_envir_concept` +
   `early_concept`. Limitations: too detailed / nothing repeated / the
   scale did not work.
3. **Backgrounds: four paintings, sixteen backgrounds** — first of the
   two finished-asset sections. Contains `ZoneStudy`.
4. **Tilesets: one rock, one grass stamp** — three failed iterations in
   prose, the solution as three facts, then the `tiles` block: the four
   real graded tilesets in a row.
5. **What worked, and what I'd change** — 2 paragraphs of wins, then 3
   icon points.

Sections 1 and 2 set **`imagesFirst: true`** (see below).

The shared `sectionsAfter` (Challenges & Takeaways, Outcome) still
follows both toggle branches and was left alone. There is mild thematic
overlap between section 5 and the shared takeaways — section 5 is
deliberately production/art-specific to keep it distinct, but if it
reads repetitive in the browser, trim section 5's points to two.

---

## Verify first, next session

1. `npm run dev` → Little Wonder → **Design** toggle.
2. **ZoneStudy grid proportions** — does the nexus fill its cell without
   an ugly crop? Does the banner row look right at ~1080px page width?
3. **Tab switching** — should feel like a colour change, not a slide
   show. If there's any flash/reflow, the preload isn't working.
4. **Captions over art** — white mono labels bottom-left of each panel.
   Check legibility over the bright cavern mouths (there's a scrim
   gradient, may need strengthening).
5. **Mobile ≤760px** — grid collapses to 2-up with the nexus dropping to
   a 16/9 band across the bottom. Untested.
6. **Palette ramp** — 6 butted swatches with hexes beneath, appears
   twice (section 1 standalone, and inside ZoneStudy).
7. Dark mode — the art is dark and the labels are white, should be fine,
   but the `.lwz-dot` ring uses `color-mix` on `--ink`; check it reads.

---

## Still to do

- [x] ~~Tileset iteration images.~~ Sharon supplied the four final
      graded tilesets in session 2 (`grassy_tile`, `intermittent_tile`,
      `crystal_tile`, `biolum_tile`) and they now carry section 4 via
      the `tiles` block. Still **not** supplied: the three *failed*
      iterations, which section 4 describes in prose only. If they turn
      up, `compare` (before/after) is the block that fits.
- [x] ~~Git hygiene for the 80 MB of masters~~ — done, see session 2.
- [ ] **Outcome section** still has `media: { caption: 'Gameplay
      capture — recording coming soon.' }` — a real capture would land
      well at the very bottom of both branches.
- [ ] Little Wonder meta says `Timeline: Spring 2026` while the card
      says `year: '2025'`. Still unresolved — asked, not answered.
      Pre-existing; pick one.
- [ ] Decide whether the corridor should be re-graded to follow the
      cavern (see the artwork section above).
- [ ] Consider whether the Design branch should be the *default* toggle
      option for this project — it's currently `code` first, and the
      design work is the more visual of the two.
- [ ] Unrelated, but visible in shipped content: Dishcovery's meta has
      `Team of 5 — TODO: teammate names` (`content.js`, in the
      Dishcovery `meta` array).

---

## Things worth not re-deriving

- `Section` in `ProjectPage.jsx` renders optional blocks in a **fixed
  order**: `body → points → subs → facts → stack → flow → archMap →
  zones → tiles → compare → media → gallery`. Copy has to be written to
  that order — e.g. section 4's "the fix" had to become the *facts*
  (which render after body) rather than a trailing paragraph.
  - **`imagesFirst: true`** on a section lifts `media` + `gallery` to sit
    directly under `body`, ahead of the facts. Added in session 2 for
    the two early sections, which read "what we made → the work → where
    it fell short"; with pictures pinned to the bottom the shortfalls
    landed before the reader had seen what they were about.
  - **`tiles`** (`{ caption, items: [{ label, src }] }`) is the four
    graded tilesets, four across on one row, 2×2 under 760px. No panel
    and no crop behind them — unlike every other image on the page these
    are cut-outs with **real alpha**, sitting on the paper. Four across
    is the whole point: the shared grey rock only reads as *the same
    rock* when they are side by side at one size.
- `s.palette` **no longer exists** — the standalone ramp block was
  removed in session 2 along with `.pp-palette-block` /
  `.pp-palette-label`. `.pp-palette` itself is still live inside
  ZoneStudy.
- `export_web.py` (in the assets folder) sizes masters into `web/`.
  Widths are per-kind: concept sheets stay big enough to read their
  handwriting, tiles export at 700px for a ~300px render. It preserves
  alpha only for the tilesets; the backgrounds are opaque and flatten to
  RGB safely. Re-run it after adding or replacing a master.
- `media: { fit: true }` shows a whole image instead of the default 21:9
  crop. It now also works **inside a gallery** (a `.pp-gallery
  .pp-media.is-fit img` override was added, capped at 340px tall) —
  needed because the concept sheets carry margin notes that a 2:1 crop
  would cut off.
- All 16 background PNGs are fully opaque (alpha checked) — flattening
  to RGB for webp was safe.
- `POINT_ICONS` available for `points`: `freeze, platform, guide, clock,
  scope, performance, identity, team`.
