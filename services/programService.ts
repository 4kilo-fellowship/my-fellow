import { Program } from "@/types";
import {
  createProgramApi,
  deleteProgramApi,
  fetchProgramsApi,
  updateProgramApi,
} from "./program.api";

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

  createProgram: async (data: FormData | any): Promise<Program> => {
    return await createProgramApi(data);
  },

  updateProgram: async (id: string, data: FormData | any): Promise<Program> => {
    return await updateProgramApi(id, data);
  },

  deleteProgram: async (id: string): Promise<boolean> => {
    return await deleteProgramApi(id);
  },
};
