import { Team } from "@/constants/teams";
import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const CACHE_KEY = "teams_data";
const IMG_DIR = FileSystem.documentDirectory + "teams_images/";

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMG_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
  }
};

const downloadImage = async (
  url: string,
  id: string,
  type: "main" | "leader",
) => {
  if (!url) return null;
  try {
    // Basic sanitization of filename
    const filename = `${id}_${type}_${url.split("/").pop()?.split("?")[0] || "img"}`;
    const fileUri = IMG_DIR + filename;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    // Download
    const downloadRes = await FileSystem.downloadAsync(url, fileUri);
    return downloadRes.uri;
  } catch (e) {
    console.error("Image download failed for:", url, e);
    return url; // Fallback to remote URL
  }
};

export const fetchTeams = async (forceRefresh = false): Promise<Team[]> => {
  try {
    // 1. Try Cache first if not refreshing
    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        console.log("Serving teams from cache");
        return JSON.parse(cached);
      }
    }

    // 2. Fetch from API
    console.log("Fetching teams from API...");
    // const response = await api.get("/teams"); // Use configured api instance
    // Note: User prompt says "GET {{baseUrl}}/teams".
    // Assuming api instance has baseUrl set correctly to backend.

    const response = await api.get("/teams");

    if (response.data.success) {
      const teamsData = response.data.data;

      await ensureDirExists();

      // 3. Process and Cache Images
      const processedTeams: Team[] = await Promise.all(
        teamsData.map(async (t: any) => {
          // Map _id to id
          const team: Team = {
            ...t,
            id: t._id,
            // Ensure structure matches Team type
            leader: {
              ...t.leader,
              imageUrl: t.leader?.imageUrl || "",
            },
            imageUrl: t.imageUrl || "",
          };

          // Download images to local storage
          if (team.imageUrl) {
            const localUri = await downloadImage(
              team.imageUrl,
              team.id,
              "main",
            );
            if (localUri) team.imageUrl = localUri;
          }

          if (team.leader?.imageUrl) {
            const localUri = await downloadImage(
              team.leader.imageUrl,
              team.id,
              "leader",
            );
            if (localUri) team.leader.imageUrl = localUri;
          }

          return team;
        }),
      );

      // 4. Save to Cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(processedTeams));

      return processedTeams;
    }

    return [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    // If fetch fails, try to return cache even if forceRefresh was true (fallback)
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
    return [];
  }
};
