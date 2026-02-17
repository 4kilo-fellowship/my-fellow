import { PRIMARY } from "@/constants";
import { useAppStore } from "@/stores/app.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

interface Slide {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string[];
  title: string;
  subtitle: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    icon: "people",
    iconBg: ["#ff6719", "#ff8a50"],
    title: "Welcome to\nYour Fellowship",
    subtitle:
      "Join a vibrant community of believers growing together in faith, love, and purpose.",
    accent: "#ff6719",
  },
  {
    id: 2,
    icon: "book",
    iconBg: ["#ff6719", "#e85d10"],
    title: "Daily\nDevotions",
    subtitle:
      "Nourish your spirit with daily devotions, insightful readings, and guided prayers.",
    accent: "#ff6719",
  },
  {
    id: 3,
    icon: "notifications",
    iconBg: ["#ff6719", "#ff8a50"],
    title: "Stay\nConnected",
    subtitle:
      "Never miss an event, announcement, or program. Stay in the loop with your community.",
    accent: "#ff6719",
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
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === currentIndex} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 28 : 8);
  const opacity = useSharedValue(active ? 1 : 0.3);

  React.useEffect(() => {
    width.value = withSpring(active ? 28 : 8, {
      damping: 15,
      stiffness: 200,
    });
    opacity.value = withSpring(active ? 1 : 0.3, {
      damping: 15,
      stiffness: 200,
    });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
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

      {/* Skip */}
      <Animated.View
        entering={FadeIn.delay(600).duration(500)}
        style={styles.skipContainer}
      >
        <TouchableOpacity
          onPress={handleComplete}
          activeOpacity={0.7}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </Animated.View>

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
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.slideContent}>
              {/* Icon Area */}
              <Animated.View
                entering={FadeInDown.delay(200 + index * 100)
                  .duration(700)
                  .springify()
                  .damping(14)}
                style={styles.illustrationArea}
              >
                {/* Decorative rings */}
                <View style={styles.iconWrapper}>
                  <View
                    style={[
                      styles.outerRing,
                      { borderColor: `${slide.accent}15` },
                    ]}
                  />
                  <View
                    style={[
                      styles.middleRing,
                      { borderColor: `${slide.accent}20` },
                    ]}
                  />
                  <View
                    style={[
                      styles.innerRing,
                      { borderColor: `${slide.accent}28` },
                    ]}
                  />
                  <LinearGradient
                    colors={slide.iconBg as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconCircle}
                  >
                    <Ionicons name={slide.icon} size={56} color="#fff" />
                  </LinearGradient>
                </View>

                {/* Floating particles */}
                <Animated.View
                  entering={FadeIn.delay(700).duration(600)}
                  style={[
                    styles.particle,
                    styles.particleTopRight,
                    { backgroundColor: `${slide.accent}30` },
                  ]}
                />
                <Animated.View
                  entering={FadeIn.delay(900).duration(600)}
                  style={[
                    styles.particle,
                    styles.particleBottomLeft,
                    { backgroundColor: `${slide.accent}20` },
                  ]}
                />
                <Animated.View
                  entering={FadeIn.delay(800).duration(600)}
                  style={[
                    styles.particleSmall,
                    styles.particleMidRight,
                    { backgroundColor: `${slide.accent}40` },
                  ]}
                />
              </Animated.View>

              {/* Text */}
              <View style={styles.textArea}>
                <Animated.Text
                  entering={FadeInUp.delay(350 + index * 100).duration(600)}
                  style={styles.title}
                >
                  {slide.title}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.delay(500 + index * 100).duration(600)}
                  style={styles.subtitle}
                >
                  {slide.subtitle}
                </Animated.Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <Animated.View
        entering={FadeInUp.delay(700).duration(500)}
        style={styles.bottomArea}
      >
        <DotIndicator currentIndex={currentIndex} total={SLIDES.length} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={styles.ctaButtonOuter}
        >
          <LinearGradient
            colors={["#ff6719", "#e85d10"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            {isLastSlide ? (
              <Text style={styles.ctaText}>Get Started</Text>
            ) : (
              <View style={styles.ctaInner}>
                <Text style={styles.ctaText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipContainer: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94a3b8",
    marginRight: 2,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  illustrationArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  iconWrapper: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  outerRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
  },
  middleRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
  },
  innerRing: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 18,
  },
  particle: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  particleSmall: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  particleTopRight: {
    top: 8,
    right: -12,
  },
  particleBottomLeft: {
    bottom: 8,
    left: -8,
  },
  particleMidRight: {
    top: "45%" as unknown as number,
    right: -22,
  },
  textArea: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
    maxWidth: 300,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  bottomArea: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: "center",
  },
  ctaButtonOuter: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
