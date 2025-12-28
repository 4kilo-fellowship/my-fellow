import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: isDark ? "#fff" : "#000",
        tabBarInactiveTintColor: isDark ? "#fff" : "#000",

        tabBarStyle: {
          backgroundColor: isDark ? "#1A1A1B" : "#fff",
          height: 85,
          borderTopWidth: 0,
          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 6,
        },

        tabBarItemStyle: {
          paddingVertical: 12,
        },

        tabBarIcon: ({ focused, color }) => {
          if (route.name === "index") {
            return (
              <Octicons
                name={focused ? "home-fill" : "home"}
                size={focused ? 32 : 26}
                color={color}
              />
            );
          }

          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "devotions":
              iconName = focused ? "book" : "book-outline";
              break;
            case "teams":
              iconName = focused ? "people" : "people-outline";
              break;
            case "reminders":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            case "gifts":
              iconName = focused ? "gift" : "gift-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return (
            <Ionicons name={iconName} size={focused ? 32 : 26} color={color} />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="devotions" options={{ title: "Devotions" }} />
      <Tabs.Screen name="teams" options={{ title: "Teams" }} />
      <Tabs.Screen name="reminders" options={{ title: "Alerts" }} />
      <Tabs.Screen name="gifts" options={{ title: "Gifts" }} />
    </Tabs>
  );
}
