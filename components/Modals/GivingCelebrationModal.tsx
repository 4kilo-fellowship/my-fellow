import AppButton from "@/components/AppButton";
import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface GivingCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  reason?: string;
  txRef?: string | null;
  isDark?: boolean;
}

export const GivingCelebrationModal: React.FC<GivingCelebrationModalProps> = ({
  visible,
  onClose,
  amount,
  reason = "Gift",
  txRef,
  isDark = false,
}) => {
  const cardBg = isDark ? "#27272A" : "#F4F4F5";
  const textColor = isDark ? "#FFFFFF" : "#09090B";
  const subTextColor = isDark ? "#A1A1AA" : "#71717A";
  const borderColor = isDark ? "#3F3F46" : "#E4E4E7";

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      snapPoints={["half", "full"]}
    >
      <View style={styles.sheetContainer}>
        {/* Celebration Icon Header */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircleOuter,
              { backgroundColor: "rgba(255, 103, 25, 0.12)" },
            ]}
          >
            <View
              style={[styles.iconCircleInner, { backgroundColor: PRIMARY }]}
            >
              <Ionicons name="checkmark-sharp" size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Title & Affirmation */}
        <Text style={[styles.title, { color: textColor }]}>
          Thank You for Giving!
        </Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>
          Your contribution has been received with joy and gratitude.
        </Text>

        {/* Blessing Scripture Card */}
        <View
          style={[
            styles.scriptureCard,
            { backgroundColor: cardBg, borderColor },
          ]}
        >
          <Ionicons
            name="heart"
            size={18}
            color={PRIMARY}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={[
              styles.scriptureText,
              { color: isDark ? "#D4D4D8" : "#3F3F46" },
            ]}
          >
            “እግዚአብሔር ይባርክህ፥ ይጠብቅህም፤ እግዚአብሔር ፊቱን ያብራልህ፥ ይማርህም፤ እግዚአብሔር ፊቱን ወደ አንተ
            ያቅና፥ ሰላምንም ይስጥህ።”
          </Text>
          <Text style={[styles.scriptureRef, { color: PRIMARY }]}>
            ኦሪት ዘኍልቍ 6፥24-26
          </Text>
        </View>

        {/* Transaction Summary Card */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: cardBg, borderColor },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: subTextColor }]}>
              Amount Given
            </Text>
            <Text style={[styles.summaryAmount, { color: textColor }]}>
              {amount.toLocaleString()} ETB
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: subTextColor }]}>
              Reason
            </Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {reason}
            </Text>
          </View>

          {txRef ? (
            <View style={[styles.summaryRow, { marginTop: 6 }]}>
              <Text style={[styles.summaryLabel, { color: subTextColor }]}>
                Reference
              </Text>
              <Text
                style={[styles.summaryRef, { color: subTextColor }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {txRef}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <AppButton
            title="Done"
            onPress={onClose}
            variant="primary"
            size="lg"
            fullWidth={true}
            isDark={isDark}
          />
        </View>
      </View>
    </AppBottomSheet>
  );
};

export default GivingCelebrationModal;

const styles = StyleSheet.create({
  sheetContainer: {
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconCircleOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scriptureCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  scriptureText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 6,
  },
  scriptureRef: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  summaryCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "900",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  summaryRef: {
    fontSize: 11,
    maxWidth: 160,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  buttonWrapper: {
    width: "100%",
  },
});
