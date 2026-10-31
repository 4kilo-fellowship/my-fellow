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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const INDICATOR_WIDTH = 60;
const INDICATOR_HEIGHT = 40;
const INDICATOR_RADIUS = 20;
const ICON_SIZE = 24;

// Optimal Expo / Reanimated physics for gesture-driven spring transitions
const SPRING_CONFIG = {
  damping: 22,
  stiffness: 240,
  mass: 0.6,
  overshootClamping: false,
};

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
  const isHome = routeName === "index";
  const iconSize = isHome ? 26 : ICON_SIZE;

  // Profile tab: if custom photo uploaded, render clean circular avatar with border
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

  // 2. Material Design Icons on Android
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
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        android_ripple={{
          borderless: true,
          radius: 28,
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
  // Minimalist monochrome: NO primary color indicator.
  // Active indicator is deep black (#000000) with white icon (#ffffff).
  // In dark mode, clean white capsule (#ffffff) with black icon (#000000).
  const activeIconColor = isDark ? "#000000" : "#ffffff";
  const inactiveTextColor = isDark
    ? "rgba(255, 255, 255, 0.50)"
    : "rgba(0, 0, 0, 0.45)";

  const avatarUri = user?.profileImage;

  const routes = useMemo(() => state?.routes || [], [state?.routes]);
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
  const tabWidth = containerWidth > 0 && numTabs > 0 ? containerWidth / numTabs : SCREEN_WIDTH / numTabs;

  // Compute initial position for the sliding active indicator
  const initialTargetX =
    (currentIndex + 0.5) * tabWidth - INDICATOR_WIDTH / 2;

  const translateX = useSharedValue(initialTargetX);
  const startX = useSharedValue(initialTargetX);
  const isPanning = useSharedValue(false);

  // Synchronize indicator with tab index changes
  useEffect(() => {
    if (containerWidth > 0 && numTabs > 0) {
      const currentTabWidth = containerWidth / numTabs;
      const targetX =
        (currentIndex + 0.5) * currentTabWidth - INDICATOR_WIDTH / 2;

      translateX.value = withSpring(targetX, SPRING_CONFIG);
    }
  }, [currentIndex, containerWidth, numTabs, translateX]);

  // Programmatically navigate to target tab index from gesture or tap
  const navigateToIndex = useCallback(
    (index: number) => {
      const targetRoute = routes[index];
      if (!targetRoute) return;
      if (currentIndex === index) return;

      triggerTabHaptic();

      const event = emitter?.emit
        ? emitter.emit({
            type: "tabPress",
            target: targetRoute.key,
            canPreventDefault: true,
          })
        : navigation?.emit?.({
            type: "tabPress",
            target: targetRoute.key,
            canPreventDefault: true,
          });

      if (!event?.defaultPrevented) {
        if (typeof navigateToTab === "function") {
          navigateToTab(targetRoute.key);
        } else if (navigation?.dispatch) {
          navigation.dispatch({
            ...CommonActions.navigate(targetRoute),
            target: state.key,
          });
        } else if (navigation?.navigate) {
          navigation.navigate(targetRoute.name);
        } else {
          const targetPath =
            targetRoute.name === "index" ? "/(tabs)" : `/(tabs)/${targetRoute.name}`;
          expoRouter.navigate(targetPath as any);
        }
      }
    },
    [routes, currentIndex, emitter, navigation, navigateToTab, state]
  );

  // Pan gesture for smooth fluid gesture movement across tabs
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      isPanning.value = true;
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      if (tabWidth <= 0) return;
      const minX = 0.5 * tabWidth - INDICATOR_WIDTH / 2;
      const maxX = (numTabs - 0.5) * tabWidth - INDICATOR_WIDTH / 2;
      const nextX = startX.value + e.translationX;
      // Fluid movement with slight edge resistance
      if (nextX < minX) {
        translateX.value = minX + (nextX - minX) * 0.2;
      } else if (nextX > maxX) {
        translateX.value = maxX + (nextX - maxX) * 0.2;
      } else {
        translateX.value = nextX;
      }
    })
    .onEnd((e) => {
      isPanning.value = false;
      if (tabWidth <= 0) return;
      // Account for flick velocity for responsive swipe switching
      const projectedX = translateX.value + e.velocityX * 0.08;
      const targetIndex = Math.min(
        Math.max(
          Math.round((projectedX + INDICATOR_WIDTH / 2 - tabWidth * 0.5) / tabWidth),
          0
        ),
        numTabs - 1
      );
      const targetX = (targetIndex + 0.5) * tabWidth - INDICATOR_WIDTH / 2;
      translateX.value = withSpring(targetX, SPRING_CONFIG);
      runOnJS(navigateToIndex)(targetIndex);
    });

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
                borderBottomColor: isDark ? "#27272a" : "#000000",
              },
            ]
          : [
              styles.androidContainer,
              {
                paddingBottom: Math.max(insets.bottom, 6),
                height: 62 + Math.max(insets.bottom, 6),
                backgroundColor: isDark ? "#121212" : "#ffffff",
                borderTopColor: isDark ? "#262626" : "#e5e7eb",
                borderBottomColor: isDark ? "#27272a" : "#000000",
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

      {/* Gesture-driven Tabs Row */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.tabsRow} onLayout={handleTabsLayout}>
          {/* Animated Sliding Minimalist Black Indicator Capsule */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slidingIndicator,
              {
                backgroundColor: isDark ? "#ffffff" : "#000000",
                borderColor: isDark ? "#ffffff" : "#000000",
              },
              indicatorAnimatedStyle,
            ]}
          />

          {/* Tab Buttons */}
          {routes.map((route: any, index: number) => {
            const descriptor = descriptors?.[route.key];
            const options = descriptor?.options || {};
            const isFocused = currentIndex === index;

            // Resolve tab label text for inactive presentation
            const label =
              options.tabBarLabel !== undefined
                ? typeof options.tabBarLabel === "function"
                  ? options.tabBarLabel({
                      focused: isFocused,
                      color: isFocused ? activeIconColor : inactiveTextColor,
                      position: "below-icon",
                      children: route.name,
                    })
                  : options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const onPress = () => {
              if (!isFocused) {
                navigateToIndex(index);
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
                accessibilityLabel={typeof label === "string" ? label : route.name}
                isDark={isDark}
              >
                {/* For inactive tabs: DO NOT show icon, display only minimal text label.
                    For active tab: show native icon inside the minimalist black indicator capsule */}
                {isFocused ? (
                  <TabIcon
                    routeName={route.name}
                    focused={isFocused}
                    color={activeIconColor}
                    avatarUri={avatarUri}
                  />
                ) : (
                  <Text
                    style={[
                      styles.inactiveLabel,
                      { color: inactiveTextColor },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                )}
              </TabBarButton>
            );
          })}
        </View>
      </GestureDetector>

      {/* Minimalist Black Bottom Line */}
      <View
        pointerEvents="none"
        style={[
          styles.bottomLine,
          {
            backgroundColor: isDark ? "#27272a" : "#000000",
          },
        ]}
      />
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
    borderBottomWidth: 1.5,
    overflow: "hidden",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  androidContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 1.5,
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
  inactiveLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: -0.1,
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
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileAvatarImg: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  bottomLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 101,
  },
});
