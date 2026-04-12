import { Placeholder, QuickActions } from "@/components";
import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { JoinRequest, joinRequestService } from "@/services/joinRequestService";
import { useTeamsStore } from "@/stores/teams.store";
import { useUserStore } from "@/stores/user.store";
import { Team } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

// --- Components ---

const SearchBar = ({
  isDark,
  searchText,
  setSearchText,
}: {
  isDark: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
}) => (
  <View
    className={`mx-5 mb-6 px-4 h-12 rounded-2xl flex-row items-center ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
  >
    <Ionicons name="search" size={20} color={isDark ? "#a1a1aa" : "#71717a"} />
    <TextInput
      placeholder="Search ministries..."
      placeholderTextColor={isDark ? "#a1a1aa" : "#71717a"}
      className={`flex-1 ml-3 text-base ${isDark ? "text-white" : "text-black"}`}
      value={searchText}
      onChangeText={setSearchText}
    />
  </View>
);

const GridCard = ({
  item,
  onPress,
}: {
  item: Team & { isUserTeam: boolean };
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={{
      width: ITEM_WIDTH,
      height: ITEM_WIDTH * 0.85, // Aspect ratio similar to screenshot
      backgroundColor: item.color,
    }}
    className="rounded-2xl p-4 relative overflow-hidden justify-between mb-3 shadow-sm"
    onPress={onPress}
  >
    {/* Huge Background Icon (Watermark style) */}
    <View className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12">
      <Ionicons name={item.icon as any} size={110} color="white" />
    </View>

    {/* Content */}
    <View>
      <Text
        className="text-white text-lg font-extrabold tracking-wide"
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <View className="bg-black/10 self-start px-2 py-0.5 rounded-md mt-1">
        <Text className="text-white/90 text-[10px] font-bold">
          {item.members} Mbrs
        </Text>
      </View>
    </View>

    {/* Small directional arrow or Membership badge */}
    <View className="flex-row justify-between items-center w-full">
      {item.isUserTeam && (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            shadowColor: item.color,
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
          className="px-2.5 py-1 rounded-full flex-row items-center"
        >
          <View
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            className="w-4 h-4 rounded-full items-center justify-center mr-1"
          >
            <Ionicons name="checkmark" size={10} color={item.color} />
          </View>
          <Text
            style={{ color: item.color, letterSpacing: 0.5 }}
            className="text-[8px] font-black uppercase"
          >
            Member
          </Text>
        </View>
      )}
      <View className="ml-auto bg-white/20 p-1.5 rounded-full">
        <Ionicons name="arrow-forward" size={14} color="white" />
      </View>
    </View>
  </TouchableOpacity>
);

const Teams = () => {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const { authState, getCurrentUser } = useAuth();
  const user = useUserStore((state) => state.user);
  const { teams, loading, refreshing, loadTeams } = useTeamsStore();
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (authState.authenticated) {
        fetchUserRequests();
        getCurrentUser().catch(console.error);
        loadTeams(); // Check for updates in background on focus
      }
    }, [authState.authenticated]),
  );

  useEffect(() => {
    loadTeams();
  }, []);

  const fetchUserRequests = async () => {
    try {
      const myRequests = await joinRequestService.getMyRequests();
      setRequests(myRequests);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  };

  const onRefresh = () => {
    loadTeams(true);
  };

  // Filter logic
  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ paddingTop: top + 10 }}>
        {/* HEADER */}
        <View className="px-5 mb-4">
          <Text
            className={`text-4xl font-extrabold ${isDark ? "text-white" : "text-black"}`}
          >
            Teams
          </Text>
        </View>

        {/* Search & Actions */}
        <SearchBar
          isDark={isDark}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        <QuickActions />
      </View>

      <FlatList
        data={filteredTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const getUserTeams = () => {
            const teams: string[] = [];
            if (!user) return teams;

            const add = (val: any) => {
              if (!val) return;
              if (typeof val === "string") teams.push(val);
              if (typeof val === "object") {
                if (val._id) teams.push(val._id);
                if (val.id) teams.push(val.id);
                if (val.name) teams.push(val.name);
              }
            };

            add(user.team);
            return teams;
          };

          const userTeams = getUserTeams();
          const norm = (s: any) =>
            String(s || "")
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "");

          const normalizedUserTeams = userTeams
            .map(norm)
            .filter((s) => s !== "");
          const currentTeamNames = [
            norm(item.name),
            norm(item.id),
            norm(item._id),
            norm(item.category),
          ];

          // Fuzzy match helper: checks if either string contains the other
          const fuzzyMatch = (a: string, b: string) =>
            a !== "" && b !== "" && (a.includes(b) || b.includes(a));

          const existingRequest = requests.find((r) => {
            const requestTeamId =
              typeof r.teamId === "string" ? r.teamId : (r.teamId as any)?._id;
            const requestTeamName =
              typeof r.teamId === "object"
                ? (r.teamId as any).name
                : (r as any).teamName || r.team;

            const nReqId = norm(requestTeamId);
            const nReqName = norm(requestTeamName);
            const nReqTeam = norm(r.team);

            return currentTeamNames.some(
              (tn) =>
                (nReqId && fuzzyMatch(tn, nReqId)) ||
                (nReqName && fuzzyMatch(tn, nReqName)) ||
                (nReqTeam && fuzzyMatch(tn, nReqTeam)),
            );
          });

          const isApproved =
            existingRequest?.status === "approved" ||
            (existingRequest as any)?.status === "accepted";

          const isUserTeam =
            isApproved ||
            currentTeamNames.some((tn) =>
              normalizedUserTeams.some((ut) => fuzzyMatch(tn, ut)),
            );

          return (
            <GridCard
              item={{ ...item, isUserTeam } as any}
              onPress={() => router.push(`/teams/${item.id}` as any)}
            />
          );
        }}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: PADDING,
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading && !refreshing ? (
            <View
              style={{
                paddingHorizontal: PADDING,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Placeholder
                  key={i}
                  width={ITEM_WIDTH}
                  height={ITEM_WIDTH * 0.85}
                  borderRadius={16}
                  style={{ marginBottom: GAP }}
                />
              ))}
            </View>
          ) : (
            <View className="items-center mt-10">
              <Text className={isDark ? "text-zinc-500" : "text-zinc-400"}>
                No teams found
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          !loading && filteredTeams.length > 0 ? (
            <View className="mt-4 px-5 mb-10">
              <View
                className={`p-6 rounded-2xl items-center ${isDark ? "bg-zinc-900" : "bg-zinc-50 border border-zinc-100"}`}
              >
                <Text
                  className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-black"}`}
                >
                  Wondering where you fit?
                </Text>
                <Text className="text-zinc-500 text-center text-sm mb-4">
                  Connect with I4U to get guidance and support.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL("https://t.me/I4U_TEAM_bot")}
                  className={`bg-black ${isDark ? "bg-white" : "bg-dark"} px-6 py-3 rounded-full`}
                >
                  <Text
                    className={`font-bold ${isDark ? "text-black" : "text-white"}`}
                  >
                    Contact I4U
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Teams;
