import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "rgba(0,0,0,0)",

        tabBarStyle: {
          backgroundColor: "#fff",
          height: 80,
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
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "index":
              iconName = focused ? "home" : "home-outline";
              break;
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
            <Ionicons
              name={iconName}
              size={focused ? 32 : 26} // BIG ICONS
              color={color}
            />
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
