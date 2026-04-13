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
      <View className="px-5 py-6 flex-1">
        <Text className="text-3xl font-JakartaExtraBold text-black mb-5">
          Connections
        </Text>
        <Text className="text-gray-500 font-Jakarta mb-5">
          Mutual approaches.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#14B8A6" className="mt-10" />
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.clerk_id}
            ListEmptyComponent={() => (
              <View className="flex flex-col items-center justify-center mt-20">
                <Text className="text-gray-500 font-Jakarta text-base">You haven't connected with anyone nearby yet.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity 
                // In a perfect world this routes to the direct message view: '/(root)/chat/[id]'
                onPress={() => console.log('Route to Chat details for', item.clerk_id)}
                className="flex flex-row items-center bg-gray-50 p-4 mb-3 rounded-2xl shadow-sm border border-gray-100"
              >
                <View className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                    <Text className="text-teal-700 font-JakartaBold text-xl">
                      {item.name?.slice(0, 2).toUpperCase() || 'AN'}
                    </Text>
                </View>

                <View className="flex-1 flex flex-col">
                  <Text className="font-JakartaBold text-lg text-gray-800">
                    {item.name || "Anonymous"}
                  </Text>
                  <Text className="text-sm font-JakartaMedium text-teal-600 mt-1">
                    Tap to chat
                  </Text>
                </View>
                
                <Image source={icons.to} className="w-5 h-5 opacity-40" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}