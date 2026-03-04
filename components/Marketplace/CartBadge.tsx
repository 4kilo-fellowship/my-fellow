import { useMarketplaceStore } from "@/stores/marketplace.store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface CartBadgeProps {
  isDark: boolean;
  onPress: () => void;
}

const CartBadge = ({ isDark, onPress }: CartBadgeProps) => {
  const count = useMarketplaceStore((s) => s.getCartCount());
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (count > 0) {
      scale.value = withSpring(1.2, { damping: 8 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [count]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count === 0) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.button, isDark ? styles.buttonDark : styles.buttonLight]}
      >
        <Ionicons name="cart" size={24} color="#fff" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#ff6719",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  buttonLight: {
    backgroundColor: "#ff6719",
  },
  buttonDark: {
    backgroundColor: "#ff6719",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
});

export default CartBadge;
