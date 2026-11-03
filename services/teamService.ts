import api from "@/services/api";
import { Team } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const CACHE_KEY = "teams_data";
const IMG_DIR = (FileSystem.documentDirectory || "") + "teams_images/";

const ensureDirExists = async () => {
  try {
    if (!FileSystem.documentDirectory) return;
    const dirInfo = await FileSystem.getInfoAsync(IMG_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
    }
  } catch (e) {
    console.error("Error creating team image directory", e);
  }
};

const downloadImage = async (url: string, type: "main" | "leader") => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("file://") || url.startsWith("/")) return url;

  try {
    const urlHash = url.split("?")[0].split("/").pop() || "image";
    const cleanName = urlHash.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50);
    const extension = url.split(".").pop()?.split(/[?#]/)[0] || "jpg";
    const filename = `team_${cleanName}_${type}.${extension}`;
    const fileUri = IMG_DIR + filename;

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
    console.warn(`Failed to download team image: ${url}`, e);
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

          if (
            team.imageUrl &&
            (team.imageUrl.startsWith("http") ||
              team.imageUrl.startsWith("https"))
          ) {
            const localUri = await downloadImage(team.imageUrl, "main");
            if (localUri) team.imageUrl = localUri;
          }

          if (
            team.leader?.imageUrl &&
            (team.leader.imageUrl.startsWith("http") ||
              team.leader.imageUrl.startsWith("https"))
          ) {
            const localUri = await downloadImage(
              team.leader.imageUrl,
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

export const createTeamApi = async (data: FormData | any): Promise<Team> => {
  const isFormData = data instanceof FormData;
  const res = await api.post("/teams", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  const t = res.data?.data || res.data;
  return {
    ...t,
    id: t._id || t.id,
  };
};

export const updateTeamApi = async (
  id: string,
  data: FormData | any,
): Promise<Team> => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`/teams/${id}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  const t = res.data?.data || res.data;
  return {
    ...t,
    id: t._id || t.id || id,
  };
};

export const deleteTeamApi = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/teams/${id}`);
  return res.data?.success !== false;
};
