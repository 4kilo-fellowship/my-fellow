import React, { Component } from "react";
import { Host, Alert, Button, Text, Spacer } from "@expo/ui/swift-ui";
import { NativeAlertFallback } from "./NativeAlertFallback";
import { NativeAlertProps } from "./types";

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeNativeAlertIOS extends Component<
  NativeAlertProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("SwiftUI Alert error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <NativeAlertFallback {...this.props} />;
    }
    return <SwiftUIAlertView {...this.props} />;
  }
}

function SwiftUIAlertView({
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
      style={{ position: "absolute", width: 0, height: 0 }}
      pointerEvents="box-none"
      colorScheme={isDark ? "dark" : "light"}
    >
      <Alert
        title={title || ""}
        isPresented={visible}
        onIsPresentedChange={(isPresented) => {
          if (!isPresented && visible) {
            onClose();
          }
        }}
      >
        <Alert.Trigger>
          <Spacer minLength={0} />
        </Alert.Trigger>
        <Alert.Actions>
          <Button
            label={buttonText || "OK"}
            onPress={onClose}
          />
          {secondaryButtonText && onSecondaryPress ? (
            <Button
              label={secondaryButtonText}
              role="cancel"
              onPress={onSecondaryPress}
            />
          ) : null}
        </Alert.Actions>
        {message ? (
          <Alert.Message>
            <Text>{message}</Text>
          </Alert.Message>
        ) : null}
      </Alert>
    </Host>
  );
}

export function NativeAlert(props: NativeAlertProps) {
  return <SafeNativeAlertIOS {...props} />;
}
