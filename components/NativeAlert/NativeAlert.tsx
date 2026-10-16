import React from "react";
import { NativeAlertFallback } from "./NativeAlertFallback";
import { NativeAlertProps } from "./types";

export function NativeAlert(props: NativeAlertProps) {
  return <NativeAlertFallback {...props} />;
}
