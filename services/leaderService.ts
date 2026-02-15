import { Leader } from "@/types/leader.types";
import { fetchLeadersApi } from "./leader.api";

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
};
