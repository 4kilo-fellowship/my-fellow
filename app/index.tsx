import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/stores/app.store";
import { useUserStore } from "@/stores/user.store";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  const { authState } = useAuth();
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  if (authState.authenticated === null) {
    return null;
  }

  let destination: string;
  if (!hasCompletedOnboarding) {
    destination = "/onboarding";
  } else if (authState.authenticated) {
    const user = useUserStore.getState().user;
    if (user && (!user.fullName || !user.department)) {
      destination = "/(auth)/personalization";
    } else {
      destination = "/(tabs)";
    }
  } else {
    destination = "/(auth)/sign-in";
  }

  return <Redirect href={destination as any} />;
}
