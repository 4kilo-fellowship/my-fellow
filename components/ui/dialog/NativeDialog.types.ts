export type DialogType = 'success' | 'error' | 'confirmation' | 'info';

export interface DialogOptions {
  visible: boolean;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
  onDismiss: () => void;
}
