import api from "@/services/api";
import { Team } from "@/types/types";
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
    const filename = `${id}_${type}_${url.split("/").pop()?.split("?")[0] || "img"}`;
    const fileUri = IMG_DIR + filename;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    const downloadRes = await FileSystem.downloadAsync(url, fileUri);
    return downloadRes.uri;
  } catch (e) {
    return url;
  }
};

export const fetchTeams = async (forceRefresh = false): Promise<Team[]> => {
  try {
    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const response = await api.get("/teams");

    if (response.data.success) {
      const teamsData = response.data.data;

      await ensureDirExists();

      const processedTeams: Team[] = await Promise.all(
        teamsData.map(async (t: any) => {
          const team: Team = {
            ...t,
            id: t._id,
            leader: {
              ...t.leader,
              imageUrl: t.leader?.imageUrl || "",
            },
            imageUrl: t.imageUrl || "",
          };

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

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(processedTeams));

      return processedTeams;
    }

    return [];
  } catch (error) {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
    return [];
  }
};
