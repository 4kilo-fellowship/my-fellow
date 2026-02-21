import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const userHasOverridden = useRef(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark") {
          userHasOverridden.current = true;
          setTheme(storedTheme);
        } else {
          setTheme("light");
        }
      } catch (error) {
        console.warn("Failed to load theme", error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    if (isThemeLoaded) {
      setColorScheme(theme);
    }
  }, [theme, isThemeLoaded]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!userHasOverridden.current) {
        const newTheme: Theme = colorScheme === "dark" ? "dark" : "light";
        setTheme(newTheme);
      }
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      userHasOverridden.current = true;
      AsyncStorage.setItem("theme", next).catch(() => {});
      return next;
    });
  }, []);

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
