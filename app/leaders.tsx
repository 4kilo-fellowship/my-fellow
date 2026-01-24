import { LEADERS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    SectionList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Leader Card Component
const LeaderCard = ({ item, isDark, onCopyPhone, onCopyTelegram }: { item: any; isDark: boolean; onCopyPhone: () => void; onCopyTelegram: () => void }) => {
  return (
    <View
      className={`mb-5 rounded-[24px] p-5 border ${
        isDark ? "bg-[#1C1C1E] border-gray-800" : "bg-white border-gray-100"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
        <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header Section: Avatar + Info */}
      <View className="flex-row items-center">
        <Image
          source={item.image}
          style={{ width: 68, height: 68, borderRadius: 34 }}
          contentFit="cover"
        />
        <View className="flex-1 ml-4 justify-center">
            <View className="flex-row items-center">
                <Text
                  className={`text-lg font-bold mr-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.name}
                </Text>
                {item.isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color="#1DA1F2" />
                )}
            </View>
            <Text className={`text-sm font-medium mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                @{item.role.replace(/\s+/g, '').toLowerCase()}
            </Text>
             <View className="mt-1.5">
                <Text className="text-orange-500 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 self-start px-2 py-0.5 rounded-md overflow-hidden">
                    {item.role}
                </Text>
            </View>
        </View>
      </View>

      {/* Bio Section - Full Width */}
      <View className="mt-4">
        <Text className={`text-[15px] leading-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {item.bio}
        </Text>
      </View>

      {/* Footer: Phone Number & Copy */}
      <View className={`mt-4 pt-4 border-t ${isDark? "border-gray-800" : "border-gray-100"} flex-row flex-wrap items-center justify-between gap-y-3`}>
          {/* Phone Section */}
          <View className="flex-row items-center">
             
              <Text className={`text-base font-semibold mr-2 ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                {item.phoneNumber}
              </Text>
              <TouchableOpacity 
                  onPress={onCopyPhone}
                  activeOpacity={0.7}
                  className={`p-2 rounded-full ${isDark ? "bg-gray-800" : "bg-slate-100"}`}
              >
                <Ionicons name="copy-outline" size={16} color={isDark ? "#9ca3af" : "#64748b"} />
              </TouchableOpacity>
          </View>

          {/* Telegram Section */}
          <View className="flex-row items-center">
              
              <Text className={`text-base font-semibold mr-3 ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                {item.telegram}
              </Text>
              <TouchableOpacity 
                  onPress={onCopyTelegram}
                  activeOpacity={0.7}
                  className={`p-2 rounded-full ${isDark ? "bg-gray-800" : "bg-slate-100"}`}
              >
                <Ionicons name="copy-outline" size={16} color={isDark ? "#9ca3af" : "#64748b"} />
              </TouchableOpacity>
          </View>
      </View>
    </View>
  );
};

export default function LeadersScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const mainLeaders = LEADERS.filter((l) => l.type === "Main");
  const teamLeaders = LEADERS.filter((l) => l.type === "Team");

  const sections = [
    { title: "Main Leaders", data: mainLeaders },
    { title: "Team Leaders", data: teamLeaders },
  ];

  const handleCopyPhone = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    // In a real app, you might show a toast here.
    // For now, the user gets haptic feedback or simply the action completes.
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
        {/* Custom Header */}
        <View 
          className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
          style={{ paddingTop: top + 10 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: isDark ? '#1C1C1E' : '#e2e8f0' }}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? "white" : "#0f172a"} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Leaders
          </Text>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeaderCard 
                item={item} 
                isDark={isDark} 
                onCopyPhone={() => handleCopyPhone(item.phoneNumber)}
                onCopyTelegram={() => handleCopyPhone(item.telegram)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className={`py-4 px-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
               <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="h-5 w-1.5 bg-orange-500 rounded-full mr-3" />
                        <Text className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>
                            {title}
                        </Text>
                    </View>
                    <View className={`h-[1px] flex-1 ml-4 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
               </View>
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View className="mb-4 mt-4">
                <Text className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Connect with our dedicated leaders giving their all for the kingdom.
                </Text>
            </View>
          }
        />
      </View>
    </>
  );
}
