import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import './SectionSeam.css';

/* ------------------------------------------------------------------
   The seam between two sections.

   A magazine rules a line across the page when the subject changes.
   Here the reader draws it: the rule's width is scrubbed directly
   against scroll position, so it isn't a reveal that fires once — it
   grows under you as you arrive and is already complete by the time
   the section's title has set. The folio and the note ride in from
   their own ends on the same progress, meeting the rule.

   `folio` is the section's number, `note` a mono fact that the
   heading below doesn't already say (a count, a status) — the seam
   carries information, it isn't a divider with decoration on it.
   ------------------------------------------------------------------ */

/* The window, in viewport terms, over which the rule draws. It starts
   as the seam clears the bottom of the screen and finishes a little
   above centre, so the line is settled before the eye reaches the
   heading underneath it. */
const DRAW_WINDOW = ['start 96%', 'start 42%'];

export default function SectionSeam({ folio, note }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: DRAW_WINDOW,
  });

  /* NOTE: transforms and CSS vars only. In motion v12.42 a plain
     style-value MotionValue (opacity) never re-renders on scroll —
     the same bug worked around in HeroPourTransition. */
  const draw = useTransform(p, [0, 1], [0, 1]);
  const folioOp = useTransform(p, [0, 0.4], [0, 1]);
  const folioX = useTransform(p, [0, 0.4], [-10, 0]);
  /* the folio stamps as the rule reaches the far margin — it arrives
     a touch oversized and settles, the way a number pressed into the
     page recovers. Scrubbed like everything else here, so scrolling
     back up un-stamps it. */
  const folioScale = useTransform(p, [0.66, 0.94], [1.12, 1]);
  const noteOp = useTransform(p, [0.25, 0.75], [0, 1]);
  const noteX = useTransform(p, [0.25, 0.75], [12, 0]);

  if (reduce) {
    return (
      <div className="seam seam-static">
        <div className="container seam-inner">
          <span className="seam-folio">{folio}</span>
          <span className="seam-rule" />
          {note && <span className="seam-note">{note}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="seam" ref={ref}>
      <div className="container seam-inner">
        <motion.span
          className="seam-folio"
          style={{ '--op': folioOp, x: folioX, scale: folioScale }}
        >
          {folio}
        </motion.span>
        <motion.span className="seam-rule" style={{ scaleX: draw }} />
        {note && (
          <motion.span
            className="seam-note"
            style={{ '--op': noteOp, x: noteX }}
          >
            {note}
          </motion.span>
        )}
      </div>
    </div>
  );
}
