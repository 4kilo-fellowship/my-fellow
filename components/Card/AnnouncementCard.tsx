import { PRIMARY } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useEventsStore } from "@/stores/events.store";

import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ConfirmModal } from "../../components/Modals/ConfirmModal";
import { InfoModal } from "../../components/Modals/InfoModal";
import RegistrationModal from "../RegistrationModal";

// interface ...

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
  const { width: windowWidth } = useWindowDimensions();
  const { authState, getCurrentUser } = useAuth();

  // Proportional scaling
  const cardWidth = windowWidth - 48;
  const cardHeight = Math.min(windowWidth * 1.1, 460);
  const titleFontSize = Math.min(cardWidth * 0.08, 30);
  const subtitleFontSize = Math.min(cardWidth * 0.04, 16);
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
        remindBefore: 15,
      });
      setShowSuccessModal(true);
      return;
    }

    if (text.includes("donate")) {
      router.push("/gifts");
      return;
    }

    onPress?.();
  };

  const onConfirmRegistration = async () => {
    try {
      await registerForEvent({
        eventId: (item as any)._id || (item as any).id,
      });
      setModalVisible(false);
      Alert.alert("Success", "You have successfully registered for the event");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Registration failed";
      Alert.alert("Error", message);
    }
  };

  const imageUri = (item as any).imageUrl;
  const subtitleText = (item as any).shortDescription;

  const ctaText = (item as any).buttonText;

  const handleShare = async () => {
    try {
      if (!imageUri) {
        await Share.share({
          message: `${item.title}\n\n${subtitleText}\n\nShared via My Fellow`,
        });
        return;
      }

      const filename = imageUri.split("/").pop() || "event-image.jpg";
      const localUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(imageUri, localUri);

      if (downloadResult.status !== 200) {
        throw new Error("Failed to download image");
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: "image/jpeg",
        dialogTitle: `Share ${item.title}`,
        UTI: "public.image",
      });
    } catch (error: any) {
      console.error("Error sharing image:", error);
      Alert.alert(
        "Sharing Failed",
        "Could not share the image. Please try again.",
      );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#2a2a2b" : "#f0f0f0",
          width: cardWidth,
          height: cardHeight,
        },
      ]}
    >
      <ExpoImage
        source={
          imageUri && typeof imageUri === "string"
            ? imageUri
            : require("@/assets/images/header.png")
        }
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

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

      <View
        className="absolute top-4 right-4 flex-row items-center gap-3"
        style={{ zIndex: 10 }}
      >
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full overflow-hidden items-center justify-center"
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="share-social-outline" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="px-3 h-10 rounded-full overflow-hidden flex-row items-center justify-center"
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Text className="text-white text-[10px] font-bold mr-1 tracking-widest">
            DETAILS
          </Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={2}
          style={[styles.title, { fontSize: titleFontSize }]}
        >
          {item.title}
        </Text>

        <Text
          numberOfLines={3}
          style={[styles.subtitle, { fontSize: subtitleFontSize }]}
        >
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

      <ConfirmModal
        visible={signInModalVisible}
        onClose={() => setSignInModalVisible(false)}
        isDark={!!isDark}
        title="Sign In Required"
        description="You need to be signed in to perform this action. Would you like to sign in now?"
        icon="log-in-outline"
        iconColor={PRIMARY}
        buttons={[
          {
            label: "Go to Sign In",
            onPress: () => {
              setSignInModalVisible(false);
              router.push("/(auth)/sign-in");
            },
            variant: "primary",
          },
        ]}
        cancelButton={{
          label: "Cancel",
          onPress: () => setSignInModalVisible(false),
        }}
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
});

export default AnnouncementCard;
