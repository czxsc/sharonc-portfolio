import { useEffect } from 'react';

/* Flips the bean cursor to its cream twin over dark image regions.
 *
 * The rim on both cursors (scripts/make-cursors.py) is what keeps the
 * mark findable in general; this is the finer pass, so that a bean on a
 * dark photo is the *right* bean rather than merely a visible one.
 *
 * Whole-image averages aren't enough for the images that actually go
 * dark on this site: the hero portrait averages 0.76 on paper — mostly
 * light — and you only lose the cursor in the hair. So each image is
 * reduced to an 8x8 luminance grid and the pointer looks up its own
 * cell. Two consequences worth knowing:
 *
 *   - The grid is built in *element* space, not source space: the crop
 *     that object-fit/object-position performs is replayed into the
 *     sample canvas, so mapping the pointer to a cell stays a plain
 *     lerp. Half these images are cover crops and one is top-anchored.
 *   - Transparency is composited over --paper first. The cat art is
 *     dark strokes on nothing; measured raw it reads 0.12 and would
 *     wrongly ask for a cream bean, which on paper is invisible. Over
 *     paper it reads 0.47 and correctly stays espresso, where the rim
 *     does the work instead.
 *
 * Cost: nothing at load. Sampling is lazy — an image is read the first
 * time the pointer is over it, by which point it is on screen and
 * decoded — and is one 32x32 getImageData. After that a move is an
 * array lookup, coalesced to one per frame, and writes an attribute
 * only when the verdict changes. Nothing runs while the pointer is
 * anywhere but on an image.
 *
 * This only ever decides *colour*. Clickable images are sampled too, and
 * index.css pairs the verdict with the hover bean when one sits inside a
 * link — the outline bean has no rim to fall back on, so a dark image
 * that is also a link is exactly where the right colour matters most.
 */

const GRID = 8; // luminance cells per axis
const CELL = 4; // canvas px per cell, boxed down into it
const SAMPLE = GRID * CELL;

// hysteresis, so a pointer tracking an edge doesn't strobe between beans
const TO_CREAM = 0.42;
const TO_INK = 0.52;

const grids = new WeakMap();
let ctx = null;

function context() {
  if (!ctx) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SAMPLE;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  }
  return ctx;
}

/* object-position as a 0..1 pair. Computed style gives percentages or
   lengths; keywords only survive as percentages, which is all we need. */
function anchor(value) {
  const parts = String(value || '50% 50%').split(/\s+/);
  return [parts[0], parts[1] ?? '50%'].map((p) => {
    const n = parseFloat(p);
    return Number.isFinite(n) && p.endsWith('%') ? n / 100 : 0.5;
  });
}

/* Replay the element's fit into the sample canvas, then reduce to an
   8x8 grid of relative luminance in element space. */
function sample(img, box, paper) {
  const c = context();
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const style = getComputedStyle(img);
  const rx = box.width / nw;
  const ry = box.height / nh;
  const fit = style.objectFit;
  const scale =
    fit === 'cover' ? Math.max(rx, ry)
    : fit === 'contain' ? Math.min(rx, ry)
    : fit === 'scale-down' ? Math.min(1, rx, ry)
    : fit === 'none' ? 1
    : null; // 'fill' — stretched, so source and dest are both everything
  const [ax, ay] = anchor(style.objectPosition);

  // source crop where the render overflows the box, letterbox where it
  // falls short — the same calculation covers both directions
  let sx = 0, sy = 0, sw = nw, sh = nh;
  let dx = 0, dy = 0, dw = SAMPLE, dh = SAMPLE;
  if (scale) {
    const ox = nw * scale - box.width;
    const oy = nh * scale - box.height;
    if (ox > 0) { sw = box.width / scale; sx = (ox / scale) * ax; }
    else { dw = SAMPLE * ((nw * scale) / box.width); dx = (SAMPLE - dw) * ax; }
    if (oy > 0) { sh = box.height / scale; sy = (oy / scale) * ay; }
    else { dh = SAMPLE * ((nh * scale) / box.height); dy = (SAMPLE - dh) * ay; }
  }

  c.fillStyle = paper; // transparency has to read as the ground behind it
  c.fillRect(0, 0, SAMPLE, SAMPLE);
  let data;
  try {
    c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    data = c.getImageData(0, 0, SAMPLE, SAMPLE).data;
  } catch {
    return null; // tainted or undecodable — leave this image to the rim
  }

  const cells = new Float32Array(GRID * GRID);
  for (let y = 0; y < SAMPLE; y++) {
    for (let x = 0; x < SAMPLE; x++) {
      const i = (y * SAMPLE + x) * 4;
      const lum =
        (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      cells[((y / CELL) | 0) * GRID + ((x / CELL) | 0)] += lum;
    }
  }
  for (let i = 0; i < cells.length; i++) cells[i] /= CELL * CELL;
  return cells;
}

export function useCursorContrast() {
  useEffect(() => {
    // a coarse pointer has no cursor to keep track of
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    let frame = 0;
    let last = null;

    const read = () => {
      frame = 0;
      const { target, clientX, clientY } = last;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.naturalWidth) return; // not decoded yet; try again on the next move

      const box = target.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const paper = getComputedStyle(document.body).backgroundColor;

      // re-sample if the box was resized or the ground changed under it
      let entry = grids.get(target);
      if (
        !entry ||
        entry.paper !== paper ||
        Math.abs(entry.width - box.width) > box.width * 0.12 ||
        Math.abs(entry.height - box.height) > box.height * 0.12
      ) {
        entry = {
          cells: sample(target, box, paper),
          paper,
          width: box.width,
          height: box.height,
        };
        grids.set(target, entry);
      }
      if (!entry.cells) return;

      const cx = Math.min(GRID - 1, Math.max(0,
        ((clientX - box.left) / box.width * GRID) | 0));
      const cy = Math.min(GRID - 1, Math.max(0,
        ((clientY - box.top) / box.height * GRID) | 0));
      const lum = entry.cells[cy * GRID + cx];

      const now = target.dataset.cursor;
      const next =
        lum < TO_CREAM ? 'light' : lum > TO_INK ? 'dark' : now || 'dark';
      if (next !== now) target.dataset.cursor = next;
    };

    const onMove = (e) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(read);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
