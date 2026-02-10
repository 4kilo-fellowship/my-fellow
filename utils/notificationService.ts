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
  if (isExpoGo) return;

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

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    return (await notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.error("Error retrieving push token:", e);
  }
};

export const scheduleNotification = async (
  title: string,
  body: string,
  date: Date,
  id?: string,
  repeats?: "daily" | "weekly" | "none",
) => {
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

  let trigger: any;

  const scheduledDate = new Date(date);

  if (repeats === "daily") {
    trigger = {
      type: "calendar",
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      repeats: true,
    };
  } else if (repeats === "weekly") {
    trigger = {
      type: "calendar",
      weekday: scheduledDate.getDay() + 1,
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      repeats: true,
    };
  } else {
    // For one-time notifications, a Date object is standard,
    // but some versions prefer the timeInterval format with a type.
    const seconds = Math.floor((scheduledDate.getTime() - Date.now()) / 1000);
    trigger = {
      type: "timeInterval",
      seconds: seconds > 0 ? seconds : 1,
      repeats: false,
    };
  }

  try {
    await notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: "default", // Use default system notification sound
        data: { id },
        priority: notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        android: {
          channelId: "default",
          sound: "default",
          vibrate: true,
          priority: "max",
        },
        ios: {
          sound: "default",
        },
      },
      trigger,
    });
  } catch (e) {
    console.error("Failed to schedule notification:", e);
  }
};

export const cancelNotification = async (id: string) => {
  const notifications = getNotificationsLib();
  if (!notifications) return;
  try {
    await notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    // Ignore error
  }
};
