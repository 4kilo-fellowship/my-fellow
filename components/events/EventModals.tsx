import {
  ConfirmModal,
  ConnectionToaster,
  InfoModal,
  RegistrationModal,
} from "@/components";
import { EVENT_COLORS, EVENT_MESSAGES } from "@/constants/events.constants";
import React, { memo } from "react";

export type ModalState = {
  registrationVisible: boolean;
  signInVisible: boolean;
  unregisterVisible: boolean;
  offlineVisible: boolean;
  info: {
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  };
};

interface EventModalsProps {
  isDark: boolean;
  state: ModalState;
  eventTitle: string;
  isRegistering: boolean;
  onCloseRegistration: () => void;
  onConfirmRegistration: () => void;
  onCloseSignIn: () => void;
  onConfirmSignIn: () => void;
  onCloseUnregister: () => void;
  onConfirmUnregister: () => void;
  onCloseOffline: () => void;
  onCloseInfo: () => void;
}

export const EventModals = memo(
  ({
    isDark,
    state,
    eventTitle,
    isRegistering,
    onCloseRegistration,
    onConfirmRegistration,
    onCloseSignIn,
    onConfirmSignIn,
    onCloseUnregister,
    onConfirmUnregister,
    onCloseOffline,
    onCloseInfo,
  }: EventModalsProps) => {
    return (
      <>
        <RegistrationModal
          visible={state.registrationVisible}
          onClose={onCloseRegistration}
          onConfirm={onConfirmRegistration}
          loading={isRegistering}
          eventTitle={eventTitle}
        />

        <ConfirmModal
          visible={state.signInVisible}
          onClose={onCloseSignIn}
          isDark={isDark}
          title={EVENT_MESSAGES.MODALS.SIGN_IN_TITLE}
          description={EVENT_MESSAGES.MODALS.SIGN_IN_DESC}
          icon="log-in-outline"
          iconColor={EVENT_COLORS.primary}
          buttons={[
            {
              label: "Go to Sign In",
              onPress: onConfirmSignIn,
              variant: "primary",
            },
          ]}
          cancelButton={{
            label: "Cancel",
          }}
        />

        <ConnectionToaster
          visible={state.offlineVisible}
          onHide={onCloseOffline}
        />

        <ConfirmModal
          visible={state.unregisterVisible}
          onClose={onCloseUnregister}
          isDark={isDark}
          title={EVENT_MESSAGES.MODALS.UNREGISTER_TITLE}
          description={EVENT_MESSAGES.MODALS.UNREGISTER_DESC}
          icon="close-circle-outline"
          iconColor={EVENT_COLORS.error}
          buttons={[
            {
              label: "Unregister",
              onPress: onConfirmUnregister,
              variant: "primary",
            },
          ]}
          cancelButton={{
            label: "No, Keep it",
          }}
        />

        <InfoModal
          visible={state.info.visible}
          onClose={onCloseInfo}
          title={state.info.title}
          message={state.info.message}
          type={state.info.type}
          isDark={isDark}
        />
      </>
    );
  },
);

export default EventModals;
