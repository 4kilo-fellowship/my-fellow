import { fetchEventsApi } from "@/services/events.api";
import { fetchProductsApi } from "@/services/marketplace.api";
import { useNotificationsStore } from "@/stores/notifications.store";
import { AppNotification } from "@/types/notification.types";
import { scheduleNotification } from "@/utils/notificationService";

export async function checkForNewNotifications(): Promise<number> {
  const store = useNotificationsStore.getState();
  const newNotifications: AppNotification[] = [];
  const now = new Date().toISOString();
  const isFirstCheck = !store.lastCheckedAt;

  // Create a strict set of ALL existing notification IDs (including read ones)
  const existingIds = new Set(store.notifications.map((n) => n.id));

  try {
    const eventsRes = await fetchEventsApi("desc");
    if (eventsRes.success && Array.isArray(eventsRes.data)) {
      const newEvents = eventsRes.data.filter(
        (e) => !store.seenEventIds.includes(e._id),
      );

      for (const event of newEvents) {
        const notifId = `event-${event._id}`;

        // Final sanity check to avoid duplicating a read/existing notification
        if (existingIds.has(notifId)) continue;

        newNotifications.push({
          id: notifId,
          type: "event",
          title: "New Upcoming Event",
          body: event.title,
          imageUrl: event.imageUrl || undefined,
          targetRoute: `/events/${event._id}`,
          read: false,
          createdAt: event.createdAt || now,
        });

        // Only trigger an actual system push alert if it's not the first app load
        if (!isFirstCheck) {
          scheduleNotification(
            "New Upcoming Event",
            event.title,
            new Date(),
            notifId,
          ).catch((e) => console.log("Failed to schedule event push", e));
        }
      }

      store.addSeenEventIds(eventsRes.data.map((e) => e._id));
    }
  } catch (err) {
    console.warn("[NotificationService] Failed to check events:", err);
  }

  try {
    const productsRes = await fetchProductsApi(1, 20);
    if (productsRes.success && Array.isArray(productsRes.data?.products)) {
      const products = productsRes.data.products;
      const newProducts = products.filter(
        (p) => !store.seenProductIds.includes(p.id),
      );

      for (const product of newProducts) {
        const notifId = `product-${product.id}`;

        if (existingIds.has(notifId)) continue;

        const imgUrl =
          product.imageUrls?.[0] ||
          product.image ||
          product.imageUrl ||
          undefined;

        const title = "New in the Store";
        const bodyText =
          product.title || product.name || "A new product is available!";

        newNotifications.push({
          id: notifId,
          type: "product",
          title,
          body: bodyText,
          imageUrl: imgUrl,
          targetRoute: `/marketplace/${product.id}`,
          read: false,
          createdAt: product.createdAt || now,
        });

        if (!isFirstCheck) {
          scheduleNotification(title, bodyText, new Date(), notifId).catch(
            (e) => console.log("Failed to schedule product push", e),
          );
        }
      }

      store.addSeenProductIds(products.map((p) => p.id));
    }
  } catch (err) {
    console.warn("[NotificationService] Failed to check products:", err);
  }

  // Add all fully processed new notifications silently into the store
  if (newNotifications.length > 0) {
    store.addNotifications(newNotifications);
  }

  store.setLastCheckedAt(now);

  return newNotifications.length;
}

export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
