import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { fetchAPI } from "@/lib/fetch";
import { icons } from "constant";

export default function Chat() {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    try {
      const res = await fetchAPI(`/(api)/requests?userId=${userId}`);
      if (res && res.friends) {
        setFriends(res.friends);
      }
    } catch (err) {
      console.error("Failed to fetch friends", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    const interval = setInterval(fetchFriends, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-8 flex-1 bg-white">
        <Text className="text-4xl font-JakartaExtraBold text-[#0B1F3B] mb-2 tracking-tight">
          Connections
        </Text>
        <Text className="text-[#0B1F3B80] font-JakartaMedium mb-8">
          Mutual approaches and active contracts.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0B1F3B" className="mt-10" />
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.clerk_id}
            ListEmptyComponent={() => (
              <View className="flex flex-col items-center justify-center mt-20 border border-[#0B1F3B1A] p-8 rounded-[4px] bg-[#FFFFFF]">
                <Text className="text-[#0B1F3B80] font-JakartaMedium text-base">No active connections yet.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => router.push(`/(root)/chat/${item.clerk_id}`)}
                className="flex flex-row items-center bg-white p-6 mb-4 rounded-[4px] border border-[#0B1F3B1A]"
                style={{ shadowColor: '#0B1F3B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 2 }}
              >
                <View className="w-12 h-12 bg-[#0B1F3B] rounded-[2px] flex items-center justify-center mr-5">
                    <Text className="text-white font-JakartaBold text-lg">
                      {item.name?.slice(0, 2).toUpperCase() || 'AN'}
                    </Text>
                </View>

                <View className="flex-1 flex flex-col">
                  <Text className="font-JakartaBold text-xl text-[#0B1F3B] tracking-tight">
                    {item.name || "Anonymous"}
                  </Text>
                  <Text className="text-sm font-JakartaMedium text-[#0B1F3B80] mt-1">
                    EXECUTE CHAT PROTOCOL
                  </Text>
                </View>
                
                <Image source={icons.to} style={{ tintColor: '#0B1F3B', opacity: 0.3 }} className="w-5 h-5" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}