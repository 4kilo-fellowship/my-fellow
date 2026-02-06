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
  const { top, bottom } = useSafeAreaInsets();

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
      router.back();
    } else {
      await addAlert(alertData);
      router.back();
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Consistent Header */}
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
          <View className="flex-1 pt-6">
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>
                Alert Name
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., Morning Prayer"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    style={[
                      styles.textInput,
                      {
                        color: isDark ? "white" : "black",
                        borderColor: errors.title
                          ? "#ef4444"
                          : isDark
                            ? "#444"
                            : "#ccc",
                        backgroundColor: isDark ? "#1e1e1e" : "#fff",
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
              <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>
                Description
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="What is this alert for?"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.textArea,
                      {
                        color: isDark ? "white" : "black",
                        borderColor: errors.description
                          ? "#ef4444"
                          : isDark
                            ? "#444"
                            : "#ccc",
                        backgroundColor: isDark ? "#1e1e1e" : "#fff",
                      },
                    ]}
                  />
                )}
              />
            </View>

            {/* Date/Time Row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}
                >
                  Date
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowDatePicker(true)}
                  style={[
                    styles.pickerButton,
                    {
                      borderColor: isDark ? "#444" : "#ccc",
                      backgroundColor: isDark ? "#1e1e1e" : "#fff",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: datePicked
                        ? isDark
                          ? "white"
                          : "black"
                        : isDark
                          ? "#666"
                          : "#999",
                    }}
                  >
                    {datePicked
                      ? selectedDate.toLocaleDateString()
                      : "Select Date"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isDark ? "#ccc" : "#666"}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}
                >
                  Time
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowTimePicker(true)}
                  style={[
                    styles.pickerButton,
                    {
                      borderColor: isDark ? "#444" : "#ccc",
                      backgroundColor: isDark ? "#1e1e1e" : "#fff",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: timePicked
                        ? isDark
                          ? "white"
                          : "black"
                        : isDark
                          ? "#666"
                          : "#999",
                    }}
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
                    size={20}
                    color={isDark ? "#ccc" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (d) {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(d.getFullYear());
                    newDate.setMonth(d.getMonth());
                    newDate.setDate(d.getDate());
                    setValue("date", newDate);
                    setDatePicked(true);
                  }
                }}
              />
            )}
            {/* Simple iOS Close Button */}
            {Platform.OS === "ios" && showDatePicker && (
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{ alignSelf: "flex-end", padding: 8 }}
              >
                <Text style={{ color: "#F97316", fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="default"
                onChange={(e, d) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (d) {
                    const newDate = new Date(selectedDate);
                    newDate.setHours(d.getHours());
                    newDate.setMinutes(d.getMinutes());
                    setValue("date", newDate);
                    setTimePicked(true);
                  }
                }}
              />
            )}
            {Platform.OS === "ios" && showTimePicker && (
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={{ alignSelf: "flex-end", padding: 8 }}
              >
                <Text style={{ color: "#F97316", fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            )}

            {/* Repeats */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>
                Repeat
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {FREQUENCY_OPTIONS.map((opt) => {
                  const isActive = selectedRepeats === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setValue("repeats", opt)}
                      style={[
                        styles.chip,
                        isActive
                          ? {
                              backgroundColor: "#F97316",
                              borderColor: "#F97316",
                            }
                          : { borderColor: isDark ? "#444" : "#ccc" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && { color: "white" },
                          !isActive && isDark && { color: "#ccc" },
                        ]}
                      >
                        {opt === "none" ? "Never" : opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Remind Before */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>
                Remind Me
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {REMIND_OPTIONS.map((opt) => {
                  const isActive = selectedRemindBefore === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setValue("remindBefore", opt.value)}
                      style={[
                        styles.chip,
                        isActive
                          ? {
                              backgroundColor: "#F97316",
                              borderColor: "#F97316",
                            }
                          : { borderColor: isDark ? "#444" : "#ccc" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && { color: "white" },
                          !isActive && isDark && { color: "#ccc" },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
        <View
          className={`p-4 border-t ${isDark ? "border-gray-800 bg-[#0A0A0A]" : "border-gray-200 bg-[#f8fafc]"}`}
          style={{ paddingBottom: Math.max(bottom + 10, 20) }}
        >
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#F97316",
              borderRadius: 12,
              height: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
              {id ? "Save Changes" : "Create Alert"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 100,
    fontSize: 16,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    textTransform: "capitalize",
  },
});
