import { useEventsStore } from "@/stores/events.store";

interface EventRegistrationState {
  registerForEvent: (params: { eventId: string }) => Promise<void>;
  unregisterFromEvent: (params: { eventId: string }) => Promise<void>;
  registering: boolean;
  unregistering: boolean;
  registeredEvents: Record<string, boolean>;
  checkingRegistrationMap: Record<string, boolean>;
  checkRegistrationStatus: (eventId: string) => void;
}

export const useEventRegistration = (eventId?: string) => {
  const {
    registerForEvent,
    unregisterFromEvent,
    registering,
    unregistering,
    registeredEvents,
    checkingRegistrationMap: storeCheckingRegistrationMap,
    checkRegistrationStatus,
  } = useEventsStore((s: any) => ({
    registerForEvent: s.registerForEvent,
    unregisterFromEvent: s.unregisterFromEvent,
    registering: s.registering,
    unregistering: s.unregistering,
    registeredEvents: s.registeredEvents,
    checkingRegistrationMap: s.checkingRegistration,
    checkRegistrationStatus: s.checkRegistrationStatus,
  })) as EventRegistrationState;

  const isRegistered = eventId ? !!registeredEvents[eventId] : false;
  const isCheckingRegistration = eventId
    ? !!storeCheckingRegistrationMap[eventId]
    : false;

  const handleRegister = async () => {
    if (!eventId) return;
    await registerForEvent({ eventId });
  };

  const handleUnregister = async () => {
    if (!eventId) return;
    await unregisterFromEvent({ eventId });
  };

  const checkStatus = () => {
    if (eventId) {
      checkRegistrationStatus(eventId);
    }
  };

  return {
    isRegistered,
    isCheckingRegistration,
    isRegistering: registering,
    isUnregistering: unregistering,
    handleRegister,
    handleUnregister,
    checkStatus,
  };
};
