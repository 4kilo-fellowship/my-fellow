import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAppStore } from "@/stores/app.store";
import { FontAwesome5, Ionicons, Octicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "./global.css";

SplashScreen.preventAutoHideAsync();

const renderCustomToast = (
  props: any,
  type: "success" | "error" | "warning" | "info"
) => {
  const stylesMap = {
    success: {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      icon: "checkmark-circle" as const,
      iconColor: "#16a34a",
      titleColor: "#14532d",
      textColor: "#166534",
    },
    error: {
      bg: "#fef2f2",
      border: "#fecaca",
      icon: "close-circle" as const,
      iconColor: "#dc2626",
      titleColor: "#7f1d1d",
      textColor: "#991b1b",
    },
    warning: {
      bg: "#fffbeb",
      border: "#fef3c7",
      icon: "alert-circle" as const,
      iconColor: "#d97706",
      titleColor: "#78350f",
      textColor: "#92400e",
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      icon: "information-circle" as const,
      iconColor: "#2563eb",
      titleColor: "#1e3a8a",
      textColor: "#1e40af",
    },
  };

  const style = stylesMap[type];

  return (
    <View
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: "92%",
        marginHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <Ionicons
        name={style.icon}
        size={28}
        color={style.iconColor}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: style.titleColor,
            fontSize: 15,
            fontWeight: "700",
            marginBottom: 2,
          }}
        >
          {props.text1}
        </Text>
        {props.text2 ? (
          <Text
            style={{
              color: style.textColor,
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            {props.text2}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={() => Toast.hide()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ padding: 4, marginLeft: 8 }}
      >
        <Ionicons name="close" size={18} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...Octicons.font,
    ...FontAwesome5.font,
  });
  const [hasHydrated, setHasHydrated] = useState(
    useAppStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useAppStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loaded && hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated, loaded]);

  if (!loaded || !hasHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "default",
              animationDuration: 350,
              fullScreenGestureEnabled: Platform.OS === "ios",
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="index" options={{ title: "Splash" }} />
            <Stack.Screen
              name="onboarding"
              options={{ title: "Onboarding", animation: "fade" }}
            />
            <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
            <Stack.Screen name="(auth)" options={{ title: "Auth" }} />
            <Stack.Screen name="events/[id]" options={{ title: "Events" }} />
            <Stack.Screen name="teams/[id]" options={{ title: "Teams" }} />
            <Stack.Screen name="devotion/[id]" options={{ title: "Devotions" }} />
            <Stack.Screen name="leaders" options={{ title: "Leaders" }} />
            <Stack.Screen name="locations" options={{ title: "Locations" }} />
            <Stack.Screen name="programs" options={{ title: "Programs" }} />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen
              name="reminders/manage"
              options={{ title: "Manage Alert" }}
            />
            <Stack.Screen name="about" options={{ title: "About" }} />
            <Stack.Screen name="help" options={{ title: "Help & Support" }} />
            <Stack.Screen
              name="notifications"
              options={{ title: "Notifications" }}
            />
            <Stack.Screen
              name="marketplace/index"
              options={{ title: "Fellowship Store" }}
            />
            <Stack.Screen
              name="marketplace/[id]"
              options={{ title: "Product Details" }}
            />
            <Stack.Screen
              name="marketplace/orders"
              options={{ title: "My Orders" }}
            />
            <Stack.Screen name="givings" options={{ title: "My Givings" }} />
            <Stack.Screen
              name="change-password"
              options={{
                title: "Change Password",
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="edit-profile"
              options={{
                title: "Edit Profile",
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="update-phone"
              options={{
                title: "Update Phone",
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
          <Toast
            position="bottom"
            bottomOffset={40}
            config={{
              success: (props: any) => renderCustomToast(props, "success"),
              error: (props: any) => renderCustomToast(props, "error"),
              warning: (props: any) => renderCustomToast(props, "warning"),
              info: (props: any) => renderCustomToast(props, "info"),
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
