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
}

export const projects: Project[] = [
  {
    id: "tradeup",
    num: "001",
    title: "TRADE-UP",
    description:
      "React Native marketplace for hybrid cash and trade offers. AI image recognition pipeline reduced costs 70-90% vs LLM-only solutions. Real-time messaging, QR trade finalization, biometric auth. Production distributed via TestFlight.",
    tags: ["EXPO", "REACT NATIVE", "SUPABASE", "GPT-4O", "TYPESCRIPT", "ZUSTAND"],
    githubUrl: "",
    liveUrl: "https://tradeupmarket.com",
    stars: 5,
  },
  {
    id: "portsmith",
    num: "002",
    title: "PORTSMITH",
    description:
      "Chrome extension for migrating AI assistant configs between ChatGPT, Claude, and Gemini. Reverse-engineered platform APIs, built a Universal Interchange Schema, zero user data leaves the device. Live on the Chrome Web Store.",
    tags: ["TYPESCRIPT", "VITE", "CHROME MV3", "SIDE PANEL API"],
    githubUrl: "",
    liveUrl: "https://chromewebstore.google.com/detail/jgicdjjebakiobiehdfdbgkfknkidhcd",
    stars: 5,
  },
  {
    id: "hekdesign",
    num: "003",
    title: "HEK DESIGN STUDIO",
    description:
      "6-page portfolio site with headless CMS, GSAP scroll animations, and pixel-perfect Figma implementation. Self-hosted fonts and optimized asset delivery for sub-1.5s load on slow 4G.",
    tags: ["ASTRO 5", "SANITY CMS", "GSAP", "TAILWIND", "TYPESCRIPT"],
    githubUrl: "",
    liveUrl: "https://www.hekdesigns.com/",
    stars: 5,
  },
  {
    id: "drikipper",
    num: "004",
    title: "DR. KIPPER MD",
    description:
      "HIPAA-compliant Next.js 15 concierge medicine site. Diagnosed Core Web Vitals degradation traced to Mumbai hosting geography and migrated to Vercel US infrastructure. WCAG 2.2 AA, JSON-LD E-E-A-T SEO, and a staff CMS portal for non-technical content updates.",
    tags: ["NEXT.JS 15", "TYPESCRIPT", "TAILWIND", "VERCEL BLOB", "ATHENAHEALTH"],
    githubUrl: "",
    liveUrl: "https://stuartbkippermd.com/",
    stars: 4,
  },
  {
    id: "yieldstone",
    num: "005",
    title: "YIELDSTONE SYSTEMS",
    description:
      "5-page marketing site for a cannabis QA consulting firm built to establish credibility in a regulated niche. Astro island architecture, 41 optimized images, scroll animations, Formspree contact integration.",
    tags: ["ASTRO", "REACT", "TAILWIND", "TYPESCRIPT", "FORMSPREE"],
    githubUrl: "",
    liveUrl: "#",
    stars: 4,
  },
  {
    id: "devsum",
    num: "006",
    title: "DEVSUM",
    description:
      "Open source Node/Express middleware that parses git diffs and auto-generates Conventional Commit messages via OpenAI. Sub-200ms response under load with OAuth 2.0 GitHub integration.",
    tags: ["NODE.JS", "EXPRESS", "OPENAI", "OAUTH 2.0", "TYPESCRIPT"],
    githubUrl: "https://github.com/Hekleiman/devsum",
    liveUrl: "#",
    linkLabel: "OPEN SOURCE",
    stars: 4,
  },
];
