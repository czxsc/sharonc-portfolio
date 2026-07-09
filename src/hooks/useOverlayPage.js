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
  const onCloseRef = useRef(onClose); // listeners outlive renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const beginClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
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
    getLenis()?.stop();
    root?.setAttribute('inert', '');
    document.documentElement.style.overflow = 'hidden';
    focusRef?.current?.focus({ preventScroll: true });
    return () => {
      root?.removeAttribute('inert');
      document.documentElement.style.overflow = '';
      getLenis()?.start();
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
