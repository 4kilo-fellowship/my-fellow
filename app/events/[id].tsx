import {
  ConnectionToaster,
  InfoModal,
  RegistrationModal,
  SignInPromptModal,
} from "@/components";
import { API_URL } from "@/constants";
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
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EventDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedEvent, setSelectedEvent] = React.useState<EventDetail | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { registerForEvent, registering } = useEventsStore((s: any) => ({
    registerForEvent: s.registerForEvent,
    registering: s.registering,
  }));

  const { addAlert } = useAlerts();

  const { authState, getCurrentUser } = useAuth();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [signInModalVisible, setSignInModalVisible] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [isGoingBack, setIsGoingBack] = React.useState(false);
  const [showOfflineToaster, setShowOfflineToaster] = React.useState(false);

  const id = (params as any).id as string | undefined;

  const fetchEventById = React.useCallback(async (eventId: string) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const data = await eventsService.fetchEventById(eventId);
      setSelectedEvent(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (id) fetchEventById(String(id));
  }, [id, fetchEventById]);

  const ev: any = selectedEvent;

  useEffect(() => {}, [ev]);

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

  const ctaLabel =
    ev?.buttonText ||
    ev?.cta ||
    ev?.cta_text ||
    ev?.metadata?.cta_text ||
    ev?.button_text ||
    "Register Now";

  const handleCta = async () => {
    const text = ctaLabel.toLowerCase().trim();

    if (text.includes("register") || text.includes("join")) {
      if (!authState.authenticated) {
        setSignInModalVisible(true);
        return;
      }
      setModalVisible(true);
      return;
    }

    if (text.includes("notify")) {
      if (!ev?.startDate) {
        Alert.alert("Warning", "Program time not available for notification.");
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
      } catch (e) {
        console.warn("Failed to open url", url, e);
      }
    }
  };

  const onConfirmRegistration = async () => {
    try {
      await registerForEvent({ eventId: ev._id || ev.id });
      setModalVisible(false);
      Alert.alert("Success", "You have successfully registered for the event");
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
        Alert.alert("Error", message);
      }
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

  if (error) {
    return (
      <View
        className={`flex-1 items-center justify-center px-6 ${
          isDark ? "bg-[#1A1A1B]" : "bg-gray-50"
        }`}
      >
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={isDark ? "#ff6619" : "#ff6619"}
        />
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
                {new Date(ev.startDate).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}
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
                {new Date(ev.startDate).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
          disabled={registering}
          className={`w-full bg-[#ff6619] py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/30 ${registering ? "opacity-70" : ""}`}
        >
          {registering ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white text-lg font-bold mr-2">
                {ctaLabel}
              </Text>
              {ctaLabel.toLowerCase().includes("notify") ? (
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
        isDark={isDark}
      />

      <ConnectionToaster
        visible={showOfflineToaster}
        onHide={() => setShowOfflineToaster(false)}
      />
    </View>
  );
}
