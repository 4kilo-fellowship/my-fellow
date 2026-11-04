export type NativeDialogActionRole = "default" | "cancel" | "destructive";

export interface NativeDialogAction {
  label: string;
  onPress: () => void;
  role?: NativeDialogActionRole;
}

export interface NativeConfirmationDialogOptions {
  title: string;
  message?: string;
  actions: NativeDialogAction[];
  isDark?: boolean;
}

export interface NativeConfirmationDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actions: NativeDialogAction[];
  isDark?: boolean;
}
