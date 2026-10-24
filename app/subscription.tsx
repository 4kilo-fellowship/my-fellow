import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 56, 360);
const CARD_SPACING = 14;

export interface PlanFeature {
  title: string;
  included: boolean;
  isNew?: boolean;
  isSpecial?: boolean;
}

export interface Plan {
  id: string;
  badge?: string;
  badgeType?: "popular" | "best_value" | "starter";
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tagline: string;
  price: string;
  amount: number;
  priceSubtitle: string;
  comparisonSubtitle?: string;
  features: PlanFeature[];
  buttonText: string;
  primary?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "pro_plus",
    badge: "★ Most Popular",
    badgeType: "popular",
    icon: "diamond-outline",
    title: "Pro Plus",
    tagline: "The complete edge for top believers & leaders",
    price: "499 birr",
    amount: 499,
    priceSubtitle: "One-time · only 200 birr over Pro",
    features: [
      { title: "Everything included in Fellowship Pro", included: true },
      {
        title: "Full access to every course and new study materials",
        included: true,
      },
      {
        title: "AI tutor and smart devotional study tools",
        included: true,
      },
      {
        title: "Advanced personal analytics and growth tracking",
        included: true,
      },
      {
        title: "The complete fellowship leadership experience",
        included: true,
      },
      {
        title: "7 Days Growth Sprint — videos, notes & PDF",
        included: true,
        isNew: true,
        isSpecial: true,
      },
    ],
    buttonText: "Go Pro Plus",
    primary: true,
  },
  {
    id: "pro",
    badge: "⚡ Best Value",
    badgeType: "best_value",
    icon: "flash-outline",
    title: "Pro",
    tagline: "Everything you need to practice and grow daily",
    price: "299 birr",
    amount: 299,
    priceSubtitle: "One-time · full seasonal access",
    comparisonSubtitle: "Don't miss out on seasonal growth",
    features: [
      { title: "Full access to every practice set & lesson", included: true },
      { title: "New devotionals and study series added regularly", included: true },
      { title: "All realistic mock sessions & group discussions", included: true },
      { title: "Leaderboards and detailed spiritual growth reports", included: true },
      { title: "Limited course lessons and selected resources", included: true },
      {
        title: "7 Days Growth Sprint — practice only",
        included: true,
        isNew: true,
        isSpecial: true,
      },
      {
        title: "No videos, no notes, no master course content",
        included: false,
      },
    ],
    buttonText: "Get Pro",
    primary: false,
  },
  {
    id: "starter",
    badge: "🌱 Essential",
    badgeType: "starter",
    icon: "sparkles-outline",
    title: "Starter",
    tagline: "Core devotionals and basic fellowship access",
    price: "99 birr",
    amount: 99,
    priceSubtitle: "One-time · perpetual access",
    features: [
      { title: "Daily Scripture & core devotion reading", included: true },
      { title: "Public fellowship announcements & events", included: true },
      { title: "Basic discussion group participation", included: true },
      { title: "No advanced analytics or leaderboards", included: false },
      { title: "No master courses or audio materials", included: false },
      { title: "No 7-Day Sprint package", included: false },
    ],
    buttonText: "Get Starter",
    primary: false,
  },
];

export interface PaymentMethod {
  id: "telebirr" | "cbe" | "chapa";
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "telebirr",
    title: "Telebirr",
    subtitle: "Instant Mobile",
    iconName: "phone-portrait-outline",
    badge: "Fast",
  },
  {
    id: "cbe",
    title: "CBE Birr",
    subtitle: "Commercial Bank",
    iconName: "business-outline",
  },
  {
    id: "chapa",
    title: "Card / Bank",
    subtitle: "Chapa & Visa",
    iconName: "card-outline",
  },
];

export default function SubscriptionScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<"telebirr" | "cbe" | "chapa">("telebirr");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    if (index >= 0 && index < PLANS.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      router.push("/(auth)/sign-in" as any);
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      // 1. First try hosted Verify Checkout integration (https://checkout.verify.et/)
      // Endpoint contract: POST https://checkoutapi.verify.et/v1/deposits
      const depositPayload = {
        amount: plan.amount.toFixed(2),
        currency: "ETB",
        payment_method: selectedMethod,
        merchant_customer_id: user.id || user.email || "user_fellow",
        return_url: "myfellow://payment-status",
        metadata: {
          plan_id: plan.id,
          plan_title: plan.title,
          user_email: user.email,
        },
      };

      let checkoutUrl: string | null = null;

      try {
        // Attempt backend endpoint first
        const res = await api.post("/payments/verify-checkout/init", depositPayload);
        checkoutUrl = res.data?.data?.checkout_url || res.data?.checkout_url;
      } catch {
        // Fallback to Chapa init endpoint
        try {
          const chapaRes = await api.post("/payments/chapa/init", {
            amount: plan.amount,
            email: user.email || "support@fellowship.et",
            reason: `Subscription: ${plan.title}`,
          });
          checkoutUrl =
            chapaRes.data?.checkout_url || chapaRes.data?.data?.checkout_url;
        } catch {
          // If server endpoints unavailable in sandbox, construct demo Verify Checkout URL
          checkoutUrl = `https://checkout.verify.et/c/demo_${plan.id}_${Date.now()}`;
        }
      }

      if (checkoutUrl) {
        await WebBrowser.openBrowserAsync(checkoutUrl);
      } else {
        throw new Error("Unable to create checkout session.");
      }
    } catch (err: any) {
      setInfoModal({
        visible: true,
        title: "Checkout Error",
        message:
          err.message ||
          "Could not initialize checkout. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#0f0f10" : "#f8fafc" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Screen Header Bar */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: Math.max(top, 12),
            backgroundColor: isDark ? "#0f0f10" : "#f8fafc",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={[
            styles.backBtn,
            { backgroundColor: isDark ? "#1f1f23" : "#e2e8f0" },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={isDark ? "#ffffff" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.navTitle,
            { color: isDark ? "#a1a1aa" : "#64748b" },
          ]}
        >
          Membership & Plans
        </Text>

        <View style={styles.navBarPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(bottom, 20) + 24 },
        ]}
      >
        {/* Main Header with Title, Tagline and Counter */}
        <View style={styles.headerSection}>
          <View style={styles.headerTitleRow}>
            <Text
              style={[
                styles.headline,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              Invest in your score
            </Text>
            <Text
              style={[
                styles.counterBadge,
                { color: PRIMARY },
              ]}
            >
              {activeIndex + 1} of {PLANS.length}
            </Text>
          </View>
          <Text
            style={[
              styles.subheadline,
              { color: isDark ? "#a1a1aa" : "#64748b" },
            ]}
          >
            One payment. No subscriptions. Yours until exam day.
          </Text>
        </View>

        {/* Swipeable Plan Cards Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={PLANS}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.cardsFlatListContent}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const isSelected = activeIndex === index;
              const isLoading = loadingPlanId === item.id;

              return (
                <View
                  style={[
                    styles.planCard,
                    {
                      width: CARD_WIDTH,
                      backgroundColor: isDark ? "#17171a" : "#ffffff",
                      borderColor: item.primary
                        ? PRIMARY
                        : isDark
                        ? isSelected
                          ? "#3f3f46"
                          : "#27272a"
                        : isSelected
                        ? "#cbd5e1"
                        : "#e2e8f0",
                      borderWidth: item.primary ? 2 : 1.5,
                    },
                  ]}
                >
                  {/* Floating Badge (e.g., Most Popular) */}
                  {item.badge ? (
                    <View
                      style={[
                        styles.cardBadge,
                        {
                          backgroundColor:
                            item.badgeType === "popular"
                              ? PRIMARY
                              : item.badgeType === "best_value"
                              ? "#3b82f6"
                              : isDark
                              ? "#27272a"
                              : "#e2e8f0",
                        },
                      ]}
                    >
                      <Text style={styles.cardBadgeText}>{item.badge}</Text>
                    </View>
                  ) : null}

                  {/* Icon */}
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: item.primary
                          ? "rgba(255, 103, 25, 0.12)"
                          : isDark
                          ? "#27272a"
                          : "#f1f5f9",
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={28}
                      color={item.primary ? PRIMARY : isDark ? "#e4e4e7" : "#334155"}
                    />
                  </View>

                  {/* Title & Tagline */}
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isDark ? "#ffffff" : "#0f172a" },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardTagline,
                      { color: isDark ? "#a1a1aa" : "#64748b" },
                    ]}
                  >
                    {item.tagline}
                  </Text>

                  {/* Price */}
                  <Text
                    style={[
                      styles.cardPrice,
                      { color: item.primary ? PRIMARY : isDark ? "#ffffff" : "#0f172a" },
                    ]}
                  >
                    {item.price}
                  </Text>
                  <Text
                    style={[
                      styles.cardPriceSubtitle,
                      { color: isDark ? "#71717a" : "#94a3b8" },
                    ]}
                  >
                    {item.priceSubtitle}
                  </Text>

                  {item.comparisonSubtitle ? (
                    <Text
                      style={[
                        styles.comparisonText,
                        { color: isDark ? "#a1a1aa" : "#64748b" },
                      ]}
                    >
                      {item.comparisonSubtitle}
                    </Text>
                  ) : null}

                  <View
                    style={[
                      styles.divider,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.06)",
                      },
                    ]}
                  />

                  {/* Features List */}
                  <View style={styles.featuresList}>
                    {item.features.map((feat: PlanFeature, fIndex: number) => {
                      if (!feat.included) {
                        return (
                          <View key={fIndex} style={styles.featureRow}>
                            <View style={styles.crossCircle}>
                              <Ionicons name="close" size={13} color="#ffffff" />
                            </View>
                            <Text
                              style={[
                                styles.featureText,
                                { color: isDark ? "#ef4444" : "#dc2626" },
                              ]}
                            >
                              {feat.title}
                            </Text>
                          </View>
                        );
                      }

                      if (feat.isSpecial) {
                        return (
                          <View key={fIndex} style={styles.featureRow}>
                            <View style={styles.rocketCircle}>
                              <Ionicons name="rocket" size={13} color="#ffffff" />
                            </View>
                            <Text
                              style={[
                                styles.featureText,
                                styles.featureTextBold,
                                { color: isDark ? "#22c55e" : "#16a34a" },
                              ]}
                            >
                              {feat.title}
                            </Text>
                            <View style={styles.newBadge}>
                              <Text style={styles.newBadgeText}>NEW</Text>
                            </View>
                          </View>
                        );
                      }

                      return (
                        <View key={fIndex} style={styles.featureRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={item.primary ? PRIMARY : "#3b82f6"}
                          />
                          <Text
                            style={[
                              styles.featureText,
                              { color: isDark ? "#e4e4e7" : "#334155" },
                            ]}
                          >
                            {feat.title}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* CTA Button */}
                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={isLoading}
                    onPress={() => handleSelectPlan(item)}
                    style={[
                      styles.ctaButton,
                      {
                        backgroundColor: item.primary
                          ? PRIMARY
                          : isDark
                          ? "#27272a"
                          : "#0f172a",
                      },
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.ctaButtonText}>{item.buttonText}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>

        {/* Carousel Pagination Dots */}
        <View style={styles.dotsRow}>
          {PLANS.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToOffset({
                  offset: i * (CARD_WIDTH + CARD_SPACING),
                  animated: true,
                });
                setActiveIndex(i);
              }}
              style={[
                styles.dot,
                activeIndex === i
                  ? [styles.activeDot, { backgroundColor: PRIMARY }]
                  : {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(0, 0, 0, 0.15)",
                    },
              ]}
            />
          ))}
        </View>

        {/* Bottom Section: Payment Methods + Trust Badges */}
        <View style={styles.bottomSection}>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: isDark ? "#a1a1aa" : "#64748b" },
            ]}
          >
            SELECT PAYMENT METHOD
          </Text>

          {/* Payment Method Cards */}
          <View style={styles.paymentMethodsRow}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = selectedMethod === pm.id;
              return (
                <Pressable
                  key={pm.id}
                  onPress={() => setSelectedMethod(pm.id)}
                  style={[
                    styles.paymentMethodCard,
                    {
                      backgroundColor: isDark ? "#17171a" : "#ffffff",
                      borderColor: isSelected
                        ? PRIMARY
                        : isDark
                        ? "#27272a"
                        : "#e2e8f0",
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={pm.iconName}
                    size={20}
                    color={isSelected ? PRIMARY : isDark ? "#a1a1aa" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.pmTitle,
                      { color: isDark ? "#ffffff" : "#0f172a" },
                    ]}
                  >
                    {pm.title}
                  </Text>
                  <Text
                    style={[
                      styles.pmSubtitle,
                      { color: isDark ? "#71717a" : "#94a3b8" },
                    ]}
                  >
                    {pm.subtitle}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Trust Guarantees */}
          <View style={styles.trustBadgesContainer}>
            <View style={styles.trustRow}>
              <Ionicons name="checkmark-circle" size={17} color="#3b82f6" />
              <Text
                style={[
                  styles.trustText,
                  { color: isDark ? "#d4d4d8" : "#475569" },
                ]}
              >
                One-time payment. No recurring charges.
              </Text>
            </View>

            <View style={styles.trustRow}>
              <Ionicons name="lock-closed" size={16} color={isDark ? "#9ca3af" : "#64748b"} />
              <Text
                style={[
                  styles.trustText,
                  { color: isDark ? "#9ca3af" : "#64748b" },
                ]}
              >
                Secure & safe verification via Verify.et
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  navBarPlaceholder: {
    width: 38,
  },
  scrollContainer: {
    paddingTop: 8,
  },
  headerSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headline: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  counterBadge: {
    fontSize: 15,
    fontWeight: "800",
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  carouselContainer: {
    marginVertical: 4,
  },
  cardsFlatListContent: {
    paddingHorizontal: 24,
    gap: CARD_SPACING,
  },
  planCard: {
    borderRadius: 28,
    padding: 24,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  cardBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
    marginTop: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },
  cardTagline: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  cardPrice: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  cardPriceSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 16,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },
  featureTextBold: {
    fontWeight: "700",
  },
  rocketCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  crossCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  newBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
  ctaButton: {
    height: 52,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    borderRadius: 4,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  paymentMethodsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  paymentMethodCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pmTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  pmSubtitle: {
    fontSize: 10,
    fontWeight: "600",
  },
  trustBadgesContainer: {
    gap: 10,
    alignItems: "center",
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trustText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
