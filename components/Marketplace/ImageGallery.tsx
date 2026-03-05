import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THUMBNAIL_SIZE = 64;
const THUMBNAIL_GAP = 10;

interface ImageGalleryProps {
  images: string[];
  isDark: boolean;
}

const ImageGallery = ({ images, isDark }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const galleryImages =
    images.length > 0 ? images : ["https://via.placeholder.com/500"];

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < galleryImages.length) {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
      }
    },
    [galleryImages.length],
  );

  return (
    <View style={styles.container}>
      {/* Main Image Carousel */}
      <FlatList
        ref={flatListRef}
        data={galleryImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `hero-${index}`}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={styles.heroSlide}>
            <Image
              source={{ uri: item }}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
            />
          </View>
        )}
      />

      {/* Dot Indicators */}
      {galleryImages.length > 1 && (
        <View style={styles.dotsContainer}>
          {galleryImages.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex ? "#fff" : "rgba(255,255,255,0.4)",
                  width: index === activeIndex ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && (
        <View
          style={[
            styles.thumbnailStrip,
            {
              backgroundColor: isDark
                ? "rgba(26,26,27,0.95)"
                : "rgba(255,255,255,0.95)",
            },
          ]}
        >
          {galleryImages.map((uri, index) => (
            <TouchableOpacity
              key={`thumb-${index}`}
              onPress={() => scrollToIndex(index)}
              activeOpacity={0.8}
              style={[
                styles.thumbnailWrapper,
                {
                  borderColor:
                    index === activeIndex
                      ? "#ff6719"
                      : isDark
                        ? "#3f3f46"
                        : "#e4e4e7",
                  borderWidth: index === activeIndex ? 2 : 1,
                },
              ]}
            >
              <Image
                source={{ uri }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={200}
              />
              {index === activeIndex && (
                <View style={styles.thumbnailOverlay}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  heroSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.95,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 84,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  thumbnailStrip: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: THUMBNAIL_GAP,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,103,25,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(ImageGallery);
