import { useCallback, useRef } from "react";
import { usePreventRemove } from "expo-router";
import { useNativeConfirmation } from "@/components/NativeConfirmationDialog";

export interface UseConfirmUnsavedChangesOptions {
  title?: string;
  message?: string;
  discardLabel?: string;
  continueLabel?: string;
  saveLabel?: string;
  onSave?: () => Promise<boolean | void> | boolean | void;
}

/**
 * Reusable hook integrating Expo Router's `usePreventRemove` with the platform-native
 * confirmation dialog system (@expo/ui ConfirmationDialog / AlertDialog).
 *
 * @param hasUnsavedChanges boolean indicating whether user has modified form state
 * @param options customizable dialog messages and optional save callback
 */
export function useConfirmUnsavedChanges(
  hasUnsavedChanges: boolean,
  options: UseConfirmUnsavedChangesOptions = {},
) {
  const { confirm, hide } = useNativeConfirmation();
  const isNavigatingAwayRef = useRef(false);

  const {
    title = "Discard unsaved changes?",
    message = "You have unsaved changes that will be lost if you leave this screen.",
    discardLabel = "Discard",
    continueLabel = "Keep Editing",
    saveLabel = "Save",
    onSave,
  } = options;

  usePreventRemove(hasUnsavedChanges && !isNavigatingAwayRef.current, ({ data, repeat }) => {
    if (onSave) {
      // 3-button flow: Save / Discard / Cancel (Keep Editing)
      confirm({
        title,
        message,
        actions: [
          {
            label: saveLabel,
            role: "default",
            onPress: async () => {
              hide();
              const result = await onSave();
              if (result !== false) {
                isNavigatingAwayRef.current = true;
                repeat();
              }
            },
          },
          {
            label: discardLabel,
            role: "destructive",
            onPress: () => {
              hide();
              isNavigatingAwayRef.current = true;
              repeat();
            },
          },
          {
            label: continueLabel,
            role: "cancel",
            onPress: () => {
              hide();
            },
          },
        ],
      });
    } else {
      // 2-button flow: Discard / Continue Editing
      confirm({
        title,
        message,
        actions: [
          {
            label: discardLabel,
            role: "destructive",
            onPress: () => {
              hide();
              isNavigatingAwayRef.current = true;
              repeat();
            },
          },
          {
            label: continueLabel,
            role: "cancel",
            onPress: () => {
              hide();
            },
          },
        ],
      });
    }
  });

  const resetPrevention = useCallback(() => {
    isNavigatingAwayRef.current = false;
  }, []);

  return { resetPrevention };
}
