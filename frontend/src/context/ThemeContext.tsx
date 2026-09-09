import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "Cream Classic" | "Rose Atelier" | "Champagne Noir";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("tailor-arena-theme");
      if (saved) return saved as Theme;
    }
    return "Cream Classic";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem("tailor-arena-theme", newTheme);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.replace(/\s+/g, "-").toLowerCase());
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
