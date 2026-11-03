/**
 * Site content. Everything marked TODO is demo placeholder text, written only from
 * facts already on the landing page — replace it with the real content.
 */

export type ChapterId = "home" | "about" | "experience" | "projects" | "contact";

/** color: the chapter's pastel; pill: the nav pill colour when the page itself is that pastel */
export const CHAPTERS: { id: ChapterId; number: string; label: string; spine: string; color: string; pill?: string }[] = [
  { id: "home", number: "01", label: "Home", spine: "Home", color: "var(--lotus)" },
  { id: "about", number: "02", label: "About", spine: "About me →", color: "var(--marigold)", pill: "var(--paper)" },
  { id: "experience", number: "03", label: "Experience", spine: "Experience →", color: "var(--lilac)" },
  { id: "projects", number: "04", label: "Projects", spine: "Projects →", color: "var(--pond)" },
  { id: "contact", number: "05", label: "Contact", spine: "Contact →", color: "var(--sage)" },
];

export const chapterIndex = (id: ChapterId) => CHAPTERS.findIndex((chapter) => chapter.id === id);

export const HOME = {
  firstName: "Harnish",
  lastName: "Kapoor",
  role: [["Graphic Designer ", "&"], ["Motion Graphic Designer"]] as const,
  cta: "Explore my work",
  tagline: "Turning ideas into visuals, with curiosity in every detail.",
  status: ["Currently ", "working as"] as const, // the first word is dropped on very small cards
  currentRole: "Graphic Designer",
  currentCompany: "at Accenture",
  experience:
    "Part storyteller, part visual thinker, always curious. I turn ideas into thoughtful designs, playful illustrations and visual experiences that make people look twice.",
  badge: "GRAPHIC DESIGNER · MOTION GRAPHIC DESIGNER ·",
};

// About chapter — the story so far: one stamp per chapter of the story, its letter in the envelope
export type SceneArtId = "school" | "bounce" | "storyboard" | "clapper" | "freelance" | "books" | "motion" | "studios";

export type Scene = {
  id: string;
  number: string;
  /** short line on the stamp */
  kicker: string;
  /** full line at the top of the letter (defaults to the kicker) */
  period?: string;
  title: string;
  /** the story paragraph, in the letter */
  text: string;
  /** the stamp shows the first three */
  tags: { label: string; accent?: boolean }[];
  art: SceneArtId;
  color: string;
  /** position on the board: x, row above or below the story line, tilt */
  x: number;
  row: "top" | "bottom";
  tilt: number;
  did: string[];
  /** grouped under a project name where the story covers several */
  highlights: { title?: string; items: string[] }[];
};

const tagsOf = (labels: string) => labels.split(" · ").map((label) => ({ label }));

const SCENES: Scene[] = [
  {
    id: "sc-01",
    number: "SC 01",
    kicker: "School years",
    title: "It all started with stories.",
    text: "Long before design became a career, it was a little corner of curiosity. Between books, poetry, art and hours spent on Wattpad, I found myself exploring stories, connecting with creative communities and discovering new ways to express ideas.",
    tags: tagsOf("Storytelling · Book Covers · Digital Creativity · Visual Design"),
    art: "school",
    color: "#C3DAEC",
    x: 1260,
    row: "top",
    tilt: -1.4,
    did: [
      "Designed book covers and graphics for authors in online creative communities.",
      "Played around with basic HTML formatting to add a little visual flair to Wattpad threads and comments.",
    ],
    highlights: [
      {
        items: [
          "Turned a love for storytelling into my first hands-on design experiences.",
          "Discovered how writing, photography and art could come together through visual design.",
        ],
      },
    ],
  },
  {
    id: "sc-02",
    number: "SC 02",
    kicker: "The design years",
    title: "One foundation, a world of possibilities.",
    text: "A four-year Bachelor of Design in Communication Design, specialising in Animation, at GLS Institute of Design became my gateway to the world of visual creativity. College introduced me to the many facets of design, showing me how different disciplines connect, overlap and inspire one another.",
    tags: tagsOf("Communication Design · Animation · Visual Storytelling · Illustration · Branding · Motion Graphics"),
    art: "bounce",
    color: "#F5C9C6",
    x: 1590,
    row: "bottom",
    tilt: 1.2,
    did: [
      "Explored branding, typography, illustration, composition and visual communication.",
      "Learned the fundamentals of Design and 2D animation, motion graphics and visual storytelling.",
    ],
    highlights: [
      {
        items: [
          "Built a multidisciplinary design foundation, learning to translate ideas across different visual mediums.",
          "Discovered the joy of experimenting beyond a single discipline and finding my own creative direction.",
        ],
      },
    ],
  },
  {
    id: "sc-03",
    number: "SC 03",
    kicker: "Internships & training",
    title: "Learning the art behind the movement.",
    text: "This was where I began looking beyond the final frame and understanding the craft behind it. Through my internship at Arthaat Studio and six months of training with Vaanarsena Studios, I explored 3D modelling, human anatomy and the principles that bring animation to life.",
    tags: tagsOf("3D Modelling · Autodesk Maya · Human Anatomy · Figure Drawing · Animation Fundamentals · Visual Development"),
    art: "storyboard",
    color: "#DCD3F2",
    x: 1920,
    row: "top",
    tilt: -1,
    did: [
      "Explored 3D product modelling and visual effects using Autodesk Maya at Arthaat Animation.",
      "Studied human anatomy, muscle structure, proportions and the fundamentals of figure drawing at Vaanarsena.",
    ],
    highlights: [
      {
        items: [
          "Developed a deeper understanding of timing, spacing, placement and framing in animation.",
          "Built a stronger foundation in observing form, understanding movement and translating it into visuals.",
        ],
      },
    ],
  },
  {
    id: "sc-04",
    number: "SC 04",
    kicker: "Academic projects",
    title: "Research, imagination and a little storytelling magic.",
    text: "Some stories are imagined, while others are waiting to be discovered. During my academic journey, two projects pushed me to explore storytelling from different perspectives — one rooted in shared human experiences, the other in mythology, symbolism and visual interpretation.",
    tags: tagsOf("Visual Design · 2D Animation · Visual Poetry · Art Direction · Symbolism · Visual Research · Concept Development · Storyboarding"),
    art: "clapper",
    color: "#CFE0C3",
    x: 2250,
    row: "bottom",
    tilt: 1.5,
    did: [
      "Collaborated on a 2D visual film, translating human emotions and shared experiences into poetic imagery.",
      "Developed a research-led visual concept, transforming mythology, symbolism and philosophical ideas into a cohesive visual narrative.",
    ],
    highlights: [
      {
        title: "There Is an Insect Inside of Me · Collaborative 2D Visual Film",
        items: [
          "Created with friends during COVID-19, exploring isolation, uncertainty and the emotional struggles experienced during the pandemic.",
          "Translated collective emotions into visual sequences and poetry, capturing the human experience through an abstract, poetic lens.",
          "Received multiple film festival selections.",
        ],
      },
      {
        title: "Aham Brahmasmi · Independent Research-led Mood Film",
        items: [
          "Undertook extensive research into Hindu mythology, symbolism and philosophical ideas surrounding birth, death, rebirth and reincarnation.",
          "Interpreted these concepts through visual research, symbolic imagery, graphic exploration, composition and storyboarding to establish a distinctive visual language.",
          "Brought the research and visual concepts together in an experimental mood film, capturing an abstract journey through imagery, symbolism and visual storytelling.",
        ],
      },
    ],
  },
  {
    id: "sc-05",
    number: "SC 05",
    kicker: "Freelance · 2021 – 2023",
    period: "The freelance years · 2021–2023",
    title: "Different briefs, different ideas, endless possibilities.",
    text: "After graduation, I stepped into freelancing, where every new client brought a different creative challenge. From building visual identities and illustrating stories to creating animations and designing for brands, I explored the many facets of visual communication. It was a time of experimentation, collaboration and learning to turn ideas into meaningful visual experiences.",
    tags: tagsOf("Graphic Design · Branding · 2D Animation · Visual Storytelling · Illustration · Storyboarding · Animatics · Social Media Design"),
    art: "freelance",
    color: "#C3DAEC",
    x: 2580,
    row: "top",
    tilt: -1.2,
    did: [
      "Worked across branding, graphic design, social media creatives, brochures, illustrations and 2D animation.",
      "Developed storyboards, animatics, animated videos, visual presentations and illustrated narratives for diverse clients.",
    ],
    highlights: [
      {
        title: "Fold Labs · Creative Collaborations",
        items: ["Collaborated on approximately eight projects, spanning 2D educational videos, branding, web and graphic design, brochures, illustrations and storyboarding."],
      },
      {
        title: "Era and Canvas · Visual Storytelling & Branding",
        items: [
          "Created branding, social media creatives, illustrations and promotional posters.",
          "Translated a founder’s personal journey into an illustrated visual narrative.",
          "Designed posters for Ahmedabad Metro, displayed across stations.",
        ],
      },
      {
        title: "MVAC · Design & Illustration",
        items: ["Collaborated over approximately one year, creating monthly social media creatives.", "Designed and illustrated a handbook."],
      },
      {
        title: "Independent Film & Animation Projects",
        items: [
          "Contributed to three independent short films through storyboarding, animatics and 2D animation.",
          "Collaborated on a six-month feature-film project through Upwork, developing storyboards and animatics.",
        ],
      },
    ],
  },
  {
    id: "sc-06",
    number: "SC 06",
    kicker: "Safety Troop · 2023 – 24",
    period: "The professional years – Safety Troop · May 2023 – May 2024",
    title: "Turning ideas into engaging visual experiences.",
    text: "My first professional role was as an Illustrator and Animator at Safety Troop, collaborating with a team of psychologists to bring educational content to life. I translated their research and concepts into illustrations, activities and comics designed to make learning engaging for children.",
    tags: tagsOf("Illustration · Editorial Design · Character Design · Educational Content · Comics · Motion Graphics"),
    art: "books",
    color: "#F5C9C6",
    x: 2910,
    row: "bottom",
    tilt: 1,
    did: [
      "Designed and illustrated complete book layouts, creating characters, comic strips, puzzles and interactive activities for children.",
      "Created social media creatives and short motion graphics for the brand.",
    ],
    highlights: [{ items: ["Contributed to a series of published educational books for Standards 1–10, taking individual pages from concept to finished layouts."] }],
  },
  {
    id: "sc-07",
    number: "SC 07",
    kicker: "PathQuest · 2024 – 25",
    period: "PathQuest · June 2024 – Feb 2025",
    title: "Bringing brands and ideas into motion.",
    text: "At PathQuest, I worked as a Motion Graphics Designer, creating visual content that helped shape the brand’s digital presence. From everyday social media creatives to product demos, I collaborated with content writers and the creative team to brainstorm ideas and bring them to life.",
    tags: tagsOf("Motion Graphics · Social Media Design · Branding · Campaign Ideation · Video Editing · Graphic Design"),
    art: "motion",
    color: "#DCD3F2",
    x: 3240,
    row: "top",
    tilt: -1.3,
    did: [
      "Created social media creatives, motion graphics, product demos and branded videos.",
      "Contributed to branding, logo explorations and campaign ideation alongside the content team.",
    ],
    highlights: [{ items: ["Created regular static graphic posts and animated motion graphic posts for the brand’s social media channels."] }],
  },
  {
    id: "sc-08",
    number: "SC 08",
    kicker: "Accenture · 2025 → now",
    period: "Accenture · March 2025 – present",
    title: "Designing visuals that make ideas click.",
    text: "At Accenture, I work as a Graphic Designer, translating complex information and content into clear, engaging visual experiences. My work spans graphic design, branding, motion graphics, visual communication and digital learning, with a strong focus on maintaining brand consistency across different projects and deliverables.",
    tags: [
      { label: "Now at Accenture", accent: true },
      ...tagsOf("Graphic Design · Branding · Visual Communication · Motion Graphics · E-learning Design · Articulate Storyline · Articulate Rise · PowerPoint · Infographics"),
    ],
    art: "studios",
    color: "#CFE0C3",
    x: 3570,
    row: "bottom",
    tilt: 1,
    did: [
      "Designed PowerPoint pitch decks, infographics, icons and visual assets to communicate ideas effectively while following established brand guidelines.",
      "Created overview videos, system videos and motion graphics, translating information into engaging visual narratives.",
      "Designed and developed e-learning experiences using Articulate Storyline and Rise, creating visual templates, layouts and interactive slide structures for e-learning modules, microlearning, job aids and instructor-led training decks.",
    ],
    highlights: [
      {
        items: [
          "Translated content-heavy information into clear visual narratives across decks, videos and interactive learning experiences.",
          "Applied brand guidelines consistently across project deliverables, ensuring a cohesive visual identity and design language.",
          "Developed visual templates, graphics and layouts to maintain consistency across different learning formats.",
        ],
      },
    ],
  },
];

export const ABOUT = {
  // typed line by line: the first two in bold, the last two in the italic accent
  title: { lead: ["Ideas into", "visuals."], accent: ["Stories into", "experiences."] },
  bio: "I’m Harnish — a graphic designer, illustrator and visual storyteller with 3+ years of experience exploring the many sides of visual communication. From building brand identities and illustrating characters to crafting motion graphics and thoughtful designs, I enjoy turning ideas into visuals that connect, communicate and leave an impression.",
  chips: [{ label: "B.Des Animation · GLS" }, { label: "3+ years" }, { label: "Films · Brands · Reels", accent: true }],
  hint: "Press play on the story",
  stampAlt: "Portrait of Harnish Kapoor as a postage stamp",
  postmark: "SINCE 2017 · ANIMATION · DESIGN ·",
  stampCaption: "Harnish Kapoor · since 2017",
  scenes: SCENES,
  toolkit: {
    title: "The toolkit",
    skillsLabel: "Visual design",
    skills: [
      "Graphic Design",
      "Visual Communication",
      "Branding & Visual Identity",
      "Social Media & Marketing Design",
      "Brochure & Publication Design",
      "Concept Development & Creative Research",
      "Visual Storytelling & Storyboarding",
    ],
    softwareLabel: "Software & tools",
    // "Adobe" is left off the Adobe apps so the pills stay short
    software: [
      "Illustrator",
      "Photoshop",
      "InDesign",
      "After Effects",
      "Premiere Pro",
      "Audition",
      "Figma",
      "Canva",
      "Articulate Storyline",
      "Articulate Rise",
    ],
  },
  closing: {
    line: ["The next frame", "is yours."],
    cv: "Download CV",
    cvHref: "", // TODO: link the CV file (media CDN); until then the button links nowhere
    hello: "Say hello →",
  },
};

/* ---------------------------------------------------------------------------
   04 · Projects — "Open a folder". Each project is a file in the drawer; its
   sections are the sheets of its case file (the inner page).

   Images and videos: put the path in `src` (served through mediaUrl(), see
   src/lib/media.ts). Until a `src` is set, the drawn placeholder `art` shows.
   If media moves to a CDN, allow its host in next.config.ts (images.remotePatterns
   and the Content-Security-Policy img-src / media-src).
   --------------------------------------------------------------------------- */

export type ProjectFilter = "film" | "branding" | "illustration" | "motion";

export type CoverArtId = "insect" | "mood" | "fold" | "posters" | "handbook" | "books" | "motion" | "boards";

export type Figure = { src?: string; alt: string; caption: string; art?: CoverArtId };

export type CaseSection =
  | { kind: "brief"; heading: string; text: string; facts: { label: string; value: string }[] }
  | { kind: "process"; heading: string; note?: string; items: Figure[] }
  | { kind: "drafts"; heading: string; note?: string; frames: Figure[] }
  | { kind: "final"; heading: string; media: Figure & { video?: string; poster?: string } }
  | { kind: "credits"; heading: string; credits: { role: string; name: string }[]; results: string[] };

export type ProjectFile = {
  /** test hook only; never shown in the URL */
  id: string;
  number: string;
  title: string;
  /** label on the open folder's tab: "01 · Short film" */
  tab: string;
  /** vertical label on the folder in the drawer */
  type: string;
  /** foot of the folder in the drawer, and the meta row of the open folder */
  years: string;
  context: string;
  format: string;
  summary: string;
  tags: string[];
  filters: ProjectFilter[];
  color: string;
  cover: Figure & { art: CoverArtId };
  sections: CaseSection[];
};

/** Placeholder sheets for a project whose case file isn't written yet. TODO (Harnish): replace per project. */
const draftSections = (art: CoverArtId, what: string): CaseSection[] => [
  {
    kind: "brief",
    heading: "The brief",
    text: `TODO (Harnish): the idea behind ${what}, and what it had to do.`,
    facts: [
      { label: "Role", value: "TODO" },
      { label: "Team", value: "TODO" },
      { label: "Tools", value: "TODO" },
    ],
  },
  {
    kind: "process",
    heading: "Process",
    note: "TODO (Harnish): sketches, boards and references.",
    items: [
      { alt: "Early sketch", caption: "TODO: first sketches", art },
      { alt: "Moodboard", caption: "TODO: moodboard", art },
      { alt: "Storyboard", caption: "TODO: storyboard", art },
    ],
  },
  {
    kind: "drafts",
    heading: "Drafts",
    note: "TODO (Harnish): how it changed along the way.",
    frames: [
      { alt: "Draft one", caption: "v1", art },
      { alt: "Draft two", caption: "v2", art },
      { alt: "Draft three", caption: "v3", art },
      { alt: "Final draft", caption: "final", art },
    ],
  },
  { kind: "final", heading: "The final frame", media: { alt: `The finished ${what}`, caption: "TODO: the finished piece", art } },
  { kind: "credits", heading: "Credits", credits: [{ role: "TODO", name: "TODO" }], results: ["TODO (Harnish): results, screenings or reach"] },
];

export const ARCHIVE = {
  intro: {
    title: ["Open a", "folder."],
    text: "Films, brands, books and motion. Every project is filed with its sketches, drafts and the final frame.",
    hint: "Pull a tab to open a file",
    drawerLabel: "The archive",
    since: "2021 → now",
  },
  filters: [
    { id: "all", label: "All" },
    { id: "film", label: "Film & Animation" },
    { id: "branding", label: "Branding" },
    { id: "illustration", label: "Illustration" },
    { id: "motion", label: "Motion" },
  ] as { id: "all" | ProjectFilter; label: string }[],
  projects: [
    {
      id: "insect",
      number: "01",
      title: "There Is an Insect Inside of Me",
      tab: "Short film",
      type: "Short film",
      years: "2021",
      context: "Collaborative",
      format: "2D visual film",
      summary: "Made with friends during COVID-19: isolation, uncertainty and the feelings in between, turned into visual sequences and poetry.",
      tags: ["2D Animation", "Visual poetry", "Art direction"],
      filters: ["film"],
      color: "var(--lotus)",
      cover: { alt: "Film still: a small insect under a full moon over green hills", caption: "Film still / poster", art: "insect" },
      sections: [
        {
          kind: "brief",
          heading: "The brief",
          text: "Made with friends during COVID-19: isolation, uncertainty and the feelings in between, turned into visual sequences and poetry. TODO (Harnish): a few more lines on the idea.",
          facts: [
            { label: "Format", value: "2D visual film" },
            { label: "Made", value: "2021, collaborative" },
            { label: "Role", value: "TODO" },
          ],
        },
        ...draftSections("insect", "the film").slice(1, 4),
        {
          kind: "credits",
          heading: "Credits & festivals",
          credits: [{ role: "TODO (Harnish): your role", name: "Harnish Kapoor" }],
          results: ["7 official festival selections", "TODO (Harnish): festival names"],
        },
      ],
    },
    {
      id: "aham-brahmasmi",
      number: "02",
      title: "Aham Brahmasmi",
      tab: "Mood film",
      type: "Mood film",
      years: "",
      context: "Academic",
      format: "Mood film",
      summary: "An academic mood film. TODO (Harnish): the story in one or two lines.",
      tags: ["Mood film", "Animation"],
      filters: ["film"],
      color: "var(--lilac)",
      cover: { alt: "Placeholder: a sun rising over a still horizon", caption: "Film still", art: "mood" },
      sections: draftSections("mood", "the mood film"),
    },
    {
      id: "fold-labs",
      number: "03",
      title: "Fold Labs",
      tab: "Explainers",
      type: "Explainers · Brand",
      years: "2021–23",
      context: "Freelance",
      format: "Explainers · Brand",
      summary: "Explainer films and brand pieces for Foldlabs. TODO (Harnish): what they explained and how.",
      tags: ["Explainers", "Brand", "Motion"],
      filters: ["branding", "motion"],
      color: "var(--marigold)",
      cover: { alt: "Placeholder: a folded paper shape unfolding", caption: "Explainer frame", art: "fold" },
      sections: draftSections("fold", "the Foldlabs explainers"),
    },
    {
      id: "era-and-canvas",
      number: "04",
      title: "Era and Canvas",
      tab: "Brand",
      type: "Brand · Posters",
      years: "2021–23",
      context: "Freelance",
      format: "Brand · Posters",
      summary: "A brand and its posters. TODO (Harnish): the brand, the idea and the poster series.",
      tags: ["Branding", "Posters"],
      filters: ["branding"],
      color: "var(--sage)",
      cover: { alt: "Placeholder: two posters pinned side by side", caption: "Poster", art: "posters" },
      sections: draftSections("posters", "the posters"),
    },
    {
      id: "mvac-handbook",
      number: "05",
      title: "MVAC Handbook",
      tab: "Illustration",
      type: "Illustration",
      years: "2021–23",
      context: "Freelance",
      format: "Illustrated handbook",
      summary: "Illustrations for the MVAC handbook. TODO (Harnish): who it was for and what it covered.",
      tags: ["Illustration", "Editorial"],
      filters: ["illustration"],
      color: "#fffdf9",
      cover: { alt: "Placeholder: an open handbook with an illustrated page", caption: "Spread", art: "handbook" },
      sections: draftSections("handbook", "the handbook"),
    },
    {
      id: "safety-troop-books",
      number: "06",
      title: "Safety Troop Books",
      tab: "Books",
      type: "Books · Comics",
      years: "2023–24",
      context: "Safety Troop",
      format: "Books · Comics",
      summary: "Books and comics made as Illustrator & Animator at Safety Troop. TODO (Harnish): the series and its readers.",
      tags: ["Books", "Comics", "Illustration"],
      filters: ["illustration"],
      color: "var(--lotus)",
      cover: { alt: "Placeholder: a comic page with three panels", caption: "Comic page", art: "books" },
      sections: draftSections("books", "the books"),
    },
    {
      id: "pathquest-motion",
      number: "07",
      title: "PathQuest Motion",
      tab: "Motion",
      type: "Motion graphics",
      years: "2024–25",
      context: "PathQuest",
      format: "Motion graphics",
      summary: "Motion graphics made as Motion Graphic Designer at PathQuest. TODO (Harnish): the pieces and what they did.",
      tags: ["Motion graphics", "After Effects"],
      filters: ["motion"],
      color: "var(--lilac)",
      cover: { alt: "Placeholder: shapes moving along a curved path", caption: "Motion frame", art: "motion" },
      sections: draftSections("motion", "the motion pieces"),
    },
    {
      id: "feature-storyboards",
      number: "08",
      title: "Feature Storyboards",
      tab: "Storyboards",
      type: "Storyboards",
      years: "2021–23",
      context: "Freelance",
      format: "Storyboards · Animatics",
      summary: "Storyboards and animatics for a Dag Compeau feature. TODO (Harnish): the film and the boards.",
      tags: ["Storyboards", "Animatics", "Film"],
      filters: ["film"],
      color: "var(--marigold)",
      cover: { alt: "Placeholder: a strip of storyboard panels", caption: "Board", art: "boards" },
      sections: draftSections("boards", "the storyboards"),
    },
  ] satisfies ProjectFile[],
};

/**
 * Contact details. The email and phone are kept in pieces and only joined in the browser
 * (see useContactDetails), so they never appear whole in the page HTML or source — a
 * small hurdle for address-harvesting bots. Visitors see and use them normally.
 */
export const CONTACT = {
  title: ["Let’s create", "something", "meaningful."],
  subtitle: "Whether it’s a new project, a creative collaboration or a quick hello, let’s get talking.",
  emailParts: ["harnish.kapoor03", "gmail", "com"],
  phoneParts: ["+91", "81605", "04042"],
  links: [
    { label: "Behance", href: "https://www.behance.net/Harnish_Kapoor" },
    { label: "Instagram", href: "https://www.instagram.com/_harnish.kapoor_/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/harnish-kapoor-animator/" },
  ],
  form: {
    subject: "Hello from your portfolio",
    sentNote: "Your email app should open with the message ready to send.",
  },
};
