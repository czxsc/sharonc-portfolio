import { useInViewPlayback, useLoopToggle } from '../hooks/useVideoPlayback.js';

/* a recorded walkthrough (media.video, with media.src as its poster):
   muted and looping like a GIF, but it only runs while it's on screen,
   and never starts by itself under reduced motion. The Pause / Play
   in the caption row is the way to stop it — anything that moves for
   longer than a few seconds needs one — and clicking the video does
   the same. `playing` tracks what the reader asked for; whether it is
   actually running at the moment also depends on it being in view.

   media.ratio is for recordings that aren't the usual 16:10, set up
   front so the box doesn't jump when metadata lands. */
export default function Walkthrough({ media, className }) {
  const [playing, toggle] = useLoopToggle();
  const ref = useInViewPlayback(playing);

  return (
    <figure
      ref={ref}
      className={`pp-media pp-video ${className} ${media.fit ? 'is-fit' : ''}`}
    >
      <video
        src={media.video}
        poster={media.src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={media.label ?? media.caption}
        onClick={toggle}
        style={media.ratio ? { aspectRatio: media.ratio } : undefined}
      />
      <figcaption>
        {media.caption && <span>{media.caption}</span>}
        <button type="button" className="pp-video-toggle" onClick={toggle}>
          {playing ? 'Pause' : 'Play'}
        </button>
      </figcaption>
    </figure>
  );
}
