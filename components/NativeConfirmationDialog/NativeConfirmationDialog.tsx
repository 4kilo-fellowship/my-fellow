import { NativeConfirmationDialogProps } from "./types";
import { NativeConfirmationDialogFallback } from "./NativeConfirmationDialogFallback";

export function NativeConfirmationDialog(props: NativeConfirmationDialogProps) {
  return <NativeConfirmationDialogFallback {...props} />;
}
