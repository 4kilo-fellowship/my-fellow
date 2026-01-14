/**
 * Cloudinary Upload Service
 * Handles image uploads to Cloudinary
 */

const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Upload image to Cloudinary
 * @param imageUri - Local URI of the image to upload
 * @param folder - Optional folder path in Cloudinary (e.g., 'profile-images')
 * @returns Promise with Cloudinary response containing secure_url
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = "profile-images"
): Promise<string> => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary credentials not configured. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables."
      );
    }

    // Create FormData for upload
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    // Append image file
    formData.append("file", {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    // Append upload preset and folder
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `Upload failed with status ${response.status}`
      );
    }

    const data: CloudinaryUploadResponse = await response.json();

    if (!data.secure_url) {
      throw new Error("Upload succeeded but no URL returned");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
