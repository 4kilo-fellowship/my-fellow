import { Leader } from "@/types/leader.types";
import {
  createLeaderApi,
  deleteLeaderApi,
  fetchLeadersApi,
  updateLeaderApi,
} from "./leader.api";

export const leaderService = {
  fetchLeaders: async (): Promise<Leader[]> => {
    try {
      const leaders = await fetchLeadersApi();
      return leaders.map((leader: any) => ({
        ...leader,
        id: leader.id || leader._id || "unknown",
        image: leader.image || "",
      })) as Leader[];
    } catch (error) {
      console.error("Error fetching leaders:", error);
      throw error;
    }
  },

  createLeader: async (data: FormData | any): Promise<Leader> => {
    return await createLeaderApi(data);
  },

  updateLeader: async (id: string, data: FormData | any): Promise<Leader> => {
    return await updateLeaderApi(id, data);
  },

  deleteLeader: async (id: string): Promise<boolean> => {
    return await deleteLeaderApi(id);
  },
};
