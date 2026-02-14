import { Program } from "@/types";
import { fetchProgramsApi } from "./program.api";

export const programService = {
  fetchPrograms: async (): Promise<Program[]> => {
    try {
      const programs = await fetchProgramsApi();
      return programs.map((program: any) => ({
        ...program,
        id: program.id || program._id || "unknown",
        image: program.image || "",
      })) as Program[];
    } catch (error) {
      console.error("Error fetching programs:", error);
      throw error;
    }
  },
};
