import { EventSummary } from "@/types/events.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { fetchEventsApi } from "./events.api";

const EVENTS_CACHE_KEY = "events_cache_data";
const EVENTS_IMG_DIR = (FileSystem.documentDirectory || "") + "events_images/";

const ensureDirExists = async () => {
  try {
    if (!FileSystem.documentDirectory) return;
    const dirInfo = await FileSystem.getInfoAsync(EVENTS_IMG_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(EVENTS_IMG_DIR, {
        intermediates: true,
      });
    }
  } catch (error) {
    console.error("Error creating image directory:", error);
  }
};

const downloadImage = async (url: string) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("file://") || url.startsWith("/")) return url;

  try {
    const urlHash = url.split("?")[0].split("/").pop() || "image";
    const cleanName = urlHash.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50);
    const extension = url.split(".").pop()?.split(/[?#]/)[0] || "jpg";
    const filename = `cache_${cleanName}.${extension}`;
    const fileUri = EVENTS_IMG_DIR + filename;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists && fileInfo.size > 0) {
      return fileUri;
    }

    const downloadRes = await FileSystem.downloadAsync(encodeURI(url), fileUri);
    if (downloadRes.status !== 200) {
      return url;
    }
    return downloadRes.uri;
  } catch (e) {
    console.warn(`Failed to download image: ${url}`, e);
    return url;
  }
};

export const eventsService = {
  getCachedEvents: async (): Promise<EventSummary[]> => {
    try {
      const cached = await AsyncStorage.getItem(EVENTS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  },

  fetchAndCacheEvents: async (): Promise<EventSummary[]> => {
    try {
      const events = await fetchEventsApi();
      await ensureDirExists();

      const processedEvents = await Promise.all(
        events.map(async (event: any) => {
          const imgSource = event.image || event.imageUrl;
          const eventId = event.id || event._id || "unknown";

          if (
            imgSource &&
            (imgSource.startsWith("http") || imgSource.startsWith("https"))
          ) {
            const localUri = await downloadImage(imgSource);
            return {
              ...event,
              id: eventId,
              image: localUri || imgSource,
              imageUrl: localUri || imgSource,
            };
          }
          return {
            ...event,
            id: eventId,
          };
        }),
      );

      await AsyncStorage.setItem(
        EVENTS_CACHE_KEY,
        JSON.stringify(processedEvents),
      );
      return processedEvents as EventSummary[];
    } catch (error) {
      console.error("Error fetching and caching events:", error);
      throw error;
    }
  },
};
