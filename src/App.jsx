import { useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import Nav from './components/Nav.jsx';
import HeroPourTransition from './components/HeroPourTransition.jsx';
import SheetFlip from './components/SheetFlip.jsx';
import Work from './components/Work.jsx';
import Play from './components/Play.jsx';
import Contact from './components/Contact.jsx';
import { useReveal } from './hooks/useReveal.js';
import { useLenis } from './hooks/useLenis.js';

export default function App() {
  useReveal();
  useLenis();

  const reduce = useReducedMotion();
  /* which cover the Work preview is showing — written by Work, read by
     the flight card so both sides of the hand-off show the same
     project. See the note on Work's props. */
  const previewRef = useRef(0);

  return (
    <>
      <a href="#about" className="skip-link">Skip to content</a>
      <Nav />
      <main>
        {/* Hero + About/Experience, joined by the coffee-pour scroll transition */}
        <HeroPourTransition />
        <Work previewRef={previewRef} flight={!reduce} />
        <Play />
        <Contact />
      </main>
      {/* Outside <main>, and outside every section: the card is fixed
          and has to be able to fly over both of its endpoints. It
          carries no content of its own — About and Work keep the
          semantics — so it sits at the end of the document. */}
      {!reduce && <SheetFlip previewRef={previewRef} />}
    </>
  );
}
