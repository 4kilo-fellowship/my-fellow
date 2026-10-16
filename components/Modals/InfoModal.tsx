import { NativeAlert } from "@/components/NativeAlert";
import { formatAlertContent } from "@/utils/alertUtils";
import React from "react";

export interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  isDark?: boolean;
}

/**
 * Native alert component for displaying error, success, and info messages.
 * Uses @expo/ui Alert on iOS, AlertDialog on Android, and an accessible fallback on Web.
 */
export const InfoModal = ({
  visible,
  onClose,
  title,
  message,
  type = "info",
  isDark = false,
}: InfoModalProps) => {
  const formatted = formatAlertContent(title, message, type);

  return (
    <NativeAlert
      visible={visible}
      onClose={onClose}
      title={formatted.title}
      message={formatted.message}
      type={type}
      isDark={isDark}
      buttonText="OK"
    />
  );
};

export default InfoModal;
