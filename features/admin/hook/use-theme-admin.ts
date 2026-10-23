import { useTheme } from "next-themes";

export function useAdminTheme() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return { toggle, theme };
}
