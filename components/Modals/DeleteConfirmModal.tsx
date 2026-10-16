import { NativeAlert } from "@/components/NativeAlert";
import React from "react";

export interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark?: boolean;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  isDark = false,
  title = "Delete Reminder",
  message = "This action cannot be undone.",
}: DeleteConfirmModalProps) => {
  return (
    <NativeAlert
      visible={visible}
      title={title}
      message={message}
      buttonText="Delete"
      onClose={onConfirm}
      secondaryButtonText="Cancel"
      onSecondaryPress={onClose}
      destructive
      isDark={isDark}
    />
  );
};

export default DeleteConfirmModal;
