/* ------------------------------------------------------------------
   Site content. Drawn from Sharon's own reference mockups; treat as
   real and refine specifics later. Placeholder links marked TODO.
   ------------------------------------------------------------------ */
import portfolioProjectImg from '../assets/portfolio_project_img.jpg';
import dishcoveryImg from '../assets/dishcovery_demo.jpg';
import artificerImg from '../assets/artificer_placeholder.jpg';
import cuairRadioImg from '../assets/cuair_cropped.png';
import littleWonderImg from '../assets/little_wonder.png';
import pokeleetDashboardImg from '../assets/pokeleet_dashboard_static.png';

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
  github: 'https://github.com/czxsc',
  linkedin: 'https://www.linkedin.com/in/sharon-chen-692595211',
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

/* Hover a project to preview it; click to open its case study.
   Same sample image everywhere for now — swap in per-project shots.

   Each `page` renders in ProjectPage.jsx (layout modeled on
   dousanmiao.com case pages):
   - status:   pill next to the title ('Completed' / 'Developing' / 'Live')
   - subtitle: one line under the title
   - intro:    short paragraph under the hero media
   - links:    external chips, e.g. [{ label: 'GitHub', href }]
   - meta:     labeled rows — Product / My role / Timeline / Skills
               (+ Team only where it was a team project)
   - sections: [{ heading, body: [paragraphs], facts?: [{title, text}],
                  media?: { src?, caption } }] — media without src
               renders a placeholder panel

   TODO(sharon): all case copy below is placeholder — replace with the
   real story per project, plus real links and media. */
export const projects = [
  {
    index: '01',
    name: 'Artificer',
    slug: 'artificer',
    category: 'Design engineering',
    year: '2026',
    blurb: 'ML powered app to scan artworks and learn their history.',
    tech: ['React', 'TypeScript', 'Claude API'],
    image: artificerImg,
    tone: ['var(--tone-b1)', 'var(--tone-b2)'],
    href: '#work',
    page: {
      status: 'Developing',
      subtitle: 'Point your camera at a painting; get its story.',
      intro:
        'Artificer is an ML-powered app that identifies artworks from a photo and unpacks their history, technique, and context. I’m building it end to end — from the recognition pipeline to an interface that reads like a well-set gallery label.',
      links: [{ label: 'GitHub', href: '#' }],
      meta: [
        { label: 'Category', value: 'Machine Learning, RAG, Full-Stack' },
        { label: 'My role', value: 'Design & engineering' },
        { label: 'Timeline', value: '2026 — in progress' },
        { label: 'Skills', value: 'Evaluating ML Models, RAG, LLM, React, Javascript' },
      ],
      sections: [
        {
          heading: 'Problem: Art context is locked in wall text',
          body: [
            'Standing in front of a painting, most of what makes it interesting — who made it, why, what to look at — lives in a paragraph you have to find, or a tour you didn’t book. Outside a museum there’s even less: reverse image search returns listings, not stories.',
            'Artificer starts from the moment of curiosity: you’re looking at the thing, and you want to know more right now.',
          ],
        },
        {
          heading: 'Approach',
          body: [
            'The build is organized around three decisions, each still being tested against real gallery visits.',
          ],
          facts: [
            {
              title: 'Recognition first',
              text: 'Identification has to work on imperfect photos — glare, angles, crops — before anything else matters.',
            },
            {
              title: 'Context, not captions',
              text: 'The model’s output is edited into a structured story: era, technique, and one thing to look closer at.',
            },
            {
              title: 'Gallery-label tone',
              text: 'The interface borrows from wall text: quiet type, short measures, no feed mechanics.',
            },
          ],
        },
        {
          heading: 'Architecture: From photograph to provenance',
          body: [
            'A single CLIP encoder feeds two parallel heads — exact-match retrieval and label classification. A confidence gate decides which signal to trust before handing a rewritten query to the RAG layer. Hover a layer to expand its stack.',
          ],
          // renders the interactive isometric pile (StackDiagram.jsx);
          // one plate per tool, grouped top → bottom
          stack: {
            title: 'Four layers, one request',
            hint: 'Hover a layer to expand its stack.',
            flow: [
              { title: 'Photograph in', note: 'museum capture, upload, or crop' },
              { title: 'Embed → route → retrieve', note: 'CLIP encoder + confidence gate' },
              { title: 'Context out', note: 'top match + synthesized history' },
            ],
            // diagram-specific hues (not site tokens): the translucent
            // plates blend when stacked, so the bands need genuinely
            // different hue families — rust / blue / amber / green
            groups: [
              {
                name: 'Frontend',
                tone: '#b05438',
                tools: [
                  { name: 'React + TypeScript', note: 'capture, scan, and reading views' },
                  { name: 'Vite', note: 'build and dev tooling' },
                  { name: 'Design tokens', note: 'the gallery-label reading experience' },
                ],
              },
              {
                name: 'Backend & data',
                tone: '#3e6b9e',
                tools: [
                  { name: 'Node.js API', note: 'scan orchestration and session state' },
                  { name: 'Job queue', note: 'rate-limited model calls' },
                  { name: 'Vector index', note: 'artwork embeddings' },
                  { name: 'Metadata store', note: 'artists, eras, provenance' },
                  { name: 'Ingest pipeline', note: 'museum open-data sets' },
                ],
              },
              {
                name: 'Vision model',
                tone: '#c99a3d',
                tools: [
                  { name: 'CLIP encoder', note: 'shared image embeddings' },
                  { name: 'Retrieval head', note: 'exact match against the index' },
                  { name: 'Classifier + confidence gate', note: 'decides which signal to trust' },
                ],
              },
              {
                name: 'RAG & context',
                tone: '#55855a',
                tools: [
                  { name: 'Claude API', note: 'history and technique, synthesized' },
                  { name: 'Corpus retrieval', note: 'curated art-history passages' },
                  { name: 'Prompt templates', note: 'wall-label tone control' },
                ],
              },
            ],
          },
        },
        {
          heading: 'Solution: A pocket docent',
          body: [
            'Scan a work and Artificer returns a label-sized summary with the option to go deeper — related works, the artist’s arc, and how this piece fits it. Depth is opt-in; the default reading takes under a minute.',
          ],
          media: { caption: 'Scan-to-story flow — screens coming as the build stabilizes.' },
        },
        {
          heading: 'Status',
          body: [
            'The recognition pipeline and core reading experience are working; current focus is offline handling in low-signal galleries and the related-works graph.',
          ],
        },
      ],
    },
  },
  {
    index: '02',
    name: 'Portfolio',
    slug: 'portfolio',
    category: 'Web · this site',
    year: '2026',
    blurb: 'Personal portfolio site to learn about me and my work.',
    tech: ['React', 'Vite', 'Motion', 'CSS'],
    image: portfolioProjectImg,
    tone: ['var(--tone-a1)', 'var(--tone-a2)'],
    href: '#work',
    page: {
      status: 'Live',
      subtitle: 'The site you’re reading, designed like a printed journal.',
      intro:
        'This portfolio began as a Framer prototype and was rebuilt from scratch in code — partly to own every detail, mostly because the details are the point. It’s a React + Vite site with a paper-and-ink design system and hand-tuned motion throughout.',
      links: [{ label: 'GitHub', href: '#' }],
      meta: [
        { label: 'Product', value: 'Personal website' },
        { label: 'My role', value: 'Design & engineering' },
        { label: 'Timeline', value: '2026' },
        { label: 'Skills', value: 'React, Vite, Motion, CSS, editorial design' },
      ],
      sections: [
        {
          heading: 'Goal: Feel set, not assembled',
          body: [
            'Most developer portfolios read as templates with content poured in. The goal here was the opposite: an editorial object with strong typography, asymmetric composition, and personality kept to about ten percent — coffee, one cat, and a tote bag.',
          ],
        },
        {
          heading: 'Details: The interactions carry it',
          body: [
            'Every section got one considered moment instead of scattered effects.',
          ],
          facts: [
            {
              title: 'Coffee-pour transition',
              text: 'The hero pours into the About section on scroll, scrubbed through a liquid fill.',
            },
            {
              title: 'The tote-bag spill',
              text: 'A drawn cat knocks over a bag and the hobbies scatter out as a flat-lay.',
            },
            {
              title: 'Iris mini-pages',
              text: 'Hobby items open full-screen pages through a compositor-friendly circle transition.',
            },
          ],
        },
        {
          heading: 'Build notes',
          body: [
            'Animations are CSS-first and kept on transform/opacity for smoothness; Lenis handles scroll feel; reduced-motion collapses everything to instant states. The design system lives in tokens — components never touch raw hex.',
          ],
          media: { caption: 'Selected details — recorded walkthrough coming soon.' },
        },
      ],
    },
  },
  {
    index: '03',
    name: 'Project DPK',
    slug: 'project-dpk',
    category: 'Software',
    year: '2025',
    blurb: 'Sensor calibration support for CUAIR\'s custom GCS',
    tech: ['Python', 'SQL', 'Node.js'],
    image: cuairRadioImg,
    tone: ['var(--tone-c1)', 'var(--tone-c2)'],
    href: '#work',
    page: {
      status: 'Completed',
      subtitle: 'Sensor calibration support for CUAIR’s custom ground control station.',
      intro:
        'On Cornell’s Unmanned Aerial Systems team, I built calibration tooling for the autopilot’s sensor stack inside our custom ground control station — turning a manual, error-prone pre-flight ritual into a guided, logged workflow.',
      links: [{ label: 'CUAIR', href: '#' }],
      meta: [
        { label: 'Product', value: 'Ground control station tooling' },
        { label: 'My role', value: 'Autopilot software engineer' },
        { label: 'Timeline', value: '2025' },
        { label: 'Skills', value: 'Python, SQL, Node.js, data pipelines' },
      ],
      sections: [
        {
          heading: 'Problem: Drifting sensors, manual fixes',
          body: [
            'Autopilot accuracy depends on well-calibrated sensors, and calibration state drifted between flight days. The existing process was manual, undocumented, and easy to get subtly wrong — the kind of wrong you only discover in the air.',
          ],
        },
        {
          heading: 'Solution: Calibration in the loop',
          body: [
            'The tooling walks operators through each sensor’s calibration, validates readings against expected ranges as they come in, and records every run to the flight database — so a bad calibration is caught on the ground and every flight has a traceable baseline.',
          ],
          media: { caption: 'Calibration workflow in the GCS — screenshots pending team approval.' },
        },
        {
          heading: 'Impact: Flight-day confidence',
          body: [
            'Pre-flight sensor checks went from tribal knowledge to a repeatable procedure any team member can run, and logged calibration history made post-flight debugging meaningfully faster.',
          ],
        },
      ],
    },
  },
  {
    index: '04',
    name: 'Little Wonder',
    slug: 'little-wonder',
    category: 'Product design',
    year: '2025',
    blurb: 'Platformer action game set in a fantasy acorn world',
    tech: ['Java'],
    image: littleWonderImg,
    tone: ['var(--tone-e1)', 'var(--tone-e2)'],
    href: '#work',
    page: {
      status: 'Completed',
      subtitle: 'A platformer set in a fantasy acorn world.',
      intro:
        'Little Wonder is a 2D platformer built in Java with a small team — a forest adventure where you play an acorn sprite finding its way home. I owned character movement and level design, the two systems that decide whether a platformer feels good.',
      links: [{ label: 'Play', href: '#' }],
      meta: [
        { label: 'Product', value: 'Desktop game' },
        { label: 'My role', value: 'Design Lead & Game Programmer' },
        { label: 'Timeline', value: 'Spring 2026' },
        { label: 'Skills', value: 'Java, game feel, level design' },
        { label: 'Team', value: 'Christian Amadeo, Caden Lau, Afram Ahmed, Paul Lukewesa, David Colle, Samantha Ahn, Thomas Myers' },
      ],
      sections: [
        {
          heading: 'Concept: Small hero, big forest',
          body: [
            'The world is scaled to an acorn: blades of grass are platforms, puddles are lakes, and a garden fence is the final ascent. That one framing decision drove the art direction, the level metaphors, and the movement tuning.',
          ],
        },
        {
          heading: 'Design: Movement before everything',
          body: [
            'We prototyped jump arcs for two weeks before building a single level — if carrying momentum around the world isn’t fun, nothing layered on top will fix it.',
          ],
          facts: [
            {
              title: 'Coyote time & buffers',
              text: 'Forgiving input windows make the controls feel fair without making them easy.',
            },
            {
              title: 'Readable danger',
              text: 'Every hazard telegraphs one screen early; deaths should feel earned, not cheap.',
            },
            {
              title: 'One new idea per level',
              text: 'Each level introduces a single mechanic, then remixes the ones you already know.',
            },
          ],
        },
        {
          heading: 'Outcome',
          body: [
            'The finished build shipped with a full level arc and boss encounter. Playtesters’ first words were about how the jump felt — which was the point.',
          ],
          media: { caption: 'Gameplay capture — recording coming soon.' },
        },
      ],
    },
  },
  {
    index: '05',
    name: 'Dishcovery',
    slug: 'dishcovery',
    category: 'Web app',
    year: '2025',
    blurb: 'Restaurant recommendations from food, ambiance, and price queries.',
    tech: ['React', 'Python', 'SVD', 'LLM'],
    image: dishcoveryImg,
    tone: ['var(--tone-d1)', 'var(--tone-d2)'],
    href: '#work',
    page: {
      status: 'Completed',
      subtitle: 'Restaurant recommendations from plain-language cravings.',
      intro:
        'Dishcovery answers the question review sites can’t: “somewhere quiet with great hand-pulled noodles, under $20.” It parses free-form queries about food, ambiance, and price, and ranks restaurants against thousands of reviews.',
      links: [{ label: 'Demo', href: '#' }, { label: 'GitHub', href: '#' }],
      meta: [
        { label: 'Product', value: 'Web app' },
        { label: 'My role', value: 'ML & frontend' },
        { label: 'Timeline', value: '2025' },
        { label: 'Skills', value: 'React, Python, SVD, LLM integration' },
        { label: 'Team', value: 'Team of 5 — TODO: teammate names' },
      ],
      sections: [
        {
          heading: 'Problem: Reviews answer questions nobody asked',
          body: [
            'Star ratings average away exactly what you care about. A four-star restaurant might be perfect for a date and wrong for a work lunch — the signal is in the review text, and nobody reads three hundred reviews.',
          ],
        },
        {
          heading: 'How it works',
          body: [
            'The pipeline turns a sentence of preferences into a ranked shortlist with receipts.',
          ],
          facts: [
            {
              title: 'SVD retrieval',
              text: 'Latent-semantic search over review text finds candidates that match the vibe, not just the keywords.',
            },
            {
              title: 'LLM reranking',
              text: 'A second pass scores candidates against the specific query — food, ambiance, and price separately.',
            },
            {
              title: 'Evidence surfaced',
              text: 'Each recommendation quotes the review lines that earned it, so you can trust the match.',
            },
          ],
        },
        {
          heading: 'Impact',
          body: [
            'The demo consistently beat keyword search on ambiance-heavy queries in our evaluation set, and the evidence-quoting pattern became the feature testers mentioned first.',
          ],
          media: { src: dishcoveryImg, caption: 'Dishcovery results view — query to ranked shortlist.' },
        },
      ],
    },
  },
  {
    index: '06',
    name: 'PokeLeet',
    slug: 'pokeleet',
    category: 'Experiment',
    year: '2024',
    blurb: 'Gamified, pokemon-themed Leetcode tracker.',
    tech: ['JavaScript', 'CSS'],
    image: pokeleetDashboardImg,
    tone: ['var(--tone-f1)', 'var(--tone-f2)'],
    href: '#work',
    page: {
      status: 'Completed',
      subtitle: 'A Pokémon-themed tracker that turns Leetcode into a collect-a-thon.',
      intro:
        'PokeLeet is a small experiment in motivation design: every solved Leetcode problem earns progress toward catching a Pokémon, with harder problems yielding rarer catches. Built to make a grind feel like a game — mostly for me, then for friends.',
      links: [{ label: 'GitHub', href: '#' }],
      meta: [
        { label: 'Product', value: 'Browser app' },
        { label: 'My role', value: 'Design & engineering' },
        { label: 'Timeline', value: '2024' },
        { label: 'Skills', value: 'JavaScript, CSS, gamification' },
      ],
      sections: [
        {
          heading: 'Idea: Borrow a better reward loop',
          body: [
            'Interview prep has a brutal feedback curve — effort now, payoff months away. Collection games solved that problem decades ago: visible progress, variable rewards, and a shelf to fill.',
          ],
        },
        {
          heading: 'How it works',
          body: [
            'Problems map to encounter tiers by difficulty and topic; streaks improve catch rates. The collection screen is the real interface — the todo list is just how you hunt.',
          ],
          media: { caption: 'Collection screen — capture coming soon.' },
        },
        {
          heading: 'What I learned',
          body: [
            'Gamification works when the game is honest: as soon as rewards felt arbitrary, motivation dropped. Tying rarity to genuine difficulty kept the loop meaningful — a lesson that generalizes well beyond side projects.',
          ],
        },
      ],
    },
  },
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
  title: 'Let’s make something!',
  body:
    'I’m open to 2027 internships and collaborations. The fastest way to reach me is email.',
};
