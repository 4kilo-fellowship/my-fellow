import { useTheme } from "@/context/ThemeContext";
import React, { memo } from "react";
import { DimensionValue, StyleSheet, View } from "react-native";

interface PlaceholderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: any;
}

export const Placeholder = memo(
  ({ width, height, borderRadius, style }: PlaceholderProps) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
      <View
        style={[
          styles.placeholder,
          {
            width: width || "100%",
            height: height || 20,
            borderRadius: borderRadius || 8,
            backgroundColor: isDark ? "#2a2a2b" : "#f0f0f0",
          },
          style,
        ]}
      />
    );
  },
);

const styles = StyleSheet.create({
  placeholder: {},
});
