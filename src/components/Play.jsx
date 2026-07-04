import { interests } from '../data/content.js';
import { Coffee, Cat, Piano, Camera, Plane, Pencil, Sparkle } from './Doodles.jsx';
import './Play.css';

const iconMap = { coffee: Coffee, cat: Cat, piano: Piano, camera: Camera, plane: Plane, pencil: Pencil };

export default function Play() {
  return (
    <section id="play" className="section play">
      <div className="container">
        <div className="section-head reveal">
          <span className="folio">04</span>
          <h2>Off the Clock</h2>
          <p className="head-note">
            The small things that keep the work human.
          </p>
        </div>

        <ul className="play-grid">
          {interests.map((it, i) => {
            const Icon = iconMap[it.icon] || Sparkle;
            return (
              <li
                key={it.title}
                className="play-card reveal"
                style={{ '--reveal-delay': `${i * 0.05}s` }}
              >
                <span className="play-icon">
                  <Icon size={26} />
                </span>
                <h3 className="play-title">{it.title}</h3>
                <p className="play-note">{it.note}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
