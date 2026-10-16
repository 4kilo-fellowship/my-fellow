import { useTheme } from "@/context/ThemeContext";
import React from "react";
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

export interface NativeRipplePressableProps extends Omit<PressableProps, "style"> {
  rippleColor?: string;
  borderRadius?: number;
  className?: string;
  isDark?: boolean;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  children: React.ReactNode;
}

/**
 * A native-feeling pressable component that provides a fully-rounded (pill capsule)
 * ripple effect on Android with generous space/padding, strictly hardware-clipped
 * to a perfect semicircular pill boundary via parent View, plus subtle native scale
 * compression on iOS.
 * When idle, background is transparent.
 */
export const NativeRipplePressable = React.forwardRef<
  any,
  NativeRipplePressableProps
>(function NativeRipplePressable(
  {
    children,
    rippleColor,
    borderRadius = 9999,
    style,
    className = "",
    isDark: isDarkProp,
    ...props
  },
  ref
) {
  let isDark = isDarkProp;
  try {
    const themeCtx = useTheme();
    if (isDark === undefined) {
      isDark = themeCtx.theme === "dark";
    }
  } catch {
    // Graceful fallback outside ThemeProvider
  }

  // Natural common ripple color (neutral subtle light/dark)
  const defaultRippleColor = isDark
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.12)";
  const activeRipple = rippleColor || defaultRippleColor;

  return (
    <View
      style={[
        styles.outer,
        { borderRadius },
        typeof style === "function" ? undefined : style,
      ]}
    >
      <Pressable
        ref={ref}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        android_ripple={{
          color: activeRipple,
          borderless: false,
          foreground: false,
        }}
        className={className}
        style={(state) => [
          styles.inner,
          {
            borderRadius,
            backgroundColor: state.pressed
              ? isDark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.08)"
              : "transparent",
          },
          Platform.OS === "ios" && state.pressed && {
            transform: [{ scale: 0.96 }],
          },
          typeof style === "function" ? style(state) : undefined,
        ]}
        {...props}
      >
        {typeof children === "function" ? children : children}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    borderRadius: 9999,
    overflow: "hidden",
  },
  inner: {
    borderRadius: 9999,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    minHeight: 38,
  },
});

export default NativeRipplePressable;
