import { NativeAlert } from "@/components/NativeAlert";
import { useTheme } from "@/context/ThemeContext";
import React from "react";

interface SignInPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
  message?: string;
}

const SignInPromptModal = ({
  visible,
  onClose,
  onSignIn,
  message = "Please sign in to continue.",
}: SignInPromptModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <NativeAlert
      visible={visible}
      title="Sign In Required"
      message={message}
      buttonText="Sign In"
      onClose={onSignIn}
      secondaryButtonText="Cancel"
      onSecondaryPress={onClose}
      isDark={isDark}
    />
  );
};

export default SignInPromptModal;
