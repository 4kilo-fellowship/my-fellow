import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LegalScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const privacyRef = useRef<View>(null);
  const termsRef = useRef<View>(null);

  const [privacyY, setPrivacyY] = React.useState(0);
  const [termsY, setTermsY] = React.useState(0);

  useEffect(() => {
    if (section === "privacy" && privacyY > 0) {
      scrollViewRef.current?.scrollTo({ y: privacyY, animated: true });
    } else if (section === "terms" && termsY > 0) {
      scrollViewRef.current?.scrollTo({ y: termsY, animated: true });
    }
  }, [section, privacyY, termsY]);

  const renderSectionHeader = (title: string) => (
    <Text
      className={`text-2xl font-bold mb-4 mt-8 ${isDark ? "text-white" : "text-black"}`}
    >
      {title}
    </Text>
  );

  const renderContentText = (children: React.ReactNode) => (
    <Text
      className={`text-base leading-6 mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
    >
      {children}
    </Text>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* minimalist Header */}
      <View
        className={`px-6 py-4 flex-row items-center border-b ${isDark ? "border-zinc-800" : "border-zinc-100"}`}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={`w-10 h-10 items-center justify-center rounded-full ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text
          className={`ml-4 text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}
        >
          Legal Information
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          onLayout={(e) => setTermsY(e.nativeEvent.layout.y)}
          ref={termsRef}
        >
          {renderSectionHeader("Terms of Use")}
          {renderContentText(
            "Welcome to My Fellow. By using our application, you agree to comply with and be bound by the following terms and conditions of use.",
          )}
          {renderContentText(
            "1. Acceptance of Terms: By accessing this app, you signify your agreement to these Terms of Use. If you do not agree, please do not use the app.",
          )}
          {renderContentText(
            "2. Use License: Permission is granted to temporarily download one copy of the materials on My Fellow&apos;s app for personal, non-commercial transitory viewing only.",
          )}
          {renderContentText(
            "3. Disclaimer: The materials on My Fellow&apos;s app are provided on an &apos;as is&apos; basis. My Fellow makes no warranties, expressed or implied.",
          )}
          {renderContentText(
            "4. Limitations: In no event shall My Fellow or its suppliers be liable for any damages arising out of the use or inability to use the materials.",
          )}
        </View>

        <View
          className="mt-12 pt-12 border-t border-zinc-100 dark:border-zinc-800"
          onLayout={(e) => setPrivacyY(e.nativeEvent.layout.y)}
          ref={privacyRef}
        >
          {renderSectionHeader("Privacy Policy")}
          {renderContentText(
            "Your privacy is important to us. It is My Fellow&apos;s policy to respect your privacy regarding any information we may collect from you through our app.",
          )}
          {renderContentText(
            "We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.",
          )}
          {renderContentText(
            "We don’t share any personally identifying information publicly or with third-parties, except when required to by law.",
          )}
          {renderContentText(
            "Our app may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites.",
          )}
          {renderContentText(
            "You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.",
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
