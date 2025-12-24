import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark") {
          setTheme(storedTheme);
        } else {
          // If no stored theme, use system preference
          const systemTheme = Appearance.getColorScheme();
          setTheme(systemTheme === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        // Fallback to system theme on error
        const systemTheme = Appearance.getColorScheme();
        setTheme(systemTheme === "dark" ? "dark" : "light");
      }
    };
    loadTheme();

    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if user hasn't set a custom theme
      AsyncStorage.getItem("theme").then((storedTheme) => {
        if (!storedTheme) {
          setTheme(colorScheme === "dark" ? "dark" : "light");
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
