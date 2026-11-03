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
  tagline: "Stories drawn by hand and set in motion.",
  status: ["Currently ", "working as"] as const, // the first word is dropped on very small cards
  currentRole: "Graphic Designer",
  currentCompany: "at Accenture",
  experience:
    "3+ years drawing brands, explainers and a festival-selected short film — every still designed as if it’s about to move.",
  badge: "ANIMATION · ILLUSTRATION · MOTION ·",
};

// About chapter — text from the design "04 · About — the story so far"
export type SceneArtId = "school" | "bounce" | "storyboard" | "clapper" | "freelance" | "studios";

export type Scene = {
  id: string;
  number: string;
  kicker: string;
  title: string;
  text?: string;
  roles?: { role: string; company: string }[];
  tags: { label: string; accent?: boolean }[];
  art: SceneArtId;
  color: string;
  /** position on the 3840×1080 board: x, row above or below the story line, tilt */
  x: number;
  row: "top" | "bottom";
  tilt: number;
  // TODO: real details — shown when the scene is opened
  did: string[];
  highlights: string[];
};

const SCENES: Scene[] = [
  {
    id: "sc-01",
    number: "SC 01",
    kicker: "School years",
    title: "Where it started",
    text: "Aga Khan Primary, then Vedant International (Science) — with drawing, poetry and photography always on the side.",
    tags: [{ label: "Science" }, { label: "Sketchbooks" }],
    art: "school",
    color: "#C3DAEC",
    x: 1260,
    row: "top",
    tilt: -1.4,
    did: ["TODO: what she did in these years", "TODO: a second point"],
    highlights: ["TODO: a highlight", "TODO: another highlight"],
  },
  {
    id: "sc-02",
    number: "SC 02",
    kicker: "2017 – 2021",
    title: "Learning to make things move",
    text: "Bachelor in Animation Design at GLS Institute of Design: 2D animation, stop motion and character design.",
    tags: [{ label: "B.Des" }, { label: "GLS" }],
    art: "bounce",
    color: "#F5C9C6",
    x: 1590,
    row: "bottom",
    tilt: 1.2,
    did: ["TODO: courses and projects", "TODO: a second point"],
    highlights: ["TODO: a highlight", "TODO: another highlight"],
  },
  {
    id: "sc-03",
    number: "SC 03",
    kicker: "Internships",
    title: "First studio days",
    text: "Four months at Vaanarsena Studio and two at Arthat Studio — real pipelines, real deadlines, real feedback.",
    tags: [{ label: "Vaanarsena" }, { label: "Arthat" }],
    art: "storyboard",
    color: "#DCD3F2",
    x: 1920,
    row: "top",
    tilt: -1,
    did: ["TODO: work at Vaanarsena Studio", "TODO: work at Arthat Studio"],
    highlights: ["TODO: a highlight", "TODO: another highlight"],
  },
  {
    id: "sc-04",
    number: "SC 04",
    kicker: "2021",
    title: "A film that travelled",
    text: "Co-created the short film There Is an Insect Inside Me, which earned 7 official festival selections.",
    tags: [{ label: "Short film" }, { label: "7 selections" }],
    art: "clapper",
    color: "#CFE0C3",
    x: 2250,
    row: "bottom",
    tilt: 1.5,
    did: ["TODO: her role on the film", "TODO: a second point"],
    highlights: ["TODO: festival names", "TODO: another highlight"],
  },
  {
    id: "sc-05",
    number: "SC 05",
    kicker: "2021 – 2024",
    title: "Going freelance",
    text: "Storyboards and animatics for a Dag Compeau feature, explainers for Foldlabs, title sequences, invites and reels.",
    tags: [{ label: "Films" }, { label: "Brands" }, { label: "Reels" }],
    art: "freelance",
    color: "#C3DAEC",
    x: 2580,
    row: "top",
    tilt: -1.2,
    did: ["TODO: storyboards and animatics", "TODO: explainers and reels"],
    highlights: ["TODO: a highlight", "TODO: another highlight"],
  },
  {
    id: "sc-06",
    number: "SC 06",
    kicker: "2023 → now",
    title: "Into the studio world",
    roles: [
      { role: "Illustrator & Animator", company: "Safety Troop" },
      { role: "Motion Graphic Designer", company: "PathQuest" },
      { role: "Graphic Designer", company: "Accenture · now" },
    ],
    tags: [{ label: "Now at Accenture", accent: true }],
    art: "studios",
    color: "#F5C9C6",
    x: 2910,
    row: "bottom",
    tilt: 1,
    did: ["TODO: work at Safety Troop and PathQuest", "TODO: work at Accenture"],
    highlights: ["TODO: a highlight", "TODO: another highlight"],
  },
];

export const ABOUT = {
  title: ["Frame by", "frame."] as const,
  bio: "I’m Harnish — an animator, illustrator and designer with over three years across 2D animation, motion graphics, storyboarding, brand design and character creation. I love breathing life into characters and telling visual stories, one frame at a time.",
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
  title: ["Let’s make", "it move"],
  subtitle: "Commissions, collaborations or just a hello.",
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
