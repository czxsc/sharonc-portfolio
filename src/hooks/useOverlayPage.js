import { useEffect, useRef, useState } from 'react';
import { getLenis, holdLenis, releaseLenis } from './useLenis.js';

/* ------------------------------------------------------------------
   Shared behavior for full-screen overlay pages (HobbyPage,
   ProjectPage): enter → open on the frame after mount (so entrance
   transitions run), page behind goes inert with scroll paused, and
   Esc / the browser back button / explicit close buttons all funnel
   through the same reverse animation before `onClose` unmounts.

   Options beyond the transition wiring, all optional and all about
   pages that own a URL (see routes.js — case studies do, hobbies
   don't):
   - path:    the URL to wear while open. Omitted, the history entry
              is still pushed but the address bar never changes.
   - deep:    this page WAS the URL the visitor arrived at, so the
              entry in the history is the browser's, not ours.
   - landing: () => scrollY for the page behind, asked at close time.
              For a deep entry, where there is no remembered place.

   Returns { state, requestClose }:
   - state: 'enter' → 'open' → 'closing', for transition classes
   - requestClose: call from close buttons / Esc-equivalents
   ------------------------------------------------------------------ */
export function useOverlayPage({
  slug,
  path = null,
  deep = false,
  landing = null,
  closeMs,
  onClose,
  focusRef,
}) {
  /* A deep entry opens already open. The entrance is a transition
     *from the index* — the paper ground washing over it, the blocks
     trailing the hero's flight — and there is no index to come from
     here: the case study is what the visitor asked for and what the
     first paint should show. Committing the open state before the
     first paint is also what keeps the ground from transitioning at
     all; there is no earlier value for it to animate out of. */
  const [state, setState] = useState(deep ? 'open' : 'enter');
  const closingRef = useRef(false); // reverse animation underway
  const poppedRef = useRef(false); // our history entry already consumed
  const pushedRef = useRef(false); // our history entry exists
  const rafRef = useRef(0);
  const timerRef = useRef(0);
  const scrollRef = useRef(0); // where the page behind was left
  const landingRef = useRef(deep ? landing : null); // resolved once, at close
  const onCloseRef = useRef(onClose); // listeners outlive renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /* Where the page behind belongs when this closes.
     Normally: wherever the reader left it, recorded on the way in.

     Arriving straight at the page's URL there is no such place — the
     index behind was built at the top and never scrolled — so the
     host supplies one, and it is asked for LATE rather than at mount:
     by close time the index has laid out and can be measured, and the
     answer is wanted a moment before the return flight measures its
     landing against the same layout. */
  const targetScroll = () => {
    const ask = landingRef.current;
    if (ask) {
      landingRef.current = null;
      const y = ask();
      if (typeof y === 'number' && Number.isFinite(y)) scrollRef.current = y;
    }
    return scrollRef.current;
  };

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
    const y = targetScroll();
    if (Math.abs(window.scrollY - y) < 1) return;
    const html = document.documentElement;
    const held = html.style.overflow;
    html.style.overflow = '';
    // explicit 'instant' — the page sets scroll-behavior: smooth
    // globally, which would otherwise turn this jump into a few
    // hundred ms of browser-driven scrolling racing the close
    window.scrollTo({ top: y, left: 0, behavior: 'instant' });
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
    /* A page reached by its own URL has no entry of ours behind it —
       the one it is sitting on is the browser's, and going back from
       it leaves the site entirely. So trade the URL for the index and
       close in place. Back still does what it should from here: it
       returns to wherever the reader followed the link from. */
    if (deep) {
      if (path) history.replaceState(null, '', '/');
      beginClose();
      return;
    }
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
    holdLenis();
    root?.setAttribute('inert', '');
    document.documentElement.style.overflow = 'hidden';
    focusRef?.current?.focus({ preventScroll: true });
    return () => {
      root?.removeAttribute('inert');
      document.documentElement.style.overflow = '';
      restoreScroll(); // last word, in case anything moved after the close began
      releaseLenis();
      // Lenis interpolates towards its own idea of where the page is,
      // and it has been stopped through all of the above — hand it the
      // truth or it animates the page back to wherever it left off
      getLenis()?.scrollTo(scrollRef.current, { immediate: true, force: true });
      history.scrollRestoration = prevRestoration;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // browser back closes the page instead of leaving the site
  useEffect(() => {
    // a deep entry already HAS its entry, made by the browser when it
    // followed the link; pushing ours on top would put a duplicate of
    // this page behind the reader
    if (deep) pushedRef.current = true;
    // pushedRef survives StrictMode's dev-only remount, so we never
    // push a second (leaked) history entry
    if (!pushedRef.current && !poppedRef.current && !closingRef.current) {
      pushedRef.current = true;
      if (path) history.pushState({ overlay: slug }, '', path);
      else history.pushState({ overlay: slug }, '');
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

  /* Paging ←/→ between case studies changes which one the URL names.
     replaceState, not push: it changes what the reader is looking at,
     not how deep they are — one back press still closes, from the
     sixth project as from the first. It also settles the canonical
     form of the path a deep link arrived at. */
  useEffect(() => {
    if (!path || closingRef.current || poppedRef.current) return;
    if (window.location.pathname === path) return;
    history.replaceState({ overlay: slug }, '', path);
  }, [path, slug]);

  return { state, requestClose };
}
