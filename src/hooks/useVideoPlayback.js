import { useEffect, useRef, useState } from 'react';

/* what the reader asked for: running, unless they prefer reduced
   motion, in which case nothing starts until they press Play */
export function useLoopToggle() {
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return [playing, () => setPlaying((p) => !p)];
}

/* runs every <video> inside the returned ref's element while it is on
   screen and `playing` is set, and holds them paused otherwise.

   Videos without `loop` are a set: one that finishes early waits on
   its last frame, and once every one has ended they all restart from
   the top together. Resuming skips the ones already waiting, since
   play() on an ended video would restart it alone. */
export function useInViewPlayback(playing) {
  const ref = useRef(null);
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const videos = [...box.querySelectorAll('video')];
    if (!playing) {
      videos.forEach((v) => v.pause());
      return;
    }
    let inView = false;
    const run = () =>
      videos.forEach((v) => !v.ended && v.play().catch(() => {}));
    const onEnded = () => {
      if (!videos.every((v) => v.ended)) return;
      videos.forEach((v) => {
        v.currentTime = 0;
      });
      if (inView) run();
    };
    videos.forEach((v) => v.addEventListener('ended', onEnded));
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) run();
        else videos.forEach((v) => v.pause());
      },
      { threshold: 0.35 }
    );
    io.observe(box);
    return () => {
      io.disconnect();
      videos.forEach((v) => v.removeEventListener('ended', onEnded));
    };
  }, [playing]);
  return ref;
}
