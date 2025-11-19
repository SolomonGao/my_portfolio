import { Project } from './types';

export const PROJECTS: Project[] = [
  {
    id: 1,
    name: "Nebula Dashboard",
    description: "A real-time SaaS analytics platform with AI-driven insights.",
    tech: ["React", "D3.js", "Node.js"],
    image: "https://picsum.photos/id/1/400/250"
  },
  {
    id: 2,
    name: "Pixel Verse",
    description: "A collaborative 3D whiteboard for remote teams.",
    tech: ["Three.js", "WebRTC", "Firebase"],
    image: "https://picsum.photos/id/20/400/250"
  },
  {
    id: 3,
    name: "Echo Chat",
    description: "End-to-end encrypted messaging app focused on privacy.",
    tech: ["TypeScript", "Signal Protocol", "Rust"],
    image: "https://picsum.photos/id/3/400/250"
  }
];

export const TECH_STACK = [
  { name: "React / Next.js", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Three.js / R3F", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "Tailwind CSS", level: 95 },
  { name: "Python / AI", level: 70 }
];

export const QUOTES = [
  "Code is like humor. When you have to explain it, it’s bad. – Cory House",
  "Simplicity is the soul of efficiency. – Austin Freeman",
  "Make it work, make it right, make it fast. – Kent Beck",
  "The only way to do great work is to love what you do. – Steve Jobs"
];
