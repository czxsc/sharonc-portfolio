import Nav from './components/Nav.jsx';
import HeroPourTransition from './components/HeroPourTransition.jsx';
import Craft from './components/Craft.jsx';
import Work from './components/Work.jsx';
import Play from './components/Play.jsx';
import Contact from './components/Contact.jsx';
import { useReveal } from './hooks/useReveal.js';
import { useLenis } from './hooks/useLenis.js';

export default function App() {
  useReveal();
  useLenis();

  return (
    <>
      <a href="#about" className="skip-link">Skip to content</a>
      <Nav />
      <main>
        {/* Hero + About, joined by the coffee-pour scroll transition */}
        <HeroPourTransition />
        <Craft />
        <Work />
        <Play />
        <Contact />
      </main>
    </>
  );
}
