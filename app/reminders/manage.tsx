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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const { top } = useSafeAreaInsets();

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
    <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
          style={{ paddingTop: top + 10 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: isDark ? "#1C1C1E" : "#e2e8f0" }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "white" : "#0f172a"}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {id ? "Edit Alert" : "Add Alert"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Content */}
          <View className="flex-1">
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#A0A0A0" : "#64748b" },
                ]}
              >
                ALERT NAME
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., Morning Prayer"
                    placeholderTextColor={isDark ? "#48484A" : "#94a3b8"}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                        borderColor: errors.title
                          ? "#ef4444"
                          : isDark
                            ? "#1f2937"
                            : "#e2e8f0",
                        color: isDark ? "#FFFFFF" : "#0f172a",
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
                  { color: isDark ? "#A0A0A0" : "#64748b" },
                ]}
              >
                DESCRIPTION (OPTIONAL)
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="What's this reminder for?"
                    placeholderTextColor={isDark ? "#48484A" : "#94a3b8"}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                        borderColor: errors.description
                          ? "#ef4444"
                          : isDark
                            ? "#1f2937"
                            : "#e2e8f0",
                        color: isDark ? "#FFFFFF" : "#0f172a",
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
                    { color: isDark ? "#A0A0A0" : "#64748b" },
                  ]}
                >
                  DATE
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowDatePicker(true)}
                  style={[
                    styles.pickerTrigger,
                    {
                      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                      borderColor: isDark ? "#1f2937" : "#e2e8f0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerValue,
                      {
                        color: !datePicked
                          ? isDark
                            ? "#4b5563"
                            : "#94a3b8"
                          : isDark
                            ? "#FFFFFF"
                            : "#0f172a",
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
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.flex1}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? "#A0A0A0" : "#64748b" },
                  ]}
                >
                  TIME
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowTimePicker(true)}
                  style={[
                    styles.pickerTrigger,
                    {
                      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                      borderColor: isDark ? "#1f2937" : "#e2e8f0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerValue,
                      {
                        color: !timePicked
                          ? isDark
                            ? "#4b5563"
                            : "#94a3b8"
                          : isDark
                            ? "#FFFFFF"
                            : "#0f172a",
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
                    color={isDark ? "#94a3b8" : "#64748b"}
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
                  { color: isDark ? "#A0A0A0" : "#64748b" },
                ]}
              >
                REPETITION
              </Text>
              <View
                style={[
                  styles.segmentedControl,
                  { backgroundColor: isDark ? "#1C1C1E" : "#e2e8f0" },
                ]}
              >
                {FREQUENCY_OPTIONS.map((r) => {
                  const isActive = selectedRepeats === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      activeOpacity={0.8}
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
                                ? "#94a3b8"
                                : "#64748b",
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
                  { color: isDark ? "#A0A0A0" : "#64748b" },
                ]}
              >
                REMIND ME BEFORE
              </Text>
              <View style={styles.pillContainer}>
                {REMIND_OPTIONS.map((item) => {
                  const isActive = selectedRemindBefore === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      activeOpacity={0.8}
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
                              ? "#1C1C1E"
                              : "#FFFFFF",
                          borderColor: isActive
                            ? "#F97316"
                            : isDark
                              ? "#374151"
                              : "#e2e8f0",
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
                                ? "#94a3b8"
                                : "#64748b",
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
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-10">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>
                {id ? "Update Alert" : "Set Alert"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1.5,
  },
  textArea: {
    height: 120,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1.5,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 6,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  flex1: {
    flex: 1,
  },
  pickerTrigger: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  segmentedControl: {
    flexDirection: "row",
    padding: 6,
    borderRadius: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#F97316",
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
