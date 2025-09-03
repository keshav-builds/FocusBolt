export interface ColorTheme {
  id: string;
  name: string;
  background: string;
  cardBackground: string;
  cardBorder: string;
  digitColor: string;
  separatorColor: string;
  shadow: string;
  category: 'light' | 'dark' | 'pastel-light' | 'pastel-dark';
}
