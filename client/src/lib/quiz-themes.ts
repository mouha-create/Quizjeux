import type { QuizTheme } from "@shared/schema";

export interface ThemeColors {
  from: string;
  to: string;
  bg: string;
  text: string;
  border: string;
  light: string;
}

export const quizThemeColors: Record<QuizTheme, ThemeColors> = {
  purple: {
    from: "from-purple-500",
    to: "to-blue-500",
    bg: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500",
    light: "bg-purple-50 dark:bg-purple-950/30",
  },
  green: {
    from: "from-green-500",
    to: "to-teal-500",
    bg: "bg-green-500",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500",
    light: "bg-green-50 dark:bg-green-950/30",
  },
  orange: {
    from: "from-orange-500",
    to: "to-red-500",
    bg: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500",
    light: "bg-orange-50 dark:bg-orange-950/30",
  },
  pink: {
    from: "from-pink-500",
    to: "to-purple-500",
    bg: "bg-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500",
    light: "bg-pink-50 dark:bg-pink-950/30",
  },
  blue: {
    from: "from-blue-500",
    to: "to-cyan-500",
    bg: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500",
    light: "bg-blue-50 dark:bg-blue-950/30",
  },
};

export function getThemeGradient(theme: QuizTheme): string {
  const colors = quizThemeColors[theme];
  return `bg-gradient-to-br ${colors.from} ${colors.to}`;
}

export function getThemeClasses(theme: QuizTheme) {
  return quizThemeColors[theme];
}
