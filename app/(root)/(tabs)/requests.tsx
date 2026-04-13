import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchAPI } from "@/lib/fetch";

export default function Requests() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetchAPI(`/(api)/requests?userId=${userId}`);
      if (res && res.pending) {
        setRequests(res.pending);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleAction = async (requestId: number, action: 'accepted' | 'declined' | 'blocked') => {
    try {
      await fetchAPI('/(api)/requests', {
        method: 'PATCH',
        body: JSON.stringify({ requestId, status: action }),
      });
      // Filter out acted request locally
      setRequests(current => current.filter(r => r.id !== requestId));
    } catch (err) {
      console.error("Failed to update request:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-6">
        <Text className="text-3xl font-JakartaExtraBold text-black mb-5">
          Approach Requests
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#14B8A6" className="mt-10" />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={() => (
              <View className="flex flex-col items-center justify-center mt-20">
                <Text className="text-gray-500 font-Jakarta text-base">No pending requests around you.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View className="bg-gray-50 rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
                <View className="flex flex-row justify-between items-center mb-3">
                  <View className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <Text className="text-teal-700 font-JakartaBold text-lg">
                      {item.sender_name?.slice(0, 2).toUpperCase() || 'AN'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 font-Jakarta">Sent a note:</Text>
                    <Text className="font-JakartaMedium text-base text-gray-800">"{item.note}"</Text>
                  </View>
                </View>
                
                <View className="flex flex-row gap-3 mt-2">
                  <TouchableOpacity 
                    onPress={() => handleAction(item.id, 'accepted')}
                    className="flex-1 bg-teal-500 py-3 rounded-xl flex items-center"
                  >
                    <Text className="text-white font-JakartaBold">Accept</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleAction(item.id, 'declined')}
                    className="flex-1 bg-gray-200 py-3 rounded-xl flex items-center"
                  >
                    <Text className="text-gray-700 font-JakartaBold">Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}