export interface NativeAlertProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  isDark?: boolean;
  type?: "success" | "error" | "info";
  destructive?: boolean;
}
