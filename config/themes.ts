import { ColorTheme } from '../lib/theme';

export const colorThemes: ColorTheme[] = [
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

  // Soft pastels
  {
    id: 'soft-blue',
    name: 'Soft Blue',
    background: '#e3f2fd',
    cardBackground: 'linear-gradient(180deg, #bbdefb 0%, #90caf9 100%)',
    cardBorder: '#64b5f6',
    digitColor: '#0d47a1',
    separatorColor: '#1565c0',
    shadow: '0 8px 32px rgba(33, 150, 243, 0.2)',
    category: 'pastel-light'
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    background: '#fce4ec',
    cardBackground: 'linear-gradient(180deg, #f8bbd9 0%, #f48fb1 100%)',
    cardBorder: '#f06292',
    digitColor: '#880e4f',
    separatorColor: '#ad1457',
    shadow: '0 8px 32px rgba(233, 30, 99, 0.2)',
    category: 'pastel-light'
  },
  {
    id: 'soft-green',
    name: 'Soft Green',
    background: '#e8f5e8',
    cardBackground: 'linear-gradient(180deg, #c8e6c9 0%, #a5d6a7 100%)',
    cardBorder: '#81c784',
    digitColor: '#1b5e20',
    separatorColor: '#2e7d32',
    shadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
    category: 'pastel-light'
  },
  {
    id: 'soft-purple',
    name: 'Soft Purple',
    background: '#f3e5f5',
    cardBackground: 'linear-gradient(180deg, #e1bee7 0%, #ce93d8 100%)',
    cardBorder: '#ba68c8',
    digitColor: '#4a148c',
    separatorColor: '#6a1b9a',
    shadow: '0 8px 32px rgba(156, 39, 176, 0.2)',
    category: 'pastel-light'
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
    id: 'dark-purple',
    name: 'Dark Purple',
    background: '#1e1b4b',
    cardBackground: 'linear-gradient(180deg, #581c87 0%, #7c3aed 100%)',
    cardBorder: '#8b5cf6',
    digitColor: '#ede9fe',
    separatorColor: '#c4b5fd',
    shadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
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
  { id: 'pastel-light', name: 'Soft Pastels', icon: '🌸' },
  { id: 'pastel-dark', name: 'Dark Pastels', icon: '🌌' }
] as const;
