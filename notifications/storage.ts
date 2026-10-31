import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReminderRecord } from "./types";

const REMINDERS_STORAGE_KEY = "@my_fellow_reminders_v2";

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Safe listener invocation
    }
  });
}

export function subscribeToReminders(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function loadAll(): Promise<ReminderRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("[reminders storage] Failed to load reminders", e);
    return [];
  }
}

export async function save(record: ReminderRecord): Promise<void> {
  try {
    const all = await loadAll();
    const filtered = all.filter((r) => r.eventId !== record.eventId);
    filtered.push(record);
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filtered));
    notifyListeners();
  } catch (e) {
    console.warn("[reminders storage] Failed to save reminder", e);
  }
}

export async function remove(eventId: string): Promise<void> {
  try {
    const all = await loadAll();
    const filtered = all.filter((r) => r.eventId !== eventId);
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filtered));
    notifyListeners();
  } catch (e) {
    console.warn("[reminders storage] Failed to remove reminder", e);
  }
}

export async function getByEventId(
  eventId: string,
): Promise<ReminderRecord | null> {
  const all = await loadAll();
  return all.find((r) => r.eventId === eventId) || null;
}
