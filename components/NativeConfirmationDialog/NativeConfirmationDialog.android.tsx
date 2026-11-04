import React, { Component } from "react";
import { Host, AlertDialog, TextButton, Text, Row } from "@expo/ui/jetpack-compose";
import { NativeConfirmationDialogProps } from "./types";
import { NativeConfirmationDialogFallback } from "./NativeConfirmationDialogFallback";

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeNativeConfirmationAndroid extends Component<
  NativeConfirmationDialogProps,
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
      return <NativeConfirmationDialogFallback {...this.props} />;
    }
    return <ComposeConfirmationDialogView {...this.props} />;
  }
}

function ComposeConfirmationDialogView({
  visible,
  onClose,
  title,
  message,
  actions,
  isDark = false,
}: NativeConfirmationDialogProps) {
  if (!visible) return null;

  // In Android Jetpack Compose AlertDialog:
  // Slot confirmButton typically holds primary/affirmative or multi-action row
  // Slot dismissButton holds cancel action
  const cancelAction = actions.find((a) => a.role === "cancel");
  const nonCancelActions = actions.filter((a) => a.role !== "cancel");

  // Destructive color in Compose or primary color
  const destructiveColor = "#B3261E"; // M3 error color

  return (
    <Host
      matchContents
      style={{ position: "absolute", width: 0, height: 0 }}
      pointerEvents="box-none"
      colorScheme={isDark ? "dark" : "light"}
    >
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
          <Row>
            {nonCancelActions.map((action, idx) => {
              const isDestructive = action.role === "destructive";
              return (
                <TextButton
                  key={`${action.label}-${idx}`}
                  onClick={() => {
                    onClose();
                    action.onPress();
                  }}
                  colors={
                    isDestructive
                      ? {
                          contentColor: destructiveColor,
                        }
                      : undefined
                  }
                >
                  <Text color={isDestructive ? destructiveColor : undefined}>
                    {action.label}
                  </Text>
                </TextButton>
              );
            })}
          </Row>
        </AlertDialog.ConfirmButton>
        {cancelAction ? (
          <AlertDialog.DismissButton>
            <TextButton
              onClick={() => {
                onClose();
                cancelAction.onPress();
              }}
            >
              <Text>{cancelAction.label}</Text>
            </TextButton>
          </AlertDialog.DismissButton>
        ) : null}
      </AlertDialog>
    </Host>
  );
}

export function NativeConfirmationDialog(props: NativeConfirmationDialogProps) {
  return <SafeNativeConfirmationAndroid {...props} />;
}
