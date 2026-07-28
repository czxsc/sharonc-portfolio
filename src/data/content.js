/* ------------------------------------------------------------------
   Site content. Drawn from Sharon's own reference mockups; treat as
   real and refine specifics later. Placeholder links marked TODO.
   ------------------------------------------------------------------ */
import portfolioProjectImg from '../assets/portfolio_project_img.jpg';
import dishcoveryImg from '../assets/dishcovery_demo.jpg';
import artificerImg from '../assets/artificer_placeholder.jpg';
import cuairGcsImg from '../assets/cuair.webp';
import dpkMissionPlannerImg from '../assets/dpk_mission_planner.png';
import dpkAccelImg from '../assets/dpk_accel_cropped.webp';
import dpkGuideImg from '../assets/dpk_guide.webp';
import dpkRadioImg from '../assets/dpk_radio.webp';
import dpkServosImg from '../assets/dpk_servos.webp';
import dpkFlightModesImg from '../assets/dpk_flightmodes.webp';
import littleWonderImg from '../assets/little_wonder.webp';
import pokeleetDashboardImg from '../assets/pokeleet_dashboard_static.webp';
import concertRoseImg from '../assets/rose_stage.jpg';
import concertTwiceImg from '../assets/twice.jpg';
import concertSunkisImg from '../assets/sunkis_closeup.jpg';
import concertSlopeDayImg from '../assets/slope_grouppic.jpg';
import concertKiofImg from '../assets/kiof_group.jpg';
import receiptifyImg from '../assets/receiptify.png';
import pcBuildImg from '../assets/hobby/web/pc.webp';

/* Save-file snapshots for the permanent three — a `shot` on a favourite
   is what the hover peek picks up (HobbyPage · FavesList). Titles without
   one behave exactly as before, so the other two can land whenever the
   screenshots do. */
import shotStardew from '../assets/hobby/web/game_stardew.webp';
import shotFireEmblem from '../assets/hobby/web/game_fire_emblem.webp';

/* Book jackets for the Stories shelf — sized-down covers from the Open
   Library cover archive, one per title in `read` below. */
import coverBabel from '../assets/hobby/web/book_babel.webp';
import coverKatabasis from '../assets/hobby/web/book_katabasis.webp';
import coverCirce from '../assets/hobby/web/book_circe.webp';
import coverDivineRivals from '../assets/hobby/web/book_divine_rivals.webp';
import coverHailMary from '../assets/hobby/web/book_project_hail_mary.webp';
import coverThursday from '../assets/hobby/web/book_thursday_murder_club.webp';

/* Die-cut stickers for the Stories watch row — each one trimmed to its
   subject on transparent, so the white outline is drawn in CSS. */
import stickerOdyssey from '../assets/hobby/web/show_odyssey.webp';
import stickerSpyFamily from '../assets/hobby/web/show_spy_family.webp';
import stickerWitchHat from '../assets/hobby/web/show_witch_hat.webp';

/* Little Wonder art direction. `web/` holds the sized webp exports of
   the source art next to it — the originals run 2–17MB each and are
   kept only as masters. */
import lwBoard from '../assets/little_wonder/web/little_wonder_brainstorm_board.webp';
import lwSketch from '../assets/little_wonder/web/early_landscape_sketch.webp';
import lwEnvir from '../assets/little_wonder/web/early_envir_concept.webp';
import lwConcept from '../assets/little_wonder/web/early_concept.webp';
import lwGrass from '../assets/little_wonder/web/early_grass.webp';
import lwTileOg from '../assets/little_wonder/web/grassy_tile.webp';
import lwTileIn from '../assets/little_wonder/web/intermittent_tile.webp';
import lwTileCr from '../assets/little_wonder/web/crystal_tile.webp';
import lwTileBi from '../assets/little_wonder/web/biolum_tile.webp';
import lwOgBanner from '../assets/little_wonder/web/overgrown_stalactites.webp';
import lwOgCave from '../assets/little_wonder/web/overgrown_cave2048.webp';
import lwOgGrove from '../assets/little_wonder/web/overgrown_mushrooms.webp';
import lwOgNexus from '../assets/little_wonder/web/overgrown_nexus.webp';
import lwInBanner from '../assets/little_wonder/web/intermittent_stalactites.webp';
import lwInCave from '../assets/little_wonder/web/intermittent_cave.webp';
import lwInGrove from '../assets/little_wonder/web/intermittent_mushrooms.webp';
import lwInNexus from '../assets/little_wonder/web/intermittent_nexus.webp';
import lwCrBanner from '../assets/little_wonder/web/crystal_stalactites.webp';
import lwCrCave from '../assets/little_wonder/web/crstal_cave2048.webp';
import lwCrGrove from '../assets/little_wonder/web/crystal_mushrooms.webp';
import lwCrNexus from '../assets/little_wonder/web/crystal_nexus.webp';
import lwBiBanner from '../assets/little_wonder/web/biolum_stalactites.webp';
import lwBiCave from '../assets/little_wonder/web/biolum_cav2048.webp';
import lwBiGrove from '../assets/little_wonder/web/biolum_mushrooms.webp';
import lwBiNexus from '../assets/little_wonder/web/biolum_nexus.webp';

export const meta = {
  name: 'Sharon Chen',
  role: 'Software engineer & designer',
  email: 'sharonc.czx@gmail.com',
  location: 'Ithaca, NY and Dallas, TX',
  status: 'Open to 2027 opportunities',
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'play', label: 'Play' },
  { id: 'contact', label: 'Contact' },
];

export const links = {
  email: 'mailto:sharonc.czx@gmail.com',
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
   - meta:     labeled rows — Category / My role / Timeline / Skills
               (+ Team only where it was a team project)
   - sections: [{ heading, body: [paragraphs], facts?: [{title, text}],
                  points?: [{icon, text}], stack?, flow?,
                  compare?: { before, after: {src, label}, caption },
                  media?: { src?, fit?, caption },
                  gallery?: [{src, caption}] }] — media without src
               renders a placeholder panel; fit shows the whole image
               instead of the 21:9 crop; points renders icon tiles;
               compare renders a labeled before/after pair;
               stack renders StackDiagram.jsx, flow FlowDiagram.jsx

   TODO(sharon): all case copy below is placeholder — replace with the
   real story per project, plus real links and media. */
export const projects = [
  {
    index: '01',
    name: 'Artificer',
    slug: 'artificer',
    category: 'ML · Full-Stack',
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
    category: 'Frontend · Design',
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
        { label: 'Category', value: 'Frontend, Design' },
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
    name: 'Preflight',
    slug: 'preflight',
    category: 'Full-Stack · Autonomous Systems',
    year: '2025',
    blurb: 'Hardware pre-flight setup for Cuair\'s custom GCS',
    tech: ['Svelte', 'Python', 'Flask', 'MAVLink'],
    image: cuairGcsImg,
    tone: ['var(--tone-c1)', 'var(--tone-c2)'],
    href: '#work',
    page: {
      status: 'Completed',
      // show the whole GCS screenshot instead of the 21:9 hero crop
      hero: { fit: true },
      subtitle: 'Bringing pre-flight hardware setup into CUAIR’s custom ground control station.',
      intro:
        'Every CUAIR test flight used to be divided between two different software platforms. Our team flies a custom ground control station, but hardware setup features like sensor calibration or servo output configuration still lived in Mission Planner. Preflight built that hardware setup layer into our own GCS, from the Svelte interface down to the MAVLink commands on the wire.',
      links: [{ label: 'CUAIR', href: 'https://cuair.org' }],
      meta: [
        { label: 'Category', value: 'Full-Stack, Autonomous Systems' },
        { label: 'My role', value: 'Autopilot Team\nSoftware engineer' },
        { label: 'Timeline', value: '2025-2026' },
        { label: 'Skills', value: 'Svelte, Python, Flask, MAVProxy, MAVLink' },
      ],
      sections: [
        {
          heading: 'Problem: Two ground stations',
          body: [
            'Mission Planner is a free, open-source ground control station software, and is the de facto ground station for ArduPilot teams. So even with our team\'s custom Ground Control Station flying the plane autonomously, hardware setup kept us still tethered to Mission Planner. Every test flight required pre-flight configuration in one tool then migrating to the other. However, when this year’s competition rules changed to include setup into the 45-minute mission window, this workflow became a significant problem that has to change.',
            'Through surveying the team, I identified four key limitations of depending on Mission Planner for hardware setup:',
          ],
          points: [
            { icon: 'freeze', text: 'Older, clunkier software that often crashes and freezes' },
            { icon: 'platform', text: 'Windows-only compatibility on a largely-Mac team' },
            { icon: 'guide', text: 'Guidance lived in forum threads and online docs, not the tool itself' },
            { icon: 'clock', text: 'Switching between platforms is timely, with setup now on the clock' },
          ],
          compare: {
            // the MP asset is pre-trimmed to content (no title bar or
            // dead space), so a center crop only shaves a few px
            before: { src: dpkMissionPlannerImg, label: 'Before · Mission Planner', position: 'center' },
            // fit: the wider GCS shot letterboxes a hair instead of
            // losing its modal edge to the crop
            after: { src: dpkAccelImg, label: 'After · Preflight', fit: true },
            caption:
              'Mission Planner’s hardware setup page vs. Preflight’s guided setup window inside our GCS.',
          },
        },
        {
          heading: 'Research: Redesigning for the team',
          body: [
            'Rather than directly moving Mission Planner\'s interface over, I redesigned the setup experience to best fit our team\'s needs. Integrating hardware setup into our GCS solved the platform-switching and Mac compatibility problems, while the interface itself was simplified to focus on the five setup tasks we actually perform, replacing cluttered menus and external documentation with a guided, intuitive experience.',
          ],
          facts: [
            {
              title: 'Simplified to the essential workflows',
              text: 'Accelerometer calibration, large-vehicle compass calibration, radio calibration, servo outputs, and flight modes — the setup steps every flight needs, and nothing else.',
            },
            {
              title: 'A window, not a sidebar',
              text: 'Hardware setup happens before flight, so it lives in its own separate draggable modal instead of permanently crowding flight-critical telemetry on the main display.',
            },
            {
              title: 'Guidance built in',
              text: 'A dedicated Guide tab and per-step prompts replace the need to switch between online documentation and the GCS. ',
            },
          ],
        },
        {
          heading: 'Implementation: One command’s round trip',
          body: [
            'The GCS frontend is a Svelte single-page app, and the backend is a Flask REST API that MAVProxy hosts on a background thread. Preflight adds a layer to each: a five-tab setup window in the UI, five Flask blueprints behind it, and a new MAVProxy module that owns the MAVLink communication. The boundaries are strict: nothing above dpk.py knows MAVLink exists, and nothing below the Flask views knows there’s a UI.',
            'Live feedback rides a single polling loop. Every 500 ms the app asks each status endpoint, writes the answers into Svelte stores, and the tabs re-render reactively. This way, step prompts and progress update in real time while a calibration runs on the plane. The full architecture is shows below.',
          ],
          // renders the interactive layered flow (FlowDiagram.jsx)
          flow: {
            title: 'One command’s round trip',
            hint: 'Hover or tap any file to see what it sends and what it listens for.',
            journey: [
              {
                title: 'The tab asks',
                note: 'A click in the modal → DpkActions → SendAPI fires a fetch() POST.',
              },
              {
                title: 'Flask validates',
                note: 'The blueprint checks and shapes the JSON, then calls the dpk singleton.',
              },
              {
                title: 'dpk.py transmits',
                note: 'The module turns it into COMMAND_LONG / PARAM_SET on the MAVLink radio.',
              },
              {
                title: 'Status climbs back',
                note: 'Inbound packets update module state; the poll lifts it into the stores and the UI re-renders.',
              },
            ],
            // diagram-specific hues (not site tokens): each layer needs
            // its own hue family — blue / green / rust / amber
            layers: [
              {
                id: 'ui',
                name: 'Svelte UI',
                file: 'modalWindow.svelte',
                note: 'a draggable five-tab setup window, opened from the flight display',
                tone: '#3e6b9e',
                rows: [
                  {
                    label: 'Tabs',
                    nodes: [
                      {
                        id: 'guide',
                        label: 'GuideTab.svelte',
                        feature: ['all'],
                        detail: {
                          summary: 'Pre-flight setup instructions with the documentation directly written into the tool itself.',
                          points: [
                            { tag: 'role', text: 'The onboarding fix: this tab explains what each workflow does, when to run it, and detailed instructions for every step.' },
                          ],
                        },
                      },
                      {
                        id: 'cal-tab',
                        label: 'Calibration.svelte',
                        feature: ['accel', 'mag'],
                        detail: {
                          summary: 'The accelerometer and compass calibration tab: includes the six-position accelerometer flow plus large-vehicle compass calibration.',
                          points: [
                            { tag: 'sends', text: 'startAccel() · confirmAccelPosition() — begin the flow, then confirm each vehicle position.' },
                            { tag: 'sends', text: 'sendLargeMagCalib(yaw) — submit the vehicle’s measured heading for fixed-yaw compass cal.' },
                            { tag: 'listens', text: '$accelStatusStore · $accelStepStore — the live step prompt (“Place vehicle LEVEL”) and progress.' },
                            { tag: 'listens', text: '$magStatusStore — IN_PROGRESS → SUCCESS / FAILED, straight from the autopilot’s reports.' },
                          ],
                        },
                      },
                      {
                        id: 'radio-tab',
                        label: 'RadioCalibration.svelte',
                        feature: ['radio'],
                        detail: {
                          summary: 'Channel bars move as the pilot sweeps the transmitter, monitors the sticks and configures the min/max values.',
                          points: [
                            { tag: 'sends', text: 'startRadioCalibration() · finishRadioCalibration(snapshot) — open and close the capture window.' },
                            { tag: 'listens', text: '$rollCurrent … $throttleMax — current, min, and max for roll / pitch / throttle / yaw.' },
                            { tag: 'listens', text: '$radio5 – $radio14 — the auxiliary channels, live.' },
                          ],
                        },
                      },
                      {
                        id: 'modes-tab',
                        label: 'FlightModes.svelte',
                        feature: ['modes'],
                        detail: {
                          summary: 'Sets up the six switches on the transmitter to custom set flight modes.',
                          points: [
                            { tag: 'sends', text: 'saveFlightModes(list) — POSTs exactly six { slot, mode } entries.' },
                            { tag: 'role', text: 'A one-shot parameter write — no live polling needed, unlike the calibration tabs.' },
                          ],
                        },
                      },
                      {
                        id: 'servo-tab',
                        label: 'ServoOutput.svelte',
                        feature: ['servo'],
                        detail: {
                          summary: 'A per-channel servo table to set up the function, min / trim / max PWM, and reverse state of each output.',
                          points: [
                            { tag: 'sends', text: 'saveServoOutputs(channels) — one { channel, function, reversed, min, trim, max } row per servo.' },
                            { tag: 'role', text: 'Explicit Save keeps half-finished edits off the aircraft.' },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    label: 'Wiring',
                    nodes: [
                      {
                        id: 'store',
                        label: 'DpkStore.js',
                        feature: ['all'],
                        detail: {
                          summary: 'Svelte writables are the single source of truth every tab subscribes to.',
                          points: [
                            { tag: 'state', text: 'Accel: step · status · in-progress.' },
                            { tag: 'state', text: 'Compass: calibration status · vehicle yaw.' },
                            { tag: 'state', text: 'Radio: current / min / max / reverse for the four primaries, plus aux channels 5–14.' },
                          ],
                        },
                      },
                      {
                        id: 'actions',
                        label: 'DpkActions.js',
                        feature: ['all'],
                        detail: {
                          summary: 'A thin action layer between components and the network.',
                          points: [
                            { tag: 'role', text: 'startAccel, saveFlightModes, finishRadioCalibration… — components trigger intents; they never call fetch directly.' },
                          ],
                        },
                      },
                      {
                        id: 'send',
                        label: 'SendAPI.js',
                        feature: ['all'],
                        detail: {
                          summary: 'The write path: fetch() POSTs to the five Flask routes.',
                          points: [
                            { tag: 'sends', text: 'POST /accelcal_start · /magcal_large · /radiocal_start · /flight_modes · /servo_output, JSON bodies shaped per feature.' },
                            { tag: 'role', text: 'Raises a success or failure toast on every call — the operator always gets an answer.' },
                          ],
                        },
                      },
                      {
                        id: 'receive',
                        label: 'ReceiveAPI.js',
                        feature: ['all'],
                        detail: {
                          summary: 'The read path: three status pollers keep the stores fresh.',
                          points: [
                            { tag: 'listens', text: 'GET /accelcal_status · /magcal_status · /radiocal_status — then .set()s the matching stores.' },
                            { tag: 'role', text: 'startReceive(500) — one interval drives Preflight status alongside telemetry, heartbeat, and mode polling.' },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'flask',
                name: 'Flask REST API',
                file: 'mavproxy_cuairapi/views',
                note: 'one blueprint per feature to validate requests, delegate business logic, and return JSON responses',
                tone: '#55855a',
                rows: [
                  {
                    label: 'Views',
                    nodes: [
                      {
                        id: 'accel-view',
                        label: 'accelerometer.py',
                        feature: ['accel'],
                        detail: {
                          summary: 'The guided accelerometer flow, as three routes.',
                          points: [
                            { tag: 'routes', text: 'POST /accelcal_start · POST /accelcal_next · GET /accelcal_status.' },
                            { tag: 'role', text: 'Delegates to start_accel_calibration() and send_accel_next(); status returns { status, step, in_progress }.' },
                          ],
                        },
                      },
                      {
                        id: 'mag-view',
                        label: 'magcal.py',
                        feature: ['mag'],
                        detail: {
                          summary: 'Large-vehicle compass calibration from a known heading.',
                          points: [
                            { tag: 'routes', text: 'POST /magcal_large · GET /magcal_status → { status, detail }.' },
                            { tag: 'guards', text: 'Rejects requests with no yaw value before anything reaches the plane.' },
                          ],
                        },
                      },
                      {
                        id: 'radio-view',
                        label: 'radio.py',
                        feature: ['radio'],
                        detail: {
                          summary: 'Start, finish, and observe radio calibration.',
                          points: [
                            { tag: 'routes', text: 'POST /radiocal_start · POST /radiocal_finish · GET /radiocal_status.' },
                            { tag: 'role', text: 'Finish accepts the UI’s snapshot and returns the saved channel ranges.' },
                          ],
                        },
                      },
                      {
                        id: 'modes-view',
                        label: 'flightmodes.py',
                        feature: ['modes'],
                        detail: {
                          summary: 'Flight-mode assignment as a single validated write.',
                          points: [
                            { tag: 'routes', text: 'POST /flight_modes.' },
                            { tag: 'guards', text: 'Exactly six entries, each with a mode name — anything else is a 400, not a radio packet.' },
                          ],
                        },
                      },
                      {
                        id: 'servo-view',
                        label: 'servooutputs.py',
                        feature: ['servo'],
                        detail: {
                          summary: 'Servo configuration, checked against ArduPilot’s own vocabulary.',
                          points: [
                            { tag: 'routes', text: 'POST /servo_output.' },
                            { tag: 'guards', text: 'Owns SERVO_FUNCTION_MAP (name → ArduPilot int) and enforces 500 ≤ min ≤ trim ≤ max ≤ 2200 per channel.' },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'dpk',
                name: 'MAVProxy module',
                file: 'dpk.py',
                note: 'a singleton state machine acts as the only layer that speaks MAVLink',
                tone: '#b05438',
                rows: [
                  {
                    label: 'Sends',
                    nodes: [
                      {
                        id: 'accel-fn',
                        label: 'start_accel_calibration()',
                        feature: ['accel'],
                        detail: {
                          summary: 'Drives the six-position accelerometer sequence.',
                          points: [
                            { tag: 'sends', text: 'MAV_CMD_PREFLIGHT_CALIBRATION — kicks off the calibration onboard.' },
                            { tag: 'sends', text: 'MAV_CMD_ACCELCAL_VEHICLE_POS — send_accel_next() confirms each position as the operator places the plane.' },
                            { tag: 'state', text: 'Advances the step optimistically; the autopilot’s STATUSTEXT corrects it if they ever disagree.' },
                          ],
                        },
                      },
                      {
                        id: 'mag-fn',
                        label: 'largeVehicleMagCal(yaw)',
                        feature: ['mag'],
                        detail: {
                          summary: 'Compass calibration for a plane too large to spin in your hands.',
                          points: [
                            { tag: 'sends', text: 'MAV_CMD_FIXED_MAG_CAL_YAW — calibrates from the measured heading instead of rotations.' },
                            { tag: 'sends', text: 'MAV_CMD_DO_ACCEPT_MAG_CAL — auto-accepts a successful result the autopilot didn’t autosave.' },
                          ],
                        },
                      },
                      {
                        id: 'radio-fn',
                        label: 'start_radio_calibration()',
                        feature: ['radio'],
                        detail: {
                          summary: 'Opens the capture window and tracks stick extremes.',
                          points: [
                            { tag: 'sends', text: 'MAV_CMD_PREFLIGHT_CALIBRATION (param4 = 1) — puts the autopilot in radio-cal mode.' },
                            { tag: 'state', text: 'Tracks running min / max per channel from live RC_CHANNELS while the pilot sweeps; finish snapshots the ranges.' },
                          ],
                        },
                      },
                      {
                        id: 'modes-fn',
                        label: 'set_flight_modes()',
                        feature: ['modes'],
                        detail: {
                          summary: 'Writes the six mode slots as autopilot parameters.',
                          points: [
                            { tag: 'sends', text: 'PARAM_SET FLTMODE1–6 — one parameter write per slot.' },
                            { tag: 'guards', text: 'Resolves names against the autopilot’s own mode mapping — unknown modes never leave the ground.' },
                          ],
                        },
                      },
                      {
                        id: 'servo-fn',
                        label: 'set_servo_outputs()',
                        feature: ['servo'],
                        detail: {
                          summary: 'Writes each channel’s full servo configuration.',
                          points: [
                            { tag: 'sends', text: 'PARAM_SET SERVOn_FUNCTION · _MIN · _TRIM · _MAX · _REVERSED — five parameters per channel.' },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    label: 'Listens',
                    nodes: [
                      {
                        id: 'packet-fn',
                        label: 'mavlink_packet(m)',
                        feature: ['all'],
                        detail: {
                          summary: 'Called for every inbound MAVLink message — the ear of the whole system.',
                          points: [
                            { tag: 'listens', text: 'MAG_CAL_PROGRESS / MAG_CAL_REPORT — compass percent-complete, fitness, pass / fail.' },
                            { tag: 'listens', text: 'COMMAND_ACK — accepted / denied verdicts for the mag and radio commands.' },
                            { tag: 'listens', text: 'RC_CHANNELS — live stick positions; min / max tracking while radio cal runs.' },
                            { tag: 'listens', text: 'STATUSTEXT — “Place vehicle LEVEL”… step prompts and calibration success / failure text.' },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'plane',
                name: 'Autopilot',
                file: 'ArduPilot',
                note: 'runs the calibration onboard and streams progress back over the radio',
                tone: '#c99a3d',
                terminal: true,
              },
            ],
            channels: [
              {
                via: 'fetch() over HTTP · localhost:8001',
                down: 'POST — start · next · save',
                up: 'GET *_status — every 500 ms',
              },
              {
                via: 'get_dpk_mod() · in-process singleton',
                down: 'direct method calls',
                up: 'status dicts, read on demand',
              },
              {
                via: 'pymavlink · MAVLink over the radio link',
                down: 'COMMAND_LONG · PARAM_SET',
                up: 'ACKs · progress · RC_CHANNELS · STATUSTEXT',
              },
            ],
          },
        },
        {
          heading: 'Results: The finished window',
          body: [
            'The shipped setup window, tab by tab — guidance, radio, servos, and flight modes, all inside our GCS.',
          ],
          gallery: [
            {
              src: dpkGuideImg,
              caption: 'Guide tab — plain-language instructions for every workflow, built into the window.',
            },
            {
              src: dpkRadioImg,
              caption: 'Radio tab — live stick positions, with min / max captured as the pilot sweeps.',
            },
            {
              src: dpkServosImg,
              caption: 'Servos tab — per-channel function, PWM range, and reverse.',
            },
            {
              src: dpkFlightModesImg,
              caption: 'Flight Modes tab — six FLTMODE slots, written to the autopilot on Save.',
            },
          ],
        },
        {
          heading: 'Engineering decisions',
          body: [
            'Three choices shaped the build more than any feature.',
          ],
          facts: [
            {
              title: 'A state machine, not a wrapper',
              text: 'dpk.py doesn’t fire commands and hope. It holds each calibration as explicit state, updated only by what the autopilot reports back so the UI only reflects what the plane said.',
            },
            {
              title: 'Polling over push',
              text: 'One 500 ms GET loop rides the existing telemetry poller instead of introducing websockets. It’s trivially debuggable at a windy flight line, and a dropped response just means the next tick catches up.',
            },
            {
              title: 'Validate on the ground',
              text: 'The Flask layer rejects bad input before it becomes a radio packet: exactly six flight modes, servo functions checked against a canonical map, PWM ranges pinned with min ≤ trim ≤ max.',
            },
          ],
        },
        {
          heading: 'Challenges: Three learning curves',
          body: [
            'Preflight was my first full project inside such a large team-scale codebase, and nearly every layer of it was new to me. There was plenty of new skills I learned along the way, both new technical tools and strong engineering practices.',
          ],
          subs: [
            {
              title: 'A codebase with history',
              text: 'The GCS is the accumulated work of many generations of CUAIR members. I spent the first month just reading and trying to understand the project structure before writing a line.',
            },
            {
              title: 'Learning unfamiliar tools',
              text: 'I hadn’t touched Svelte or MAVLink before so the beginning was definitely a steep learning curve. I picked up Svelte’s reactive stores by tracing the GCS’s existing tabs, and MAVLink by extensively reading MAVLink and ArduPilot docs.',
            },
            {
              title: 'Figuring out the polling loop',
              text: 'Calibration is a conversation, you send commands out but also need to listen for status updates and flight controller values too. Understanding that packet flow well enough to design the polling loop and state machine took the longest.',
            },
          ],
        },
        {
          heading: 'Impact: Time and Accessibility',
          body: [
            'Preflight shipped for the 2025 - 2026 season and changed who can run a flight line, not just how fast. Setup used to require a autopilot member and windows laptop with Mission Planner at every test flight. Now, any team member, even newer and non-autopilot members, can lead it from their own laptop.',
          ],
          facts: [
            {
              title: '10–15 minutes → under 3',
              text: 'Full pre-flight hardware setup now happens inside our GCS — comfortably inside the competition’s 45-minute mission window, with no tool-switching.',
            },
            {
              title: 'Two semesters → three months',
              text: 'New members used to shadow for most of a year before running setup alone. With the guided flows, they now lead ground tests solo within a semester.',
            },
            {
              title: 'One ground station, any laptop',
              text: 'Our GCS runs on macOS and Windows alike, so Mission Planner is no longer required equipment, coming out only for rare edge cases.',
            },
          ],
        },
      ],
    },
  },
  {
    index: '04',
    name: 'Little Wonder',
    slug: 'little-wonder',
    category: 'Game Design',
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
      links: [{ label: 'Play', href: 'https://gdiac.cs.cornell.edu/gdiac/showcase/games/little_wonder/' }],
      meta: [
        { label: 'Category', value: 'Game Design & Development' },
        { label: 'My role', value: 'Design Lead & Game Programmer' },
        { label: 'Timeline', value: 'Spring 2026' },
        { label: 'Skills', value: 'Java, libGDX, Box2D, game feel, environment art, colour design' },
        { label: 'Team', value: 'Christian Amadeo, Caden Lau, Afram Ahmed, Paul Lukewesa, David Colle, Samantha Ahn, Thomas Myers' },
      ],
      // shared top section — same for both toggle views
      sections: [
        {
          heading: 'Concept: Small hero, big forest',
          body: [
            'The world is scaled to an acorn: blades of grass are platforms, puddles are lakes, and a garden fence is the final ascent. That one framing decision drove the art direction, the level metaphors, and the movement tuning.',
          ],
        },
      ],
      // I split my time between the programming and the art/design side
      // of this project, so the case study lets a reader toggle between
      // the two breakdowns. Everything above and below this stays fixed.
      toggle: {
        options: [
          { id: 'code', label: 'Code' },
          { id: 'design', label: 'Design' },
        ],
        sections: {
          code: [
            {
              heading: 'Prototyping: Movement first, then one enemy',
              body: [
                'Little Wonder runs on Java and libGDX with Box2D physics, built on top of a Cornell teaching framework that supplied a physics-obstacle wrapper and a JSON-driven asset pipeline — the team\'s job was everything above that: 87 files and roughly 35,000 lines built out over three months and 1,269 commits across parallel feature branches.',
                'Before any levels existed, we proved out the core loop on one test map: basic movement against one basic enemy. I owned the player\'s dash and attack systems and its ammo/health state from that first prototype through to ship, plus enemy AI and getting our art assets working in-engine.',
              ],
              facts: [
                {
                  title: 'Dash vs. attack',
                  text: 'Dash was straightforward. Attack design took far longer — we were still choosing between melee, charged, and tracking styles before settling on three to prototype: a direct projectile, a charged beam, and an area-of-effect burst.',
                },
                {
                  title: 'Enemy AI v0',
                  text: '"Move toward the player whenever they\'re in range" — the whole behavior, for exactly as long as it took to start playtesting.',
                },
              ],
            },
            {
              heading: 'Playtesting rewrote the attack kit',
              body: [
                'Almost every attack changed shape between prototype and ship — the direct projectile was the only one that survived untouched. Getting combat to feel right meant treating it as a platforming-balance problem as much as a combat one.',
                'Enemies needed rework too: because the game is built around downward traversal, a plain "follow the player" behavior sent whole packs of enemies falling off platforms and piling up below. I rooted enemies to their spawn platforms and added the AI rules to keep formations intact, and gave the dash invincibility frames so it read as a real evasive tool instead of just a repositioning one.',
              ],
              facts: [
                {
                  title: 'Aim, three times over',
                  text: 'Autoaim → facing-direction (Hollow Knight–style) → full mouse aim, each pass trading platforming complexity against combat complexity until it balanced.',
                },
                {
                  title: 'Charged beam → shotgun',
                  text: 'The beam was too punishing in fast, platforming-heavy sections, so it became a shotgun-style spread instead.',
                },
                {
                  title: 'AoE → bouncing burst',
                  text: 'A damage-over-time pulse felt unsatisfying and slowed pacing; an instantaneous burst that bounces off walls made aiming it a skill instead of a wait.',
                },
              ],
            },
            {
              heading: 'Architecture: How the game fits together',
              body: [
                'Above the Cornell teaching framework that supplies the physics wrapper and asset pipeline, the game itself is a web of controllers, entities, and plain JSON data. My own work lived mainly in the AI and Combat corners of this, but the diagram below is the full picture — click a box for what it does and what it depends on.',
              ],
              // renders the interactive dependency map (ArchMap.jsx): boxes
              // grouped into zones, arrows for who-calls-who, "depends on /
              // used by" in the side card derived straight from edges
              archMap: {
                title: 'Class & data dependency map',
                hint: 'Click a box to see what it does and what it connects to.',
                zones: [
                  {
                    id: 'controller',
                    name: 'Controller',
                    tone: '#3e6b9e',
                    note: 'Screens, orchestration, physics, and the AI/combat controllers that drive the model each frame.',
                    colStart: 1,
                    colEnd: 8,
                    rowStart: 1,
                    rowEnd: 4,
                  },
                  {
                    id: 'model',
                    name: 'Model',
                    tone: '#55855a',
                    note: 'Every physical object in the game — all sharing the same ObstacleSprite pattern.',
                    colStart: 1,
                    colEnd: 6,
                    rowStart: 5,
                    rowEnd: 5,
                  },
                  {
                    id: 'content',
                    name: 'Content',
                    tone: '#3e9e8f',
                    note: 'Levels and assets as plain JSON — no code, no knowledge of game objects.',
                    colStart: 1,
                    colEnd: 4,
                    rowStart: 6,
                    rowEnd: 7,
                  },
                  {
                    id: 'presentation',
                    name: 'Presentation',
                    tone: '#6b4fa0',
                    note: 'What the player sees and hears — HUD and audio.',
                    colStart: 6,
                    colEnd: 8,
                    rowStart: 6,
                    rowEnd: 7,
                  },
                ],
                nodes: [
                  // ---- Model ----
                  {
                    id: 'player',
                    zone: 'model',
                    label: 'Player',
                    col: 2,
                    row: 5,
                    detail: {
                      summary: 'The largest entity (~2,900 lines): a full animation-state machine, movement physics, dual invincibility timers, and a pluggable loadout.',
                    },
                  },
                  {
                    id: 'enemy',
                    zone: 'model',
                    label: 'Enemy',
                    col: 3,
                    row: 5,
                    detail: {
                      summary: 'One class for every archetype — Patrol, Hopper, Flying, Armored — since its behavior comes entirely from the strategies its EnemyController is built with.',
                    },
                  },
                  {
                    id: 'worldObjects',
                    zone: 'model',
                    label: 'World objects',
                    col: 4,
                    row: 5,
                    count: 5,
                    detail: {
                      summary: 'Every other physical object in a level, sharing the same ObstacleSprite pattern as Player and Enemy.',
                      points: [
                        { text: 'Surface' },
                        { text: 'Door' },
                        { text: 'Boat' },
                        { text: 'Pickups' },
                        { text: 'Hazards (stalactites, thermals)' },
                      ],
                    },
                  },
                  {
                    id: 'attackEntities',
                    zone: 'model',
                    label: 'Attack entities',
                    col: 5,
                    row: 5,
                    count: 4,
                    detail: {
                      summary: 'The projectiles and effects themselves — spawned, ticked, and culled by their owning controller, not by Player or Enemy directly.',
                      points: [
                        { text: 'Bullet' },
                        { text: 'Pellet' },
                        { text: 'Beam' },
                        { text: 'AoE' },
                      ],
                    },
                  },
                  // ---- Controller ----
                  {
                    id: 'gameScene',
                    zone: 'controller',
                    label: 'GameScene',
                    col: 4,
                    row: 1,
                    detail: {
                      summary: 'Runs a fixed 1/60s timestep accumulator so physics stays consistent regardless of render rate — the loop that calls everything else below it, once per tick.',
                    },
                  },
                  {
                    id: 'inputController',
                    zone: 'controller',
                    label: 'InputController',
                    col: 7,
                    row: 1,
                    detail: {
                      summary: 'Polling-based, not event-driven: latches edge-triggered presses once per render frame, then resolves final movement/aim once per fixed physics tick.',
                    },
                  },
                  {
                    id: 'gameplayController',
                    zone: 'controller',
                    label: 'GameplayController',
                    col: 4,
                    row: 2,
                    detail: {
                      summary: 'The composition root — owns every entity list, turns JSON level data into live objects, and orchestrates the whole per-frame update in order.',
                    },
                  },
                  {
                    id: 'collisionController',
                    zone: 'controller',
                    label: 'CollisionController',
                    col: 2,
                    row: 2,
                    detail: {
                      summary: 'Owns the Box2D World and the only contact listener in the game; resolves a raw physics fixture back into a typed entity, so gameplay code never touches Box2D directly.',
                    },
                  },
                  {
                    id: 'playerController',
                    zone: 'controller',
                    label: 'PlayerController',
                    col: 3,
                    row: 3,
                    detail: {
                      summary: 'A thin translation layer: reads InputController state and calls setters on Player. It never applies a force itself.',
                    },
                  },
                  {
                    id: 'enemyController',
                    zone: 'controller',
                    label: 'EnemyController',
                    col: 5,
                    row: 3,
                    detail: {
                      summary: 'Composes three swappable strategies per enemy — movement, targeting, attack — read straight from level JSON, and drives its finite-state machine.',
                    },
                  },
                  {
                    id: 'attackControllers',
                    zone: 'controller',
                    label: 'Attack controllers',
                    col: 6,
                    row: 3,
                    count: 4,
                    detail: {
                      summary: 'One controller per attack type, each spawning, ticking, and culling its own list of active instances.',
                      points: [
                        { text: 'ProjectileController' },
                        { text: 'ShotgunController' },
                        { text: 'BeamController' },
                        { text: 'AoEController' },
                      ],
                    },
                  },
                  {
                    id: 'aiStrategies',
                    zone: 'controller',
                    label: 'ai/* strategies',
                    col: 5,
                    row: 4,
                    count: 4,
                    detail: {
                      summary: 'The actual behaviors an EnemyController can be built from — a new enemy archetype is a new combination of these, not a new class.',
                      points: [
                        { text: 'Patrol' },
                        { text: 'Hopper' },
                        { text: 'Flying' },
                        { text: 'Armored' },
                      ],
                    },
                  },
                  // ---- Content ----
                  {
                    id: 'levelDataIO',
                    zone: 'content',
                    label: 'LevelDataIO',
                    col: 1,
                    row: 6,
                    detail: {
                      summary: 'Loads, saves, and lists levels purely as JSON trees — it has no idea what a Player or Enemy even is.',
                    },
                  },
                  {
                    id: 'levelJSON',
                    zone: 'content',
                    label: 'Level JSON',
                    col: 1,
                    row: 7,
                    detail: {
                      summary: 'Flat, per-category arrays — surfaces, enemies, charges, doors, and more — each entry pure data with no code behind it.',
                    },
                  },
                  {
                    id: 'assetLookup',
                    zone: 'content',
                    label: 'AssetLookup',
                    col: 3,
                    row: 6,
                    detail: {
                      summary: 'A three-tier manifest lookup: per-level asset overlays fall back to the shared core set by key.',
                    },
                  },
                  {
                    id: 'assetManifests',
                    zone: 'content',
                    label: 'Asset manifest JSON',
                    col: 3,
                    row: 7,
                    detail: {
                      summary: 'The manifest files themselves — a master texture list, plus per-level overlay bundles.',
                    },
                  },
                  // ---- Presentation ----
                  {
                    id: 'hud',
                    zone: 'presentation',
                    label: 'HUD',
                    col: 7,
                    row: 6,
                    detail: {
                      summary: 'Four parallel scene2d Stages — main HUD, partial-fade, pause, full fade — laid out almost entirely from one shared JSON block instead of hardcoded values.',
                    },
                  },
                  {
                    id: 'audioManager',
                    zone: 'presentation',
                    label: 'AudioManager',
                    col: 7,
                    row: 7,
                    detail: {
                      summary: 'A small SFX dictionary with a single-slot interrupt, so overlapping sounds get replaced instead of stacking.',
                    },
                  },
                ],
                edges: [
                  { from: 'gameScene', to: 'gameplayController' },
                  { from: 'gameScene', to: 'collisionController' },
                  { from: 'gameScene', to: 'inputController' },
                  { from: 'gameScene', to: 'hud' },
                  { from: 'gameplayController', to: 'playerController' },
                  { from: 'gameplayController', to: 'enemyController' },
                  { from: 'gameplayController', to: 'attackControllers' },
                  { from: 'gameplayController', to: 'worldObjects' },
                  { from: 'gameplayController', to: 'levelDataIO' },
                  { from: 'gameplayController', to: 'assetLookup' },
                  { from: 'gameplayController', to: 'audioManager' },
                  { from: 'inputController', to: 'playerController' },
                  { from: 'playerController', to: 'player' },
                  { from: 'enemyController', to: 'enemy' },
                  { from: 'enemyController', to: 'aiStrategies' },
                  { from: 'aiStrategies', to: 'collisionController' },
                  { from: 'attackControllers', to: 'attackEntities' },
                  { from: 'collisionController', to: 'enemy' },
                  { from: 'collisionController', to: 'attackEntities' },
                  { from: 'levelDataIO', to: 'levelJSON' },
                  { from: 'assetLookup', to: 'assetManifests' },
                ],
              },
            },
            {
              heading: 'What I built: attacks & enemy AI',
              body: [
                'Two systems in the shipped game were entirely mine, and both had to hold up under maps far larger and busier than a typical class project.',
              ],
              facts: [
                {
                  title: 'Data-driven enemy archetypes',
                  text: 'Each enemy is an EnemyController composed from three swappable strategies — movement, targeting, attack — read from level JSON. A new archetype is a new combination of existing strategies, not a new class.',
                },
                {
                  title: 'AoE with real occlusion',
                  text: 'The area attack casts 48 rays outward at the moment it explodes, builds a boundary polygon that respects walls, and only damages enemies whose position tests inside it — an actual geometry problem, not a flat-radius hitbox.',
                },
                {
                  title: 'Designer-tunable damage',
                  text: 'Every hit resolves through one takeDamage(type, amount) contract, with each enemy\'s resistances and weaknesses stored as a JSON-loaded map — balance changes without touching code.',
                },
              ],
            },
            {
              heading: 'Solving the scale problem',
              body: [
                'The single biggest technical challenge was scale: a large map with dozens of enemies, each capable of firing volleys of projectiles, was enough to push us into stack overflows during heavy fights. Fixing it meant treating performance as part of the AI and attack systems, not a separate pass at the end.',
              ],
              facts: [
                {
                  title: 'Distance-gated AI',
                  text: 'Enemies only run their AI at all within an activation radius of the player, with a hysteresis band between the on/off thresholds so ones near the boundary don\'t flicker in and out.',
                },
                {
                  title: 'Cheaper cleanup',
                  text: 'Dead projectiles and enemies are cleared with a stop-and-copy pass — copying survivors into a fresh array — instead of deleting in place, trading O(n) for what would have been O(n²) under heavy fire.',
                },
              ],
            },
          ],
          design: [
            /* Order matters here and was wrong once: planning, then
               concept art, then the two sections of finished assets.
               Both early sections run body -> images -> limitations via
               `imagesFirst`, so the shortfalls arrive after the reader
               has seen the work they refer to. */
            {
              heading: 'Setting the direction',
              imagesFirst: true,
              body: [
                'I was design lead and owned everything behind the player — background art, environment assets, and the tileset.',
                'We started on a reference board rather than in a drawing, pulling in anything that felt right until a direction showed up: plants and fungi, acorns and mushrooms, a world scaled down to the floor of a forest. The course required twelve unique levels; an open map suited the game better, so we split it into four layers of three dungeons, each layer with a look of its own.',
                'The first real art was a landscape painting, and it was not there to be used. It was there to pin down the general style and to standardise the lineart and colouring across three people who draw differently — as far as that could be standardised. Ground and props followed the same way: draw a strip of grass six ways, see which one the game wants.',
              ],
              media: {
                src: lwBoard,
                fit: true,
                caption: 'Reference board — what we pulled from before any of the art existed.',
              },
              gallery: [
                {
                  src: lwSketch,
                  fit: true,
                  caption: 'Landscape attempt 1, with the notes that redirected it: more cavern, less vegetation, add fungal elements.',
                },
                {
                  src: lwGrass,
                  fit: true,
                  caption: 'Ground and prop passes — grass strips, checkpoint acorns, hazards.',
                },
              ],
              facts: [
                {
                  title: 'It came out above ground',
                  text: 'The first landscape read as forest, not cave. The notes on it are my own: go underground, cut the vegetation back, let fungus take over.',
                },
                {
                  title: 'Style only half-standardised',
                  text: 'I paint; both character designers work in cartoon lineart. We agreed on lineart weight and a colouring approach, and it still only got us part of the way.',
                },
                {
                  title: 'Variations, not a system',
                  text: 'Six versions of a grass strip is six drawings. Nothing here could be recombined yet — that problem is the whole rest of this page.',
                },
              ],
            },
            {
              heading: 'Concept art and the environment kit',
              imagesFirst: true,
              body: [
                'With the direction fixed, the next pass was the actual vocabulary of the world: what a rock looks like, what a tree trunk looks like, how a mushroom is drawn so it reads as ours. I built it out as labelled sheets — plants, grasses, pebbles, rocks, trunks — plus a full-colour painting of the overworld village to prove the palette worked at scale.',
              ],
              gallery: [
                {
                  src: lwEnvir,
                  fit: true,
                  caption: 'The environment kit — plants, grasses, pebbles, rocks, trunks, each drawn once.',
                },
                {
                  src: lwConcept,
                  fit: true,
                  caption: 'Concept sheet — mushroom studies, the overworld village, and the first ground and wall attempts.',
                },
              ],
              facts: [
                {
                  title: 'Too detailed',
                  text: 'Concept-level detail is fine for one painting and impossible across sixteen backgrounds and a full tileset.',
                },
                {
                  title: 'Nothing repeated',
                  text: 'Every piece was drawn once and reusable nowhere. Hand-drawn assets do not tile, and every new area meant new art.',
                },
                {
                  title: 'The scale did not work',
                  text: 'Good as a bible for the world, unusable as a production pipeline. Everything after this point is about making the art repeatable.',
                },
              ],
            },
            {
              heading: 'Backgrounds: four paintings, sixteen backgrounds',
              body: [
                'Sixteen hand-painted backgrounds was not a realistic scope. Reusing one background everywhere was worse — the reason to descend another layer is to see something new.',
                'So I painted four compositions instead of sixteen: a wide corridor, two squares, and a tall nexus for each layer’s landing zone. Then I re-graded every set with curves into that layer’s ramp and accessorised with a few zone-specific props. Switch layers below — the composition never moves.',
              ],
              // the ZoneStudy panel (ZoneStudy.jsx): four layouts held
              // fixed while the grade changes under them, which is the
              // argument this section is making
              zones: {
                label: 'The four layers',
                panels: [
                  { id: 'banner', label: 'Wide — corridor' },
                  { id: 'cave', label: 'Square — cavern' },
                  { id: 'grove', label: 'Square — grove' },
                  { id: 'nexus', label: 'Tall — nexus' },
                ],
                items: [
                  // ramps sampled off the finished paintings rather than
                  // the strips locked at the start — the art moved after
                  // those were set, and the swatches should match what
                  // is actually on screen beside them.
                  // `wipe` is the field the panel dips through while
                  // the grade changes (ZoneStudy.jsx): the layer's hue
                  // held at low chroma, so the handover reads as the
                  // layer arriving rather than as a blackout.
                  {
                    id: 'overgrown',
                    name: 'Overgrown',
                    tone: '#399450',
                    wipe: '#5F7048',
                    note: 'The first layer down, and the only one still lit like the surface — warm green light coming through a lot of rock.',
                    palette: ['#0F3728', '#1A5E45', '#2A765A', '#399450', '#68BA7A', '#9ED190'],
                    art: { banner: lwOgBanner, cave: lwOgCave, grove: lwOgGrove, nexus: lwOgNexus },
                  },
                  {
                    id: 'intermittent',
                    name: 'Intermittent',
                    tone: '#297072',
                    wipe: '#3F6F6B',
                    note: 'Where the green starts draining out. The same compositions cooled into teal — the first hint that you are heading somewhere colder.',
                    palette: ['#06131C', '#1C325B', '#297072', '#54A18F', '#73D0BD', '#8AFEF7'],
                    art: { banner: lwInBanner, cave: lwInCave, grove: lwInGrove, nexus: lwInNexus },
                  },
                  {
                    id: 'crystal',
                    name: 'Crystal Cove',
                    tone: '#9E4FBC',
                    wipe: '#6A5580',
                    note: 'The furthest the grade moves from the source paintings — a full rotation into violet, with the mid-tones lifted so the rock glows.',
                    palette: ['#1E0C25', '#422267', '#9E4FBC', '#7DA9DD', '#48539A', '#1F224E'],
                    art: { banner: lwCrBanner, cave: lwCrCave, grove: lwCrGrove, nexus: lwCrNexus },
                  },
                  {
                    id: 'biolum',
                    name: 'Bioluminescent',
                    tone: '#459BC4',
                    wipe: '#2F4C6B',
                    note: 'Deepest and darkest. Almost no warm value left in the ramp, so the mushrooms and pools carry all the light.',
                    palette: ['#06111F', '#102238', '#28497A', '#375D98', '#459BC4', '#5AB9D6'],
                    art: { banner: lwBiBanner, cave: lwBiCave, grove: lwBiGrove, nexus: lwBiNexus },
                  },
                ],
              },
            },
            {
              heading: 'Tilesets: one rock, one grass stamp',
              body: [
                'Tilesets were unfamiliar territory and took more iterations than anything else I made. The first was too detailed and turned to noise the moment it repeated. The second was clean but read as cartoon against painterly backgrounds. The third finally matched them — and then disappeared into them.',
                'The fix was the background trick applied to ground.',
              ],
              facts: [
                {
                  title: 'One base block',
                  text: 'A single neutral rock tile, flat enough in colour to sit under any of the four ramps.',
                },
                {
                  title: 'A grass stamp',
                  text: 'One overlay laid over the base, so ground reads as ground before it reads as a zone.',
                },
                {
                  title: 'Four grades',
                  text: 'The same curve pass as the backgrounds — one tileset, four zones, no redraws.',
                },
              ],
              tiles: {
                caption:
                  'One block and one platform, graded four ways. The rock inside each is the same rock.',
                items: [
                  { label: 'Overgrown', src: lwTileOg },
                  { label: 'Intermittent', src: lwTileIn },
                  { label: 'Crystal Cove', src: lwTileCr },
                  { label: 'Bioluminescent', src: lwTileBi },
                ],
              },
            },
            {
              heading: 'What worked, and what I’d change',
              body: [
                'The variety landed. Entering a new layer felt like arriving somewhere, and the environment art drew the most consistent praise the game got.',
                'The style mismatch I had worried about turned into an asset: painterly backgrounds behind cartoon-lineart tilesets and characters gave real separation between what you play on and what you look at.',
              ],
              /* Three, not four: the shared Challenges block directly
                 below is also a points grid, and a fourth point here
                 ("the game design kept moving, so assets got drawn and
                 dropped") was the art-side restatement of its
                 scrapped-systems point. Three leaves the row
                 deliberately uneven against the 2×2 underneath, so the
                 two blocks read as different thoughts. Everything left
                 is specific to the art. */
              points: [
                {
                  icon: 'platform',
                  text: 'What scaled here scaled because it was built once and graded, never redrawn — sixteen backgrounds and four tilesets out of one small set of paintings.',
                },
                {
                  icon: 'scope',
                  text: 'Environment art was still too large a scope for one person. I delegated character art and animation and kept all of this, and the tilesets took the quality hit.',
                },
                {
                  icon: 'identity',
                  text: 'Set style guidelines earlier. At ship, characters, enemies, and backgrounds still read as three different hands.',
                },
              ],
            },
          ],
        },
      },
      // shared bottom sections — same for both toggle views
      sectionsAfter: [
        {
          heading: 'Challenges & Takeaways',
          body: [
            'This was the largest project any of us had built from scratch — 87 files and 35,000 lines across a single semester — and the biggest lessons were about scope and process as much as any one line of code.',
          ],
          points: [
            {
              icon: 'scope',
              text: 'Scope, scope, scope — we built the most ambitious game in the course, and a one-semester timeline isn’t built for a project this size.',
            },
            {
              icon: 'performance',
              text: 'A big map with dozens of enemies each firing volleys of projectiles meant performance had to be a first-class concern, not something bolted on afterward.',
            },
            {
              icon: 'identity',
              text: 'We designed and scrapped entire systems — passive abilities, attack iterations, whole levels — because we hadn’t locked down the game’s identity before building around it.',
            },
            {
              icon: 'team',
              text: 'Everyone came in with a different art style, and with several people on parallel feature branches, documentation and planning mattered more than any code pattern.',
            },
          ],
        },
        {
          heading: 'Outcome',
          body: [
            'Little Wonder shipped as the largest-scope game in the course and was recognized as the most polished game at the Game Design Showcase. The most repeated piece of playtester feedback was about how good movement felt — dash, jump, and the rest read as tight and responsive, which was exactly the bar we set in that first prototype.',
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
    category: 'ML · Full-Stack',
    year: '2025',
    blurb: 'Restaurant recommendations from food, ambiance, and price queries.',
    tech: ['React', 'Python', 'SVD', 'LLM'],
    image: dishcoveryImg,
    tone: ['var(--tone-d1)', 'var(--tone-d2)'],
    href: '#work',
    page: {
      status: 'Completed',
      // show the whole demo screenshot instead of the 21:9 hero crop
      hero: { fit: true },
      subtitle: 'Restaurant recommendations from plain-language cravings.',
      intro:
        'Dishcovery answers the question review sites can’t: “somewhere quiet with great hand-pulled noodles, under $20.” It parses free-form queries about food, ambiance, and price, and ranks restaurants against thousands of reviews.',
      links: [{ label: 'Demo', href: '#' }, { label: 'GitHub', href: '#' }],
      meta: [
        { label: 'Category', value: 'Machine Learning, Full-Stack' },
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
          media: { src: dishcoveryImg, fit: true, caption: 'Dishcovery results view — query to ranked shortlist.' },
        },
      ],
    },
  },
  {
    index: '06',
    name: 'PokeLeet',
    slug: 'pokeleet',
    category: 'Frontend · Game Design',
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
        { label: 'Category', value: 'Frontend, Game Design' },
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
       { kind: 'carousel', title, direction?: 'horizontal'|'vertical', items: [{ caption, src }] }
         — hover/tap-to-expand strip, view-only (no links)
       { kind: 'image',   src, caption?, align?: 'left'|'right' } — small tilted accent photo
   Gaming and stories have bespoke compositions (GamingBlocks,
   StoriesBlocks) that pick blocks by `id` rather than kind, so they can
   use kinds of their own:
       { kind: 'tags',  lead, items: [tag strings] } — one inline row
       { kind: 'shelf', title, items: [{ name, by, year, src }] } —
         taped jackets in a scrapbook row; author and year are separate
         so they can set as their own line
       { kind: 'stickers', title, items: [{ name, meta, note, src }] } —
         a row of die-cut sticker icons, each one beside its title
       { kind: 'build',  src, alt, caption?, link?: { label, href },
                         parts: [{ label, value, x?, y?, note? }] }
         — x/y are % positions on the photo; a part with neither gets no
           marker (it isn't visible in the shot) and shows `note` instead.
         — link renders at the far end of the section label.
   TODO(sharon): drinks / art below are still sample copy — swap in the
   real ones, and add gallery image imports. */
export const hobbies = [
  {
    icon: 'laptop',
    slug: 'stories',
    title: 'Stories',
    note: 'Books and screens, same appetite.',
    tone: 'var(--tone-c2)',
    page: {
      tagline:
        'No real loyalty to the format, paperback, subtitles, whatever gets it across, I just love a good story.',
      blocks: [
        {
          id: 'read',
          kind: 'shelf',
          title: 'Recently read',
          /* the jackets carry these rows — cover, title, author, year,
             and nothing else under them */
          items: [
            {
              name: 'Babel',
              by: 'R.F. Kuang',
              year: '2022',
              src: coverBabel,
            },
            {
              name: 'Katabasis',
              by: 'R.F. Kuang',
              year: '2025',
              src: coverKatabasis,
            },
            {
              name: 'Circe',
              by: 'Madeline Miller',
              year: '2018',
              src: coverCirce,
            },
            {
              name: 'Divine Rivals',
              by: 'Rebecca Ross',
              year: '2023',
              src: coverDivineRivals,
            },
            {
              name: 'Project Hail Mary',
              by: 'Andy Weir',
              year: '2021',
              src: coverHailMary,
            },
            {
              name: 'The Thursday Murder Club',
              by: 'Richard Osman',
              year: '2020',
              src: coverThursday,
            },
          ],
        },
        {
          id: 'watched',
          kind: 'stickers',
          title: 'Recently watched',
          items: [
            {
              name: 'The Odyssey',
              meta: 'film',
              src: stickerOdyssey,
              note: 'Watched with 4DX seats and it felt like I was on the ship with them.',
            },
            {
              name: 'Spy × Family',
              meta: 'anime',
              src: stickerSpyFamily,
              note: 'My favorite slice-of-life show, so attatched to every character.',
            },
            {
              name: 'Witch Hat Atelier',
              meta: 'anime',
              src: stickerWitchHat,
              note: 'Beautiful art and a captivating plot, so excited for season 2!',
            },
          ],
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
    note: 'Anything that waits while I think.',
    tone: 'var(--navy)',
    page: {
      tagline:
        'I love playing a bit of everything, from short indie games to full-on triple-A titles, but my favorite are always games that make me plan and think',
      blocks: [
        {
          id: 'genres',
          kind: 'tags',
          lead: 'My favorite genres',
          /* plain strings — these render as inline tags, so they have to
             stay short enough to sit on one line together */
          items: ['Strategy', 'Turn-based RPGs', 'Cozy sims', 'Mystery', 'Puzzle'],
        },
        {
          id: 'faves',
          kind: 'list',
          title: 'Top Favorites of All Time',
          items: [
            {
              name: 'Baldur’s Gate 3',
              meta: '2023 · Turn-Based Tactical RPG',
              note: 'The boundless player freedom and reactive storytelling is truly unparalleled.',
            },
            {
              name: 'Stardew Valley',
              meta: '2016 · farm sim',
              note: 'An endless amount of things to do and explore, this game is my cozy getaway.',
              shot: {
                src: shotStardew,
                alt: 'My Stardew Valley farm, laid out in neat crop blocks with sprinklers and paths between them.',
                caption: 'My current farm!',
              },
            },
            {
              name: 'Fire Emblem: Three Houses',
              meta: '2019 · Tactical RPG',
              note: 'Absolutely love the balance of strategical gameplay and an engaging story with a cast of characters I\'ve grown attached to.',
              shot: {
                src: shotFireEmblem,
                alt: 'The Blue Lions house gathered around their professor in the classroom at Garreg Mach.',
                caption: 'Too attached to the Blue Lions playthrough to try the other houses...',
              },
            },
          ],
        },
        {
          id: 'now',
          kind: 'list',
          title: 'Currently Playing',
          items: [
            {
              name: 'Minecraft — Cobbleverse',
              meta: 'modded',
              note: 'This mod adds Pokémon to Minecraft, combining 2 of my childhood favorites.',
            },
            {
              name: 'Minecraft — Sunlit Valley',
              meta: 'modded',
              note: 'Added new progression and playstyle to Minecraft by combining in Stardew',
            },
            {
              name: 'Unicorn Overlord',
              meta: 'tactics',
              note: 'Another strategy RPG I\'ve been hooked on, but story a bit more generic',
            },
            {
              name: 'Disco Elysium',
              meta: 'RPG',
              note: 'Completely dialogue-based rpg, feels like reading an interactive mystery story.',
            },
          ],
        },
        {
          id: 'shelf',
          kind: 'list',
          title: 'Also great',
          items: [
            { name: 'No Case Left Unsolved', meta: 'mystery deduction' },
            { name: 'Chants of Sennaar', meta: 'linguistics puzzle' },
            { name: 'Outer Wilds', meta: 'metroidbrainia' },
            { name: 'It Takes Two', meta: 'co-op' },
          ],
        },
        {
          id: 'queue',
          kind: 'list',
          title: 'Up next',
          /* a queue is a list of intentions — names are enough, and
             notes here would push the build photo off the screen */
          items: [
            { name: 'Clair Obscur: Expedition 33' },
            { name: 'Blue Prince' },
            { name: 'Return of the Obra Dinn' },
            { name: 'Sovereign Tower' },
            { name: 'Grave Seasons' },
          ],
        },
        {
          id: 'build',
          kind: 'build',
          title: 'The build',
          src: pcBuildImg,
          alt: 'A white Lian Li O11 Dynamic Mini V2 build, lit pink and cyan, with figurines and paper butterflies inside the case.',
          link: { label: 'PCPartPicker', href: 'https://pcpartpicker.com/b/wGjZxr' },
          parts: [
            { label: 'CPU', value: 'Ryzen 7 7700X', x: 41, y: 35 },
            { label: 'Cooler', value: 'Lian Li Hydroshift II LCD 360', x: 52, y: 15 },
            { label: 'Motherboard', value: 'ASUS B650E MAX GAMING WIFI W', x: 16, y: 30 },
            { label: 'Memory', value: 'TEAMGROUP T-Force Delta RGB 16 GB (2×8) DDR5-6000', x: 51, y: 33 },
            { label: 'GPU', value: 'Gigabyte AERO RTX 5060 Ti 16 GB', x: 33, y: 63 },
            { label: 'Fans', value: '3× Lian Li UNI SL-Infinity 120 mm + 1× SL-INF Wireless', x: 55, y: 74 },
            { label: 'Case', value: 'Lian Li O11 Dynamic Mini V2', x: 14, y: 86 },
            { label: 'Storage', value: 'Crucial P310 2 TB NVMe', x: 34, y: 49 },
            { label: 'Power', value: 'Corsair RM750e 750 W' },
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
          kind: 'image',
          src: receiptifyImg,
          caption: 'receipts don’t lie',
        },
        {
          kind: 'carousel',
          title: 'Recently, live',
          // TODO(sharon): confirm captions — guessed from filenames/on-screen
          // signage where I could, but double check "TWICE" and "KIOF".
          items: [
            { caption: 'THE ROSE — Rosetopia', src: concertRoseImg },
            { caption: 'TWICE', src: concertTwiceImg },
            { caption: 'SUNKIS', src: concertSunkisImg },
            { caption: 'Slope Day', src: concertSlopeDayImg },
            { caption: 'KIOF', src: concertKiofImg },
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
  body:
    'I’m open to 2027 internships and collaborations. The fastest way to reach me is email.',
};
