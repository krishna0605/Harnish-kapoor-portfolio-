/**
 * Site content. Everything marked TODO is demo placeholder text, written only from
 * facts already on the landing page — replace it with the real content.
 */

export type ChapterId = "home" | "about" | "experience" | "projects" | "contact";

export const CHAPTERS: { id: ChapterId; number: string; label: string; spine: string; color: string }[] = [
  { id: "home", number: "01", label: "Home", spine: "Home", color: "var(--lotus)" },
  { id: "about", number: "02", label: "About", spine: "About me →", color: "var(--marigold)" },
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

// TODO: replace with the real bio, skills and CV link
export const ABOUT = {
  title: "About me",
  subtitle: "Drawn by hand, made to move.",
  bio: "I’m a graphic and motion designer with 3+ years of drawing brands, explainers and a festival-selected short film. I sketch every frame on paper first, then bring it to life — every still is designed as if it’s about to move.",
  cvLabel: "Download CV",
  cvHref: "#",
  skillsLabel: "What I do",
  skills: ["Illustration", "Motion graphics", "Brand identity", "Explainers", "Storyboarding"],
};

// TODO: replace with the real roles, dates and descriptions
export const EXPERIENCE = {
  title: "Experience",
  subtitle: "Where the drawings have been.",
  roles: [
    {
      role: "Graphic Designer",
      company: "Accenture",
      period: "Now",
      summary: "Brand, illustration and motion work for client campaigns.",
    },
    {
      role: "Motion Designer",
      company: "Freelance",
      period: "Earlier",
      summary: "Explainers and animated identities for small brands.",
    },
    {
      role: "Animator & Director",
      company: "Short film",
      period: "Festival selection",
      summary: "A hand-drawn short, frame by frame — selected for festival screening.",
    },
  ],
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

// TODO: replace with real email and profile links
export const CONTACT = {
  title: ["Let’s make", "it move"],
  subtitle: "Commissions, collaborations or just a hello.",
  email: "hello@example.com",
  links: [
    { label: "Instagram", href: "#" },
    { label: "Behance", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
};
