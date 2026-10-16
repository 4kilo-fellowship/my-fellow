import React, { Component } from "react";
import { Host, AlertDialog, TextButton, Text } from "@expo/ui/jetpack-compose";
import { NativeAlertFallback } from "./NativeAlertFallback";
import { NativeAlertProps } from "./types";

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeNativeAlertAndroid extends Component<
  NativeAlertProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Jetpack Compose AlertDialog error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <NativeAlertFallback {...this.props} />;
    }
    return <ComposeAlertDialogView {...this.props} />;
  }
}

function ComposeAlertDialogView({
  visible,
  onClose,
  title,
  message,
  buttonText = "OK",
  secondaryButtonText,
  onSecondaryPress,
  isDark = false,
}: NativeAlertProps) {
  return (
    <Host
      matchContents
      style={{ position: "absolute", width: 0, height: 0 }}
      pointerEvents="box-none"
      colorScheme={isDark ? "dark" : "light"}
    >
      {visible ? (
        <AlertDialog onDismissRequest={onClose}>
          {title ? (
            <AlertDialog.Title>
              <Text>{title}</Text>
            </AlertDialog.Title>
          ) : null}
          {message ? (
            <AlertDialog.Text>
              <Text>{message}</Text>
            </AlertDialog.Text>
          ) : null}
          <AlertDialog.ConfirmButton>
            <TextButton onClick={onClose}>
              <Text>{buttonText || "OK"}</Text>
            </TextButton>
          </AlertDialog.ConfirmButton>
          {secondaryButtonText && onSecondaryPress ? (
            <AlertDialog.DismissButton>
              <TextButton onClick={onSecondaryPress}>
                <Text>{secondaryButtonText}</Text>
              </TextButton>
            </AlertDialog.DismissButton>
          ) : null}
        </AlertDialog>
      ) : null}
    </Host>
  );
}

export function NativeAlert(props: NativeAlertProps) {
  return <SafeNativeAlertAndroid {...props} />;
}
