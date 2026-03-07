import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FontAwesome5, Ionicons, Octicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...Octicons.font,
    ...FontAwesome5.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
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
            options={{ title: "Change Password" }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ title: "Edit Profile" }}
          />
          <Stack.Screen
            name="update-phone"
            options={{ title: "Update Phone" }}
          />
        </Stack>
        <Toast
          position="bottom"
          bottomOffset={40}
          config={{
            success: (props: any) => (
              <View
                style={{
                  backgroundColor: "#ffffff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginHorizontal: 16,
                  width: "92%",
                  shadowOpacity: 0.1,
                  elevation: 5,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#18181b",
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 2,
                    }}
                  >
                    {props.text1}
                  </Text>
                  {props.text2 && (
                    <Text
                      style={{
                        color: "#71717a",
                        fontSize: 13,
                        fontWeight: "400",
                      }}
                    >
                      {props.text2}
                    </Text>
                  )}
                </View>
              </View>
            ),
            error: (props: any) => (
              <View
                style={{
                  backgroundColor: "#ffffff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginHorizontal: 16,
                  width: "92%",
                  shadowOpacity: 0.1,
                  elevation: 5,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#18181b",
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 2,
                    }}
                  >
                    {props.text1}
                  </Text>
                  {props.text2 && (
                    <Text
                      style={{
                        color: "#71717a",
                        fontSize: 13,
                        fontWeight: "400",
                      }}
                    >
                      {props.text2}
                    </Text>
                  )}
                </View>
              </View>
            ),
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}
