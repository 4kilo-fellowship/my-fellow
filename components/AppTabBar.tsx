import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { router as expoRouter } from "expo-router";
import { SFSymbol, SymbolView } from "expo-symbols";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const INDICATOR_WIDTH = 60;
const INDICATOR_HEIGHT = 42;
const INDICATOR_RADIUS = 21;
const ICON_SIZE = 28;

// Safe native haptic trigger
const triggerTabHaptic = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch {
    // Unsupported environment fallback
  }
};

// Check Liquid Glass availability for iOS
const checkLiquidGlassSupport = () => {
  try {
    return (
      Platform.OS === "ios" &&
      isLiquidGlassAvailable() &&
      isGlassEffectAPIAvailable()
    );
  } catch {
    return false;
  }
};

const IS_LIQUID_GLASS_SUPPORTED = checkLiquidGlassSupport();

// --- Native Platform Icons: SF Symbols on iOS, Material Design Icons on Android ---

function TabIcon({
  routeName,
  focused,
  color,
  avatarUri,
}: {
  routeName: string;
  focused: boolean;
  color: string;
  avatarUri?: string | null;
}) {
  const isIOS = Platform.OS === "ios";
  // Home icon is just a tiny bit bigger (31 vs 28)
  const isHome = routeName === "index";
  const iconSize = isHome ? 31 : ICON_SIZE;

  // Profile tab: if custom photo uploaded, render a clean single-ring circular avatar.
  // Otherwise, render the native platform person glyph — 100% consistent with other tabs, NO double border!
  if (routeName === "profile" && avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={[
          styles.profileAvatarImg,
          focused && {
            borderWidth: 2,
            borderColor: color,
          },
        ]}
      />
    );
  }

  // 1. Native Apple SF Symbols on iOS
  if (isIOS) {
    let sfName: SFSymbol = "house";
    switch (routeName) {
      case "index":
        sfName = focused ? "house.fill" : "house";
        break;
      case "devotions":
        sfName = focused ? "book.fill" : "book";
        break;
      case "community":
        sfName = focused ? "person.2.fill" : "person.2";
        break;
      case "gifts":
        sfName = focused ? "gift.fill" : "gift";
        break;
      case "profile":
        sfName = focused ? "person.fill" : "person";
        break;
      default:
        sfName = focused ? "house.fill" : "house";
    }

    return (
      <SymbolView
        name={sfName}
        size={iconSize}
        tintColor={color}
        resizeMode="scaleAspectFit"
        weight={focused ? "bold" : "medium"}
        style={{ width: iconSize, height: iconSize }}
      />
    );
  }

  // 2. Material Design Icons on Android (Matched Filled/Outline Variants)
  let materialName: keyof typeof MaterialCommunityIcons.glyphMap = "home-outline";
  switch (routeName) {
    case "index":
      materialName = focused ? "home" : "home-outline";
      break;
    case "devotions":
      materialName = focused
        ? "book-open-page-variant"
        : "book-open-page-variant-outline";
      break;
    case "community":
      materialName = focused ? "account-group" : "account-group-outline";
      break;
    case "gifts":
      materialName = focused ? "gift" : "gift-outline";
      break;
    case "profile":
      materialName = focused ? "account" : "account-outline";
      break;
    default:
      materialName = focused ? "home" : "home-outline";
  }

  return (
    <MaterialCommunityIcons
      name={materialName}
      size={iconSize}
      color={color}
    />
  );
}

// --- Stable Native Tab Button (Zero visual flash on click, zero bouncing) ---

function TabBarButton({
  focused,
  onPress,
  onLongPress,
  children,
  accessibilityLabel,
  isDark,
}: {
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.tabButtonColumn}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={accessibilityLabel}
        onPress={() => {
          triggerTabHaptic();
          onPress();
        }}
        onLongPress={onLongPress}
        hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
        android_ripple={{
          borderless: true,
          radius: 26,
          color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
        }}
        style={({ pressed }) => [
          styles.tabButtonTouchArea,
          pressed && Platform.OS === "ios" && { opacity: 0.65 },
        ]}
      >
        <View style={styles.tabPillContainer}>
          <View style={styles.tabContentCenter}>
            {children}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

// --- Main App Tab Bar Component ---

export default function AppTabBar(props: any) {
  const {
    state,
    descriptors,
    navigation,
    emitter,
    navigateToTab,
    insets: passedInsets,
  } = props || {};

  const contextInsets = useSafeAreaInsets();
  const insets = passedInsets || contextInsets;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();

  const isIOS = Platform.OS === "ios";
  // High-contrast, punchy active and inactive colors for maximum visibility
  const activeColor = isDark ? "#ffffff" : "#0f172a";
  const inactiveColor = isDark
    ? "rgba(255, 255, 255, 0.70)"
    : "rgba(15, 23, 42, 0.65)";

  const avatarUri = user?.profileImage;

  const routes = state?.routes || [];
  const numTabs = routes.length || 5;
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);

  // Measure tab bar width on layout
  const handleTabsLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      setContainerWidth(w);
    }
  }, []);

  const currentIndex = state?.index ?? 0;

  // Compute initial position for the sliding active indicator
  const initialTargetX =
    (currentIndex + 0.5) * (SCREEN_WIDTH / numTabs) - INDICATOR_WIDTH / 2;

  const translateX = useSharedValue(initialTargetX);

  useEffect(() => {
    if (containerWidth > 0 && numTabs > 0) {
      const currentTabWidth = containerWidth / numTabs;
      const targetX =
        (currentIndex + 0.5) * currentTabWidth - INDICATOR_WIDTH / 2;

      translateX.value = withSpring(targetX, {
        damping: 20,
        stiffness: 220,
        mass: 0.7,
      });
    }
  }, [currentIndex, containerWidth, numTabs, translateX]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!state || !routes.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.tabBarWrapper,
        isIOS
          ? [
              styles.iosGlassContainer,
              {
                paddingBottom: Math.max(insets.bottom, 12),
                height: 56 + Math.max(insets.bottom, 12),
                borderTopColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
              },
            ]
          : [
              styles.androidContainer,
              {
                paddingBottom: Math.max(insets.bottom, 6),
                height: 62 + Math.max(insets.bottom, 6),
                backgroundColor: isDark ? "#121212" : "#ffffff",
                borderTopColor: isDark ? "#262626" : "#e5e7eb",
              },
            ],
      ]}
    >
      {/* 100% Native Liquid Glass for iPhone */}
      {isIOS ? (
        IS_LIQUID_GLASS_SUPPORTED ? (
          <GlassView
            style={StyleSheet.absoluteFill}
            glassEffectStyle="regular"
            pointerEvents="none"
          />
        ) : (
          <BlurView
            intensity={85}
            tint={isDark ? "systemMaterialDark" : "systemMaterialLight"}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )
      ) : null}

      {/* Tabs Content Row */}
      <View style={styles.tabsRow} onLayout={handleTabsLayout}>
        {/* Animated Sliding Rounded Indicator Capsule */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slidingIndicator,
            {
              backgroundColor: isDark
                ? isIOS
                  ? "rgba(255, 255, 255, 0.16)"
                  : "rgba(255, 255, 255, 0.12)"
                : isIOS
                ? "rgba(0, 0, 0, 0.08)"
                : "rgba(0, 0, 0, 0.06)",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.22)"
                : "rgba(0, 0, 0, 0.06)",
            },
            indicatorAnimatedStyle,
          ]}
        />

        {/* Tab Buttons */}
        {routes.map((route: any, index: number) => {
          const descriptor = descriptors?.[route.key];
          const options = descriptor?.options || {};
          const isFocused = currentIndex === index;

          const onPress = () => {
            const event = emitter?.emit
              ? emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                })
              : navigation?.emit?.({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

            if (!isFocused && !event?.defaultPrevented) {
              if (typeof navigateToTab === "function") {
                navigateToTab(route.key);
              } else if (navigation?.dispatch) {
                navigation.dispatch({
                  ...CommonActions.navigate(route),
                  target: state.key,
                });
              } else if (navigation?.navigate) {
                navigation.navigate(route.name);
              } else {
                const targetPath =
                  route.name === "index" ? "/(tabs)" : `/(tabs)/${route.name}`;
                expoRouter.navigate(targetPath as any);
              }
            }
          };

          const onLongPress = () => {
            if (emitter?.emit) {
              emitter.emit({
                type: "tabLongPress",
                target: route.key,
              });
            } else if (navigation?.emit) {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            }
          };

          return (
            <TabBarButton
              key={route.key}
              focused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.title || route.name}
              isDark={isDark}
            >
              <TabIcon
                routeName={route.name}
                focused={isFocused}
                color={isFocused ? activeColor : inactiveColor}
                avatarUri={avatarUri}
              />
            </TabBarButton>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    width: "100%",
    zIndex: 100,
  },
  iosGlassContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  androidContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    zIndex: 100,
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    position: "relative",
  },
  tabButtonColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonTouchArea: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillContainer: {
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContentCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  slidingIndicator: {
    position: "absolute",
    top: "50%",
    marginTop: -INDICATOR_HEIGHT / 2,
    left: 0,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_RADIUS,
    borderWidth: 1,
    pointerEvents: "none",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  profileAvatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
