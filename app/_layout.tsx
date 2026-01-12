import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import "./global.css";

function InitialLayout() {
  const { authState } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // --- TEMPORARILY DISABLED FOR DEVELOPMENT ---
  // This useEffect handles the redirects based on auth status.
  // Uncomment this when you are ready to re-enable authentication.
  /* useEffect(() => {
    if (authState.authenticated === null) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (authState.authenticated && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!authState.authenticated && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [authState.authenticated, segments]);
  */

  // --- TEMPORARILY DISABLED LOADING STATE ---
  // Uncomment this when re-enabling auth to prevent flashing content while checking status.
  /*
  if (authState.authenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  */

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Ensure your app/index.tsx redirects to /(tabs) 
        or that your file structure defaults to it. 
      */}
      <Slot />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
