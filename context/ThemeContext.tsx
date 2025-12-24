import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  // 1. Add a loading state to prevent the "Flash of Light Mode"
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark") {
          setTheme(storedTheme);
        } else {
          const systemTheme = Appearance.getColorScheme();
          setTheme(systemTheme === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        // Mark loading as complete regardless of success/failure
        setIsThemeLoaded(true);
      }
    };

    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem("theme").then((storedTheme) => {
        // Only follow system if user has NOT manually set a preference
        if (!storedTheme) {
          setTheme(colorScheme === "dark" ? "dark" : "light");
        }
      });
    });

    return () => subscription.remove();
  }, []);

  // 2. Memoize the toggle function
  const toggleTheme = useCallback(async () => {
    // Use functional state update to ensure we have the current theme
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";

      // Fire and forget storage update (don't await it to block UI)
      AsyncStorage.setItem("theme", newTheme).catch((e) =>
        console.error("Error saving theme:", e)
      );

      return newTheme;
    });
  }, []);

  // 3. Memoize the context value object
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  // 4. Don't render children until the theme is known
  if (!isThemeLoaded) {
    return null; // Or return a <SplashScreen />
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
