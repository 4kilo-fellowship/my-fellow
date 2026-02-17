import { useAppStore } from "@/stores/app.store";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ILLUSTRATION_SIZE = SCREEN_WIDTH * 0.7;

interface Slide {
  id: number;
  image: any;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: require("@/assets/images/onboarding-community.png"),
    title: "Welcome to\nYour Fellowship",
    subtitle:
      "Join a vibrant community of believers growing together in faith, love, and purpose.",
  },
  {
    id: 2,
    image: require("@/assets/images/onboarding-devotion.png"),
    title: "Daily\nDevotions",
    subtitle:
      "Nourish your spirit with daily devotions, insightful readings, and guided prayers.",
  },
  {
    id: 3,
    image: require("@/assets/images/onboarding-connected.png"),
    title: "Stay\nConnected",
    subtitle:
      "Never miss an event, announcement, or program. Stay in the loop with your community.",
  },
];

function DotIndicator({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === currentIndex} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 24 : 8);
  const bgOpacity = useSharedValue(active ? 1 : 0.25);

  React.useEffect(() => {
    width.value = withSpring(active ? 24 : 8, {
      damping: 16,
      stiffness: 180,
    });
    bgOpacity.value = withSpring(active ? 1 : 0.25, {
      damping: 16,
      stiffness: 180,
    });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: bgOpacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const setHasCompletedOnboarding = useAppStore(
    (s) => s.setHasCompletedOnboarding,
  );

  const handleComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
    router.replace("/(tabs)");
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: SCREEN_WIDTH * (currentIndex + 1),
        animated: true,
      });
    } else {
      handleComplete();
    }
  }, [currentIndex]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
        setCurrentIndex(index);
      }
    },
    [currentIndex],
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
        style={styles.scrollArea}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            {/* Illustration */}
            <Animated.View
              entering={FadeInDown.delay(150 + index * 80)
                .duration(600)
                .springify()
                .damping(16)}
              style={styles.illustrationContainer}
            >
              <View style={styles.illustrationCircle}>
                <Image
                  source={slide.image}
                  style={styles.illustration}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </View>
            </Animated.View>

            {/* Text */}
            <View style={styles.textContainer}>
              <Animated.Text
                entering={FadeInUp.delay(300 + index * 80).duration(500)}
                style={styles.title}
              >
                {slide.title}
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(450 + index * 80).duration(500)}
                style={styles.subtitle}
              >
                {slide.subtitle}
              </Animated.Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom bar: Skip — Dots — Next */}
      <Animated.View
        entering={FadeIn.delay(600).duration(400)}
        style={styles.bottomBar}
      >
        <TouchableOpacity
          onPress={handleComplete}
          activeOpacity={0.6}
          style={styles.bottomAction}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <DotIndicator currentIndex={currentIndex} total={SLIDES.length} />

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.7}
          style={styles.bottomAction}
        >
          <Text style={styles.nextText}>{isLastSlide ? "Start" : "Next"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollArea: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: SCREEN_HEIGHT * 0.08,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  illustrationCircle: {
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    borderRadius: ILLUSTRATION_SIZE / 2,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  illustration: {
    width: ILLUSTRATION_SIZE * 1.15,
    height: ILLUSTRATION_SIZE * 1.15,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1a1a2e",
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: "#8a8a9a",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
    maxWidth: 280,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingBottom: 50,
    paddingTop: 16,
  },
  bottomAction: {
    width: 60,
    alignItems: "center",
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#b0b0be",
  },
  nextText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1a1a2e",
  },
});
