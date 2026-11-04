import React, { createContext, useCallback, useContext, useState } from "react";
import {
  NativeConfirmationDialogOptions,
  NativeDialogAction,
} from "./types";
import { NativeConfirmationDialog } from "./NativeConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";

interface ConfirmationContextType {
  confirm: (options: NativeConfirmationDialogOptions) => void;
  confirmDiscardOrContinue: (onDiscard: () => void, onContinue?: () => void) => void;
  confirmDeleteOrCancel: (onDelete: () => void, itemTitle?: string) => void;
  confirmSaveDiscardCancel: (
    onSave: () => void,
    onDiscard: () => void,
    onCancel?: () => void,
  ) => void;
  hide: () => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

export const NativeConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useTheme();
  const isDarkDefault = theme === "dark";

  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    actions: NativeDialogAction[];
    isDark?: boolean;
  }>({
    visible: false,
    title: "",
    message: undefined,
    actions: [],
  });

  const hide = useCallback(() => {
    setDialogState((prev) => ({ ...prev, visible: false }));
  }, []);

  const confirm = useCallback(
    (options: NativeConfirmationDialogOptions) => {
      setDialogState({
        visible: true,
        title: options.title,
        message: options.message,
        actions: options.actions,
        isDark: options.isDark !== undefined ? options.isDark : isDarkDefault,
      });
    },
    [isDarkDefault],
  );

  const confirmDiscardOrContinue = useCallback(
    (onDiscard: () => void, onContinue?: () => void) => {
      confirm({
        title: "Discard changes?",
        message: "You have unsaved changes. Are you sure you want to discard them?",
        actions: [
          {
            label: "Discard",
            role: "destructive",
            onPress: onDiscard,
          },
          {
            label: "Continue Editing",
            role: "cancel",
            onPress: () => onContinue?.(),
          },
        ],
      });
    },
    [confirm],
  );

  const confirmDeleteOrCancel = useCallback(
    (onDelete: () => void, itemTitle?: string) => {
      confirm({
        title: itemTitle ? `Delete ${itemTitle}?` : "Delete item?",
        message: "This action cannot be undone.",
        actions: [
          {
            label: "Delete",
            role: "destructive",
            onPress: onDelete,
          },
          {
            label: "Cancel",
            role: "cancel",
            onPress: () => {},
          },
        ],
      });
    },
    [confirm],
  );

  const confirmSaveDiscardCancel = useCallback(
    (onSave: () => void, onDiscard: () => void, onCancel?: () => void) => {
      confirm({
        title: "Save changes?",
        message: "Would you like to save your edits before leaving?",
        actions: [
          {
            label: "Save",
            role: "default",
            onPress: onSave,
          },
          {
            label: "Discard",
            role: "destructive",
            onPress: onDiscard,
          },
          {
            label: "Cancel",
            role: "cancel",
            onPress: () => onCancel?.(),
          },
        ],
      });
    },
    [confirm],
  );

  return (
    <ConfirmationContext.Provider
      value={{
        confirm,
        confirmDiscardOrContinue,
        confirmDeleteOrCancel,
        confirmSaveDiscardCancel,
        hide,
      }}
    >
      {children}
      <NativeConfirmationDialog
        visible={dialogState.visible}
        onClose={hide}
        title={dialogState.title}
        message={dialogState.message}
        actions={dialogState.actions}
        isDark={dialogState.isDark}
      />
    </ConfirmationContext.Provider>
  );
};

export function useNativeConfirmation(): ConfirmationContextType {
  const ctx = useContext(ConfirmationContext);
  if (!ctx) {
    throw new Error(
      "useNativeConfirmation must be used within a NativeConfirmationProvider",
    );
  }
  return ctx;
}

export * from "./types";
export { NativeConfirmationDialog } from "./NativeConfirmationDialog";
