import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
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
  const { setColorScheme } = useColorScheme();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark") {
          setTheme(storedTheme);
          setColorScheme(storedTheme);
        } else {
          setTheme("light");
          setColorScheme("light");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const newTheme = colorScheme === "dark" ? "dark" : "light";
      setTheme(newTheme);
      setColorScheme(newTheme);
    });

    return () => subscription.remove();
  }, [setColorScheme]);

  const toggleTheme = useCallback(async () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      setColorScheme(newTheme);

      AsyncStorage.setItem("theme", newTheme).catch((e) =>
        console.error("Error saving theme:", e),
      );

      return newTheme;
    });
  }, [setColorScheme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  if (!isThemeLoaded) {
    return null;
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
