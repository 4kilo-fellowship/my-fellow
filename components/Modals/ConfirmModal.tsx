import { NativeConfirmationDialog, NativeDialogAction } from "@/components/NativeConfirmationDialog";
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
 * Native confirmation alert dialog modal using @expo/ui ConfirmationDialog on iOS, AlertDialog on Android.
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
  const formatted = formatAlertContent(title, description, "info");

  const actions: NativeDialogAction[] = [];

  if (buttons && buttons.length > 0) {
    buttons.forEach((b) => {
      actions.push({
        label: b.label,
        role: b.variant === "danger" ? "destructive" : "default",
        onPress: () => {
          b.onPress?.();
          onClose();
        },
      });
    });
  }

  if (cancelButton) {
    actions.push({
      label: cancelButton.label,
      role: "cancel",
      onPress: () => {
        cancelButton.onPress?.();
        onClose();
      },
    });
  }

  return (
    <NativeConfirmationDialog
      visible={visible}
      onClose={onClose}
      title={formatted.title}
      message={formatted.message}
      actions={actions}
      isDark={isDark}
    />
  );
};

export default ConfirmModal;
