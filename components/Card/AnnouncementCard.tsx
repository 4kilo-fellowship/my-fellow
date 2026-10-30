import { PRIMARY } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import React, { useCallback, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useEventsStore } from "@/stores/events.store";

import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  Share,
  StyleSheet,
  Text,
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
  const eventId = (item as any)._id || (item as any).id;
  const imageUri = (item as any).imageUrl;
  const subtitleText = (item as any).shortDescription;
  const ctaText = (item as any).buttonText;

  const {
    registerForEvent,
    unregisterFromEvent,
    registering,
    unregistering,
    registeredEvents,
    checkingRegistrationMap,
    checkRegistrationStatus,
    likedEvents,
    toggleLikeEvent,
  } = useEventsStore((s: any) => ({
    registerForEvent: s.registerForEvent,
    unregisterFromEvent: s.unregisterFromEvent,
    registering: s.registering,
    unregistering: s.unregistering,
    registeredEvents: s.registeredEvents,
    checkingRegistrationMap: s.checkingRegistration,
    checkRegistrationStatus: s.checkRegistrationStatus,
    likedEvents: s.likedEvents || {},
    toggleLikeEvent: s.toggleLikeEvent,
  }));

  const isRegisteredForThisEvent = eventId
    ? !!registeredEvents[eventId]
    : false;
  const isCheckingThisEvent = eventId
    ? !!checkingRegistrationMap[eventId]
    : false;
  const isLiked = eventId ? !!likedEvents[eventId] : false;
  const isAdmin = useIsAdmin();

  const handleAdminEdit = () => {
    if (!eventId) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    router.push(`/events/manage?id=${eventId}`);
  };

  const handleLike = () => {
    if (!eventId) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
    if (toggleLikeEvent) {
      toggleLikeEvent(eventId);
    }
  };

  const { addAlert } = useAlerts();

  const [modalVisible, setModalVisible] = useState(false);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [unregisterModalVisible, setUnregisterModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const showInfoModal = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "info" = "info",
    ) => {
      setInfoModal({ visible: true, title, message, type });
    },
    [],
  );

  const isRegisterCta =
    ctaText?.toLowerCase()?.includes("register") ||
    ctaText?.toLowerCase()?.includes("join");

  React.useEffect(() => {
    if (eventId && authState.authenticated && isRegisterCta) {
      checkRegistrationStatus(eventId);
    }
  }, [eventId, authState.authenticated, isRegisterCta]);

  const handlePrimary = async () => {
    const text = ctaText.toLowerCase().trim();

    if (text.includes("register") || text.includes("join")) {
      if (!authState.authenticated) {
        setSignInModalVisible(true);
        return;
      }
      if (isRegisteredForThisEvent) {
        setUnregisterModalVisible(true);
      } else {
        setModalVisible(true);
      }
      return;
    }

    if (text.includes("notify")) {
      const startTime = (item as any).startDate;
      if (!startTime) {
        showInfoModal(
          "Warning",
          "Program time not available for notification.",
          "info",
        );
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
      showInfoModal(
        "Success",
        "You have successfully registered for the event",
        "success",
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Registration failed";
      showInfoModal("Error", message, "error");
    }
  };

  const onConfirmUnregistration = async () => {
    try {
      await unregisterFromEvent({
        eventId: (item as any)._id || (item as any).id,
      });
      setUnregisterModalVisible(false);
      showInfoModal(
        "Success",
        "You have successfully unregistered from the event",
        "success",
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Unregistration failed";
      showInfoModal("Error", message, "error");
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const eventId = (item as any)._id || (item as any).id;
      const eventLink = Linking.createURL(`events/${eventId}`);
      const rawDate = (item as any).startDate;
      const formattedDate = rawDate
        ? new Date(rawDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : "";
      const location = (item as any).location || (item as any).venue || "AAU 4 Kilo Campus";
      
      const shareMessage = `🔥 ${item.title}${formattedDate ? `\n📅 ${formattedDate}` : ""}\n📍 ${location}\n\n${subtitleText || ""}\n\n👉 View event: ${eventLink}\n\n#MyFellow #AAUECSF`;

      if (!imageUri) {
        await Share.share({
          message: shareMessage,
        });
        return;
      }

      const filename = imageUri.split("/").pop() || "event-image.jpg";
      const localUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.createDownloadResumable(
        imageUri,
        localUri,
      ).downloadAsync();

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        await Share.share({
          message: shareMessage,
        });
        return;
      }

      await Sharing.shareAsync(localUri, {
        mimeType: "image/jpeg",
        dialogTitle: `Share ${item.title}`,
        UTI: "public.image",
      });
    } catch (error: any) {
      console.error("Error sharing image:", error);
      showInfoModal(
        "Sharing Failed",
        "Could not share the event. Please try again.",
        "error",
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#2a2a2b" : "#f0f0f0",
          width: cardWidth,
          height: cardHeight,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        android_ripple={{
          color: "rgba(255, 255, 255, 0.22)",
          borderless: false,
          foreground: true,
        }}
        style={StyleSheet.absoluteFill}
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
      </Pressable>

      <View style={styles.content} pointerEvents="box-none">
        <Text
          numberOfLines={2}
          style={[styles.title, { fontSize: titleFontSize }]}
        >
          {item.title}
        </Text>

        <Text
          numberOfLines={2}
          style={[styles.subtitle, { fontSize: subtitleFontSize }]}
        >
          {subtitleText}
        </Text>

        <View style={styles.actionsRow}>
          {/* Primary CTA button from backend */}
          <View
            style={[
              styles.primaryBtnWrap,
              {
                backgroundColor:
                  isRegisterCta && isRegisteredForThisEvent
                    ? isDark
                      ? "#27272a"
                      : "#d1d5db"
                    : PRIMARY,
              },
            ]}
          >
            <Pressable
              onPress={handlePrimary}
              disabled={
                registering ||
                unregistering ||
                (isRegisterCta && isCheckingThisEvent)
              }
              accessibilityRole="button"
              accessibilityLabel={`Primary action for ${item.title}`}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.28)",
                borderless: false,
                foreground: true,
              }}
              style={styles.primaryBtnInner}
            >
              {registering ||
              unregistering ||
              (isRegisterCta && isCheckingThisEvent) ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View style={styles.primaryBtnContent}>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.78}
                    ellipsizeMode="tail"
                    style={[
                      styles.primaryBtnText,
                      {
                        color:
                          isRegisterCta && isRegisteredForThisEvent
                            ? isDark
                              ? "#9ca3af"
                              : "#6b7280"
                            : "#ffffff",
                      },
                    ]}
                  >
                    {isRegisterCta && isRegisteredForThisEvent
                      ? "Registered"
                      : ctaText}
                  </Text>
                  {isRegisterCta && isRegisteredForThisEvent ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={isDark ? "#4ade80" : "#16a34a"}
                      style={styles.primaryBtnIcon}
                    />
                  ) : ctaText?.toLowerCase()?.includes("notify") ? (
                    <Ionicons
                      name="notifications"
                      size={17}
                      color="white"
                      style={styles.primaryBtnIcon}
                    />
                  ) : (
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color="white"
                      style={styles.primaryBtnIcon}
                    />
                  )}
                </View>
              )}
            </Pressable>
          </View>

          {/* Like Button */}
          <View style={styles.actionIconBtnWrap}>
            <Pressable
              onPress={handleLike}
              accessibilityRole="button"
              accessibilityLabel={isLiked ? "Unlike event" : "Like event"}
              android_ripple={{
                color: "rgba(239, 68, 68, 0.35)",
                borderless: false,
                foreground: true,
              }}
              style={styles.actionIconBtnInner}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#ef4444" : "#ffffff"}
              />
            </Pressable>
          </View>

          {/* Share Button */}
          <View style={styles.actionIconBtnWrap}>
            <Pressable
              onPress={handleShare}
              disabled={isSharing}
              accessibilityRole="button"
              accessibilityLabel={`Share ${item.title}`}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.28)",
                borderless: false,
                foreground: true,
              }}
              style={styles.actionIconBtnInner}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="share-social-outline" size={20} color="white" />
              )}
            </Pressable>
          </View>

          {/* Admin Edit Button */}
          {isAdmin && (
            <View style={[styles.actionIconBtnWrap, styles.adminBtnWrap as any]}>
              <Pressable
                onPress={handleAdminEdit}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${item.title}`}
                android_ripple={{
                  color: "rgba(255, 103, 25, 0.35)",
                  borderless: false,
                  foreground: true,
                }}
                style={styles.actionIconBtnInner}
              >
                <Ionicons name="pencil" size={20} color="#ff6719" />
              </Pressable>
            </View>
          )}
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

      <ConfirmModal
        visible={unregisterModalVisible}
        onClose={() => setUnregisterModalVisible(false)}
        isDark={!!isDark}
        title="Unregister"
        description="Are you sure you want to unregister from this event?"
        icon="close-circle-outline"
        iconColor="#ef4444"
        buttons={[
          {
            label: "Unregister",
            onPress: onConfirmUnregistration,
            variant: "primary",
          },
        ]}
        cancelButton={{
          label: "No, Keep it",
          onPress: () => setUnregisterModalVisible(false),
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

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={!!isDark}
      />
    </View>
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
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
    marginTop: 14,
  },
  primaryBtnWrap: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff6719",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  primaryBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
    includeFontPadding: false,
    textAlignVertical: "center",
    flexShrink: 1,
  },
  primaryBtnIcon: {
    flexShrink: 0,
  },
  actionIconBtnWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBtnWrap: {
    borderColor: "rgba(255, 103, 25, 0.45)",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  actionIconBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
