export interface Skill {
  name: string;
  pct: number;
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
      { name: "TypeScript", pct: 94, gradient: "linear-gradient(90deg, #3178c6, #00e5ff)" },
      { name: "JavaScript", pct: 92, gradient: "linear-gradient(90deg, #ffe600, #ff6b00)" },
      { name: "Python", pct: 75, gradient: "linear-gradient(90deg, #3776ab, #ffd343)" },
      { name: "SQL", pct: 78, gradient: "linear-gradient(90deg, #00758f, #00e5ff)" },
    ],
  },
  {
    category: "FRAMEWORKS",
    skills: [
      { name: "React", pct: 90, gradient: "linear-gradient(90deg, #149eca, #61dafb)" },
      { name: "React Native", pct: 85, gradient: "linear-gradient(90deg, #149eca, #39ff14)" },
      { name: "Next.js", pct: 85, gradient: "linear-gradient(90deg, #555, #fff)" },
      { name: "Astro", pct: 88, gradient: "linear-gradient(90deg, #ff6b00, #6a0dad)" },
    ],
  },
  {
    category: "TOOLS",
    skills: [
      { name: "Git / GitHub", pct: 92, gradient: "linear-gradient(90deg, #f05032, #ff6b00)" },
      { name: "Supabase", pct: 85, gradient: "linear-gradient(90deg, #3ecf8e, #1e6745)" },
      { name: "Vercel", pct: 88, gradient: "linear-gradient(90deg, #fff, #888)" },
      { name: "Figma", pct: 72, gradient: "linear-gradient(90deg, #f24e1e, #a259ff)" },
    ],
  },
  {
    category: "UNLOCKABLES",
    skills: [
      { name: "AI / LLM APIs", pct: 88, gradient: "linear-gradient(90deg, #6a0dad, #00e5ff)" },
      { name: "Chrome Extension APIs", pct: 80, gradient: "linear-gradient(90deg, #4285f4, #34a853)" },
      { name: "GSAP", pct: 75, gradient: "linear-gradient(90deg, #88ce02, #00e5ff)" },
      { name: "Headless CMS", pct: 80, gradient: "linear-gradient(90deg, #ff6b00, #ffe600)" },
    ],
  },
];
