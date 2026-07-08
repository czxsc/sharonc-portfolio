/* ------------------------------------------------------------------
   Site content. Drawn from Sharon's own reference mockups; treat as
   real and refine specifics later. Placeholder links marked TODO.
   ------------------------------------------------------------------ */
import portfolioProjectImg from '../assets/portfolio_project_img.jpg';
import dishcoveryImg from '../assets/dishcovery_demo.jpg';

export const meta = {
  name: 'Sharon Chen',
  role: 'Software engineer & designer',
  email: 'sharonc4747@gmail.com',
  location: 'Ithaca, NY',
  status: 'Open to 2026 opportunities',
};

export const nav = [
  { id: 'about', label: 'About' },
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
    'Computer science student @ Cornell passionate about AI, software engineering, and design.',
  pull: 'I build software the way an editor sets a page.',
  marginNote: 'CS @ Cornell\nsoftware · design · AI',
};

export const about = {
  lead:
    'Some starting header',
  body: [
    'I\'m a Computer Science student at Cornell who enjoys building at the intersection of software engineering, AI, design, and autonomous systems. I\'m most drawn to spaces where different disciplines overlap, because that\'s often where the most interesting problems emerge from.',
    'Whatever I\'m building, I strive to understand how each piece of a system influences the next, from the underlying algorithms and infrastructure to the interface people actually interact with. Whether I\'m building an AI application, developing autonomous plane software for my team, or designing user interfaces, I enjoy balancing complex systems with experiences that feel intuitive and approachable.',
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

// Hover a project to preview it. Same sample image everywhere for now —
// swap in per-project shots; sample blurbs + tech lists are TODO.
export const projects = [
  { index: '01', name: 'Artificer', category: 'Design engineering', year: '2026', blurb: 'ML powered app to scan artworks and learn their history.', tech: ['React', 'TypeScript', 'Claude API'], image: portfolioProjectImg, tone: ['var(--tone-b1)', 'var(--tone-b2)'], href: '#work' },
  { index: '02', name: 'Portfolio', category: 'Web · this site', year: '2026', blurb: 'Personal portfolio site to learn about me and my work.', tech: ['React', 'Vite', 'Motion', 'CSS'], image: portfolioProjectImg, tone: ['var(--tone-a1)', 'var(--tone-a2)'], href: '#work' },
  { index: '03', name: 'Project DPK', category: 'Software', year: '2025', blurb: 'Sensor calibration support for CUAIR\'s custom GCS', tech: ['Python', 'SQL', 'Node.js'], image: portfolioProjectImg, tone: ['var(--tone-c1)', 'var(--tone-c2)'], href: '#work' },
  { index: '04', name: 'Little Wonder', category: 'Product design', year: '2025', blurb: 'Platformer action game set in a fantasy acorn world', tech: ['Java'], image: portfolioProjectImg, tone: ['var(--tone-e1)', 'var(--tone-e2)'], href: '#work' },
  { index: '05', name: 'Dishcovery', category: 'Web app', year: '2025', blurb: 'Restaurant recommendations from food, ambiance, and price queries.', tech: ['React', 'Python', 'SVD', 'LLM'], image: dishcoveryImg, tone: ['var(--tone-d1)', 'var(--tone-d2)'], href: '#work' },
  { index: '06', name: 'PokeLeet', category: 'Experiment', year: '2024', blurb: 'Gamified, pokemon-themed Leetcode tracker.', tech: ['JavaScript', 'CSS'], image: portfolioProjectImg, tone: ['var(--tone-f1)', 'var(--tone-f2)'], href: '#work' },
];

/* What spills out of the tote in the Play section. Each item opens a
   mini-page (iris transition from the item's hover dot).
   - tone: the dot / iris / page-tint color, always a token
   - page.blocks: rendered in order by HobbyPage.jsx
       { kind: 'text',    title?, body: [paragraphs] }
       { kind: 'list',    title,  items: [{ name, meta, note }] }
       { kind: 'specs',   title,  rows:  [{ label, value }] }
       { kind: 'gallery', title,  items: [{ caption, src? }] } — no src → placeholder frame
   TODO(sharon): all block content below is sample copy — swap in the
   real shows/books/games/parts, and add gallery image imports. */
export const hobbies = [
  {
    icon: 'laptop',
    slug: 'shows',
    title: 'Shows',
    note: 'Always mid-season on something.',
    tone: 'var(--tone-c2)',
    page: {
      tagline:
        'Comfort rewatches, one prestige drama at a time, and a rotating cast of shows I swear I’ll finish.',
      blocks: [
        {
          kind: 'list',
          title: 'Currently mid-season',
          items: [
            { name: 'Severance', meta: 'Apple TV+', note: 'Half the fun is the theories between episodes.' },
            { name: 'The Bear', meta: 'FX', note: 'Came for the plot, stayed for the plating.' },
            { name: 'Spy × Family', meta: 'anime', note: 'The palate cleanser.' },
          ],
        },
        {
          kind: 'text',
          body: ['The queue is longer than the watch history, and I’ve made peace with that.'],
        },
      ],
    },
  },
  {
    icon: 'book',
    slug: 'reading',
    title: 'Reading',
    note: 'Paperbacks over ebooks, always.',
    tone: 'var(--tone-b2)',
    page: {
      tagline: 'Paperbacks over ebooks, pencil marks over bookmarks.',
      blocks: [
        {
          kind: 'list',
          title: 'Recent shelf',
          items: [
            { name: 'Klara and the Sun', meta: 'Kazuo Ishiguro', note: 'An AI narrator with better manners than most humans.' },
            { name: 'The Design of Everyday Things', meta: 'Don Norman', note: 'Required reading that actually earns it.' },
            { name: 'Piranesi', meta: 'Susanna Clarke', note: 'Read in two sittings, thought about for two weeks.' },
          ],
        },
        {
          kind: 'text',
          body: ['Mostly fiction, with detours into design writing. The spines stay creased — books here are working objects, not shelf decor.'],
        },
      ],
    },
  },
  {
    icon: 'coffee',
    slug: 'drinks',
    title: 'Drink making',
    note: 'Pour-overs, matchas, and the odd experiment.',
    tone: 'var(--espresso)',
    page: {
      tagline:
        'Pour-overs on slow mornings, matcha when it’s warm, and the occasional experiment that shouldn’t leave the kitchen.',
      blocks: [
        {
          kind: 'list',
          title: 'House menu',
          items: [
            { name: 'V60 pour-over', meta: 'the daily', note: 'Light roast, 1:16, no shortcuts.' },
            { name: 'Iced matcha latte', meta: 'summer', note: 'Whisked properly or not at all.' },
            { name: 'Honey cardamom latte', meta: 'the experiment', note: 'Version four finally works.' },
          ],
        },
        {
          kind: 'text',
          body: ['Making the drink is half ritual, half excuse to slow down before the day starts. The latte-art cursor on this site is not a coincidence.'],
        },
      ],
    },
  },
  {
    icon: 'controller',
    slug: 'gaming',
    title: 'Gaming',
    note: 'Cozy sims and the occasional roguelike.',
    tone: 'var(--navy)',
    page: {
      tagline: 'Cozy sims on weeknights, roguelikes when I have something to prove.',
      blocks: [
        {
          kind: 'specs',
          title: 'The build',
          rows: [
            { label: 'CPU', value: 'AMD Ryzen 5 7600' },
            { label: 'GPU', value: 'NVIDIA RTX 4070' },
            { label: 'Memory', value: '32 GB DDR5' },
            { label: 'Storage', value: '1 TB NVMe' },
            { label: 'Monitor', value: '27″ · 1440p · 165 Hz' },
            { label: 'Keyboard', value: '75% mechanical, tactile' },
          ],
        },
        {
          kind: 'list',
          title: 'On rotation',
          items: [
            { name: 'Stardew Valley', meta: 'cozy sim', note: 'Five hundred hours and the farm still isn’t done.' },
            { name: 'Hades', meta: 'roguelike', note: 'The “something to prove” half.' },
            { name: 'It Takes Two', meta: 'co-op', note: 'A friendship stress test.' },
          ],
        },
      ],
    },
  },
  {
    icon: 'headphones',
    slug: 'music',
    title: 'Music',
    note: 'Debussy when the debugging gets hard.',
    tone: 'var(--tone-d2)',
    page: {
      tagline: 'Debussy when the debugging gets hard; everything else the rest of the time.',
      blocks: [
        {
          kind: 'list',
          title: 'On rotation',
          items: [
            { name: 'Clair de lune', meta: 'Debussy', note: 'The debugging soundtrack.' },
            { name: 'Merry Christmas Mr. Lawrence', meta: 'Ryuichi Sakamoto', note: 'For late trains and late commits.' },
            { name: 'Holocene', meta: 'Bon Iver', note: 'The walk-home track.' },
          ],
        },
        {
          kind: 'text',
          body: ['Years of piano lessons mostly left me with strong opinions about voicing and a soft spot for anything in D-flat.'],
        },
      ],
    },
  },
  {
    icon: 'sketchbook',
    slug: 'art',
    title: 'Art',
    note: 'Margins full of small, useless doodles.',
    tone: 'var(--sage)',
    page: {
      tagline: 'Margins full of small, useless doodles — and a sketchbook that gets the serious attempts.',
      blocks: [
        {
          kind: 'gallery',
          title: 'From the sketchbook',
          // TODO(sharon): add `src: importedImage` per piece; captionless
          // frames render as placeholders until then
          items: [
            { caption: 'figure studies, ink' },
            { caption: 'hands, again' },
            { caption: 'subway sketches' },
            { caption: 'portrait practice' },
            { caption: 'the cat, unimpressed' },
            { caption: 'perspective homework' },
          ],
        },
        {
          kind: 'text',
          body: ['Mostly ink and pencil, drawn from life when I can. The doodles in this site’s corners started in these pages.'],
        },
      ],
    },
  },
];

export const contact = {
  title: 'Let’s make something considered.',
  body:
    'I’m open to 2026 internships and collaborations at the intersection of software and design. The fastest way to reach me is email.',
};
