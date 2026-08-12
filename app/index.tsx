import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/stores/app.store";
import { Redirect } from "expo-router";

export default function Index() {
  const { authState } = useAuth();
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  if (authState.authenticated === null) {
    return null;
  }

  const destination = !hasCompletedOnboarding
    ? "/onboarding"
    : authState.authenticated
      ? "/(tabs)"
      : "/(auth)/sign-up-step-1";

  return (
    <Redirect href={destination} />
  );
}
