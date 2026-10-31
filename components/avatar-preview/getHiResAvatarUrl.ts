/**
 * Returns a high-resolution (>= 1000px) variant of an avatar image if possible.
 * Used for the full-screen Instagram-style preview.
 */
export function getHiResAvatarUrl(uri?: string): string | undefined {
  if (!uri) return undefined;

  // Unsplash: increase w parameter to 1200
  if (uri.includes('images.unsplash.com')) {
    if (uri.includes('w=')) {
      return uri.replace(/w=\d+/, 'w=1200');
    }
    return `${uri}&w=1200`;
  }

  // Cloudinary: upgrade transformation parameters if present
  if (uri.includes('cloudinary.com') && uri.includes('/upload/')) {
    // If it has scale transformations like /upload/w_200,c_fill/, replace with /upload/w_1200,c_fill,q_auto,f_auto/
    return uri.replace(/\/upload\/[^/]+\//, '/upload/w_1200,c_fill,q_auto,f_auto/');
  }

  return uri;
}
