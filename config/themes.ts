import { ColorTheme } from '../lib/theme';

export const colorThemes: ColorTheme[] = [
  //images

  {
  id: 'Car Bg',
  name: 'Car Bg',
  background: '#ffffff',
  backgroundImage: '/images/backgrounds/carWallpaper.jpg',
  backgroundOverlay: 'rgba(255, 255, 255, 0.05)', // White overlay for light theme
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  cardBorder: 'rgba(0, 0, 0, 0.1)',
  digitColor: '#1f2937',
  separatorColor: '#6b7280',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  category: 'image'
},
  {
  id: 'Anime bg',
  name: 'Anime bg',
  background: '#ffffff',
  backgroundImage: '/images/backgrounds/Anime.png',
  backgroundOverlay: 'rgba(255, 255, 255, 0.05)', // White overlay for light theme
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  cardBorder: 'rgba(0, 0, 0, 0.1)',
  digitColor: '#1f2937',
  separatorColor: '#6b7280',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  category: 'image'
},
  // Light themes
  {
    id: 'pure-white',
    name: 'Pure White',
    background: '#ffffff',
    cardBackground: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
    cardBorder: '#e9ecef',
    digitColor: '#212529',
    separatorColor: '#6c757d',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    category: 'light'
  },
  {
    id: 'light-gray',
    name: 'Light Gray',
    background: '#f8f9fa',
    cardBackground: 'linear-gradient(180deg, #ffffff 0%, #f1f3f4 100%)',
    cardBorder: '#dee2e6',
    digitColor: '#495057',
    separatorColor: '#6c757d',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    category: 'light'
  },
  
  // Dark themes
  {
    id: 'pure-black',
    name: 'Pure Black',
    background: '#000000',
    cardBackground: 'linear-gradient(180deg, #1a1a1a 0%, #0d1117 100%)',
    cardBorder: '#30363d',
    digitColor: '#ffffff',
    separatorColor: '#8b949e',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
    category: 'dark'
  },
  {
    id: 'dark-gray',
    name: 'Dark Gray',
    background: '#0d1117',
    cardBackground: 'linear-gradient(180deg, #21262d 0%, #161b22 100%)',
    cardBorder: '#30363d',
    digitColor: '#f0f6fc',
    separatorColor: '#7d8590',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    category: 'dark'
  },

  // Vibrant gradients
  {
    id: 'rainbow-dream',
    name: 'Dual Dream',
    background: `
      linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
      radial-gradient(circle 500px at 20% 100%, rgba(139,92,246,0.3), transparent),
      radial-gradient(circle 500px at 100% 80%, rgba(59,130,246,0.3), transparent),
      #ffffff
    `,
    cardBackground: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
    cardBorder: 'rgba(139,92,246,0.2)',
    digitColor: '#1f2937',
    separatorColor: '#6b7280',
    shadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
    category: 'gradient'
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%)',
    cardBackground: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
    cardBorder: 'rgba(255,255,255,0.3)',
    digitColor: '#2d3436',
    separatorColor: '#636e72',
    shadow: '0 8px 32px rgba(253, 121, 168, 0.3)',
    category: 'gradient'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00b894 100%)',
    cardBackground: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
    cardBorder: 'rgba(255,255,255,0.25)',
    digitColor: '#ffffff',
    separatorColor: '#ddd',
    shadow: '0 8px 32px rgba(116, 185, 255, 0.4)',
    category: 'gradient'
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 50%, #fd79a8 100%)',
    cardBackground: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
    cardBorder: 'rgba(255,255,255,0.3)',
    digitColor: '#ffffff',
    separatorColor: '#f0f0f0',
    shadow: '0 8px 32px rgba(162, 155, 254, 0.4)',
    category: 'gradient'
  },
 
  {
    id: 'fire-orange',
    name: 'Fire Orange',
    background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 50%, #d63031 100%)',
    cardBackground: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
    cardBorder: 'rgba(255,255,255,0.3)',
    digitColor: '#ffffff',
    separatorColor: '#f0f0f0',
    shadow: '0 8px 32px rgba(253, 203, 110, 0.4)',
    category: 'gradient'
  },

  // Dark pastels
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    background: '#0a1929',
    cardBackground: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
    cardBorder: '#3b82f6',
    digitColor: '#dbeafe',
    separatorColor: '#93c5fd',
    shadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
    category: 'pastel-dark'
  },
  
  {
    id: 'dark-emerald',
    name: 'Dark Emerald',
    background: '#022c22',
    cardBackground: 'linear-gradient(180deg, #065f46 0%, #059669 100%)',
    cardBorder: '#10b981',
    digitColor: '#d1fae5',
    separatorColor: '#6ee7b7',
    shadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
    category: 'pastel-dark'
  }
];

export const themeCategories = [
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'gradient', name: 'Gradients', icon: '🌈' },
  { id: 'pastel-dark', name: 'Dark Pastels', icon: '🌌' },
  { id: 'image', name: 'Images', icon: '🖼️' }
] as const;
