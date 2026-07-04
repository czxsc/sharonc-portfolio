import { useEffect } from 'react';

/**
 * Observes every `.reveal` / `.img-reveal` element and adds `.is-visible`
 * as it scrolls into view (once). Honors prefers-reduced-motion by
 * revealing everything immediately.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal, .img-reveal'));

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // escape hatch: `?all` reveals everything at once (useful for previews/PDF)
    const revealAll = window.location.search.includes('all');

    if (revealAll || reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
