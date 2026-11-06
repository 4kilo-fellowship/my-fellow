import {
  AlertDialog,
  Host,
  Text,
  TextButton,
  TextField,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";

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
  const reasonState = useNativeState("Gift");

  useEffect(() => {
    if (visible) {
      reasonState.set?.("Gift");
      if ("value" in reasonState) {
        (reasonState as any).value = "Gift";
      }
    }
  }, [visible, reasonState]);

  if (!visible) return null;

  const handleConfirm = () => {
    const raw = reasonState.get?.() ?? (reasonState as any).value ?? "Gift";
    const trimmed = typeof raw === "string" ? raw.trim() : "Gift";
    onSubmit(trimmed || "Gift");
  };

  return (
    <Host
      matchContents
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
    >
      <AlertDialog onDismissRequest={onClose}>
        <AlertDialog.Title>
          <Text>Provide a Reason</Text>
        </AlertDialog.Title>
        <AlertDialog.Text>
          <TextField
            value={reasonState}
            singleLine
            autoFocus
          />
        </AlertDialog.Text>
        <AlertDialog.ConfirmButton>
          <TextButton onClick={handleConfirm}>
            <Text>Continue</Text>
          </TextButton>
        </AlertDialog.ConfirmButton>
        <AlertDialog.DismissButton>
          <TextButton onClick={onClose}>
            <Text>Cancel</Text>
          </TextButton>
        </AlertDialog.DismissButton>
      </AlertDialog>
    </Host>
  );
};
