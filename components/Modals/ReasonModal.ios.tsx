import { useEffect } from "react";
import { Alert } from "react-native";

interface ReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isDark?: boolean;
}

export const ReasonModal = ({
  visible,
  onClose,
  onSubmit,
}: ReasonModalProps) => {
  useEffect(() => {
    if (visible) {
      Alert.prompt(
        "Provide a Reason",
        "What is this payment for?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: onClose,
          },
          {
            text: "Continue",
            onPress: (text?: string) => {
              const trimmed = text?.trim();
              onSubmit(trimmed || "Gift");
            },
          },
        ],
        "plain-text",
        "Gift"
      );
    }
  }, [visible, onClose, onSubmit]);

  return null;
};
