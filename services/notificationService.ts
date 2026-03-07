import { fetchEventsApi } from "@/services/events.api";
import { fetchProductsApi } from "@/services/marketplace.api";
import { useNotificationsStore } from "@/stores/notifications.store";
import { AppNotification } from "@/types/notification.types";

export async function checkForNewNotifications(): Promise<number> {
  const store = useNotificationsStore.getState();
  const newNotifications: AppNotification[] = [];
  const now = new Date().toISOString();

  try {
    const eventsRes = await fetchEventsApi("desc");
    if (eventsRes.success && Array.isArray(eventsRes.data)) {
      const newEvents = eventsRes.data.filter(
        (e) => !store.seenEventIds.includes(e._id),
      );

      for (const event of newEvents) {
        newNotifications.push({
          id: `event-${event._id}`,
          type: "event",
          title: "🗓  Upcoming Event",
          body: event.title,
          imageUrl: event.imageUrl || undefined,
          targetRoute: `/events/${event._id}`,
          read: false,
          createdAt: event.createdAt || now,
        });
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
        const imgUrl =
          product.imageUrls?.[0] ||
          product.image ||
          product.imageUrl ||
          undefined;

        newNotifications.push({
          id: `product-${product.id}`,
          type: "product",
          title: "🛍  New in the Store",
          body: product.title || product.name || "A new product is available!",
          imageUrl: imgUrl,
          targetRoute: `/marketplace/${product.id}`,
          read: false,
          createdAt: product.createdAt || now,
        });
      }

      store.addSeenProductIds(products.map((p) => p.id));
    }
  } catch (err) {
    console.warn("[NotificationService] Failed to check products:", err);
  }

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
