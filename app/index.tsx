import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/stores/app.store";
import { useSignupStore } from "@/stores/signup.store";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

const signupStepRoute = {
  "signup-step-1": "/(auth)/sign-up-step-1",
  "signup-step-2": "/(auth)/sign-up-step-2",
} as const;

export default function Index() {
  const { authState } = useAuth();
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );
  const signupStep = useSignupStore((state) => state.step);
  const [signupHydrated, setSignupHydrated] = useState(
    useSignupStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsubscribe = useSignupStore.persist.onFinishHydration(() => {
      setSignupHydrated(true);
    });
    if (useSignupStore.persist.hasHydrated()) {
      setSignupHydrated(true);
    }
    return unsubscribe;
  }, []);

  if (authState.authenticated === null || !signupHydrated) {
    return null;
  }

  let destination: string;
  if (!hasCompletedOnboarding) {
    destination = "/onboarding";
  } else if (authState.authenticated) {
    destination = "/(tabs)";
  } else if (signupStep) {
    destination = signupStepRoute[signupStep];
  } else {
    destination = "/(auth)/sign-up-step-1";
  }

  return (
    <Redirect href={destination} />
  );
}
