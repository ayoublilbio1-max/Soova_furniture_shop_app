export interface ThemeColors {
  background: string;
  accent: string;
  onAccent: string;
  textPrimary: string;
  textMuted: string;
  outline: string;
  placeholder: string;
  placeholderAlt: string;
}

export const lightColors: ThemeColors = {
  background: "#F7F1EA",
  accent: "#A9572F",
  onAccent: "#FFFFFF",
  textPrimary: "#2B1D14",
  textMuted: "#8A7B6E",
  outline: "#E4D5C4",
  placeholder: "#D8C4AE",
  placeholderAlt: "#C9B49B",
};

export const darkColors: ThemeColors = {
  background: "#1C1712",
  accent: "#D97B4F",
  onAccent: "#FFFFFF",
  textPrimary: "#F5EDE4",
  textMuted: "#A99A8C",
  outline: "#3A2F26",
  placeholder: "#4A3C30",
  placeholderAlt: "#5A4A3C",
};
