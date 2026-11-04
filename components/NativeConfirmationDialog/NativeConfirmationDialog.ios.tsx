import React, { Component } from "react";
import { Host, ConfirmationDialog, Button, Text } from "@expo/ui/swift-ui";
import { NativeConfirmationDialogProps } from "./types";
import { NativeConfirmationDialogFallback } from "./NativeConfirmationDialogFallback";

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeNativeConfirmationIOS extends Component<
  NativeConfirmationDialogProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("SwiftUI ConfirmationDialog error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <NativeConfirmationDialogFallback {...this.props} />;
    }
    return <SwiftUIConfirmationDialogView {...this.props} />;
  }
}

function SwiftUIConfirmationDialogView({
  visible,
  onClose,
  title,
  message,
  actions,
  isDark = false,
}: NativeConfirmationDialogProps) {
  // Sort or ensure cancel action is properly marked with role="cancel"
  const cancelAction = actions.find((a) => a.role === "cancel");
  const otherActions = actions.filter((a) => a.role !== "cancel");

  return (
    <Host
      style={{ position: "absolute", width: 0, height: 0 }}
      pointerEvents="box-none"
      colorScheme={isDark ? "dark" : "light"}
    >
      <ConfirmationDialog
        title={title || ""}
        isPresented={visible}
        onIsPresentedChange={(isPresented) => {
          if (!isPresented && visible) {
            onClose();
          }
        }}
      >
        <ConfirmationDialog.Trigger>
          <Text />
        </ConfirmationDialog.Trigger>
        <ConfirmationDialog.Actions>
          {otherActions.map((action, idx) => (
            <Button
              key={`${action.label}-${idx}`}
              label={action.label}
              role={action.role === "destructive" ? "destructive" : "default"}
              onPress={() => {
                onClose();
                action.onPress();
              }}
            />
          ))}
          {cancelAction ? (
            <Button
              label={cancelAction.label}
              role="cancel"
              onPress={() => {
                onClose();
                cancelAction.onPress();
              }}
            />
          ) : (
            <Button
              label="Cancel"
              role="cancel"
              onPress={onClose}
            />
          )}
        </ConfirmationDialog.Actions>
        {message ? (
          <ConfirmationDialog.Message>
            <Text>{message}</Text>
          </ConfirmationDialog.Message>
        ) : null}
      </ConfirmationDialog>
    </Host>
  );
}

export function NativeConfirmationDialog(props: NativeConfirmationDialogProps) {
  return <SafeNativeConfirmationIOS {...props} />;
}
