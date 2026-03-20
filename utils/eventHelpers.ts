import { API_URL } from "@/constants";
import { Linking } from "react-native";

export const formatEventDate = (startDate?: string | null, endDate?: string | null) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  if (!endDate) {
    return start.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  }
  const end = new Date(endDate);
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  }
  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
};

export const formatEventTime = (startDate?: string | null) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return start.toLocaleTimeString(undefined, options);
};

export const buildEventImageSource = (imgPath?: string | null) => {
  let imageSource: any = require("@/assets/images/header.png");
  if (!imgPath) return imageSource;
  if (typeof imgPath === "string") {
    if (imgPath.startsWith("http")) {
      return { uri: imgPath };
    }
    const baseUrl = API_URL.replace(/\/api\/?$/, "");
    const cleanPath = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
    return { uri: `${baseUrl}${cleanPath}` };
  }
  return imageSource;
};

export const isEventFull = (ev: any) => {
  return (
    ev?.registrationLimit !== null &&
    ev?.registrationLimit !== undefined &&
    (ev?.registrationsCount || 0) >= ev?.registrationLimit
  );
};

export const getEventDisplayLabel = (params: {
  ev: any;
  ctaLabel: string;
  isRegisterCta: boolean;
  isRegisteredForThisEvent: boolean;
}) => {
  const { ev, ctaLabel, isRegisterCta, isRegisteredForThisEvent } = params;
  const isFullFlag = isEventFull(ev);
  if (isRegisterCta && isRegisteredForThisEvent) return "Already Registered";
  if (isFullFlag && isRegisterCta) return "Event Full";
  return ctaLabel;
};

export const createEventActions = (args: {
  ev: any;
  ctaLabel: string;
  authState: any;
  addAlert: (arg: any) => Promise<any> | any;
  registerForEvent: (arg: any) => Promise<any>;
  unregisterFromEvent: (arg: any) => Promise<any>;
  router: any;
  showInfoModalFn: (title: string, message: string, type?: "success" | "error" | "info") => void;
  setModalVisible: (v: boolean) => void;
  setSignInModalVisible: (v: boolean) => void;
  setUnregisterModalVisible: (v: boolean) => void;
  setShowSuccessModal: (v: boolean) => void;
  setShowOfflineToaster: (v: boolean) => void;
}) => {
  const {
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
  } = args;

  const handleCta = async () => {
    const text = ctaLabel.toLowerCase().trim();
    if (text.includes("register") || text.includes("join")) {
      if (!authState.authenticated) {
        setSignInModalVisible(true);
        return;
      }
      if (ev && ev._id && ev._id in ({} as any)) {
      }
      if (isEventFull(ev)) {
        showInfoModalFn(
          "Event Full",
          "We're sorry, this event has reached its maximum capacity. Please check back later or join our future events.",
          "info",
        );
        return;
      }
      setModalVisible(true);
      return;
    }

    if (text.includes("notify")) {
      if (!ev?.startDate) {
        showInfoModalFn("Warning", "Program time not available for notification.", "info");
        return;
      }
      await addAlert({ title: ev.title, description: ev.shortDescription || "Event notification", time: ev.startDate, repeats: "none", remindBefore: 15 });
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
      showInfoModalFn("Success", "You have successfully registered for the event", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Registration failed";
      if (err.message === "Network Error" || err.code === "ERR_NETWORK" || !err.response) {
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
      showInfoModalFn("Success", "You have successfully unregistered from the event", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Unregistration failed";
      showInfoModalFn("Error", message, "error");
    }
  };

  return { handleCta, onConfirmRegistration, onConfirmUnregistration };
};
