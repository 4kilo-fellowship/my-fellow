import { useTheme } from "@/context/ThemeContext";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const barBg = isDark ? "#1A1A1B" : "#ffffff";
  const active = isDark ? "#ffffff" : "#000000";
  const inactive = isDark ? "#8E8E93" : "#8E8E93";

  return (
    <NativeTabs
      backgroundColor={barBg}
      iconColor={{ default: inactive, selected: active }}
      labelStyle={{ default: { color: inactive }, selected: { color: active } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home" }}
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="devotions">
        <NativeTabs.Trigger.Icon
          sf={{ default: "book", selected: "book.fill" }}
          md={{ default: "menu_book", selected: "menu_book" }}
        />
        <NativeTabs.Trigger.Label>Devotions</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="teams">
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.3", selected: "person.3.fill" }}
          md={{ default: "groups", selected: "groups" }}
        />
        <NativeTabs.Trigger.Label>Teams</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reminders">
        <NativeTabs.Trigger.Icon
          sf={{ default: "bell", selected: "bell.fill" }}
          md={{ default: "notifications", selected: "notifications" }}
        />
        <NativeTabs.Trigger.Label>Alerts</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gifts">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gift", selected: "gift.fill" }}
          md={{ default: "redeem", selected: "redeem" }}
        />
        <NativeTabs.Trigger.Label>Gifts</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}