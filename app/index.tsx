import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(tabs)"); // force tabs on app start
  }, []);

  return null; // nothing renders
}
