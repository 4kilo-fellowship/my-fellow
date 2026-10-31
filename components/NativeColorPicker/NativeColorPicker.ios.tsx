import React from "react";
import { Host, ColorPicker } from "@expo/ui/swift-ui";
import { StyleSheet, View } from "react-native";
import { NativeColorPickerProps } from "./types";

export function NativeColorPicker({
  color,
  onColorChange,
  label = "Custom Color",
  isDark = false,
}: NativeColorPickerProps) {
  return (
    <View style={styles.container}>
      <Host
        style={styles.host}
        colorScheme={isDark ? "dark" : "light"}
      >
        <ColorPicker
          label={label}
          selection={color}
          onSelectionChange={onColorChange}
          supportsOpacity={false}
        />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: "100%",
    justifyContent: "center",
  },
  host: {
    width: "100%",
    height: "100%",
  },
});
