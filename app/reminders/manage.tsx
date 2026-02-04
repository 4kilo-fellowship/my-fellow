import { useTheme } from "@/context/ThemeContext";
import { useAlertsStore } from "@/stores/alerts.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const alertSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title is too long"),
  description: z.string().max(200, "Description is too long"),
  date: z.date({
    message: "Please select a date",
  }),
  repeats: z.enum(["none", "daily", "weekly"]),
  remindBefore: z.number(),
});

type FormData = z.infer<typeof alertSchema>;

const FREQUENCY_OPTIONS = ["none", "daily", "weekly"] as const;
const REMIND_OPTIONS = [
  { label: "At Time", value: 0 },
  { label: "5m", value: 5 },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
];

export default function ManageAlertScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { alerts, addAlert, updateAlert } = useAlertsStore();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePicked, setDatePicked] = useState(false);
  const [timePicked, setTimePicked] = useState(false);

  const initialAlert = id ? alerts.find((a) => a.id === id) : undefined;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: initialAlert?.title || "",
      description: initialAlert?.description || "",
      date: initialAlert
        ? new Date(initialAlert.time)
        : new Date(Date.now() + 5 * 60000),
      repeats: initialAlert?.repeats || "none",
      remindBefore: initialAlert?.remindBefore || 0,
    },
  });

  const selectedDate = watch("date");
  const selectedRepeats = watch("repeats");
  const selectedRemindBefore = watch("remindBefore");

  useEffect(() => {
    if (initialAlert) {
      setDatePicked(true);
      setTimePicked(true);
    }
  }, [initialAlert]);

  const onSubmit = async (data: FormData) => {
    const alertData = {
      title: data.title,
      description: data.description,
      time: data.date.toISOString(),
      repeats: data.repeats,
      remindBefore: data.remindBefore,
    };

    if (initialAlert) {
      await updateAlert({ ...initialAlert, ...alertData });
    } else {
      await addAlert(alertData);
    }
    router.back();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#F8F9FA" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            {id ? "Edit Alert" : "Add Alert"}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#A0A0A0" : "#666666" },
                ]}
              >
                NAME
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., Morning Prayer"
                    placeholderTextColor={isDark ? "#48484A" : "#AEAEB2"}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                        borderColor: errors.title ? "#FF3B30" : "transparent",
                        color: isDark ? "#FFFFFF" : "#000000",
                      },
                    ]}
                  />
                )}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#A0A0A0" : "#666666" },
                ]}
              >
                DETAILS
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Add some details..."
                    placeholderTextColor={isDark ? "#48484A" : "#AEAEB2"}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                        borderColor: errors.description
                          ? "#FF3B30"
                          : "transparent",
                        color: isDark ? "#FFFFFF" : "#000000",
                      },
                    ]}
                  />
                )}
              />
              {errors.description && (
                <Text style={styles.errorText}>
                  {errors.description.message}
                </Text>
              )}
            </View>

            {/* DateTime Row */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? "#A0A0A0" : "#666666" },
                  ]}
                >
                  DATE
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[
                    styles.pickerTrigger,
                    { backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7" },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerValue,
                      {
                        color: !datePicked
                          ? "#AEAEB2"
                          : isDark
                            ? "#FFFFFF"
                            : "#000000",
                      },
                    ]}
                  >
                    {datePicked
                      ? selectedDate.toLocaleDateString()
                      : "Select Date"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={isDark ? "#A0A0A0" : "#666666"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.flex1}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? "#A0A0A0" : "#666666" },
                  ]}
                >
                  TIME
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={[
                    styles.pickerTrigger,
                    { backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7" },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerValue,
                      {
                        color: !timePicked
                          ? "#AEAEB2"
                          : isDark
                            ? "#FFFFFF"
                            : "#000000",
                      },
                    ]}
                  >
                    {timePicked
                      ? selectedDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Select Time"}
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={isDark ? "#A0A0A0" : "#666666"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(date.getFullYear());
                    newDate.setMonth(date.getMonth());
                    newDate.setDate(date.getDate());
                    setValue("date", newDate, { shouldValidate: true });
                    setDatePicked(true);
                  }
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    const newDate = new Date(selectedDate);
                    newDate.setHours(date.getHours());
                    newDate.setMinutes(date.getMinutes());
                    setValue("date", newDate, { shouldValidate: true });
                    setTimePicked(true);
                  }
                }}
              />
            )}

            {/* Frequency */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#A0A0A0" : "#666666" },
                ]}
              >
                REPETITION
              </Text>
              <View
                style={[
                  styles.segmentedControl,
                  { backgroundColor: isDark ? "#121212" : "#F2F2F7" },
                ]}
              >
                {FREQUENCY_OPTIONS.map((r) => {
                  const isActive = selectedRepeats === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() =>
                        setValue("repeats", r, { shouldValidate: true })
                      }
                      style={[
                        styles.segmentItem,
                        isActive &&
                          (isDark
                            ? styles.segmentActiveDark
                            : styles.segmentActiveLight),
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color: isActive
                              ? "#F97316"
                              : isDark
                                ? "#8E8E93"
                                : "#636366",
                          },
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Remind me */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#A0A0A0" : "#666666" },
                ]}
              >
                REMIND BEFORE
              </Text>
              <View style={styles.pillContainer}>
                {REMIND_OPTIONS.map((item) => {
                  const isActive = selectedRemindBefore === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() =>
                        setValue("remindBefore", item.value, {
                          shouldValidate: true,
                        })
                      }
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isActive
                            ? "#F97316"
                            : isDark
                              ? "#2C2C2E"
                              : "#F2F2F7",
                          borderColor: isActive ? "#F97316" : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          {
                            color: isActive
                              ? "#FFFFFF"
                              : isDark
                                ? "#8E8E93"
                                : "#636366",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Notification Confirmation */}
            <View
              style={[
                styles.notificationBox,
                {
                  backgroundColor: isDark ? "#121212" : "#FFF7ED",
                  borderColor: isDark ? "#2C2C2E" : "#FED7AA",
                },
              ]}
            >
              <Ionicons name="notifications" size={20} color="#F97316" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[
                    styles.notificationTitle,
                    { color: isDark ? "#FFFFFF" : "#9A3412" },
                  ]}
                >
                  Notification Alert
                </Text>
                <Text
                  style={[
                    styles.notificationDesc,
                    { color: isDark ? "#A0A0A0" : "#C2410C" },
                  ]}
                >
                  This alert will notify you with a standard system sound.
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            style={styles.submitButton}
          >
            <Text style={styles.submitText}>
              {id ? "Update Alert" : "Create Alert"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    borderRadius: 25,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 2,
    borderColor: "transparent",
  },
  textArea: {
    height: 100,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 2,
    borderColor: "transparent",
    textAlignVertical: "top",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
    marginLeft: 5,
  },
  row: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  flex1: {
    flex: 1,
  },
  pickerTrigger: {
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  segmentedControl: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentActiveLight: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentActiveDark: {
    backgroundColor: "#2C2C2E",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  notificationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  notificationDesc: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: "#F97316",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 40,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
