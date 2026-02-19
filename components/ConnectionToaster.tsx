import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Animated, Text, View } from "react-native";

interface ConnectionToasterProps {
  visible: boolean;
  message?: string;
  onHide?: () => void;
  duration?: number;
}

export default function ConnectionToaster({
  visible,
  message = "No connection",
  onHide,
  duration = 3000,
}: ConnectionToasterProps) {
  const [shouldRender, setShouldRender] = React.useState(visible);
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 20,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
      if (onHide) onHide();
    });
  };

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 80,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        className="bg-[#282828] px-4 py-3 rounded-lg flex-row items-center shadow-xl"
        style={{ elevation: 5 }}
      >
        <Ionicons name="cloud-offline-outline" size={20} color="white" />
        <Text className="text-white ml-3 font-medium text-sm">{message}</Text>
      </View>
    </Animated.View>
  );
}
