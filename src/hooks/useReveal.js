import { useEffect } from 'react';

/**
 * Scroll entrances for `.reveal`, `.img-reveal` and `.set` (SetType).
 *
 * Two things beyond a plain IntersectionObserver, both aimed at the
 * same problem — a fade-up that plays back identically every time
 * reads as canned:
 *
 * 1. DIRECTION. An element rises from below when you scroll down and
 *    descends from above when you scroll back up, so the entrance
 *    always moves *with* the page rather than against it. Written as
 *    `--rd` (1 | -1) on the element while it is still hidden, so the
 *    transition's start value is settled a frame before it runs.
 *
 * 2. VELOCITY. Travel distance scales with how fast the page is
 *    moving (16px browsing → 30px flicking), so arrivals carry the
 *    weight of the gesture that caused them. One root-level var,
 *    quantised to 4px steps so it isn't a per-frame style invalidation
 *    — and only elements that haven't revealed yet read it.
 *
 * Reduced motion (or `?all`) reveals everything immediately.
 */

const SELECTOR = '.reveal, .img-reveal, .set';

const DIST_MIN = 16;
const DIST_MAX = 30;
const DIST_STEP = 4;
const VEL_FULL = 2200; // px/s at which travel is maxed out

export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(SELECTOR));

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // escape hatch: `?all` reveals everything at once (useful for previews/PDF)
    const revealAll = window.location.search.includes('all');

    if (revealAll || reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // elements still waiting — the only ones whose start state matters
    const pending = new Set(els);

    let lastY = window.scrollY;
    let lastT = performance.now();
    let dir = 1; // 1 = scrolling down (content rises), -1 = up
    let dist = DIST_MIN;

    const onScroll = () => {
      if (!pending.size) return;
      const y = window.scrollY;
      const t = performance.now();
      const dy = y - lastY;
      const dt = Math.max(t - lastT, 1);
      lastY = y;
      lastT = t;
      if (!dy) return;

      // direction: only the pending set needs rewriting, and only when
      // the sign actually flips
      const nextDir = dy > 0 ? 1 : -1;
      if (nextDir !== dir) {
        dir = nextDir;
        pending.forEach((el) => el.style.setProperty('--rd', dir));
      }

      // velocity → travel, quantised so most scroll events write nothing
      const v = Math.min((Math.abs(dy) / dt) * 1000, VEL_FULL);
      const raw = DIST_MIN + (DIST_MAX - DIST_MIN) * (v / VEL_FULL);
      const next = Math.round(raw / DIST_STEP) * DIST_STEP;
      if (next !== dist) {
        dist = next;
        document.documentElement.style.setProperty(
          '--reveal-dist',
          `${dist}px`
        );
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          pending.delete(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
