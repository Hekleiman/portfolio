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
      { name: "TypeScript", count: 7, gradient: "linear-gradient(90deg, #3178c6, #00e5ff)" },
      { name: "JavaScript", count: 8, gradient: "linear-gradient(90deg, #ffe600, #ff6b00)" },
    ],
  },
  {
    category: "FRAMEWORKS",
    skills: [
      { name: "React", count: 3, gradient: "linear-gradient(90deg, #149eca, #61dafb)" },
      { name: "React Native", count: 1, gradient: "linear-gradient(90deg, #149eca, #39ff14)" },
      { name: "Next.js", count: 1, gradient: "linear-gradient(90deg, #555, #fff)" },
      { name: "Astro", count: 4, gradient: "linear-gradient(90deg, #ff6b00, #6a0dad)" },
    ],
  },
  {
    category: "TOOLS",
    skills: [
      { name: "Git / GitHub", count: 8, gradient: "linear-gradient(90deg, #f05032, #ff6b00)" },
      { name: "Supabase", count: 1, gradient: "linear-gradient(90deg, #3ecf8e, #1e6745)" },
      { name: "Vercel", count: 2, gradient: "linear-gradient(90deg, #fff, #888)" },
      { name: "Figma", count: 1, gradient: "linear-gradient(90deg, #f24e1e, #a259ff)" },
    ],
  },
  {
    category: "UNLOCKABLES",
    skills: [
      { name: "AI / LLM APIs", count: 2, gradient: "linear-gradient(90deg, #6a0dad, #00e5ff)" },
      { name: "Chrome Extension APIs", count: 1, gradient: "linear-gradient(90deg, #4285f4, #34a853)" },
      { name: "GSAP", count: 2, gradient: "linear-gradient(90deg, #88ce02, #00e5ff)" },
      { name: "Headless CMS", count: 2, gradient: "linear-gradient(90deg, #ff6b00, #ffe600)" },
    ],
  },
];
