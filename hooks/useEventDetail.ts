import { eventsService } from "@/services/eventsService";
import { useQuery } from "@tanstack/react-query";

interface UseEventDetailOptions {
  enabled?: boolean;
}

export const useEventDetail = (
  eventId?: string,
  options?: UseEventDetailOptions,
) => {
  return useQuery({
    queryKey: ["eventDetail", eventId],
    queryFn: async ({ signal }) => {
      if (!eventId) throw new Error("Event ID is required");
      // If your eventsService fetches using axios, you can pass the AbortSignal to it
      // like: return eventsService.fetchEventById(eventId, { signal });
      // For now, assuming fetchEventById handles caching and the request logic
      return eventsService.fetchEventById(eventId);
    },
    enabled: !!eventId && options?.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
