import { EVENT_COLORS, EVENT_MESSAGES } from "@/constants/events.constants";
import { EventCtaType } from "@/types/events.types";
import { getEventCtaType } from "@/utils/event.utils";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EventFooterProps {
  isDark: boolean;
  ctaLabel: string;
  isRegistered: boolean;
  isCheckingRegistration: boolean;
  isRegistering: boolean;
  isUnregistering: boolean;
  onCtaPress: () => void;
}

const EventFooter = ({
  isDark,
  ctaLabel,
  isRegistered,
  isCheckingRegistration,
  isRegistering,
  isUnregistering,
  onCtaPress,
}: EventFooterProps) => {
  const { bottom } = useSafeAreaInsets();

  const ctaType = useMemo(() => getEventCtaType(ctaLabel), [ctaLabel]);
  const isRegisterCta = ctaType === EventCtaType.REGISTER;

  const displayLabel = useMemo(() => {
    if (isRegisterCta && isRegistered) {
      return EVENT_MESSAGES.LABELS.ALREADY_REGISTERED;
    }
    return ctaLabel || EVENT_MESSAGES.LABELS.REGISTER_NOW;
  }, [isRegisterCta, isRegistered, ctaLabel]);

  const buttonDisabled = isRegistering || isUnregistering;
  const showLoading =
    isRegistering ||
    isUnregistering ||
    (isRegisterCta && isCheckingRegistration);

  const containerBg = isDark
    ? EVENT_COLORS.background.dark
    : EVENT_COLORS.background.light;
  const borderColor = isDark
    ? EVENT_COLORS.border.dark
    : EVENT_COLORS.border.light;

  const getButtonBg = () => {
    if (isRegisterCta && isRegistered) {
      return isDark ? "#27272a" : "#d1d5db";
    }
    return EVENT_COLORS.primary;
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-6 pt-4 border-t"
      style={{
        backgroundColor: containerBg,
        borderColor: borderColor,
        paddingBottom: bottom > 0 ? bottom + 4 : 20,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onCtaPress}
        disabled={buttonDisabled}
        accessibilityRole="button"
        accessibilityLabel={displayLabel}
        className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/30 ${
          buttonDisabled ? "opacity-60" : ""
        }`}
        style={{ backgroundColor: getButtonBg() }}
      >
        {showLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text
              className={`text-lg font-bold mr-2 ${
                isRegisterCta && isRegistered
                  ? isDark
                    ? "text-gray-400"
                    : "text-gray-500"
                  : "text-white"
              }`}
            >
              {displayLabel}
            </Text>
            {isRegisterCta && isRegistered ? (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={isDark ? EVENT_COLORS.success : "#16a34a"}
              />
            ) : ctaType === EventCtaType.NOTIFY ? (
              <Ionicons name="notifications" size={20} color="white" />
            ) : (
              <Ionicons name="arrow-forward" size={20} color="white" />
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default memo(EventFooter);
