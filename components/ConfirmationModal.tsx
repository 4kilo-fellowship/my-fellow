import { NativeConfirmationDialog } from "@/components/NativeConfirmationDialog";
import React from "react";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Sign out",
  cancelLabel = "Cancel",
  danger = true,
}: ConfirmationModalProps) => {
  return (
    <NativeConfirmationDialog
      visible={visible}
      onClose={onClose}
      title={title}
      message={message}
      actions={[
        {
          label: confirmLabel,
          role: danger ? "destructive" : "default",
          onPress: onConfirm,
        },
        {
          label: cancelLabel,
          role: "cancel",
          onPress: onClose,
        },
      ]}
    />
  );
};

export default ConfirmationModal;
