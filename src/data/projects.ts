export interface Project {
  id: string;
  num: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  linkLabel?: string;
  stars: number;
  image: string | null;
}

export const projects: Project[] = [
  {
    id: "jewmanity",
    num: "001",
    title: "JEWMANITY",
    description:
      "40-page site for a Jewish and Israeli mental health 501(c)(3). Stripe Payment Links shop, Givebutter donations, and volunteer/contact forms. Sanity CMS with a publish webhook that rebuilds the site in under a minute; a failed fetch during a build degrades a section instead of failing the deploy.",
    tags: ["ASTRO 5", "TAILWIND 4", "SANITY CMS", "STRIPE", "GIVEBUTTER", "GSAP"],
    githubUrl: "",
    liveUrl: "https://jewmanity.com",
    stars: 5,
    image: "/images/projects/jewmanity.png",
  },
  {
    id: "tradeup",
    num: "002",
    title: "TRADE-UP",
    description:
      "React Native marketplace for hybrid cash and trade offers. Hybrid image pipeline that gates a GPT-4o mini call behind a Google Vision confidence threshold. Real-time messaging, QR trade finalization, biometric auth. Pre-launch on TestFlight. Built with designer Harrison Kipper.",
    tags: ["EXPO", "REACT NATIVE", "SUPABASE", "GPT-4O", "TYPESCRIPT", "ZUSTAND"],
    githubUrl: "",
    liveUrl: "https://tradeupmarket.com",
    stars: 5,
    image: "/images/projects/tradeup.png",
  },
  {
    id: "portsmith",
    num: "003",
    title: "PORTSMITH",
    description:
      "Chrome extension for migrating AI assistant configs between ChatGPT, Claude, and Gemini. Mapped each platform's internal web API from network traffic, translates through one interchange schema, and checkpoints writes so an interrupted migration resumes without duplicates. No PortSmith servers, no analytics. Live on the Chrome Web Store.",
    tags: ["TYPESCRIPT", "VITE", "CHROME MV3", "SIDE PANEL API"],
    githubUrl: "https://github.com/Hekleiman/portsmith",
    liveUrl: "https://chromewebstore.google.com/detail/jgicdjjebakiobiehdfdbgkfknkidhcd",
    stars: 5,
    image: "/images/projects/portsmith.png",
  },
  {
    id: "hekdesign",
    num: "004",
    title: "HEK DESIGN STUDIO",
    description:
      "6-page portfolio site with headless CMS, GSAP scroll animations, and pixel-perfect Figma implementation. Self-hosted fonts and optimized asset delivery.",
    tags: ["ASTRO 5", "SANITY CMS", "GSAP", "TAILWIND", "TYPESCRIPT"],
    githubUrl: "https://github.com/Hekleiman/hekds",
    liveUrl: "https://www.hekdesigns.com/",
    stars: 5,
    image: "/images/projects/hekdesign.png",
  },
  {
    id: "drikipper",
    num: "005",
    title: "DR. KIPPER MD",
    description:
      "Next.js 15 concierge medicine site built to keep patient data off the marketing site; patient workflows hand off to athenaOne. Moved the site off a shared host in Asia onto US-region hosting on Vercel. WCAG 2.2 AA, with a staff CMS portal for non-technical content updates.",
    tags: ["NEXT.JS 15", "TYPESCRIPT", "TAILWIND", "VERCEL BLOB"],
    githubUrl: "",
    liveUrl: "https://stuartbkippermd.com/",
    stars: 4,
    image: "/images/projects/drikipper.png",
  },
  {
    id: "yieldstone",
    num: "006",
    title: "YIELDSTONE SYSTEMS",
    description:
      "5-page marketing site for a cannabis QA consulting firm built to establish credibility in a regulated niche. Astro island architecture, 41 optimized images, scroll animations, Formspree contact integration.",
    tags: ["ASTRO", "REACT", "TAILWIND", "TYPESCRIPT", "FORMSPREE"],
    githubUrl: "",
    liveUrl: "https://yieldstonesystems.com/",
    stars: 4,
    image: "/images/projects/yieldstone.png",
  },
  {
    id: "devsum",
    num: "007",
    title: "DEVSUM",
    description:
      "AI dev-analytics dashboard shipped by a team of 4 working in pair and mob sessions. I built the backend OpenAI commit-analysis service (prompt building, diff analysis, caching) and paired on the shared GitHub OAuth flow.",
    tags: ["REACT 19", "EXPRESS", "MONGODB", "OPENAI", "OAUTH 2.0"],
    githubUrl: "https://github.com/osp3/devsum",
    liveUrl: "https://www.linkedin.com/company/108621640/",
    linkLabel: "LINKEDIN",
    stars: 4,
    image: null,
  },
];
