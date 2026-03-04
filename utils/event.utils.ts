import { API_URL } from "@/constants";

export const getImageSource = (imgPath?: string | null) => {
  if (!imgPath) {
    return require("@/assets/images/header.png");
  }

  if (typeof imgPath === "string") {
    if (imgPath.startsWith("http")) {
      return { uri: imgPath };
    } else {
      const baseUrl = API_URL.replace(/\/api\/?$/, "");
      const cleanPath = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
      return { uri: `${baseUrl}${cleanPath}` };
    }
  }

  return require("@/assets/images/header.png");
};

export const isNetworkError = (err: unknown): boolean => {
  if (!err) return false;
  const error = err as any;
  return (
    error.message === "Network Error" ||
    error.code === "ERR_NETWORK" ||
    (!error.response && error.request)
  );
};

export const normalizeError = (
  err: unknown,
  defaultMessage = "Something went wrong.",
): string => {
  if (!err) return defaultMessage;
  const error = err as any;
  return error?.response?.data?.message || error?.message || defaultMessage;
};

export const formatEventDate = (
  startDate?: string,
  endDate?: string,
): string => {
  if (!startDate) return "";
  const start = new Date(startDate);
  if (!endDate) {
    return start.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });
  }
  const end = new Date(endDate);
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });
  }
  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} - ${end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
};

export const formatEventTime = (startDate?: string): string => {
  if (!startDate) return "";
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return start.toLocaleTimeString(undefined, options);
};

import { EventCtaType } from "@/types/events.types";

export const getEventCtaType = (ctaLabel?: string): EventCtaType => {
  const text = (ctaLabel || "").toLowerCase().trim();
  if (text.includes("register") || text.includes("join")) {
    return EventCtaType.REGISTER;
  }
  if (text.includes("notify")) {
    return EventCtaType.NOTIFY;
  }
  if (text.includes("donate")) {
    return EventCtaType.DONATE;
  }
  if (text) {
    return EventCtaType.URL;
  }
  return EventCtaType.UNKNOWN;
};
