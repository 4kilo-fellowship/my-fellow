export interface NativeColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  label?: string;
  isDark?: boolean;
}
