import { Platform } from "react-native";
import { ReasonModal as ReasonModalAndroid } from "./ReasonModal.android";
import { ReasonModal as ReasonModalIOS } from "./ReasonModal.ios";

interface ReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isDark?: boolean;
}

export const ReasonModal = (props: ReasonModalProps) => {
  if (Platform.OS === "android") {
    return <ReasonModalAndroid {...props} />;
  }
  return <ReasonModalIOS {...props} />;
};
