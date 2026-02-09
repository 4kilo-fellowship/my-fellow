import { ConfirmModal, InfoModal } from "@/components";
import { PRIMARY } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { JoinRequest, joinRequestService } from "@/services/joinRequestService";
import { fetchTeams } from "@/services/teamService";
import { useUserStore } from "@/stores/user.store";
import { Team } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const TeamDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { authState } = useAuth();
  const user = useUserStore((state) => state.user);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const fetchUserRequests = async () => {
    if (authState.authenticated) {
      try {
        const myRequests = await joinRequestService.getMyRequests();
        setRequests(myRequests);
      } catch (error) {
        console.error("Error fetching requests", error);
      }
    }
  };

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const teams = await fetchTeams(false);
        const foundTeam = teams.find((t) => t.id === id);
        setTeam(foundTeam || null);
      } catch (error) {
        console.error("Error loading team details", error);
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, [id]);

  useEffect(() => {
    fetchUserRequests();
  }, [authState.authenticated]);

  const existingRequest = requests.find((r) => {
    // Handle different API response structures:
    // 1. r.teamId as string (from create request)
    // 2. r.teamId as object with _id (from get my requests - populated)
    // 3. r.team as fallback (our manual field)
    const requestTeamId =
      typeof r.teamId === "string" ? r.teamId : (r.teamId as any)?._id;

    return (
      requestTeamId === team?.id ||
      requestTeamId === team?._id ||
      r.team === team?.id ||
      r.team === team?._id ||
      (r as any).teamName?.toLowerCase().trim().replace(/\s+/g, "") ===
        team?.name.toLowerCase().trim().replace(/\s+/g, "")
    );
  });
  const isPending = existingRequest?.status === "pending";

  const normalizedUserTeam = user?.team
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "");
  const normalizedTeamName = team?.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
  const isMember =
    user?.team === team?.id || normalizedUserTeam === normalizedTeamName;

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!team) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-dark" : "bg-background"}`}
      >
        <Text className={isDark ? "text-white" : "text-black"}>
          Team not found
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          className="mt-4 p-4 bg-primary rounded-full"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${team.leader.phone}`);
  };

  const handleTelegram = () => {
    Linking.openURL(`https://t.me/${team.leader.telegram.replace("@", "")}`);
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${team.coordinates.lat},${team.coordinates.lng}`;
    Linking.openURL(url);
  };

  const handleJoinPress = () => {
    setIsConfirmModalVisible(true);
  };

  const confirmJoin = async () => {
    if (!team) return;
    setIsSubmitting(true);
    try {
      const response = await joinRequestService.createJoinRequest(team.id);

      // Handle different possible response structures
      let newRequest = null;

      // Check various possible response structures
      if (response?.data?.data) {
        // Structure: { success: true, data: { data: JoinRequest } }
        newRequest = response.data.data;
      } else if (response?.data) {
        // Structure: { success: true, data: JoinRequest } or { data: JoinRequest }
        newRequest = response.data;
      } else if (response) {
        // Structure: JoinRequest directly
        newRequest = response;
      }

      // Update local state immediately to disable the button
      if (newRequest && newRequest._id) {
        // Ensure the request has the pending status
        const requestToAdd = {
          ...newRequest,
          status: newRequest.status || "pending",
          team: newRequest.team || team.id,
        };

        setRequests((prev) => [...prev, requestToAdd]);
      } else {
        // Fallback: refetch all requests to ensure state is up to date
        await fetchUserRequests();
      }

      setInfoModal({
        visible: true,
        title: "Request Sent",
        message:
          "Your request to join the team has been sent successfully! We'll notify you once it's approved.",
        type: "success",
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send join request";
      setInfoModal({
        visible: true,
        title: "Error",
        message: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalVisible(false); // Close modal to prevent re-submission
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-background"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        style={{
          position: "absolute",
          top: top + 10,
          left: 20,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-black/30 rounded-full items-center justify-center shadow-lg"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image
            source={{ uri: team.imageUrl }}
            style={{ width, height: 280 }}
            className="bg-zinc-200"
            resizeMode="cover"
          />

          <View className="absolute bottom-4 left-5">
            <View
              style={{ backgroundColor: PRIMARY }}
              className="px-4 py-2 rounded-full flex-row items-center"
            >
              <Ionicons name={team.icon as any} size={18} color="white" />
              <Text className="text-white font-bold text-sm ml-2">
                {team.category}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-6 pb-10">
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className={`text-3xl font-extrabold flex-1 ${isDark ? "text-white" : "text-black"}`}
              >
                {team.name}
              </Text>
              {isMember && (
                <View className="flex-row items-center">
                  <View
                    style={{ borderColor: `${PRIMARY}33` }}
                    className="bg-primary/10 px-3 py-1.5 rounded-xl border flex-row items-center shadow-sm shadow-orange-500/10"
                  >
                    <View className="bg-primary p-0.5 rounded-full mr-2">
                      <Ionicons name="sparkles" size={12} color="white" />
                    </View>
                    <Text className="text-primary font-extrabold text-[10px] uppercase tracking-wider">
                      Your Team
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="people"
                  size={18}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
                <Text className="text-zinc-500 ml-2 font-semibold">
                  {team.members} Members
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar"
                  size={18}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
                <Text className="text-zinc-500 ml-2 font-semibold">
                  {team.meetingDay}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text
              className={`text-base leading-6 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              {team.description}
            </Text>
          </View>

          <View
            className={`rounded-3xl p-6 mb-6 border ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-100"
            }`}
          >
            <Text
              className={`text-xl font-extrabold mb-5 ${isDark ? "text-white" : "text-black"}`}
            >
              Meeting Details
            </Text>

            <View className="gap-5">
              <View className="flex-row items-center">
                <View
                  className={`w-12 ${isDark ? "bg-zinc-900" : "bg-white"} h-12 rounded-2xl items-center justify-center`}
                >
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color={isDark ? "white" : "black"}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Time
                  </Text>
                  <Text
                    className={`font-bold text-base ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.meetingDay}, {team.time}
                  </Text>
                </View>
              </View>

              <View
                className={`h-px ${isDark ? "bg-zinc-800" : "bg-sky-200"}`}
              />

              <View className="flex-row items-center">
                <View
                  className={`w-12 ${isDark ? "bg-zinc-900" : "bg-white"} h-12 rounded-2xl items-center justify-center`}
                >
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={isDark ? "white" : "black"}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Location
                  </Text>
                  <Text
                    className={`font-bold text-base mb-2 ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.location}
                  </Text>
                  <TouchableOpacity
                    onPress={handleGetDirections}
                    style={{ backgroundColor: PRIMARY }}
                    className="self-start active:scale-95 transition-all duration-75 px-4 py-2 rounded-full flex-row items-center"
                    activeOpacity={1}
                  >
                    <Ionicons name="navigate" size={16} color="white" />
                    <Text className="text-white font-bold text-sm ml-2">
                      Get Directions
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text
              className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-black"}`}
            >
              About This Team
            </Text>
            <Text
              className={`text-base leading-7 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              {team.about}
            </Text>
          </View>

          <View className="mb-6">
            <Text
              className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}
            >
              Team Leader
            </Text>

            <View
              className={`rounded-2xl p-5 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}
            >
              <View className="flex-row items-center mb-5">
                <Image
                  source={{ uri: team.leader.imageUrl }}
                  className="w-16 h-16 rounded-full bg-zinc-200"
                />
                <View className="ml-4 flex-1">
                  <Text
                    className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.leader.name}
                  </Text>
                  <Text className="text-zinc-500 font-semibold">
                    {team.leader.role}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCall}
                  style={{ backgroundColor: PRIMARY }}
                  className="flex-1 py-3.5 active:scale-95 transition-all duration-75 rounded-xl flex-row items-center justify-center shadow-md"
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color="white" />
                  <Text className="font-bold ml-2 text-white">Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleTelegram}
                  className={`flex-1 h-14 active:scale-95 transition-all duration-75 rounded-2xl flex-row items-center justify-center border ${
                    isDark
                      ? "bg-[#2A2A2C] border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Ionicons
                    name="paper-plane"
                    size={18}
                    color={isDark ? "#38BDF8" : "#0EA5E9"}
                  />
                  <Text
                    className={`font-bold ml-2 ${isDark ? "text-white" : "text-gray-700"}`}
                  >
                    Telegram
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {!isMember && (
            <TouchableOpacity
              onPress={
                isPending
                  ? () =>
                      setInfoModal({
                        visible: true,
                        title: "Request Pending",
                        message:
                          "Your request to join this team is currently under review. We will notify you once it's approved!",
                        type: "success",
                      })
                  : handleJoinPress
              }
              style={{
                backgroundColor: isPending
                  ? isDark
                    ? "rgba(113, 113, 122, 0.1)"
                    : "#F4F4F5"
                  : isSubmitting
                    ? `${PRIMARY}80`
                    : PRIMARY,
                borderStyle: isPending ? "dashed" : "solid",
              }}
              className={`py-5 rounded-3xl items-center mb-4 border ${
                isPending
                  ? "border-zinc-500/20"
                  : "shadow-lg shadow-orange-500/20 border-transparent"
              }`}
              disabled={isPending || isSubmitting}
              activeOpacity={isPending ? 1 : 0.8}
            >
              <View className="flex-row items-center">
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Sending Request...
                    </Text>
                  </View>
                ) : isPending ? (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="time"
                      size={20}
                      color={isDark ? "#71717a" : "#71717a"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      className={`font-bold text-lg ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
                    >
                      Pending Approval
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Join This Team
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={isConfirmModalVisible}
        onClose={() => setIsConfirmModalVisible(false)}
        isDark={isDark}
        title={authState.authenticated ? "Join Team" : "Sign In Required"}
        description={
          authState.authenticated
            ? `Are you sure you want to request to join ${team?.name}?`
            : "You need to be signed in to join a team. Would you like to sign in now?"
        }
        icon={authState.authenticated ? "people" : "log-in-outline"}
        iconColor={PRIMARY}
        buttons={[
          {
            label: authState.authenticated
              ? isSubmitting
                ? "Sending..."
                : "Confirm Join"
              : "Go to Sign In",
            onPress: authState.authenticated
              ? confirmJoin
              : () => router.push("/(auth)/sign-in"),
            variant: "primary",
          },
        ]}
        cancelButton={{
          label: "Cancel",
        }}
      />
      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal({ ...infoModal, visible: false })}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </View>
  );
};

export default TeamDetails;
