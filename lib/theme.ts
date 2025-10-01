export interface ColorTheme {
  id: string;
  name: string;
  background: string;
  backgroundImage?: string; 
  backgroundOverlay?: string; 
  cardBackground: string;
  cardBorder: string;
  digitColor: string;
  separatorColor: string;
  shadow: string;
  category: 'light' | 'dark' | 'pastel-dark'| 'gradient'| 'image';
}
