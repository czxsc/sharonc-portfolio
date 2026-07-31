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
      // Eased at both ends so a nav click still reads as travelling
      // rather than teleporting, but the ease-out is short — the long
      // tail is what made the trip feel like waiting.
      anchors: {
        duration: 0.9,
        // quadratic ease-in for the first 40%, cubic ease-out after;
        // coefficients are the pair that keeps value and slope
        // continuous at the join, so there is no kick mid-flight
        easing: (t) =>
          t < 0.4 ? 3.125 * t * t : 1 - 2.3148 * Math.pow(1 - t, 3),
      },
    });
    instance = lenis;
    return () => {
      instance = null;
      lenis.destroy();
    };
  }, []);
}
