import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Craft from './components/Craft.jsx';
import Work from './components/Work.jsx';
import Play from './components/Play.jsx';
import Contact from './components/Contact.jsx';
import { useReveal } from './hooks/useReveal.js';

export default function App() {
  useReveal();

  return (
    <>
      <a href="#about" className="skip-link">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <About />
        <Craft />
        <Work />
        <Play />
        <Contact />
      </main>
    </>
  );
}
