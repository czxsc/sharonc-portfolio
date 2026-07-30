import { useEffect, useRef, useState } from 'react';
import { getLenis } from './useLenis.js';

/* ------------------------------------------------------------------
   Shared behavior for full-screen overlay pages (HobbyPage,
   ProjectPage): enter → open on the frame after mount (so entrance
   transitions run), page behind goes inert with scroll paused, and
   Esc / the browser back button / explicit close buttons all funnel
   through the same reverse animation before `onClose` unmounts.

   Returns { state, requestClose }:
   - state: 'enter' → 'open' → 'closing', for transition classes
   - requestClose: call from close buttons / Esc-equivalents
   ------------------------------------------------------------------ */
export function useOverlayPage({ slug, closeMs, onClose, focusRef }) {
  const [state, setState] = useState('enter');
  const closingRef = useRef(false); // reverse animation underway
  const poppedRef = useRef(false); // our history entry already consumed
  const pushedRef = useRef(false); // our history entry exists
  const rafRef = useRef(0);
  const timerRef = useRef(0);
  const scrollRef = useRef(0); // where the page behind was left
  const onCloseRef = useRef(onClose); // listeners outlive renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /* Put the page behind back where the reader left it.

     Closing goes through history.back(), and a history traversal is
     the browser's cue to restore the scroll position it recorded for
     that entry — which is not reliably the one we want. We set
     scrollRestoration to 'manual' on the way in to stop it trying,
     and this is the belt to that brace.

     It has to run at the START of the close, not on unmount: the
     scrim spends the second half of the close dissolving, and
     whatever is underneath by then is what the reader sees. It also
     has to be true before the return flight is measured, or the
     image lands on a frame that has moved out from under it.

     The document is `overflow: hidden` while the overlay is up, so
     it can't be scrolled — lift that for the one synchronous
     statement it takes to move, then put it back. Same frame, so
     nothing paints in between. */
  const restoreScroll = () => {
    if (Math.abs(window.scrollY - scrollRef.current) < 1) return;
    const html = document.documentElement;
    const held = html.style.overflow;
    html.style.overflow = '';
    // explicit 'instant' — the page sets scroll-behavior: smooth
    // globally, which would otherwise turn this jump into a few
    // hundred ms of browser-driven scrolling racing the close
    window.scrollTo({ top: scrollRef.current, left: 0, behavior: 'instant' });
    html.style.overflow = held;
  };

  const beginClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    restoreScroll();
    setState('closing');
    timerRef.current = setTimeout(() => onCloseRef.current(), closeMs);
  };

  // canonical close: pop the history entry we pushed; popstate → beginClose
  const requestClose = () => {
    if (closingRef.current || poppedRef.current) return;
    poppedRef.current = true;
    history.back();
  };

  // open on the frame after the closed styles have been committed
  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setState('open'));
    });
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  // while open: page behind is inert and its scroll is paused
  useEffect(() => {
    const root = document.getElementById('root');
    scrollRef.current = window.scrollY;
    // ours to restore, not the browser's to guess at — see restoreScroll
    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    getLenis()?.stop();
    root?.setAttribute('inert', '');
    document.documentElement.style.overflow = 'hidden';
    focusRef?.current?.focus({ preventScroll: true });
    return () => {
      root?.removeAttribute('inert');
      document.documentElement.style.overflow = '';
      restoreScroll(); // last word, in case anything moved after the close began
      const lenis = getLenis();
      lenis?.start();
      // Lenis interpolates towards its own idea of where the page is,
      // and it has been stopped through all of the above — hand it the
      // truth or it animates the page back to wherever it left off
      lenis?.scrollTo(scrollRef.current, { immediate: true, force: true });
      history.scrollRestoration = prevRestoration;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // browser back closes the page instead of leaving the site
  useEffect(() => {
    // pushedRef survives StrictMode's dev-only remount, so we never
    // push a second (leaked) history entry
    if (!pushedRef.current && !poppedRef.current && !closingRef.current) {
      pushedRef.current = true;
      history.pushState({ overlay: slug }, '');
    }
    const onPop = () => {
      poppedRef.current = true;
      beginClose();
    };
    const onKey = (e) => e.key === 'Escape' && requestClose();
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, requestClose };
}
