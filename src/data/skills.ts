export interface Skill {
  name: string;
  count: number;
  gradient: string;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    category: "LANGUAGES",
    skills: [
      { name: "JavaScript", count: 8, gradient: "linear-gradient(90deg, #ffe600, #ff6b00)" },
      { name: "HTML / CSS", count: 8, gradient: "linear-gradient(90deg, #e34f26, #2965f1)" },
      { name: "TypeScript", count: 6, gradient: "linear-gradient(90deg, #3178c6, #00e5ff)" },
    ],
  },
  {
    category: "FRAMEWORKS",
    skills: [
      { name: "Astro", count: 4, gradient: "linear-gradient(90deg, #ff6b00, #6a0dad)" },
      { name: "Tailwind", count: 4, gradient: "linear-gradient(90deg, #38bdf8, #0ea5e9)" },
      { name: "React", count: 3, gradient: "linear-gradient(90deg, #149eca, #61dafb)" },
      { name: "React Native", count: 1, gradient: "linear-gradient(90deg, #149eca, #39ff14)" },
      { name: "Next.js", count: 1, gradient: "linear-gradient(90deg, #555, #fff)" },
      { name: "Expo", count: 1, gradient: "linear-gradient(90deg, #4630eb, #8b7fff)" },
    ],
  },
  {
    category: "TOOLS",
    skills: [
      { name: "Git / GitHub", count: 8, gradient: "linear-gradient(90deg, #f05032, #ff6b00)" },
      { name: "Vercel", count: 2, gradient: "linear-gradient(90deg, #fff, #888)" },
      { name: "Supabase", count: 1, gradient: "linear-gradient(90deg, #3ecf8e, #1e6745)" },
      { name: "Figma", count: 1, gradient: "linear-gradient(90deg, #f24e1e, #a259ff)" },
      { name: "Node / Express", count: 1, gradient: "linear-gradient(90deg, #339933, #88c000)" },
      { name: "Zustand", count: 1, gradient: "linear-gradient(90deg, #a67c52, #e0c9a6)" },
    ],
  },
  {
    category: "UNLOCKABLES",
    skills: [
      { name: "AI / LLM APIs", count: 2, gradient: "linear-gradient(90deg, #6a0dad, #00e5ff)" },
      { name: "GSAP", count: 2, gradient: "linear-gradient(90deg, #88ce02, #00e5ff)" },
      { name: "Headless CMS", count: 2, gradient: "linear-gradient(90deg, #ff6b00, #ffe600)" },
      { name: "Chrome Extension APIs", count: 1, gradient: "linear-gradient(90deg, #4285f4, #34a853)" },
      { name: "Stripe Payments", count: 1, gradient: "linear-gradient(90deg, #635bff, #a58bff)" },
      { name: "OAuth 2.0", count: 1, gradient: "linear-gradient(90deg, #3c4ec2, #00e5ff)" },
    ],
  },
];
