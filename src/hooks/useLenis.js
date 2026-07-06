import { useEffect } from 'react';
import Lenis from 'lenis';

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
      // from the page's scroll-padding-top, which Lenis respects
      anchors: true,
    });
    return () => lenis.destroy();
  }, []);
}
