import * as ExpoRouter from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Linking, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAlerts } from "@/hooks/useAlerts";

import { useEventDetail } from "@/hooks/useEventDetail";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useOfflineAnimation } from "@/hooks/useOfflineAnimation";

import { EventCtaType } from "@/types/events.types";
import {
  getEventCtaType,
  isNetworkError,
  normalizeError,
} from "@/utils/event.utils";

import EventBody from "@/components/events/EventBody";
import { ErrorView, OfflineView } from "@/components/events/EventErrorViews";
import EventFooter from "@/components/events/EventFooter";
import EventHeader from "@/components/events/EventHeader";
import EventModals, { ModalState } from "@/components/events/EventModals";
import EventSkeleton from "@/components/events/EventSkeleton";

const initialModalState: ModalState = {
  registrationVisible: false,
  signInVisible: false,
  unregisterVisible: false,
  offlineVisible: false,
  info: { visible: false, title: "", message: "", type: "info" },
};

type ModalAction =
  | { type: "SHOW_REGISTRATION" }
  | { type: "HIDE_REGISTRATION" }
  | { type: "SHOW_SIGN_IN" }
  | { type: "HIDE_SIGN_IN" }
  | { type: "SHOW_UNREGISTER" }
  | { type: "HIDE_UNREGISTER" }
  | { type: "SHOW_OFFLINE" }
  | { type: "HIDE_OFFLINE" }
  | {
      type: "SHOW_INFO";
      payload: {
        title: string;
        message: string;
        type: "success" | "error" | "info";
      };
    }
  | { type: "HIDE_INFO" };

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "SHOW_REGISTRATION":
      return { ...state, registrationVisible: true };
    case "HIDE_REGISTRATION":
      return { ...state, registrationVisible: false };
    case "SHOW_SIGN_IN":
      return { ...state, signInVisible: true };
    case "HIDE_SIGN_IN":
      return { ...state, signInVisible: false };
    case "SHOW_UNREGISTER":
      return { ...state, unregisterVisible: true };
    case "HIDE_UNREGISTER":
      return { ...state, unregisterVisible: false };
    case "SHOW_OFFLINE":
      return { ...state, offlineVisible: true };
    case "HIDE_OFFLINE":
      return { ...state, offlineVisible: false };
    case "SHOW_INFO":
      return { ...state, info: { visible: true, ...action.payload } };
    case "HIDE_INFO":
      return { ...state, info: { ...state.info, visible: false } };
    default:
      return state;
  }
}

export default function EventDetails() {
  const router = ExpoRouter.useRouter();
  const { id } = ExpoRouter.useLocalSearchParams<{ id?: string }>();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { authState } = useAuth();
  const { addAlert } = useAlerts();

  const [isGoingBack, setIsGoingBack] = useState(false);
  const [modalState, dispatchModal] = useReducer(
    modalReducer,
    initialModalState,
  );

  // --- Hooks ---
  const {
    data: event,
    isLoading,
    error: fetchError,
    refetch,
  } = useEventDetail(id);

  const {
    isRegistered,
    isCheckingRegistration,
    isRegistering,
    isUnregistering,
    handleRegister,
    handleUnregister,
    checkStatus,
  } = useEventRegistration(event?._id || event?.id);

  const { startAnimations, pulseRingStyle, containerFadeStyle } =
    useOfflineAnimation();

  // --- Effects ---
  useEffect(() => {
    if (fetchError && isNetworkError(fetchError)) {
      startAnimations();
    }
  }, [fetchError, startAnimations]);

  useEffect(() => {
    if (event && authState?.authenticated) {
      checkStatus();
    }
  }, [event, authState?.authenticated, checkStatus]);

  // --- Handlers ---
  const handleBack = useCallback(() => {
    setIsGoingBack(true);
    router.back();
  }, [router]);

  const handleCtaPress = async () => {
    const ctaType = getEventCtaType(event?.buttonText);

    if (ctaType === EventCtaType.REGISTER) {
      if (!authState?.authenticated) {
        dispatchModal({ type: "SHOW_SIGN_IN" });
        return;
      }
      if (isRegistered) {
        dispatchModal({ type: "SHOW_UNREGISTER" });
      } else {
        dispatchModal({ type: "SHOW_REGISTRATION" });
      }
      return;
    }

    if (ctaType === EventCtaType.NOTIFY) {
      if (!event?.startDate) {
        dispatchModal({
          type: "SHOW_INFO",
          payload: {
            title: "Warning",
            message: "Program time not available for notification.",
            type: "info",
          },
        });
        return;
      }
      await addAlert({
        title: event.title,
        description: event.shortDescription || "Event notification",
        time: event.startDate,
        repeats: "none",
        remindBefore: 15,
      });
      dispatchModal({
        type: "SHOW_INFO",
        payload: {
          title: "Alert Set",
          message: "We'll notify you 15 minutes before the program starts.",
          type: "success",
        },
      });
      return;
    }

    if (ctaType === EventCtaType.DONATE) {
      router.push("/gifts");
      return;
    }

    const url =
      event?.cta_url || event?.metadata?.cta_url || event?.metadata?.url;
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (e) {}
    }
  };

  const onConfirmRegistration = async () => {
    try {
      await handleRegister();
      dispatchModal({ type: "HIDE_REGISTRATION" });
      dispatchModal({
        type: "SHOW_INFO",
        payload: {
          title: "Success",
          message: "You have successfully registered for the event",
          type: "success",
        },
      });
    } catch (err) {
      if (isNetworkError(err)) {
        dispatchModal({ type: "SHOW_OFFLINE" });
      } else {
        dispatchModal({
          type: "SHOW_INFO",
          payload: {
            title: "Error",
            message: normalizeError(err, "Registration failed"),
            type: "error",
          },
        });
      }
    }
  };

  const onConfirmUnregistration = async () => {
    try {
      await handleUnregister();
      dispatchModal({ type: "HIDE_UNREGISTER" });
      dispatchModal({
        type: "SHOW_INFO",
        payload: {
          title: "Success",
          message: "You have successfully unregistered from the event",
          type: "success",
        },
      });
    } catch (err) {
      dispatchModal({
        type: "SHOW_INFO",
        payload: {
          title: "Error",
          message: normalizeError(err, "Unregistration failed"),
          type: "error",
        },
      });
    }
  };

  // --- Render ---
  if (isLoading) {
    return <EventSkeleton isDark={isDark} />;
  }

  if (fetchError && isNetworkError(fetchError)) {
    return (
      <OfflineView
        isDark={isDark}
        isLoading={isLoading}
        isGoingBack={isGoingBack}
        containerFadeStyle={containerFadeStyle}
        pulseRingStyle={pulseRingStyle}
        onRetry={() => refetch()}
        onBack={handleBack}
      />
    );
  }

  if (fetchError || !event) {
    return (
      <ErrorView
        isDark={isDark}
        error={fetchError ? normalizeError(fetchError) : "Event not found"}
        isGoingBack={isGoingBack}
        onRetry={() => refetch()}
        onBack={handleBack}
      />
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style="light" />

      <EventHeader
        event={event}
        isGoingBack={isGoingBack}
        onBack={handleBack}
      />

      <EventBody event={event} isDark={isDark} />

      <EventFooter
        isDark={isDark}
        ctaLabel={event.buttonText || ""}
        isRegistered={isRegistered}
        isCheckingRegistration={isCheckingRegistration}
        isRegistering={isRegistering}
        isUnregistering={isUnregistering}
        onCtaPress={handleCtaPress}
      />

      <EventModals
        isDark={isDark}
        state={modalState}
        eventTitle={event.title}
        isRegistering={isRegistering}
        onCloseRegistration={() => dispatchModal({ type: "HIDE_REGISTRATION" })}
        onConfirmRegistration={onConfirmRegistration}
        onCloseSignIn={() => dispatchModal({ type: "HIDE_SIGN_IN" })}
        onConfirmSignIn={() => {
          dispatchModal({ type: "HIDE_SIGN_IN" });
          router.push("/(auth)/sign-in");
        }}
        onCloseUnregister={() => dispatchModal({ type: "HIDE_UNREGISTER" })}
        onConfirmUnregister={onConfirmUnregistration}
        onCloseOffline={() => dispatchModal({ type: "HIDE_OFFLINE" })}
        onCloseInfo={() => dispatchModal({ type: "HIDE_INFO" })}
      />
    </View>
  );
}
