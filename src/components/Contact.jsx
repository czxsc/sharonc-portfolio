import { contact, meta, links } from '../data/content.js';
import { Sparkle, Coffee, Heart } from './Doodles.jsx';
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
        <div className="section-head reveal">
          <h2>Contact</h2>
          <p className="head-note">{meta.status}</p>
        </div>

        <div className="contact-main reveal">
          <h3 className="contact-title">
            {contact.title}
            <Sparkle size={30} className="contact-sparkle" />
          </h3>
          <p className="contact-body">{contact.body}</p>

          <a href={links.email} className="contact-email ulink">
            {meta.email}
          </a>
        </div>

        <ul className="contact-links reveal" style={{ '--reveal-delay': '0.08s' }}>
          {social.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                className="contact-link"
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
