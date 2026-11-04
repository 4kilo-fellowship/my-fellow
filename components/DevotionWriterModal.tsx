import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PRIMARY } from "@/constants";
import { useUserStore } from "@/stores/user.store";
import {
  devotionWriterService,
  WriterRequest,
} from "@/services/devotionWriterService";
import { router } from "expo-router";
import { AppBottomSheet } from "@/components/AppBottomSheet";

interface DevotionWriterModalProps {
  visible: boolean;
  onClose: () => void;
  existingRequest: WriterRequest | null;
  onSuccess: (request: WriterRequest) => void;
}

export function DevotionWriterModal({
  visible,
  onClose,
  existingRequest,
  onSuccess,
}: DevotionWriterModalProps) {
  const { user } = useUserStore();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [sampleTopic, setSampleTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setTelegramHandle(user.telegramUserName || "");
      setDepartment(user.department || "");
      setYear(user.yearOfStudy || "");
      setSampleTopic("");
      setMessage("");
    }
  }, [visible, user]);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to submit a devotion writer application.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => {
              onClose();
              router.push("/(auth)/sign-in");
            },
          },
        ]
      );
      return;
    }

    if (!fullName.trim()) {
      Alert.alert("Required", "Please provide your full name.");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Required", "Please provide your phone number.");
      return;
    }

    if (!telegramHandle.trim()) {
      Alert.alert(
        "Telegram Handle Required",
        "Please provide your Telegram handle (e.g., @username) so the editorial team can coordinate with you."
      );
      return;
    }

    if (!sampleTopic.trim()) {
      Alert.alert(
        "Devotion Topic Required",
        "Please provide a sample devotion topic or passage you'd like to write about."
      );
      return;
    }

    try {
      setSubmitting(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}

      const formattedTelegram = telegramHandle.trim().startsWith("@")
        ? telegramHandle.trim()
        : `@${telegramHandle.trim()}`;

      const created = await devotionWriterService.submitApplication({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        telegramHandle: formattedTelegram,
        department: department.trim() || undefined,
        year: year.trim() || undefined,
        sampleTopic: sampleTopic.trim(),
        message: message.trim() || undefined,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}

      Alert.alert(
        "Application Submitted! 🙏",
        "Thank you for your heart to serve! The fellowship editorial team will review your application and contact you on Telegram."
      );

      onSuccess(created);
      onClose();
    } catch (error: any) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } catch {}

      Alert.alert(
        "Submission Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Could not submit application. Please check your network and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={["full"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetContentInner}
      >
        {/* Top Title & Close Button */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="create" size={18} color={PRIMARY} />
            </View>
            <Text style={styles.sheetTitle}>Apply to Write Devotions</Text>
          </View>
          <Pressable
            hitSlop={10}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color="#71717a" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* If user already has a pending application */}
          {existingRequest?.status === "pending" ? (
            <View style={styles.statusBox}>
              <View style={styles.statusBadgePending}>
                <Ionicons name="time-outline" size={16} color="#d97706" />
                <Text style={styles.statusBadgePendingText}>
                  Application Pending Review
                </Text>
              </View>
              <Text style={styles.statusDescription}>
                Your application to write devotions has been received. Our
                fellowship editorial team is reviewing it and will reach out to
                you via Telegram at{" "}
                <Text style={{ fontWeight: "700", color: "#09090b" }}>
                  {existingRequest.telegramHandle}
                </Text>
                .
              </Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sample Topic:</Text>
                <Text style={styles.detailValue}>
                  {existingRequest.sampleTopic}
                </Text>
              </View>
              <Pressable
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                style={styles.secondaryDoneBtn}
                onPress={onClose}
              >
                <Text style={styles.secondaryDoneBtnText}>Got It</Text>
              </Pressable>
            </View>
          ) : existingRequest?.status === "approved" ? (
            <View style={styles.statusBox}>
              <View style={styles.statusBadgeApproved}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={styles.statusBadgeApprovedText}>
                  Approved Fellowship Writer
                </Text>
              </View>
              <Text style={styles.statusDescription}>
                You are an approved devotional contributor! Contact the
                fellowship editorial team on Telegram to submit your drafts.
              </Text>
              <Pressable
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                style={styles.secondaryDoneBtn}
                onPress={onClose}
              >
                <Text style={styles.secondaryDoneBtnText}>Close</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.sheetSubtitle}>
                Encourage fellow students through your written reflections,
                scriptural insights, and testimony.
              </Text>

              {/* Form Inputs */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your Full Name"
                  placeholderTextColor="#a1a1aa"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Phone *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="09..."
                    placeholderTextColor="#a1a1aa"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Telegram Username *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="@username"
                    placeholderTextColor="#a1a1aa"
                    autoCapitalize="none"
                    value={telegramHandle}
                    onChangeText={setTelegramHandle}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Department</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Electrical Eng"
                    placeholderTextColor="#a1a1aa"
                    value={department}
                    onChangeText={setDepartment}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Academic Year</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 3rd Year"
                    placeholderTextColor="#a1a1aa"
                    value={year}
                    onChangeText={setYear}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Sample Devotion Topic / Passage *
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Walking in Grace on Campus (Romans 8:1)"
                  placeholderTextColor="#a1a1aa"
                  value={sampleTopic}
                  onChangeText={setSampleTopic}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Personal Notes / Why you&apos;d like to write (Optional)
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Share a brief note about what God has put on your heart..."
                  placeholderTextColor="#a1a1aa"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              {/* Submit Primary Native Button */}
              <View style={styles.submitButtonWrapper}>
                <Pressable
                  android_ripple={{
                    color: "rgba(255, 255, 255, 0.25)",
                    foreground: true,
                  }}
                  style={({ pressed }) => [
                    styles.submitButton,
                    submitting && { opacity: 0.7 },
                    Platform.OS === "ios" && pressed && { opacity: 0.88 },
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name="paper-plane"
                        size={17}
                        color="#ffffff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.submitButtonText}>
                        Submit Application
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContentInner: {
    flex: 1,
    paddingTop: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSubtitle: {
    fontSize: 13,
    color: "#71717a",
    lineHeight: 18,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3f3f46",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#09090b",
  },
  textArea: {
    height: 80,
    paddingTop: 10,
  },
  submitButtonWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: PRIMARY,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    paddingVertical: 14,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  statusBox: {
    paddingVertical: 16,
    alignItems: "center",
  },
  statusBadgePending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusBadgePendingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b45309",
  },
  statusBadgeApproved: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusBadgeApprovedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803d",
  },
  statusDescription: {
    fontSize: 13.5,
    color: "#52525b",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  detailRow: {
    backgroundColor: "#f4f4f5",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#09090b",
  },
  secondaryDoneBtn: {
    backgroundColor: "#09090b",
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 8,
  },
  secondaryDoneBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default DevotionWriterModal;
