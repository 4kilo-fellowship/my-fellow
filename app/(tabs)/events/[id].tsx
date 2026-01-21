import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

// Redirect tab-scoped detail routes to the stack-level event detail.
export default function RedirectToStack() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace({
        pathname: "/events/[id]",
        params: { id: String(id) },
      } as any);
    }
  }, [id, router]);

  return <View />;
}
