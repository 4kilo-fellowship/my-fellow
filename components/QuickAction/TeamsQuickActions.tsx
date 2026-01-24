import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const QuickActions = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <View className="flex-row justify-between px-5 mb-6">
      <TouchableOpacity
        onPress={() => router.push("/leaders")}
        activeOpacity={0.9}
        className={`flex-1 mr-2 h-14 rounded-xl flex-row items-center justify-center ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
      >
        <Ionicons name="people" size={26} color={isDark ? "white" : "black"} />
        <Text
          className={`ml-2 font-bold ${isDark ? "text-white" : "text-black"}`}
        >
          Leaders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 ml-2 h-14 rounded-xl flex-row items-center justify-center ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
        // onPress={() => }
      >
        <Ionicons
          name="chatbubble"
          size={23}
          color={isDark ? "white" : "black"}
        />
        <Text
          className={`ml-2 font-bold ${isDark ? "text-white" : "text-black"}`}
        >
          Contact Us
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuickActions;
