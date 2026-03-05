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
  const isProgrammaticScroll = useRef(false);

  const galleryImages =
    images.length > 0 ? images : ["https://via.placeholder.com/500"];

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Skip updates during programmatic scroll to prevent blinking
      if (isProgrammaticScroll.current) return;
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
        isProgrammaticScroll.current = true;
        setActiveIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
        // Re-enable viewable tracking after scroll animation settles
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 400);
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
          {galleryImages.map((uri, index) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                key={`thumb-${index}`}
                onPress={() => scrollToIndex(index)}
                activeOpacity={0.85}
                style={[
                  styles.thumbnailWrapper,
                  {
                    borderColor: isActive
                      ? "#fff"
                      : isDark
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.08)",
                    borderWidth: isActive ? 2 : 1,
                    opacity: isActive ? 1 : 0.6,
                  },
                ]}
              >
                <Image
                  source={{ uri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            );
          })}
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
    height: SCREEN_WIDTH * 1.15,
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
    borderRadius: 10,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});

export default React.memo(ImageGallery);
