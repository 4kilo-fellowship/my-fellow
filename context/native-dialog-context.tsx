import React, { createContext, useContext, useState, useCallback } from 'react';
import { NativeDialog } from '@/components/ui/dialog';
import { DialogOptions } from '@/components/ui/dialog/NativeDialog.types';

export interface ShowDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onDismiss?: () => void;
}

export interface NativeDialogContextType {
  showSuccess: (title: string, message: string, onDismiss?: () => void) => void;
  showError: (title: string, message: string, onDismiss?: () => void) => void;
  showConfirmation: (options: ShowDialogOptions) => void;
  dismissDialog: () => void;
}

const NativeDialogContext = createContext<NativeDialogContextType | null>(null);

let globalShowSuccess: ((title: string, message: string, onDismiss?: () => void) => void) | null = null;
let globalShowError: ((title: string, message: string, onDismiss?: () => void) => void) | null = null;
let globalShowConfirmation: ((options: ShowDialogOptions) => void) | null = null;
let globalDismiss: (() => void) | null = null;

export const NativeDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialogState, setDialogState] = useState<DialogOptions>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    destructive: false,
    onDismiss: () => {},
  });

  const dismissDialog = useCallback(() => {
    setDialogState((prev) => {
      if (prev.onDismiss) prev.onDismiss();
      return { ...prev, visible: false };
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string, onDismiss?: () => void) => {
    setDialogState({
      visible: true,
      title,
      message,
      type: 'success',
      confirmText: 'OK',
      onDismiss: () => {
        setDialogState((s) => ({ ...s, visible: false }));
        if (onDismiss) onDismiss();
      },
    });
  }, []);

  const showError = useCallback((title: string, message: string, onDismiss?: () => void) => {
    setDialogState({
      visible: true,
      title,
      message,
      type: 'error',
      confirmText: 'OK',
      onDismiss: () => {
        setDialogState((s) => ({ ...s, visible: false }));
        if (onDismiss) onDismiss();
      },
    });
  }, []);

  const showConfirmation = useCallback(
    ({
      title,
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      destructive = false,
      onConfirm,
      onDismiss,
    }: ShowDialogOptions) => {
      setDialogState({
        visible: true,
        title,
        message,
        type: 'confirmation',
        confirmText,
        cancelText,
        destructive,
        onConfirm: () => {
          setDialogState((s) => ({ ...s, visible: false }));
          if (onConfirm) onConfirm();
        },
        onDismiss: () => {
          setDialogState((s) => ({ ...s, visible: false }));
          if (onDismiss) onDismiss();
        },
      });
    },
    []
  );

  globalShowSuccess = showSuccess;
  globalShowError = showError;
  globalShowConfirmation = showConfirmation;
  globalDismiss = dismissDialog;

  return (
    <NativeDialogContext.Provider
      value={{
        showSuccess,
        showError,
        showConfirmation,
        dismissDialog,
      }}>
      {children}
      <NativeDialog {...dialogState} />
    </NativeDialogContext.Provider>
  );
};

export function useNativeDialog(): NativeDialogContextType {
  const context = useContext(NativeDialogContext);
  if (!context) {
    throw new Error('useNativeDialog must be used within a NativeDialogProvider');
  }
  return context;
}

export const NativeDialogManager = {
  showSuccess: (title: string, message: string, onDismiss?: () => void) => {
    if (globalShowSuccess) globalShowSuccess(title, message, onDismiss);
  },
  showError: (title: string, message: string, onDismiss?: () => void) => {
    if (globalShowError) globalShowError(title, message, onDismiss);
  },
  showConfirmation: (options: ShowDialogOptions) => {
    if (globalShowConfirmation) globalShowConfirmation(options);
  },
  dismiss: () => {
    if (globalDismiss) globalDismiss();
  },
};
