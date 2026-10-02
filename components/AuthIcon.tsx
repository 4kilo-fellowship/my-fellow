import { Icon as SwiftUIIcon } from "@expo/ui";
import { Host, Icon as ComposeIcon } from "@expo/ui/jetpack-compose";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { ColorValue, Platform, StyleProp, View, ViewStyle } from "react-native";

export type AuthIconName =
  | "phone"
  | "lock"
  | "eye"
  | "eye-off"
  | "person"
  | "camera"
  | "edit"
  | "add"
  | "team"
  | "department"
  | "year"
  | "chevron-down"
  | "chevron-right"
  | "telegram"
  | "checkmark-circle"
  | "close"
  // Step 2 options:
  | "book"
  | "megaphone"
  | "school"
  | "heart"
  | "video"
  | "hand"
  | "music"
  | "apps"
  | "flask"
  | "calculator"
  | "leaf"
  | "globe"
  | "server"
  | "laptop"
  | "chart"
  | "wrench"
  | "groups"
  | "ribbon";

interface IconDef {
  ios: any;
  android: any;
  web: keyof typeof MaterialIcons.glyphMap;
}

const ICON_DEFINITIONS: Record<AuthIconName, IconDef> = {
  phone: {
    ios: "phone",
    android: require("@expo/material-symbols/call.xml"),
    web: "call",
  },
  lock: {
    ios: "lock",
    android: require("@expo/material-symbols/lock.xml"),
    web: "lock",
  },
  eye: {
    ios: "eye",
    android: require("@expo/material-symbols/visibility.xml"),
    web: "visibility",
  },
  "eye-off": {
    ios: "eye.slash",
    android: require("@expo/material-symbols/visibility_off.xml"),
    web: "visibility-off",
  },
  person: {
    ios: "person",
    android: require("@expo/material-symbols/person.xml"),
    web: "person",
  },
  camera: {
    ios: "camera",
    android: require("@expo/material-symbols/photo_camera.xml"),
    web: "photo-camera",
  },
  edit: {
    ios: "pencil",
    android: require("@expo/material-symbols/edit.xml"),
    web: "edit",
  },
  add: {
    ios: "plus",
    android: require("@expo/material-symbols/add.xml"),
    web: "add",
  },
  team: {
    ios: "person.2",
    android: require("@expo/material-symbols/group.xml"),
    web: "group",
  },
  department: {
    ios: "building.2",
    android: require("@expo/material-symbols/apartment.xml"),
    web: "apartment",
  },
  year: {
    ios: "calendar",
    android: require("@expo/material-symbols/calendar_today.xml"),
    web: "calendar-today",
  },
  "chevron-down": {
    ios: "chevron.down",
    android: require("@expo/material-symbols/keyboard_arrow_down.xml"),
    web: "keyboard-arrow-down",
  },
  "chevron-right": {
    ios: "chevron.right",
    android: require("@expo/material-symbols/chevron_right.xml"),
    web: "chevron-right",
  },
  telegram: {
    ios: "paperplane",
    android: require("@expo/material-symbols/send.xml"),
    web: "send",
  },
  "checkmark-circle": {
    ios: "checkmark.circle.fill",
    android: require("@expo/material-symbols/check_circle.xml"),
    web: "check-circle",
  },
  close: {
    ios: "xmark",
    android: require("@expo/material-symbols/close.xml"),
    web: "close",
  },
  book: {
    ios: "book",
    android: require("@expo/material-symbols/book.xml"),
    web: "menu-book",
  },
  megaphone: {
    ios: "megaphone",
    android: require("@expo/material-symbols/campaign.xml"),
    web: "campaign",
  },
  school: {
    ios: "graduationcap",
    android: require("@expo/material-symbols/school.xml"),
    web: "school",
  },
  heart: {
    ios: "heart",
    android: require("@expo/material-symbols/favorite.xml"),
    web: "favorite",
  },
  video: {
    ios: "video",
    android: require("@expo/material-symbols/videocam.xml"),
    web: "videocam",
  },
  hand: {
    ios: "hand.raised",
    android: require("@expo/material-symbols/front_hand.xml"),
    web: "pan-tool",
  },
  music: {
    ios: "music.note",
    android: require("@expo/material-symbols/music_note.xml"),
    web: "music-note",
  },
  apps: {
    ios: "square.grid.2x2",
    android: require("@expo/material-symbols/apps.xml"),
    web: "apps",
  },
  flask: {
    ios: "flask",
    android: require("@expo/material-symbols/science.xml"),
    web: "science",
  },
  calculator: {
    ios: "function",
    android: require("@expo/material-symbols/calculate.xml"),
    web: "calculate",
  },
  leaf: {
    ios: "leaf",
    android: require("@expo/material-symbols/eco.xml"),
    web: "eco",
  },
  globe: {
    ios: "globe",
    android: require("@expo/material-symbols/public.xml"),
    web: "public",
  },
  server: {
    ios: "server.rack",
    android: require("@expo/material-symbols/dns.xml"),
    web: "dns",
  },
  laptop: {
    ios: "laptopcomputer",
    android: require("@expo/material-symbols/computer.xml"),
    web: "computer",
  },
  chart: {
    ios: "chart.bar",
    android: require("@expo/material-symbols/bar_chart.xml"),
    web: "bar-chart",
  },
  wrench: {
    ios: "wrench.and.screwdriver",
    android: require("@expo/material-symbols/handyman.xml"),
    web: "handyman",
  },
  groups: {
    ios: "person.3",
    android: require("@expo/material-symbols/groups.xml"),
    web: "groups",
  },
  ribbon: {
    ios: "medal",
    android: require("@expo/material-symbols/military_tech.xml"),
    web: "military-tech",
  },
};

export interface AuthIconProps {
  name: AuthIconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}

export default function AuthIcon({
  name,
  size = 22,
  color,
  style,
}: AuthIconProps) {
  const def = ICON_DEFINITIONS[name];
  if (!def) return null;

  if (Platform.OS === "android") {
    return (
      <Host
        matchContents
        style={[
          { width: size, height: size },
          style,
        ]}
      >
        <ComposeIcon
          source={def.android}
          size={size}
          tint={color}
        />
      </Host>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <MaterialIcons
          name={def.web}
          size={size}
          color={(color as string) || "#000000"}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <SwiftUIIcon name={def.ios} size={size} color={color} />
    </View>
  );
}
