/* ------------------------------------------------------------------
   Site content. Drawn from Sharon's own reference mockups; treat as
   real and refine specifics later. Placeholder links marked TODO.
   ------------------------------------------------------------------ */

export const meta = {
  name: 'Sharon Chen',
  role: 'Software engineer & designer',
  email: 'sharonc4747@gmail.com',
  location: 'Ithaca, NY',
  status: 'Open to 2026 opportunities',
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'craft', label: 'Craft' },
  { id: 'work', label: 'Work' },
  { id: 'play', label: 'Play' },
  { id: 'contact', label: 'Contact' },
];

export const links = {
  email: 'mailto:sharonc4747@gmail.com',
  github: '#', // TODO: real GitHub URL
  linkedin: '#', // TODO: real LinkedIn URL
  resume: '#', // TODO: real résumé link
};

export const hero = {
  eyebrow: 'Portfolio — 2026',
  // rendered as two display lines
  nameLines: ['Sharon', 'Chen'],
  lead:
    'Engineering with an eye for the page — a CS student at Cornell working across software, design & AI.',
  pull: 'I build software the way an editor sets a page.',
  marginNote: 'CS @ Cornell\nsoftware · design · AI',
};

export const about = {
  lead:
    'I care about the seams — where software meets the people using it. I like calm interfaces, well-set type, and the odd coffee-fueled experiment.',
  body: [
    'I’m a computer science student at Cornell, working where engineering and design overlap. Most of what I make lives in that overlap: design systems, human-centered AI tools, and interfaces that feel considered rather than assembled.',
    'I care less about shipping everything and more about shipping the right thing, well — the same instinct whether I’m naming a component or setting a headline.',
  ],
  focus: [
    { k: 'Now', v: 'Design systems & human-centered AI tools' },
    { k: 'Studying', v: 'B.S. Computer Science, Cornell University' },
    { k: 'Believes', v: 'Restraint over decoration; the right thing, done well' },
  ],
};

export const stack = [
  'Python',
  'Java',
  'JavaScript',
  'HTML/CSS',
  'React',
  'Svelte',
  'Node.js',
  'OCaml',
  'SQL',
  'C',
  'GitHub',
  'Figma',
];

export const education = [
  { school: 'Cornell University', detail: 'Class of 2028' },
  { school: 'Lovejoy High School', detail: 'Class of 2024' },
];

// Reverse-chronological by start date. Each: accent date range → organization → role.
export const experience = [
  {
    date: 'Jun 2026 — Aug 2026',
    org: 'DeepSunlight Research',
    role: 'Student Researcher',
  },
  {
    date: 'Jan 2026 — Present',
    org: 'Cornell Systems Engineering Lab',
    role: 'Student Researcher',
  },
  {
    date: 'Jun 2025 — Aug 2025',
    org: 'Persado',
    role: 'Data Science & AI Intern',
  },
  {
    date: 'Nov 2024 — Present',
    org: 'Cornell University Unmanned Aerial Systems',
    role: 'Autopilot Software Engineer',
  },
];

export const projects = [
  {
    index: '01',
    name: 'Sentari AI',
    tagline: 'A design system that listens.',
    description:
      'A scalable, token-driven design system for an AI journaling product that remembers and grows with the person using it. Built the component library, theming, and documentation from first principles.',
    role: 'Design systems & front-end',
    stack: ['React', 'Design tokens', 'TypeScript', 'Storybook'],
    year: '2026',
    tone: ['var(--tone-b1)', 'var(--tone-b2)'],
    links: { study: '#', repo: '#' }, // TODO
  },
  {
    index: '02',
    name: 'CornellGO',
    tagline: 'Gamifying campus exploration.',
    description:
      'A campus-exploration app that turns the map into a game. Led three new gamified features end to end, with accessibility and playful engagement treated as first-class, not afterthoughts.',
    role: 'Product & engineering lead',
    stack: ['React Native', 'Accessibility', 'Node.js'],
    year: '2025',
    tone: ['var(--tone-a1)', 'var(--tone-a2)'],
    links: { study: '#', repo: '#' }, // TODO
  },
  {
    index: '03',
    name: 'Souvenir',
    tagline: 'Authentic social journaling, in the age of AI.',
    description:
      'A concept exploring how social journaling can foster genuine connection rather than performance. Named an 8th-of-150 finalist at the Rice 2025 Design-a-thon.',
    role: 'Product designer',
    stack: ['Figma', 'Prototyping', 'Research'],
    year: '2025',
    tone: ['var(--tone-c1)', 'var(--tone-c2)'],
    links: { study: '#', repo: '#' }, // TODO
  },
];

export const interests = [
  { icon: 'coffee', title: 'Coffee', note: 'Pour-over devotee. This site runs on it.' },
  { icon: 'cat', title: 'Cats', note: 'One black cat — my most frequent code reviewer.' },
  { icon: 'piano', title: 'Piano', note: 'Debussy when the debugging gets hard.' },
  { icon: 'camera', title: 'Photography', note: '35mm, mostly for the way cities catch light.' },
  { icon: 'plane', title: 'Travel', note: 'Quietly collecting train stations.' },
  { icon: 'pencil', title: 'Sketching', note: 'Margins full of small, useless doodles.' },
];

export const contact = {
  title: 'Let’s make something considered.',
  body:
    'I’m open to 2026 internships and collaborations at the intersection of software and design. The fastest way to reach me is email.',
};
