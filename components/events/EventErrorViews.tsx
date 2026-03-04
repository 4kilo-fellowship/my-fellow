import { EVENT_COLORS, EVENT_MESSAGES } from "@/constants/events.constants";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ------------------------------------------------------------------
// OFFLINE VIEW
// ------------------------------------------------------------------

interface OfflineViewProps {
  isDark: boolean;
  isLoading: boolean;
  isGoingBack: boolean;
  containerFadeStyle: any;
  pulseRingStyle: any;
  onRetry: () => void;
  onBack: () => void;
}

export const OfflineView = memo(
  ({
    isDark,
    isLoading,
    isGoingBack,
    containerFadeStyle,
    pulseRingStyle,
    onRetry,
    onBack,
  }: OfflineViewProps) => {
    const bgColor = isDark
      ? EVENT_COLORS.background.dark
      : EVENT_COLORS.background.light;
    const textColor = isDark
      ? EVENT_COLORS.text.dark.primary
      : EVENT_COLORS.text.light.primary;
    const mutedColor = isDark
      ? EVENT_COLORS.text.dark.muted
      : EVENT_COLORS.text.light.muted;

    return (
      <View style={[offlineStyles.container, { backgroundColor: bgColor }]}>
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

          <Text style={[offlineStyles.title, { color: textColor }]}>
            {EVENT_MESSAGES.ERRORS.NETWORK_TITLE}
          </Text>
          <Text style={[offlineStyles.message, { color: mutedColor }]}>
            {EVENT_MESSAGES.ERRORS.NETWORK_MESSAGE}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onRetry}
            disabled={isLoading}
            style={[offlineStyles.button, isLoading && { opacity: 0.6 }]}
          >
            <Text style={offlineStyles.buttonText}>
              {isLoading
                ? EVENT_MESSAGES.LABELS.CHECKING
                : EVENT_MESSAGES.LABELS.TRY_AGAIN}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
            {isGoingBack ? (
              <ActivityIndicator size="small" color={mutedColor} />
            ) : (
              <Text style={{ color: mutedColor, fontSize: 15 }}>
                {EVENT_MESSAGES.LABELS.GO_BACK}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  },
);

// ------------------------------------------------------------------
// ERROR VIEW
// ------------------------------------------------------------------

interface ErrorViewProps {
  isDark: boolean;
  error: string;
  isGoingBack: boolean;
  onRetry: () => void;
  onBack: () => void;
}

export const ErrorView = memo(
  ({ isDark, error, isGoingBack, onRetry, onBack }: ErrorViewProps) => {
    const bgColor = isDark
      ? EVENT_COLORS.background.dark
      : EVENT_COLORS.background.lightGray;
    const textColor = isDark
      ? EVENT_COLORS.text.dark.primary
      : EVENT_COLORS.text.light.primary;
    const mutedColor = isDark
      ? EVENT_COLORS.text.dark.muted
      : EVENT_COLORS.text.light.muted;

    return (
      <View style={[styles.errorContainer, { backgroundColor: bgColor }]}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={EVENT_COLORS.primary}
        />
        <Text style={[styles.errorTitle, { color: textColor }]}>
          Something went wrong
        </Text>
        <Text style={[styles.errorMessage, { color: mutedColor }]}>
          {error}
        </Text>
        <TouchableOpacity onPress={onRetry} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
          {isGoingBack ? (
            <ActivityIndicator size="small" color={mutedColor} />
          ) : (
            <Text style={{ color: mutedColor }}>Go Back</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

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
    borderColor: EVENT_COLORS.primary,
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
    backgroundColor: EVENT_COLORS.primary,
    paddingHorizontal: 52,
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: EVENT_COLORS.primary,
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

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: EVENT_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
