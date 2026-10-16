export interface FormattedAlert {
  title: string;
  message: string;
}

/**
 * Formats various error shapes (AxiosError, Error, string, etc.)
 * into short, platform-native messages matching Expo native UI guidelines.
 */
export function formatErrorMessage(
  error: unknown,
  fallbackMessage: string = "Something went wrong. Try again."
): FormattedAlert {
  if (!error) {
    return { title: "Error", message: fallbackMessage };
  }

  let raw = "";
  if (typeof error === "string") {
    raw = error;
  } else if (typeof error === "object" && error !== null) {
    const err = error as any;
    raw =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      err.code ||
      "";
  }

  const lower = raw.toLowerCase();

  // 1. Network / Connection errors
  if (
    lower.includes("network") ||
    lower.includes("econnrefused") ||
    lower.includes("econnaborted") ||
    lower.includes("timeout") ||
    lower.includes("failed to connect") ||
    lower.includes("no internet") ||
    lower.includes("err_network") ||
    lower.includes("offline")
  ) {
    return {
      title: "Network Error",
      message: "Connection failed. Try again.",
    };
  }

  // 2. Invalid phone number
  if (
    lower.includes("phone number format") ||
    lower.includes("valid phone") ||
    lower.includes("invalid phone") ||
    lower.includes("must start with 09") ||
    lower.includes("digits entered")
  ) {
    return {
      title: "Invalid Phone Number",
      message: "Please enter a valid phone number.",
    };
  }

  // 3. Invalid credentials / sign in failure
  if (
    lower.includes("invalid phone number or password") ||
    lower.includes("invalid password") ||
    lower.includes("wrong password") ||
    lower.includes("user not found") ||
    lower.includes("invalid credentials") ||
    lower.includes("unauthorized") ||
    (typeof error === "object" && (error as any)?.response?.status === 401)
  ) {
    return {
      title: "Sign In Failed",
      message: "Invalid phone number or password.",
    };
  }

  // 4. Phone already registered
  if (
    lower.includes("already registered") ||
    lower.includes("already exists") ||
    lower.includes("phone number already in use")
  ) {
    return {
      title: "Already Registered",
      message: "This phone number is already registered. Please sign in.",
    };
  }

  // 5. OTP / Verification code
  if (
    lower.includes("invalid otp") ||
    lower.includes("incorrect code") ||
    lower.includes("expired code") ||
    lower.includes("code is invalid")
  ) {
    return {
      title: "Invalid Code",
      message: "Incorrect verification code. Try again.",
    };
  }

  // Short and clean custom message
  if (raw && raw.length <= 60 && !raw.includes("status code") && !raw.includes("AxiosError")) {
    return {
      title: "Error",
      message: raw.endsWith(".") ? raw : `${raw}.`,
    };
  }

  return {
    title: "Error",
    message: fallbackMessage,
  };
}

/**
 * Formats success messages to be short and platform-native.
 */
export function formatSuccessMessage(
  typeOrAction: string,
  customMessage?: string
): FormattedAlert {
  const lower = typeOrAction.toLowerCase();

  if (lower.includes("phone") || lower.includes("otp") || lower.includes("verified")) {
    return {
      title: "Success",
      message: "Phone number verified.",
    };
  }

  if (lower.includes("password")) {
    return {
      title: "Success",
      message: "Password updated.",
    };
  }

  if (lower.includes("profile")) {
    return {
      title: "Success",
      message: "Profile updated.",
    };
  }

  return {
    title: "Success",
    message: customMessage || "Done.",
  };
}

/**
 * Unified alert content formatter for all message types (error, success, info).
 * Ensures titles and messages are kept short, clear, and platform-native.
 */
export function formatAlertContent(
  title?: string,
  message?: string,
  type: "success" | "error" | "info" = "info"
): FormattedAlert {
  if (type === "error") {
    const formatted = formatErrorMessage(message || title);
    return {
      title: !title || title === "Error" ? formatted.title : title,
      message: formatted.message,
    };
  }

  if (type === "success") {
    const formatted = formatSuccessMessage(title || message || "", message);
    return {
      title: !title || title === "Success" ? formatted.title : title,
      message: formatted.message,
    };
  }

  const cleanTitle = title || "Notice";
  let cleanMsg = message || "";
  if (cleanMsg.length > 90) {
    const firstSentence = cleanMsg.split(".")[0];
    cleanMsg = firstSentence ? `${firstSentence}.` : cleanMsg;
  }
  return {
    title: cleanTitle,
    message: cleanMsg,
  };
}

