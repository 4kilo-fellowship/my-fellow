import { NativeConfirmationDialog } from "@/components/NativeConfirmationDialog";
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
    <NativeConfirmationDialog
      visible={visible}
      title={title}
      message={message}
      actions={[
        {
          label: "Delete",
          role: "destructive",
          onPress: onConfirm,
        },
        {
          label: "Cancel",
          role: "cancel",
          onPress: onClose,
        },
      ]}
      onClose={onClose}
      isDark={isDark}
    />
  );
};

export default DeleteConfirmModal;
