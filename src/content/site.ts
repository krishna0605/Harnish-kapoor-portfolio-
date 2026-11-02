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
    skills: ["2D Animation", "Motion Graphics", "Storyboarding", "Illustration", "Character Design", "Branding", "Matte Painting"],
    software: ["Photoshop", "Illustrator", "Animate", "After Effects", "Premiere Pro", "InDesign", "TVPaint", "Figma", "Blender"],
  },
  closing: {
    line: ["The next frame", "is yours."],
    cv: "Download CV",
    cvHref: "#", // TODO: link the CV file (media CDN)
    hello: "Say hello →",
  },
};

export type Motif = "moon" | "lotus" | "sparkle" | "arch";

// TODO: replace with real projects (title, description, tags, media from the media CDN)
export const PROJECTS: { title: string; subtitle: string; tags: string[]; motif: Motif; href: string }[] = [
  { title: "Festival short film", subtitle: "A hand-drawn story, frame by frame", tags: ["Animation", "Film"], motif: "moon", href: "#" },
  { title: "Brand explainer series", subtitle: "Complex ideas, told simply", tags: ["Motion", "Explainer"], motif: "lotus", href: "#" },
  { title: "Identity system", subtitle: "A brand that moves on every screen", tags: ["Brand", "Motion"], motif: "sparkle", href: "#" },
  { title: "Illustration set", subtitle: "Pastel worlds in ink", tags: ["Illustration"], motif: "arch", href: "#" },
];

export const PROJECTS_INTRO = {
  title: ["Selected", "work"],
  subtitle: "Brands, explainers and a short film.",
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
