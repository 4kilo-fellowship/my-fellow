import { NativeAlert } from "@/components/NativeAlert";
import { formatAlertContent } from "@/utils/alertUtils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

type IoniconsName = keyof typeof Ionicons.glyphMap;

export interface ButtonConfig {
  label: string;
  onPress: () => void;
  variant?: "default" | "danger" | "primary";
  testID?: string;
}

export interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  icon?: IoniconsName;
  iconColor?: string;
  title: string;
  description: string;
  buttons: ButtonConfig[];
  cancelButton?: {
    label: string;
    onPress?: () => void;
  };
}

/**
 * Native confirmation alert modal using @expo/ui Alert on iOS, AlertDialog on Android.
 */
export const ConfirmModal = ({
  visible,
  onClose,
  isDark,
  title,
  description,
  buttons,
  cancelButton,
}: ConfirmModalProps) => {
  const primaryButton = buttons && buttons.length > 0 ? buttons[0] : undefined;
  const isDestructive = primaryButton?.variant === "danger";

  const handlePrimary = () => {
    primaryButton?.onPress?.();
    onClose();
  };

  const handleSecondary = () => {
    cancelButton?.onPress?.();
    onClose();
  };

  const formatted = formatAlertContent(title, description, "info");

  return (
    <NativeAlert
      visible={visible}
      onClose={handlePrimary}
      title={formatted.title}
      message={formatted.message}
      buttonText={primaryButton?.label || "OK"}
      secondaryButtonText={cancelButton ? cancelButton.label : undefined}
      onSecondaryPress={handleSecondary}
      destructive={isDestructive}
      isDark={isDark}
    />
  );
};

export default ConfirmModal;
