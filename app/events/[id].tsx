import {
  ConfirmModal,
  ConnectionToaster,
  InfoModal,
  RegistrationModal,
} from "@/components";
import { API_URL, PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAlerts } from "@/hooks/useAlerts";
import { eventsService } from "@/services/eventsService";
import { useEventsStore } from "@/stores/events.store";

import { EventDetail } from "@/types/events.types";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
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
  const params = useLocalSearchParams();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);

  const pulse = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  const id = (params as any).id as string | undefined;

  const {
    registerForEvent,
    unregisterFromEvent,
    registering,
    unregistering,
    registeredEvents,
    checkingRegistrationMap,
    checkRegistrationStatus,
  } = useEventsStore((s: any) => ({
    registerForEvent: s.registerForEvent,
    unregisterFromEvent: s.unregisterFromEvent,
    registering: s.registering,
    unregistering: s.unregistering,
    registeredEvents: s.registeredEvents,
    checkingRegistrationMap: s.checkingRegistration,
    checkRegistrationStatus: s.checkRegistrationStatus,
  }));

  const isRegisteredForThisEvent = id ? !!registeredEvents[id] : false;
  const isCheckingThisEvent = id ? !!checkingRegistrationMap[id] : false;

  const { addAlert } = useAlerts();

  const { authState, getCurrentUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [unregisterModalVisible, setUnregisterModalVisible] = useState(false);
  const [showOfflineToaster, setShowOfflineToaster] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

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
  }, []);

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
  }, [selectedEvent, authState?.authenticated]);

  const ev: any = selectedEvent;

  const getFormattedDate = () => {
    if (!ev?.startDate) return "";
    const start = new Date(ev.startDate);
    if (!ev.endDate) {
      return start.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      });
    }
    const end = new Date(ev.endDate);
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      });
    }
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  };

  const getFormattedTime = () => {
    if (!ev?.startDate) return "";
    const start = new Date(ev.startDate);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return start.toLocaleTimeString(undefined, options);
  };

  let imageSource = require("@/assets/images/header.png");

  const imgPath = ev?.image || ev?.imageUrl;

  if (imgPath) {
    if (typeof imgPath === "string") {
      if (imgPath.startsWith("http")) {
        imageSource = { uri: imgPath };
      } else {
        const baseUrl = API_URL.replace(/\/api\/?$/, "");
        const cleanPath = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
        imageSource = { uri: `${baseUrl}${cleanPath}` };
      }
    }
  }

  const handleBack = () => {
    setIsGoingBack(true);
    router.back();
  };

  const ctaLabel = ev?.buttonText || "Register Now";

  const isRegisterCta =
    ctaLabel.toLowerCase().trim().includes("register") ||
    ctaLabel.toLowerCase().trim().includes("join");
  const buttonDisabled = registering || unregistering;
  const displayLabel =
    isRegisterCta && isRegisteredForThisEvent ? "Already Registered" : ctaLabel;

  const handleCta = async () => {
    const text = ctaLabel.toLowerCase().trim();

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
      if (!ev?.startDate) {
        showInfoModalFn(
          "Warning",
          "Program time not available for notification.",
          "info",
        );
        return;
      }

      await addAlert({
        title: ev.title,
        description: ev.shortDescription || "Event notification",
        time: ev.startDate,
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

    const url = ev?.cta_url || ev?.metadata?.cta_url || ev?.metadata?.url;
    if (url) {
      try {
        await Linking.openURL(url);
        return;
      } catch (e) {}
    }
  };

  const onConfirmRegistration = async () => {
    try {
      await registerForEvent({ eventId: ev._id || ev.id });
      setModalVisible(false);
      showInfoModalFn(
        "Success",
        "You have successfully registered for the event",
        "success",
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Registration failed";

      if (
        err.message === "Network Error" ||
        err.code === "ERR_NETWORK" ||
        !err.response
      ) {
        setShowOfflineToaster(true);
      } else {
        showInfoModalFn("Error", message, "error");
      }
    }
  };

  const onConfirmUnregistration = async () => {
    try {
      await unregisterFromEvent({ eventId: ev._id || ev.id });
      setUnregisterModalVisible(false);
      showInfoModalFn(
        "Success",
        "You have successfully unregistered from the event",
        "success",
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Unregistration failed";
      showInfoModalFn("Error", message, "error");
    }
  };

  if (loadingDetail) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-[#1A1A1B]" : "bg-gray-50"
        }`}
      >
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#ff6619"} />
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
            Connect to the internet to view{"\n"}this event's details.
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
            {isGoingBack ? (
              <ActivityIndicator
                size="small"
                color={isDark ? "#fff" : "#64748b"}
              />
            ) : (
              <Text
                style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 15 }}
              >
                Go Back
              </Text>
            )}
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
          {isGoingBack ? (
            <ActivityIndicator
              size="small"
              color={isDark ? "#fff" : "#64748b"}
            />
          ) : (
            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Go Back
            </Text>
          )}
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
          {isGoingBack ? (
            <ActivityIndicator size="small" color="#ff6719" />
          ) : (
            <Text className="text-[#ff6719] font-bold">Go Back</Text>
          )}
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
          transition={300}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.8)"]}
          className="absolute inset-0"
        />

        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          className="absolute left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
          style={{ top: top + 10 }}
        >
          {isGoingBack ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-back" size={24} color="#fff" />
          )}
        </TouchableOpacity>

        <View className="absolute bottom-6 left-5 right-5">
          <View className="flex-row items-center mb-2">
            <View className="bg-[#ff6619] px-2.5 py-1 rounded-md mr-2">
              <Text className="text-white text-xs font-bold uppercase tracking-wider">
                Event
              </Text>
            </View>
            {ev.startDate && (
              <Text className="text-gray-300 font-medium text-sm">
                {getFormattedDate()}
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
                {getFormattedTime()}
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
          contentContainerStyle={{ paddingBottom: 100 }}
        >
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
        </ScrollView>
      </View>

      <View
        className={`absolute bottom-0 left-0 right-0 px-6 pt-4 border-t ${
          isDark ? "bg-[#1A1A1B] border-gray-800" : "bg-white border-gray-100"
        }`}
        style={{ paddingBottom: bottom > 0 ? bottom + 4 : 20 }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCta}
          disabled={buttonDisabled}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/30 ${buttonDisabled ? "opacity-60" : ""}`}
          style={{
            backgroundColor:
              isRegisterCta && isRegisteredForThisEvent
                ? isDark
                  ? "#27272a"
                  : "#d1d5db"
                : "#ff6619",
          }}
        >
          {registering ||
          unregistering ||
          (isRegisterCta && isCheckingThisEvent) ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text
                className={`text-lg font-bold mr-2 ${isRegisterCta && isRegisteredForThisEvent ? (isDark ? "text-gray-400" : "text-gray-500") : "text-white"}`}
              >
                {displayLabel}
              </Text>
              {isRegisterCta && isRegisteredForThisEvent ? (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={isDark ? "#4ade80" : "#16a34a"}
                />
              ) : displayLabel.toLowerCase().includes("notify") ? (
                <Ionicons name="notifications" size={20} color="white" />
              ) : (
                <Ionicons name="arrow-forward" size={20} color="white" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
      <RegistrationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={onConfirmRegistration}
        loading={registering}
        eventTitle={ev.title}
      />

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
