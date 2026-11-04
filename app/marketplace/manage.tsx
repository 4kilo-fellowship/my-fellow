import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { AdminGuardFallback } from "@/components/Admin/AdminGuardFallback";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { useConfirmUnsavedChanges } from "@/hooks/useConfirmUnsavedChanges";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { Product } from "@/types/marketplace.types";

const CATEGORIES = [
  "apparel",
  "books",
  "accessories",
  "music",
  "other",
];

interface ImageItem {
  uri: string;
  isLocal: boolean;
}

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const { products, createProduct, updateProduct, deleteProduct, fetchProductById } =
    useMarketplaceStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("10");
  const [category, setCategory] = useState<string>("apparel");
  const [images, setImages] = useState<ImageItem[]>([]);

  const hasUnsavedChanges =
    !submitting &&
    (title.trim().length > 0 ||
      shortDescription.trim().length > 0 ||
      price.trim().length > 0 ||
      images.length > 0);

  useConfirmUnsavedChanges(hasUnsavedChanges, {
    title: "Discard product edits?",
    message: "You have unsaved changes to this store product.",
    discardLabel: "Discard",
    continueLabel: "Keep Editing",
  });

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    if (!isEditing || !id) {
      setLoadingInitial(false);
      return;
    }

    const existing = products.find(
      (p) => p.id === id || (p as any)._id === id,
    );
    if (existing) {
      populateForm(existing);
      setLoadingInitial(false);
    } else {
      fetchProductById(id)
        .then(() => {
          const current = useMarketplaceStore.getState().currentProduct;
          if (current) populateForm(current);
        })
        .finally(() => setLoadingInitial(false));
    }
  }, [id, isEditing, products]);

  const populateForm = (item: Product) => {
    setTitle(item.title || item.name || "");
    setShortDescription(item.shortDescription || item.description || "");
    setPrice(item.price !== undefined ? String(item.price) : "");
    setStock(item.stock !== undefined ? String(item.stock) : "10");
    setCategory(item.category || "apparel");

    const urls: string[] = [];
    if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
      urls.push(...item.imageUrls);
    } else if (item.imageUrl) {
      urls.push(item.imageUrl);
    } else if (item.image) {
      urls.push(item.image);
    }

    setImages(urls.map((u) => ({ uri: u, isLocal: false })));
  };

  const pickImages = async () => {
    if (images.length >= 4) {
      setInfoModal({
        visible: true,
        title: "Limit Reached",
        message: "You can add up to 4 images per product.",
        type: "info",
      });
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setInfoModal({
          visible: true,
          title: "Permission Required",
          message: "Please allow photo library access to upload product images.",
          type: "info",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4 - images.length,
        quality: 0.85,
      });

      if (!result.canceled && result.assets) {
        const newImgs: ImageItem[] = result.assets.map((a) => ({
          uri: a.uri,
          isLocal: true,
        }));
        setImages([...images, ...newImgs].slice(0, 4));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch {
      setInfoModal({
        visible: true,
        title: "Image Selection Error",
        message: "Failed to open image picker. Please try again.",
        type: "error",
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const validate = (): string | null => {
    if (!title.trim() || title.trim().length < 3) {
      return "Product title must be at least 3 characters.";
    }
    if (!shortDescription.trim() || shortDescription.trim().length < 5) {
      return "Product description must be at least 5 characters.";
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return "Please enter a valid price (ETB).";
    }
    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return "Please enter a valid stock quantity.";
    }
    if (images.length === 0) {
      return "Please add at least one product photo.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Validation Error",
        message: errorMsg,
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock);

      const hasLocalImages = images.some((img) => img.isLocal);

      let payload: any;
      if (hasLocalImages) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("shortDescription", shortDescription.trim());
        formData.append("price", String(parsedPrice));
        formData.append("stock", String(parsedStock));
        formData.append("category", category);

        // Append remote image URLs if any
        const remoteUrls = images.filter((i) => !i.isLocal).map((i) => i.uri);
        if (remoteUrls.length > 0) {
          formData.append("imageUrls", JSON.stringify(remoteUrls));
        }

        // Append local file blobs
        images
          .filter((i) => i.isLocal)
          .forEach((img, idx) => {
            const filename = img.uri.split("/").pop() || `product_${idx}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const fileType = match ? `image/${match[1]}` : "image/jpeg";
            formData.append("images", {
              uri: img.uri,
              name: filename,
              type: fileType,
            } as any);
          });

        payload = formData;
      } else {
        payload = {
          title: title.trim(),
          shortDescription: shortDescription.trim(),
          price: parsedPrice,
          stock: parsedStock,
          category,
          imageUrls: images.map((i) => i.uri),
        };
      }

      if (isEditing && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Product Saved",
        message: `Product has been successfully ${isEditing ? "updated" : "published to the fellowship store"}.`,
        type: "success",
      });

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err: any) {
      const isOffline =
        !err?.response &&
        (err?.message?.includes("Network") ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ERR_NETWORK");
      setInfoModal({
        visible: true,
        title: isOffline ? "Connection Issue" : "Save Failed",
        message: isOffline
          ? "Network connection issue. Please check your internet connection and try again. Your form inputs have been preserved."
          : err?.response?.data?.message ||
            err?.message ||
            "Could not save product.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await deleteProduct(id);
      setDeleteModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Product Deleted",
        message: "The product has been removed from the fellowship store.",
        type: "success",
      });
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      const isOffline =
        !err?.response &&
        (err?.message?.includes("Network") ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ERR_NETWORK");
      setInfoModal({
        visible: true,
        title: isOffline ? "Connection Issue" : "Delete Failed",
        message: isOffline
          ? "Network connection issue. Please check your internet connection and try again."
          : err?.response?.data?.message ||
            err?.message ||
            "Could not delete product.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <AdminGuardFallback title="Manage Store Product" />;
  }

  if (loadingInitial) {
    return (
      <View
        style={[
          styles.screen,
          isDark ? styles.screenDark : styles.screenLight,
          styles.centerBox,
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        isDark ? styles.screenDark : styles.screenLight,
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader title={isEditing ? "Edit Product" : "Add Product"} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photos Carousel */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Product Images ({images.length}/4) <Text style={styles.required}>*</Text>
              </Text>
              {images.length < 4 && (
                <TouchableOpacity onPress={pickImages} style={styles.addPhotosLink}>
                  <Ionicons name="add" size={16} color={PRIMARY} />
                  <Text style={styles.addPhotosLinkText}>Add Photos</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryRow}
            >
              {images.map((img, idx) => (
                <View key={idx} style={styles.imageCard}>
                  <ExpoImage
                    source={{ uri: img.uri }}
                    style={styles.imageCardThumb}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    style={styles.removePhotoBadge}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                  {idx === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Cover</Text>
                    </View>
                  )}
                </View>
              ))}

              {images.length < 4 && (
                <Pressable
                  onPress={pickImages}
                  style={[
                    styles.imageCard,
                    styles.imageCardAdd,
                    isDark ? styles.inputDark : styles.inputLight,
                  ]}
                >
                  <Ionicons name="camera-outline" size={32} color={PRIMARY} />
                  <Text
                    style={[
                      styles.addPhotoText,
                      isDark ? styles.descDark : styles.descLight,
                    ]}
                  >
                    Add
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Product Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., 4 Kilo Fellowship Hoodie - Black"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "title" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Category <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipsWrap}>
              {CATEGORIES.map((c) => {
                const selected = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setCategory(c);
                    }}
                    style={[
                      styles.chip,
                      selected
                        ? styles.chipSelected
                        : isDark
                          ? styles.chipDark
                          : styles.chipLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected
                          ? styles.chipTextSelected
                          : isDark
                            ? styles.descDark
                            : styles.descLight,
                      ]}
                    >
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price & Stock */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Price (ETB) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="e.g., 650"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                onFocus={() => setFocusedField("price")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  focusedField === "price" && styles.inputFocused,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>
            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Stock Quantity <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                placeholder="e.g., 20"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                onFocus={() => setFocusedField("stock")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  focusedField === "stock" && styles.inputFocused,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Description & Specifications <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={shortDescription}
              onChangeText={setShortDescription}
              placeholder="Material, available sizes, sizing fit, delivery details..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              multiline
              numberOfLines={4}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                styles.textArea,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "desc" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.primaryBtn, submitting && styles.btnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={isEditing ? "checkmark" : "add"}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.primaryBtnText}>
                    {isEditing ? "Update Product" : "Publish Product"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                disabled={deleting}
                style={[styles.deleteBtn, deleting && styles.btnDisabled]}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={styles.deleteBtnText}>Delete Product</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        isDark={isDark}
        icon="trash-outline"
        iconColor="#ef4444"
        title="Delete Product"
        description="Are you sure you want to permanently delete this product from the fellowship store?"
        buttons={[
          {
            label: "Delete",
            variant: "danger",
            onPress: handleDelete,
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenDark: { backgroundColor: "#000" },
  screenLight: { backgroundColor: "#fff" },
  centerBox: { alignItems: "center", justifyContent: "center" },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  section: { marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { fontSize: 13, fontWeight: "600" },
  required: { color: "#ef4444" },
  textLight: { color: "#f8fafc" },
  textDark: { color: "#0f172a" },
  descDark: { color: "#94a3b8" },
  descLight: { color: "#64748b" },
  addPhotosLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  addPhotosLinkText: { fontSize: 13, fontWeight: "600", color: PRIMARY },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  inputDark: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
  },
  inputLight: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  inputFocused: {
    borderColor: PRIMARY,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDark: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
  },
  chipLight: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  chipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: "#ffffff" },
  galleryRow: { gap: 12, paddingVertical: 4 },
  imageCard: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  imageCardThumb: { width: "100%", height: "100%" },
  imageCardAdd: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addPhotoText: { fontSize: 12, fontWeight: "600" },
  removePhotoBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  primaryBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  btnRow: { marginTop: 10, gap: 12 },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
  btnDisabled: { opacity: 0.6 },
});
