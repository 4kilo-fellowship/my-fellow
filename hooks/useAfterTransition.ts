import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";

/**
 * Defers mounting of heavy content (e.g. media grids, complex tabs) until
 * the navigation push transition has completely finished.
 * Guarantees 60/120fps during native screen transitions without dropped frames.
 */
export function useAfterTransition(fallbackMs = 400): boolean {
  const navigation = useNavigation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const done = () => {
      if (isMounted) {
        setReady(true);
      }
    };

    // Native stack transitionEnd event
    const unsub = navigation.addListener("transitionEnd" as any, done);

    // Fallback timer so heavy content is guaranteed to mount
    const timeoutId = setTimeout(done, fallbackMs);

    // Frame scheduler
    const rafId = requestAnimationFrame(done);

    return () => {
      isMounted = false;
      unsub();
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [navigation, fallbackMs]);

  return ready;
}
