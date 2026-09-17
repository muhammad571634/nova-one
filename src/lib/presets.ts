export interface StylePreset {
  id: string;
  name: string;
  tagline: string;
  vibe: string;
  colors: string[];
  isAuto?: boolean;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'auto',
    name: 'Auto AI Match',
    tagline: 'Automatically extract palette & vibe from target site',
    vibe: 'Adaptive & Brand-Aligned',
    colors: ['#00C2FF', '#2B59FF', '#0F172A'],
    isAuto: true,
  },
  {
    id: 'coral',
    name: 'Coral',
    tagline: 'Warm energetic red-coral with clean cream typography',
    vibe: 'Modern Consumer & Mobile Apps',
    colors: ['#E85D5D', '#F5F0E8', '#1A1A1A'],
  },
  {
    id: 'bold-poster',
    name: 'Bold Poster',
    tagline: 'High impact typography with punchy contrast cards',
    vibe: 'Product Launches & Bold Announcements',
    colors: ['#FF3B30', '#FFFFFF', '#000000'],
  },
  {
    id: 'blue-professional',
    name: 'Blue Professional',
    tagline: 'Refined corporate blue with crisp enterprise accents',
    vibe: 'B2B SaaS & Financial Tools',
    colors: ['#1E40AF', '#3B82F6', '#F8FAFC'],
  },
  {
    id: 'cobalt-grid',
    name: 'Cobalt Grid',
    tagline: 'Technical grid structures with electric cobalt accents',
    vibe: 'Developer Platforms & Infrastructure',
    colors: ['#2563EB', '#0F172A', '#E2E8F0'],
  },
  {
    id: 'code-editorial',
    name: 'Code Editorial',
    tagline: 'Monospace editorial feel with dark syntax highlighting',
    vibe: 'DevTools, Open Source, & APIs',
    colors: ['#10B981', '#1E293B', '#0F172A'],
  },
  {
    id: 'capsule',
    name: 'Capsule',
    tagline: 'Curved pill geometry with smooth glass highlights',
    vibe: 'AI Assistants & Health Tech',
    colors: ['#06B6D4', '#E0F2FE', '#0F172A'],
  },
  {
    id: 'cartesian',
    name: 'Cartesian',
    tagline: 'Architectural precision lines with structured hierarchy',
    vibe: 'Analytics, Data & Engineering',
    colors: ['#64748B', '#0F172A', '#F1F5F9'],
  },
  {
    id: 'creative-mode',
    name: 'Creative Mode',
    tagline: 'Playful gradient mesh with vibrant kinetic motion',
    vibe: 'Design Tools & Creator Economy',
    colors: ['#8B5CF6', '#EC4899', '#FDF4FF'],
  },
  {
    id: 'daisy-days',
    name: 'Daisy Days',
    tagline: 'Soft sunlight yellows and organic friendly layouts',
    vibe: 'Education, Productivity, & Lifestyle',
    colors: ['#F59E0B', '#FEF3C7', '#1F2937'],
  },
  {
    id: 'editorial-forest',
    name: 'Editorial Forest',
    tagline: 'Deep botanical greens with high-end editorial serif tone',
    vibe: 'Premium Brands & Sustainability',
    colors: ['#064E3B', '#10B981', '#F0FDF4'],
  },
  {
    id: 'biennale-yellow',
    name: 'Biennale Yellow',
    tagline: 'Brutalist graphic design with stark yellow & black',
    vibe: 'Fashion, Media & Culture',
    colors: ['#FACC15', '#000000', '#FFFFFF'],
  },
  {
    id: 'blockframe',
    name: 'Blockframe',
    tagline: 'Modular block composition with strong border framing',
    vibe: 'Hardware, Web3 & Crypto',
    colors: ['#334155', '#E2E8F0', '#020617'],
  },
  {
    id: 'broadside',
    name: 'Broadside',
    tagline: 'Wide editorial typography inspired by broadsheet press',
    vibe: 'Newsletters, Publishing & Journalism',
    colors: ['#475569', '#CBD5E1', '#0F172A'],
  },
];