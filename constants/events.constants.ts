export const EVENT_COLORS = {
  primary: "#ff6619",
  background: {
    dark: "#1A1A1B",
    light: "#ffffff",
    lightGray: "#f9fafb",
  },
  text: {
    dark: {
      primary: "#ffffff",
      secondary: "#e5e7eb",
      muted: "#9ca3af",
    },
    light: {
      primary: "#111827",
      secondary: "#374151",
      muted: "#6b7280",
    },
  },
  border: {
    dark: "#374151",
    light: "#f3f4f6",
  },
  success: "#10b981",
  error: "#ef4444",
};

export const EVENT_MESSAGES = {
  ERRORS: {
    GENERIC: "Something went wrong.",
    NETWORK_TITLE: "No Connection",
    NETWORK_MESSAGE: "Connect to the internet to view\nthis event's details.",
    REGISTRATION_FAILED: "Registration failed",
    UNREGISTRATION_FAILED: "Unregistration failed",
    PROGRAM_TIME_UNAVAILABLE: "Program time not available for notification.",
  },
  SUCCESS: {
    REGISTERED: "You have successfully registered for the event",
    UNREGISTERED: "You have successfully unregistered from the event",
    ALERT_TITLE: "Alert Set",
    ALERT_MESSAGE: "We'll notify you 15 minutes before the program starts.",
  },
  MODALS: {
    SIGN_IN_TITLE: "Sign In Required",
    SIGN_IN_DESC:
      "You need to be signed in to perform this action. Would you like to sign in now?",
    UNREGISTER_TITLE: "Unregister",
    UNREGISTER_DESC: "Are you sure you want to unregister from this event?",
  },
  LABELS: {
    TRY_AGAIN: "Try Again",
    CHECKING: "Checking...",
    GO_BACK: "Go Back",
    ALREADY_REGISTERED: "Already Registered",
    REGISTER_NOW: "Register Now",
  },
};
