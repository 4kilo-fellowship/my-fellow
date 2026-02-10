import { PRIMARY } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useEventsStore } from "@/stores/events.store";
import { useUserStore } from "@/stores/user.store";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { InfoModal } from "../../components/Modals/InfoModal";
import RegistrationModal from "../RegistrationModal";
import SignInPromptModal from "../SignInPromptModal";

const { width } = Dimensions.get("window");

interface AnnouncementItem {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaIcon: keyof typeof Ionicons.glyphMap;
}

interface AnnouncementCardProps {
  item: AnnouncementItem;
  isDark?: boolean;
  onPress?: () => void;
}

const AnnouncementCard = ({ item, isDark, onPress }: AnnouncementCardProps) => {
  const router = useRouter();
  const { authState, getCurrentUser } = useAuth();
  const { registerForEvent, registering } = useEventsStore((s: any) => ({
    registerForEvent: s.registerForEvent,
    registering: s.registering,
  }));

  const { addAlert } = useAlerts();

  const [modalVisible, setModalVisible] = useState(false);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePrimary = async () => {
    const text = ctaText.toLowerCase().trim();

    if (text.includes("register") || text.includes("join")) {
      if (!authState.authenticated) {
        setSignInModalVisible(true);
        return;
      }
      setModalVisible(true);
      return;
    }

    if (text.includes("notify")) {
      const startTime = (item as any).startDate;
      if (!startTime) {
        Alert.alert("Warning", "Program time not available for notification.");
        return;
      }

      await addAlert({
        title: item.title,
        description: item.subtitle || "Event notification",
        time: startTime,
        repeats: "none",
        remindBefore: 15, // 15 minutes before
      });
      setShowSuccessModal(true);
      return;
    }

    if (text.includes("donate")) {
      router.push("/gifts");
      return;
    }

    // Default behavior if not matched
    onPress?.();
  };

  const onConfirmRegistration = async () => {
    try {
      const user = useUserStore.getState().user;

      if (!user) {
        setModalVisible(false);
        setSignInModalVisible(true);
        return;
      }

      const registrationData = {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        team: user.team || "",
        department: (user.department as string) || "",
        yearOfStudy: (user.yearOfStudy as string) || "",
        telegramUserName: user.telegramUserName || "",
        eventTitle: item.title,
      };

      await registerForEvent(registrationData);
      setModalVisible(false);
      Alert.alert("Success", "You have successfully registered for the event");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Registration failed";
      Alert.alert("Error", message);
    }
  };

  const imageUri = (item as any).imageUrl || null;
  const subtitleText =
    item.subtitle ||
    (item as any).shortDescription ||
    (item as any).short_description ||
    "";
  const ctaText = (item as any).cta || (item as any).buttonText || "Register";

  const [loading, setLoading] = useState(true);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      <ExpoImage
        source={
          imageUri && typeof imageUri === "string"
            ? imageUri
            : require("@/assets/images/header.png")
        }
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        cachePolicy="memory-disk"
      />

      {loading && (
        <View
          style={[styles.skeleton, StyleSheet.absoluteFill]}
          pointerEvents="none"
        >
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX }] }]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.4)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      )}

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.01)",
          "rgba(0,0,0,0.2)",
          "rgba(0,0,0,0.55)",
          "rgba(0,0,0,0.8)",
        ]}
        locations={[0, 0.4, 0.6, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="absolute top-5 right-6 flex-row items-center"
        style={{ zIndex: 10 }}
      >
        <Text style={styles.detailsText}>LEARN MORE</Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color="white"
          style={{ opacity: 0.8, marginLeft: 2 }}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>

        <Text numberOfLines={3} style={styles.subtitle}>
          {subtitleText}
        </Text>

        <View
          style={styles.actionsRow}
          className="w-full mt-4 items-center justify-center"
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePrimary}
            accessibilityLabel={`Primary action for ${item.title}`}
            style={{ backgroundColor: PRIMARY }}
            className="w-full py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/40"
          >
            <Text className="text-white text-base font-bold mr-2">
              {ctaText}
            </Text>
            {ctaText.toLowerCase().includes("notify") ? (
              <Ionicons name="notifications" size={18} color="white" />
            ) : (
              <Ionicons name="arrow-forward" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <RegistrationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={onConfirmRegistration}
        loading={registering}
        eventTitle={item.title}
      />

      <SignInPromptModal
        visible={signInModalVisible}
        onClose={() => setSignInModalVisible(false)}
        onSignIn={() => {
          setSignInModalVisible(false);
          router.push("/(auth)/sign-in");
        }}
        message="You need to be signed in to register for events. Would you like to sign in now?"
      />

      <InfoModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Alert Set"
        message="We'll notify you 15 minutes before the program starts."
        type="success"
        isDark={!!isDark}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: 16,
    overflow: "hidden",
    borderRadius: 20,
    width: width - 48,
    height: 400,
    backgroundColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: "Poppins_900Black",
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: "Poppins_400Regular",
  },
  detailsText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: "Poppins_600SemiBold",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "600",
    marginRight: 6,
  },
  skeleton: {
    backgroundColor: "#1a1a1a",
    zIndex: -1,
    opacity: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 2,
    opacity: 0.6,
  },
});

export default AnnouncementCard;
