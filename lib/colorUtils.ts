
import { ColorTheme } from "@/lib/theme";

export const getColor = (currentTheme: ColorTheme, isImageTheme: boolean): string => {
  if (isImageTheme) return "white"; // white for image theme

  if (currentTheme.id === "pure-white" || currentTheme.id === "light-gray")
    return "#60A5FA"; // blue for light themes

  if (currentTheme.id === "pure-black" || currentTheme.id === "dark-gray")
    return "#FCD34D"; // yellow for dark themes

  return currentTheme.digitColor; // return default
};
