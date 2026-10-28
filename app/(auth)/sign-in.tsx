import AppButton from "@/components/AppButton";
import AuthIcon from "@/components/AuthIcon";
import { NativeAlert } from "@/components/NativeAlert";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatErrorMessage } from "@/utils/alertUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { z } from "zod";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.4;

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .regex(
      /^(09|07|\+2519|\+2517|2519|2517|9|7)\d{7,8}$/,
      "Enter a valid Ethiopian phone number (e.g. 09... or 07...)",
    ),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

function normalizeEthiopianPhone(input: string): string {
  let cleaned = input.trim().replace(/\D/g, "");
  if (cleaned.startsWith("251") && cleaned.length >= 12) {
    cleaned = "0" + cleaned.substring(3);
  } else if (
    cleaned.length === 9 &&
    (cleaned.startsWith("9") || cleaned.startsWith("7"))
  ) {
    cleaned = "0" + cleaned;
  }
  return cleaned;
}

export default function SignIn() {
  const [isPhoneFocused, setIsPhoneFocused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { sendPhoneAuthOtp } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const headerHeight = useHeaderHeight();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: params.phone || "",
    },
  });

  useEffect(() => {
    if (params.phone) {
      setValue("phoneNumber", params.phone);
    }
  }, [params.phone, setValue]);

  const phoneNumberValue = watch("phoneNumber");
  const isFilled = Boolean(
    phoneNumberValue && phoneNumberValue.trim().length >= 9,
  );
  const isButtonDisabled = !isFilled || loading;

  const onSubmit = async ({ phoneNumber }: PhoneFormValues) => {
    const normalized = normalizeEthiopianPhone(phoneNumber);
    setLoading(true);

    try {
      await sendPhoneAuthOtp(normalized);
      router.push({
        pathname: "/(auth)/otp-verify",
        params: { phone: normalized },
      });
    } catch (err: unknown) {
      const formatted = formatErrorMessage(err);
      setAlertConfig({
        visible: true,
        title: formatted.title,
        message: formatted.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 20}
        >
          <View
            className="bg-primary relative overflow-hidden items-center justify-end"
            style={{
              height: HEADER_HEIGHT,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <View className="flex-1 w-full justify-end items-center pb-0">
              <Image
                source={require("@/assets/images/logo-white.png")}
                style={{ width: "99%", height: "99%", marginBottom: -46 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-8 px-6`}
            >
              <View className="flex-col gap-6">
                <View>
                  <Text
                    className={`${
                      isDark ? "text-slate-200" : "text-slate-700"
                    } font-semibold mb-2 ml-1 text-sm`}
                  >
                    Phone Number
                  </Text>
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={{
                          width: "100%",
                          height: 58,
                          position: "relative",
                          justifyContent: "center",
                        }}
                      >
                        <TextInput
                          style={{
                            width: "100%",
                            height: 58,
                            borderRadius: 22,
                            paddingLeft: 50,
                            paddingRight: 16,
                            textAlignVertical: "center",
                            fontSize: 16,
                            borderWidth: 2,
                            borderColor: isPhoneFocused
                              ? "#ff6719"
                              : isDark
                                ? "#1e293b"
                                : "#e2e8f0",
                            backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                            color: isDark ? "#ffffff" : "#0f172a",
                          }}
                          placeholder="0911234567"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setIsPhoneFocused(true)}
                          onBlur={() => {
                            onBlur();
                            setIsPhoneFocused(false);
                          }}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                          textContentType="telephoneNumber"
                          autoComplete="tel"
                          importantForAutofill="yes"
                        />
                        <View
                          style={{
                            position: "absolute",
                            left: 16,
                            top: 0,
                            bottom: 0,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          pointerEvents="none"
                        >
                          <AuthIcon
                            name="phone"
                            size={23}
                            color={isDark ? "#cbd5e1" : "#475569"}
                          />
                        </View>
                      </View>
                    )}
                  />
                  {errors.phoneNumber?.message ? (
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">
                      {errors.phoneNumber.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-8 mb-6">
                <AppButton
                  title="Continue"
                  onPress={() => handleSubmit(onSubmit)()}
                  loading={loading}
                  disabled={isButtonDisabled}
                  isDark={isDark}
                  variant="primary"
                  size="lg"
                />

                <View className="mt-8 px-2">
                  <Text
                    className={`text-center text-xs ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    } leading-5`}
                  >
                    By continuing, you agree to our{" "}
                    <Text
                      className="text-primary font-bold text-xs"
                      onPress={() => router.push("/(auth)/legal?section=terms")}
                    >
                      Terms of Use
                    </Text>{" "}
                    and{" "}
                    <Text
                      className="text-primary font-bold text-xs"
                      onPress={() =>
                        router.push("/(auth)/legal?section=privacy")
                      }
                    >
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <NativeAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        isDark={isDark}
        type={alertConfig.type}
      />
    </View>
  );
}
