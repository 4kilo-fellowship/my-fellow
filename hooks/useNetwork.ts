import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const checkConnection = async () => {
    try {
      // Use a lightweight fetch to check for actual internet connectivity
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        mode: "no-cors",
      });
      setIsConnected(response.ok || response.type === "opaque");
    } catch (error) {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check periodically
    const interval = setInterval(checkConnection, 10000);

    // Check when app state changes (e.g., coming back from background)
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkConnection();
        }
      },
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return { isConnected, refresh: checkConnection };
}
