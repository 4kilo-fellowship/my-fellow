import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

let Notifications: any;
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const getNotificationsLib = () => {
  if (!Notifications) {
    try {
      Notifications = require("expo-notifications");
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (e) {
      console.warn("Failed to load expo-notifications:", e);
    }
  }
  return Notifications;
};

export const registerForPushNotificationsAsync = async () => {
  const notifications = getNotificationsLib();
  if (!notifications) return;

  const { status: existingStatus } = await notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  if (Platform.OS === "android") {
    await notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      enableVibrate: true,
    });
  }

  // Push token retrieval is only possible in built apps or specific Expo Go scenarios
  if (isExpoGo) return;

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) return;
    return (await notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.warn("Error retrieving push token:", e);
  }
};

export const scheduleNotification = async (
  title: string,
  body: string,
  date: Date,
  id?: string,
  repeats?: "daily" | "weekly" | "none",
) => {
  await registerForPushNotificationsAsync();
  const notifications = getNotificationsLib();
  if (!notifications) return;

  if (Platform.OS === "android") {
    await notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: notifications.AndroidImportance.MAX,
      sound: "default",
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const SchedulableTriggerInputTypes =
    notifications.SchedulableTriggerInputTypes;

  let trigger: any;

  const scheduledDate = new Date(date);

  if (repeats === "daily") {
    trigger = {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      channelId: Platform.OS === "android" ? "default" : undefined,
    };
  } else if (repeats === "weekly") {
    const jsDay = scheduledDate.getDay();
    const expoWeekday = jsDay + 1;

    trigger = {
      type: SchedulableTriggerInputTypes.WEEKLY,
      weekday: expoWeekday,
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      channelId: Platform.OS === "android" ? "default" : undefined,
    };
  } else {
    if (scheduledDate.getTime() <= Date.now()) {
      return;
    }

    trigger = scheduledDate;
  }

  try {
    await notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: "default",
        data: { id },
        channelId: Platform.OS === "android" ? "default" : undefined,
        priority: notifications.AndroidNotificationPriority?.MAX,
      },
      trigger,
    });
  } catch (e) {
    console.error("Failed to schedule notification:", e);
  }
};

export const sendImmediateNotification = async (
  title: string,
  body: string,
  id?: string,
) => {
  await registerForPushNotificationsAsync();
  const notifications = getNotificationsLib();
  if (!notifications) return;

  if (Platform.OS === "android") {
    await notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: notifications.AndroidImportance.MAX,
      sound: "default",
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    await notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: "default",
        data: { id },
        channelId: Platform.OS === "android" ? "default" : undefined,
        priority: notifications.AndroidNotificationPriority?.MAX,
      },
      trigger: null,
    });
  } catch (e) {
    console.error("Failed to send immediate notification:", e);
  }
};

export const cancelNotification = async (id: string) => {
  const notifications = getNotificationsLib();
  if (!notifications) return;
  try {
    await notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {}
};
