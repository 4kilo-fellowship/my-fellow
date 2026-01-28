import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { z } from "zod";
import { AlertItem } from "../hooks/useAlerts";

const alertSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title is too long"),
  date: z.date({
    message: "Please select a date",
  }),
  repeats: z.enum(["none", "daily", "weekly"]),
  remindBefore: z.number(),
});

type FormData = z.infer<typeof alertSchema>;

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (alert: Omit<AlertItem, "id" | "enabled"> | AlertItem) => void;
  initialAlert?: AlertItem;
  isDark: boolean;
}

const FREQUENCY_OPTIONS = ["none", "daily", "weekly"] as const;
const REMIND_OPTIONS = [
  { label: "At Time", value: 0 },
  { label: "5m", value: 5 },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
];

export const AlertModal = ({
  visible,
  onClose,
  onSave,
  initialAlert,
  isDark,
}: AlertModalProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePicked, setDatePicked] = useState(false);
  const [timePicked, setTimePicked] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      repeats: "none",
      remindBefore: 0,
    },
  });

  const selectedDate = watch("date");
  const selectedRepeats = watch("repeats");
  const selectedRemindBefore = watch("remindBefore");

  useEffect(() => {
    if (visible) {
      if (initialAlert) {
        reset({
          title: initialAlert.title,
          date: new Date(initialAlert.time),
          repeats: initialAlert.repeats,
          remindBefore: initialAlert.remindBefore,
        });
        setDatePicked(true);
        setTimePicked(true);
      } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        reset({
          title: "",
          date: now,
          repeats: "none",
          remindBefore: 0,
        });
        setDatePicked(false);
        setTimePicked(false);
      }
    }
  }, [initialAlert, visible, reset]);

  const onSubmit = (data: FormData) => {
    const alertData = {
      title: data.title,
      time: data.date.toISOString(),
      repeats: data.repeats,
      remindBefore: data.remindBefore,
    };

    if (initialAlert) {
      onSave({ ...initialAlert, ...alertData });
    } else {
      onSave(alertData);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop overlay */}
        <TouchableWithoutFeedback
          onPress={() => {
            onClose();
            Keyboard.dismiss();
          }}
        >
          <View
            style={[
              styles.backdrop,
              {
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.85)"
                  : "rgba(0,0,0,0.4)",
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
              ]}
            >
              {/* Header */}
              <View
                style={[
                  styles.header,
                  { borderBottomColor: isDark ? "#2C2C2E" : "#F3F4F6" },
                ]}
              >
                <Text
                  style={[
                    styles.headerTitle,
                    { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {initialAlert ? "Edit Alert" : "Add Alert"}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    { backgroundColor: isDark ? "#2C2C2E" : "#F3F4F6" },
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Title */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: isDark ? "#636366" : "#8E8E93" },
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
                        placeholderTextColor={isDark ? "#48484A" : "#AEAEB2"}
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark
                              ? "rgba(44,44,46,0.4)"
                              : "#F2F2F7",
                            borderColor: errors.title
                              ? "#FF3B30"
                              : isDark
                                ? "#2C2C2E"
                                : "#E5E5EA",
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

                {/* DateTime Row */}
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? "#636366" : "#8E8E93" },
                      ]}
                    >
                      DATE
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={[
                        styles.pickerTrigger,
                        {
                          backgroundColor: isDark
                            ? "rgba(44,44,46,0.4)"
                            : "#F2F2F7",
                          borderColor: isDark ? "#2C2C2E" : "#E5E5EA",
                        },
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
                          : "Date"}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={isDark ? "#636366" : "#8E8E93"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.flex1}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? "#636366" : "#8E8E93" },
                      ]}
                    >
                      TIME
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(true)}
                      style={[
                        styles.pickerTrigger,
                        {
                          backgroundColor: isDark
                            ? "rgba(44,44,46,0.4)"
                            : "#F2F2F7",
                          borderColor: isDark ? "#2C2C2E" : "#E5E5EA",
                        },
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
                          : "Time"}
                      </Text>
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={isDark ? "#636366" : "#8E8E93"}
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
                      { color: isDark ? "#636366" : "#8E8E93" },
                    ]}
                  >
                    FREQUENCY
                  </Text>
                  <View
                    style={[
                      styles.segmentedControl,
                      { backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7" },
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
                      { color: isDark ? "#636366" : "#8E8E93" },
                    ]}
                  >
                    ALERT BEFORE
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
                                  ? "rgba(44,44,46,0.6)"
                                  : "#F2F2F7",
                              borderColor: isActive
                                ? "#F97316"
                                : isDark
                                  ? "#2C2C2E"
                                  : "#E5E5EA",
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

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  activeOpacity={0.8}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitText}>
                    {initialAlert ? "Save Changes" : "Create Alert"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardView: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    maxHeight: Platform.OS === "ios" ? "95%" : "98%",
    borderRadius: 36,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
    marginLeft: 4,
  },
  textInput: {
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  pickerTrigger: {
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  segmentedControl: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 14,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 11,
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
    backgroundColor: "#3A3A3C",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "900",
  },
  submitButton: {
    backgroundColor: "#F97316",
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
