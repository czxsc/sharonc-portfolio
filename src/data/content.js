/* ------------------------------------------------------------------
   Site content. Drawn from Sharon's own reference mockups; treat as
   real and refine specifics later. Placeholder links marked TODO.
   ------------------------------------------------------------------ */
import portfolioProjectImg from '../assets/portfolio_project_img.jpg';
import dishcoveryImg from '../assets/dishcovery_demo.jpg';
import artificerImg from '../assets/artificer_placeholder.jpg';
import cuairGcsImg from '../assets/cuair.png';
import dpkMissionPlannerImg from '../assets/dpk_mission_planner.png';
import dpkAccelImg from '../assets/dpk_accel_cropped.png';
import dpkGuideImg from '../assets/dpk_guide.png';
import dpkRadioImg from '../assets/dpk_radio.png';
import dpkServosImg from '../assets/dpk_servos.png';
import dpkFlightModesImg from '../assets/dpk_flightmodes.png';
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
        'Every CUAIR test flight used to be divided between two different software platforms. Our team flies a custom ground control station, but hardware setup features, such as sensor calibration, radio checks, servo and flight-mode configuration, still lived in Mission Planner. Preflight moved that entire setup layer into our own GCS, where I built the main five workflows end to end, from the Svelte interface down to the MAVLink commands on the wire.',
      links: [{ label: 'CUAIR', href: 'https://cuair.org' }],
      meta: [
        { label: 'Category', value: 'Full-Stack, Autonomous Systems' },
        { label: 'My role', value: 'Autopilot Team\nSoftware engineer' },
        { label: 'Timeline', value: '2025-2026' },
        { label: 'Skills', value: 'Svelte, Python, Flask, MAVProxy, MAVLink' },
      ],
      sections: [
        {
          heading: 'Problem: Two ground stations, one 45-minute clock',
          body: [
            'Mission Planner is the de facto ground station for ArduPilot teams, and it covers everything. So even with our team\'s custom Ground Control Station flying the plane autonomously, hardware setup kept us still tethered to Mission Planner. Every test flight required pre-flight configuration in one tool then migrating to the other. However, when this year’s competition rules changed to include setup into the 45-minute mission window, this workflow became a significant problem that has to change.',
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
          heading: 'Research: Scope by pain, not by feature list',
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
      links: [{ label: 'Play', href: '#' }],
      meta: [
        { label: 'Category', value: 'Game Design & Development' },
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
    category: 'ML · Full-Stack',
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
          media: { src: dishcoveryImg, caption: 'Dishcovery results view — query to ranked shortlist.' },
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
