import { useEffect } from 'react';
import Lenis from 'lenis';

// current instance, so overlays (HobbyPage) can stop/start page scroll;
// null under prefers-reduced-motion, where Lenis never runs
let instance = null;

export function getLenis() {
  return instance;
}

/**
 * Global smooth scrolling. Wheel input is interpolated, which is what
 * lets scroll-scrubbed animations (the hero pour) glide instead of
 * stepping. Skipped entirely under prefers-reduced-motion.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      // take over #hash links so they glide too; the nav offset comes
      // from the page's scroll-padding-top, which Lenis respects.
      // Longer than Lenis' 1s default and eased at both ends, so a nav
      // click reads as travelling to the section rather than landing on
      // it — the page you scroll past is part of the answer.
      anchors: {
        duration: 1.8,
        easing: (t) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      },
    });
    instance = lenis;
    return () => {
      instance = null;
      lenis.destroy();
    };
  }, []);
}
