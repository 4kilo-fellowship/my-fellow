/**
 * Utilities for generating cool, high-resolution student/member avatars.
 * Uses DiceBear 9.x CDN with edge caching, matching TNT Ethiopia standard.
 */

export const AVATAR_STYLES = [
  "adventurer",
  "lorelei",
  "personas",
  "bottts-neutral",
  "notionists",
  "fun-emoji",
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AVATAR_BACKGROUNDS = [
  "ffedd5", // Soft Fellowship warm orange / peach
  "fed7aa", // Light amber
  "d1fae5", // Soft mint
  "b6e3f4", // Light sky blue
  "c0aede", // Soft lavender
  "ffd5dc", // Coral blush
  "fef08a", // Soft gold
  "e0e7ff", // Soft indigo
] as const;

/**
 * Returns a random string seed.
 */
export function getRandomAvatarSeed(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a cool avatar URL.
 * If seed is not passed, a fresh random seed is used.
 * If style is not passed, a random style from AVATAR_STYLES is selected.
 */
export function generateCoolAvatarUrl(
  seed?: string,
  style?: AvatarStyle
): string {
  const chosenStyle =
    style || AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const chosenSeed = seed || getRandomAvatarSeed();
  const bg =
    AVATAR_BACKGROUNDS[Math.floor(Math.random() * AVATAR_BACKGROUNDS.length)];
  return `https://api.dicebear.com/9.x/${chosenStyle}/png?seed=${encodeURIComponent(
    chosenSeed
  )}&backgroundColor=${bg}&radius=50`;
}

/**
 * Generates a deterministic prefilled avatar for a user based on their phone number, ID, or fallback.
 */
export function getPrefilledAvatar(seedKey?: string | null): string {
  const cleanKey = seedKey ? seedKey.trim().replace(/[^a-zA-Z0-9]/g, "") : "";
  const seed = cleanKey.length > 0 ? cleanKey : getRandomAvatarSeed();
  // We use adventurer as the friendly default student style with fellowship warm tint
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=ffedd5&radius=50`;
}
