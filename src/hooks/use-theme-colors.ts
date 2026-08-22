import { darkColors, lightColors, ThemeColors } from "@/constants/colors";
import { useColorScheme } from "react-native";

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
