import { contact, meta, links } from '../data/content.js';
import { Sparkle, Coffee, Heart } from './Doodles.jsx';
import SectionSeam from './SectionSeam.jsx';
import SetType from './SetType.jsx';
import './Contact.css';

const social = [
  { label: 'Email', href: links.email, note: meta.email },
  { label: 'GitHub', href: links.github, note: 'github.com/czxsc' },
  { label: 'LinkedIn', href: links.linkedin, note: 'in/sharon-chen-692595211' },
  { label: 'Résumé', href: links.resume, note: 'PDF', todo: true },
];

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <SectionSeam folio="04 — CONTACT" note={meta.status} />

        <div className="section-head">
          <SetType as="h2" lines="Contact" />
        </div>

        <div className="contact-main">
          {/* no standing headline here — the one line of copy carries
              the section, so it reads at lead size with the sparkle
              riding its last word */}
          <p className="contact-body reveal" style={{ '--reveal-delay': '0.1s' }}>
            {contact.body}
            <Sparkle size={22} className="contact-sparkle" />
          </p>

          {/* the address is the one place the ink pools — a warm wash
              wipes in behind it rather than the hairline every other
              link gets */}
          <a
            href={links.email}
            className="contact-email reveal"
            style={{ '--reveal-delay': '0.2s' }}
          >
            <span className="contact-email-text">{meta.email}</span>
          </a>
        </div>

        <ul className="contact-links">
          {social.map((s, i) => (
            <li key={s.label} style={{ '--i': i }}>
              <a
                href={s.href}
                className="contact-link reveal"
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                <span className="contact-link-label">{s.label}</span>
                <span className="contact-link-note">
                  {s.note}
                  {s.todo && <span className="contact-todo">soon</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-mark">Sharon Chen</span>
          <span className="footer-meta">
            Designed with <Coffee size={13} className="footer-icon" /> &amp;{' '}
            <Heart size={13} className="footer-icon" /> by Sharon Chen · {new Date().getFullYear()}
          </span>
          <a href="#top" className="footer-top ulink">
            Back to top ↑
          </a>
        </div>
      </footer>
    </section>
  );
}
