import {
  ConfirmModal,
  ConnectionToaster,
  InfoModal,
  RegistrationModal,
  ReminderSheet,
} from "@/components";
import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useReminder, ReminderTarget } from "@/notifications";
import { useAlerts } from "@/hooks/useAlerts";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { eventsService } from "@/services/eventsService";
import { useEventsStore } from "@/stores/events.store";

import { EventDetail } from "@/types";
import {
  buildEventImageSource,
  createEventActions,
  formatEventDate,
  formatEventTime,
  getEventDisplayLabel,
} from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function EventDetails() {
  const params = useLocalSearchParams<{
    id?: string;
    initialImage?: string;
    initialTitle?: string;
    initialStartDate?: string;
    initialEndDate?: string;
    initialLocation?: string;
    initialDescription?: string;
    initialButtonText?: string;
  }>();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pulse = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  const id = params.id as string | undefined;

  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);

  const {
    registerForEvent,
    unregisterFromEvent,
    togglePublishEvent,
    registering,
    unregistering,
    registeredEvents,
    checkRegistrationStatus,
  } = useEventsStore((s: any) => ({
    registerForEvent: s.registerForEvent,
    unregisterFromEvent: s.unregisterFromEvent,
    togglePublishEvent: s.togglePublishEvent,
    registering: s.registering,
    unregistering: s.unregistering,
    registeredEvents: s.registeredEvents,
    checkRegistrationStatus: s.checkRegistrationStatus,
  }));

  const isAdmin = useIsAdmin();
  const [togglingPublish, setTogglingPublish] = useState(false);

  const isRegisteredForThisEvent = id ? !!registeredEvents[id] : false;

  const { addAlert } = useAlerts();

  const { authState } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [unregisterModalVisible, setUnregisterModalVisible] = useState(false);
  const [showOfflineToaster, setShowOfflineToaster] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });
  //
  const showInfoModalFn = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "info" = "info",
    ) => {
      setInfoModal({ visible: true, title, message, type });
    },
    [],
  );

  const startAnimations = useCallback(() => {
    fadeIn.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [fadeIn, pulse]);

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.15]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0]),
  }));

  const containerFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const fetchEventById = useCallback(
    async (eventId: string) => {
      setLoadingDetail(true);
      setError(null);
      setIsNetworkError(false);
      try {
        const data = await eventsService.fetchEventById(eventId);
        setSelectedEvent(data);
      } catch (err: any) {
        const isOffline =
          err.message === "Network Error" ||
          err.code === "ERR_NETWORK" ||
          !err.response;
        setIsNetworkError(isOffline);
        setError(err.message || "Something went wrong.");
        if (isOffline) startAnimations();
      } finally {
        setLoadingDetail(false);
      }
    },
    [startAnimations],
  );

  useEffect(() => {
    if (id) fetchEventById(String(id));
  }, [id, fetchEventById]);

  useEffect(() => {
    if (selectedEvent && authState?.authenticated) {
      const eventId = (selectedEvent as any)._id;
      if (eventId) {
        checkRegistrationStatus(eventId);
      }
    }
  }, [selectedEvent, authState?.authenticated, checkRegistrationStatus]);

  const ev: any = selectedEvent;
  const imgPath = ev?.image || ev?.imageUrl || params.initialImage;
  const imageSource = buildEventImageSource(imgPath);

  const handleBack = () => {
    router.back();
  };

  const ctaLabel = ev?.buttonText || "Register Now";

  const isRegisterCta =
    ctaLabel.toLowerCase().trim().includes("register") ||
    ctaLabel.toLowerCase().trim().includes("join");

  const isCapacityFull =
    ev?.registrationLimit !== null &&
    ev?.registrationLimit !== undefined &&
    (ev?.registrationsCount || 0) >= ev?.registrationLimit;

  const isEventUnpublished = ev?.isPublished === false;

  const displayLabel = getEventDisplayLabel({
    ev,
    ctaLabel,
    isRegisterCta,
    isRegisteredForThisEvent,
  });

  const buttonDisabled =
    registering ||
    unregistering ||
    (!isRegisteredForThisEvent && isRegisterCta && (isCapacityFull || isEventUnpublished));

  const isNotifyCta =
    ctaLabel.toLowerCase().trim().includes("notify") ||
    displayLabel.toLowerCase().trim().includes("notify");

  const reminderTarget: ReminderTarget = useMemo(
    () => ({
      eventId: String(ev?._id || ev?.id || id || ""),
      title: ev?.title || "Fellowship Event",
      startsAt: new Date(ev?.startDate || ev?.time || Date.now()).getTime(),
      url: `events/${ev?._id || ev?.id || id}`,
      shortDescription: ev?.shortDescription,
    }),
    [ev, id],
  );

  const reminder = useReminder(reminderTarget);

  const isExpired = ev?.endDate ? new Date(ev.endDate) < new Date() : false;

  const isButtonDisabled =
    isExpired ||
    buttonDisabled ||
    (isNotifyCta &&
      (reminder.status === "unavailable" || reminder.status === "loading"));

  const isClicked =
    (isRegisterCta && isRegisteredForThisEvent) ||
    (isNotifyCta && reminder.status === "active");

  const resolvedDisplayLabel = isExpired
    ? "Event Ended"
    : isNotifyCta
    ? reminder.status === "active"
      ? "Reminder Set"
      : reminder.status === "permission"
      ? "Enable notifications"
      : displayLabel
    : !isRegisteredForThisEvent && isRegisterCta && isCapacityFull
    ? "Registration Full"
    : !isRegisteredForThisEvent && isRegisterCta && isEventUnpublished
    ? "Registration Closed"
    : displayLabel;

  const handleTogglePublish = async () => {
    if (!ev || togglingPublish) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setTogglingPublish(true);
      const eventId = ev._id || ev.id;
      const updated = await togglePublishEvent(eventId);
      if (updated) {
        setSelectedEvent(updated);
        showInfoModalFn(
          updated.isPublished !== false ? "Event Published" : "Event Unpublished",
          updated.isPublished !== false
            ? "This event is now publicly visible to fellowship members."
            : "This event is now unpublished. Only administrators can track it.",
          "success",
        );
      }
    } catch {
      showInfoModalFn(
        "Update Failed",
        "Could not update event visibility.",
        "error",
      );
    } finally {
      setTogglingPublish(false);
    }
  };

  const handleShare = async () => {
    if (!ev || isSharing) return;
    setIsSharing(true);
    try {
      const eventId = ev._id || ev.id;
      const eventLink = Linking.createURL(`events/${eventId}`);
      const shareMessage = `🔥 ${ev.title}\n\n${ev.shortDescription || ""}\n\n👉 View event: ${eventLink}\n\n#MyFellow #AAUECSF`;

      await Share.share(
        {
          title: ev.title,
          message: shareMessage,
          url: eventLink,
        },
        {
          dialogTitle: `Share ${ev.title}`,
        },
      );
    } catch (error: any) {
      console.error("Error sharing event:", error);
      showInfoModalFn(
        "Sharing Failed",
        "Could not share the event. Please try again.",
        "error",
      );
    } finally {
      setIsSharing(false);
    }
  };

  const { handleCta, onConfirmRegistration, onConfirmUnregistration } =
    createEventActions({
      ev,
      ctaLabel,
      authState,
      addAlert,
      registerForEvent,
      unregisterFromEvent,
      router,
      showInfoModalFn,
      setModalVisible,
      setSignInModalVisible,
      setUnregisterModalVisible,
      setShowSuccessModal,
      setShowOfflineToaster,
      isRegisteredForThisEvent,
    });

  if (loadingDetail) {
    const pulseOpacity = { opacity: 0.5 };
    return (
      <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
        <StatusBar style="light" />

        {/* Hero Header Skeleton */}
        <View className="h-[45vh] w-full relative bg-gray-200 dark:bg-[#27272a] overflow-hidden">
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", isDark ? "rgba(26,26,27,0.9)" : "rgba(255,255,255,0.95)"]}
            className="absolute inset-0 z-10"
          />

          {/* Back Button Header */}
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="absolute left-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center z-20"
            style={{ top: top + 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Hero Bottom Information Placeholder */}
          <View className="absolute bottom-6 left-5 right-5 z-20">
            {/* Tag & Date Row */}
            <View className="flex-row items-center mb-3">
              <View
                style={{
                  width: 54,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: isDark ? "rgba(255, 103, 25, 0.4)" : "#ff6719",
                  opacity: 0.7,
                }}
              />
              <View
                style={{
                  width: 90,
                  height: 16,
                  borderRadius: 4,
                  marginLeft: 10,
                  backgroundColor: isDark ? "#3f3f46" : "#cbd5e1",
                }}
              />
            </View>

            {/* Title Placeholder */}
            <View
              style={{
                width: "75%",
                height: 28,
                borderRadius: 6,
                backgroundColor: isDark ? "#3f3f46" : "#cbd5e1",
                marginBottom: 10,
              }}
            />
            {/* Time Placeholder */}
            <View
              style={{
                width: "40%",
                height: 16,
                borderRadius: 4,
                backgroundColor: isDark ? "#3f3f46" : "#cbd5e1",
              }}
            />
          </View>
        </View>

        {/* Content Body Placeholder */}
        <View
          className={`flex-1 -mt-6 rounded-t-3xl px-6 pt-8 ${
            isDark ? "bg-[#1A1A1B]" : "bg-white"
          }`}
        >
          {/* Section title */}
          <View
            style={{
              width: 140,
              height: 20,
              borderRadius: 6,
              backgroundColor: isDark ? "#27272a" : "#e2e8f0",
              marginBottom: 14,
            }}
          />

          {/* Description lines */}
          <View
            style={{
              width: "100%",
              height: 14,
              borderRadius: 4,
              backgroundColor: isDark ? "#27272a" : "#f1f5f9",
              marginBottom: 10,
            }}
          />
          <View
            style={{
              width: "92%",
              height: 14,
              borderRadius: 4,
              backgroundColor: isDark ? "#27272a" : "#f1f5f9",
              marginBottom: 10,
            }}
          />
          <View
            style={{
              width: "60%",
              height: 14,
              borderRadius: 4,
              backgroundColor: isDark ? "#27272a" : "#f1f5f9",
              marginBottom: 24,
            }}
          />

          {/* Location box skeleton */}
          <View
            style={{
              width: "100%",
              height: 64,
              borderRadius: 14,
              backgroundColor: isDark ? "#27272a" : "#f8fafc",
              borderWidth: 1,
              borderColor: isDark ? "#3f3f46" : "#e2e8f0",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? "#3f3f46" : "#e2e8f0",
              }}
            />
            <View style={{ flex: 1, gap: 6 }}>
              <View
                style={{
                  width: 70,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: isDark ? "#3f3f46" : "#cbd5e1",
                }}
              />
              <View
                style={{
                  width: 130,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: isDark ? "#3f3f46" : "#e2e8f0",
                }}
              />
            </View>
          </View>

          {/* Action Button Skeleton at the bottom */}
          <View
            style={{
              marginTop: "auto",
              marginBottom: Math.max(bottom, 20) + 12,
              width: "100%",
              height: 52,
              borderRadius: 26,
              backgroundColor: isDark ? "#27272a" : "#e2e8f0",
            }}
          />
        </View>
      </View>
    );
  }

  if (error && isNetworkError) {
    return (
      <View
        style={[
          offlineStyles.container,
          { backgroundColor: isDark ? "#1A1A1B" : "#ffffff" },
        ]}
      >
        <Animated.View style={[offlineStyles.content, containerFadeStyle]}>
          <View style={offlineStyles.illustrationContainer}>
            <Animated.View style={[offlineStyles.pulseRing, pulseRingStyle]} />
            <View style={offlineStyles.imageWrapper}>
              <Image
                source={require("@/assets/images/no-internet.jpg")}
                style={offlineStyles.illustration}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text
            style={[
              offlineStyles.title,
              { color: isDark ? "#ffffff" : "#1e293b" },
            ]}
          >
            No Connection
          </Text>
          <Text
            style={[
              offlineStyles.message,
              { color: isDark ? "#94a3b8" : "#94a3b8" },
            ]}
          >
            Connect to the internet to view{"\n"}details for this event.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => id && fetchEventById(id)}
            disabled={loadingDetail}
            style={[offlineStyles.button, loadingDetail && { opacity: 0.6 }]}
          >
            <Text style={offlineStyles.buttonText}>
              {loadingDetail ? "Checking..." : "Try Again"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBack} style={{ marginTop: 16 }}>
            <Text
              style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 15 }}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className={`flex-1 items-center justify-center px-6 ${
          isDark ? "bg-[#1A1A1B]" : "bg-gray-50"
        }`}
      >
        <Ionicons name="alert-circle-outline" size={64} color="#ff6619" />
        <Text
          className={`text-lg font-bold mt-4 text-center ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Something went wrong
        </Text>
        <Text
          className={`text-base text-center mt-2 mb-6 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => id && fetchEventById(id)}
          className="bg-[#ff6619] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack} className="mt-4">
          <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!ev) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-[#1A1A1B]" : "bg-gray-50"
        }`}
      >
        <Text className={isDark ? "text-white" : "text-gray-900"}>
          Event not found
        </Text>
        <TouchableOpacity onPress={handleBack} className="mt-4">
          <Text className="text-[#ff6719] font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style="light" />

      <View className="h-[45vh] w-full relative">
        <ExpoImage
          source={imageSource}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          transition={150}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.8)"]}
          className="absolute inset-0"
        />

        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          className="absolute left-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center z-20"
          style={{ top: top + 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => router.push(`/events/manage?id=${ev._id || ev.id}`)}
            activeOpacity={0.7}
            className="absolute right-16 w-10 h-10 rounded-full bg-black/40 items-center justify-center z-20"
            style={{ top: top + 10 }}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.7}
          disabled={isSharing}
          className="absolute right-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center z-20"
          style={{ top: top + 10 }}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="share-social" size={22} color="#fff" />
          )}
        </TouchableOpacity>

        <View className="absolute bottom-6 left-5 right-5">
          <View className="flex-row items-center mb-2">
            <View
              className="px-2.5 py-1 rounded-md mr-2"
              style={{ backgroundColor: PRIMARY }}
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wider">
                Event
              </Text>
            </View>
            {ev.startDate && (
              <Text className="text-gray-300 font-medium text-sm">
                {formatEventDate(ev?.startDate, ev?.endDate)}
              </Text>
            )}
          </View>

          <Text className="text-white text-3xl font-extrabold leading-tight shadow-sm">
            {ev.title}
          </Text>

          {ev.startDate && (
            <View className="flex-row items-center mt-2">
              <Ionicons
                name="time-outline"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
              <Text className="text-gray-200 ml-1.5 font-medium">
                {formatEventTime(ev?.startDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        className={`flex-1 -mt-6 rounded-t-3xl px-6 pt-8 ${
          isDark ? "bg-[#1A1A1B]" : "bg-white"
        }`}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Math.max(bottom, 24) + 16,
          }}
        >
          <View style={{ flex: 1 }}>
            {/* Admin Management & Registration Tracking Card */}
            {isAdmin && (
              <View
                style={{
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 20,
                  backgroundColor: isDark ? "#202022" : "#f8fafc",
                  borderWidth: 1.5,
                  borderColor: isDark ? "#2e2e32" : "#e2e8f0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="shield-checkmark" size={16} color={PRIMARY} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                        color: PRIMARY,
                      }}
                    >
                      Admin Controls
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                      backgroundColor:
                        ev.isPublished !== false
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: ev.isPublished !== false ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {ev.isPublished !== false ? "PUBLISHED" : "UNPUBLISHED"}
                    </Text>
                  </View>
                </View>

                {/* Capacity & Registrations Counter */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: isDark ? "#2e2e32" : "#e2e8f0",
                    marginVertical: 4,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: isDark ? "#9ca3af" : "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Registered Attendees
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: isDark ? "#ffffff" : "#0f172a",
                        marginTop: 2,
                      }}
                    >
                      {ev.registrationsCount || 0}
                      <Text style={{ fontSize: 13, color: isDark ? "#71717a" : "#94a3b8", fontWeight: "600" }}>
                        {" "}
                        / {ev.registrationLimit ? `${ev.registrationLimit} max` : "unlimited"}
                      </Text>
                    </Text>
                  </View>

                  {ev.autoUnpublished && (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#fef3c7",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: isDark ? "#fbbf24" : "#b45309",
                        }}
                      >
                        {isExpired ? "Auto-Unpublished (Expired)" : "Auto-Unpublished (Limit)"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Quick Admin Actions: Toggle Publish & Edit */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <Pressable
                    onPress={handleTogglePublish}
                    disabled={togglingPublish}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor:
                        ev.isPublished !== false
                          ? isDark
                            ? "rgba(239, 68, 68, 0.15)"
                            : "#fee2e2"
                          : isDark
                          ? "rgba(34, 197, 94, 0.15)"
                          : "#dcfce7",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    {togglingPublish ? (
                      <ActivityIndicator size="small" color={PRIMARY} />
                    ) : (
                      <>
                        <Ionicons
                          name={
                            ev.isPublished !== false
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          size={16}
                          color={ev.isPublished !== false ? "#ef4444" : "#16a34a"}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: ev.isPublished !== false ? "#ef4444" : "#16a34a",
                          }}
                        >
                          {ev.isPublished !== false ? "Unpublish Event" : "Publish Event"}
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => router.push(`/events/manage?id=${ev._id || ev.id}`)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: isDark ? "#27272a" : "#e2e8f0",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    <Ionicons name="pencil" size={14} color={isDark ? "#ffffff" : "#0f172a"} />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isDark ? "#ffffff" : "#0f172a",
                      }}
                    >
                      Edit
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Non-admin Expired / Ended Notice */}
            {!isAdmin && isExpired && (
              <View
                style={{
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 16,
                  backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#fee2e2",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(239, 68, 68, 0.25)" : "#fecaca",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="information-circle" size={20} color="#ef4444" />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: "600",
                    color: isDark ? "#fca5a5" : "#b91c1c",
                    lineHeight: 18,
                  }}
                >
                  This event has ended and is no longer accepting new registrations.
                </Text>
              </View>
            )}

            {/* Non-admin Capacity / Closed Notice */}
            {!isAdmin && isCapacityFull && !isRegisteredForThisEvent && (
              <View
                style={{
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 16,
                  backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#fee2e2",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(239, 68, 68, 0.25)" : "#fecaca",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: "600",
                    color: isDark ? "#fca5a5" : "#b91c1c",
                    lineHeight: 18,
                  }}
                >
                  Registration for this event is currently full ({ev.registrationLimit} attendees limit reached).
                </Text>
              </View>
            )}

            <View className="mb-6">
              <Text
                className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                About this Event
              </Text>
              <Text
                className={`text-base leading-7 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                {ev.fullDescription ||
                  ev.shortDescription ||
                  ev.description ||
                  "No description available for this event."}
              </Text>
            </View>

            {ev.location && (
              <View
                className={`p-4 rounded-xl border mb-6 flex-row items-start ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Ionicons name="location" size={20} color="#0369A1" />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-bold text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Location
                  </Text>
                  <Text
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {ev.location}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Button at the very bottom of the event page */}
          <TouchableOpacity
            activeOpacity={1}
            disabled={isButtonDisabled}
            onPress={() => {
              if (isExpired) {
                Alert.alert("Event Ended", "This event has already ended. Registration and reminders are closed.");
                return;
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              if (isNotifyCta) {
                if (reminder.status === "active") {
                  reminder.openSheet();
                } else if (reminder.status === "permission") {
                  reminder.openNotificationSettings();
                } else {
                  reminder.enable();
                }
              } else {
                handleCta();
              }
            }}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 26,
              marginTop: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: isClicked ? "transparent" : isExpired ? (isDark ? "#3f3f46" : "#cbd5e1") : PRIMARY,
              borderWidth: isClicked ? 1.5 : 0,
              borderColor: isClicked
                ? isDark
                  ? "#52525b"
                  : "#cbd5e1"
                : "transparent",
              opacity: isButtonDisabled ? 0.65 : 1,
              shadowColor: isClicked ? "transparent" : PRIMARY,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isClicked ? 0 : 0.3,
              shadowRadius: 6,
              elevation: isClicked ? 0 : 3,
            }}
          >
            {registering || unregistering || (isNotifyCta && reminder.status === "loading") ? (
              <ActivityIndicator color={isClicked ? (isDark ? "#a1a1aa" : "#64748b") : "white"} size="small" />
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    letterSpacing: -0.2,
                    color: isClicked
                      ? isDark
                        ? "#a1a1aa"
                        : "#64748b"
                      : "#ffffff",
                    includeFontPadding: false,
                    textAlignVertical: "center",
                  }}
                >
                  {resolvedDisplayLabel}
                </Text>
                {isRegisterCta && isRegisteredForThisEvent ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={isDark ? "#4ade80" : "#16a34a"}
                  />
                ) : isNotifyCta ? (
                  <Ionicons
                    name={
                      reminder.status === "active"
                        ? "notifications"
                        : reminder.status === "permission"
                        ? "notifications-off-outline"
                        : "notifications-outline"
                    }
                    size={20}
                    color={
                      isClicked
                        ? isDark
                          ? "#a1a1aa"
                          : "#64748b"
                        : "white"
                    }
                  />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color="white" />
                )}
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
      <RegistrationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={onConfirmRegistration}
        loading={registering}
        eventTitle={ev?.title || ""}
        eventDate={ev?.startDate ? formatEventDate(ev.startDate, ev.endDate) : undefined}
        location={ev?.location}
        isDark={isDark}
      />

      {isNotifyCta && (
        <ReminderSheet
          visible={reminder.isSheetOpen}
          target={reminderTarget}
          activeOffsets={reminder.offsets}
          onToggleOffset={reminder.toggleOffset}
          onDisableAll={reminder.disable}
          onClose={reminder.closeSheet}
          isDark={isDark}
        />
      )}

      <ConfirmModal
        visible={signInModalVisible}
        onClose={() => setSignInModalVisible(false)}
        isDark={isDark}
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
        }}
      />

      <InfoModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Alert Set"
        message="We'll notify you 15 minutes before the program starts."
        type="success"
        isDark={isDark}
      />

      <ConnectionToaster
        visible={showOfflineToaster}
        onHide={() => setShowOfflineToaster(false)}
      />

      <ConfirmModal
        visible={unregisterModalVisible}
        onClose={() => setUnregisterModalVisible(false)}
        isDark={isDark}
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
        }}
      />

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </View>
  );
}

const offlineStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  pulseRing: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: (SCREEN_WIDTH * 0.7) / 2,
    borderWidth: 2.5,
    borderColor: PRIMARY,
    opacity: 0.3,
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 40,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 52,
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
