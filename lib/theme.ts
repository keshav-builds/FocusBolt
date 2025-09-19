export interface ColorTheme {
  id: string;
  name: string;
  background: string;
  backgroundImage?: string; // New field for image backgrounds
  backgroundOverlay?: string; // Overlay color for readability
  cardBackground: string;
  cardBorder: string;
  digitColor: string;
  separatorColor: string;
  shadow: string;
  category: 'light' | 'dark' | 'pastel-dark'| 'gradient'| 'image';
}
