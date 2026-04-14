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
      <View className="px-6 py-8 flex-1 bg-white">
        <Text className="text-4xl font-JakartaExtraBold text-[#0B1F3B] mb-2 tracking-tight">
          Approach Requests
        </Text>
        <Text className="text-[#0B1F3B80] font-JakartaMedium mb-8">
          Pending connection authorizations.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0B1F3B" className="mt-10" />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={() => (
              <View className="flex flex-col items-center justify-center mt-20 border border-[#0B1F3B1A] p-8 rounded-[4px] bg-[#FFFFFF]">
                <Text className="text-[#0B1F3B80] font-JakartaMedium text-base">No pending requests.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View 
                className="bg-white rounded-[4px] p-6 mb-4 border border-[#0B1F3B1A]"
                style={{ shadowColor: '#0B1F3B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 2 }}
              >
                <View className="flex flex-row justify-between items-center mb-5">
                  <View className="w-12 h-12 bg-[#0B1F3B] rounded-[2px] flex items-center justify-center mr-4">
                    <Text className="text-white font-JakartaBold text-lg">
                      {item.sender_name?.slice(0, 2).toUpperCase() || 'AN'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-[#0B1F3B80] font-JakartaBold uppercase tracking-wide">Signal Received</Text>
                    <Text className="font-JakartaMedium text-base text-[#0B1F3B] mt-1">"{item.note}"</Text>
                  </View>
                </View>
                
                <View className="flex flex-row gap-3">
                  <TouchableOpacity 
                    onPress={() => handleAction(item.id, 'accepted')}
                    className="flex-1 bg-[#0B1F3B] h-[48px] justify-center items-center rounded-[2px]"
                  >
                    <Text className="text-white font-JakartaBold uppercase tracking-[0.1em] text-sm">Accept</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleAction(item.id, 'declined')}
                    className="flex-1 bg-white border border-[#0B1F3B] h-[48px] justify-center items-center rounded-[2px]"
                  >
                    <Text className="text-[#0B1F3B] font-JakartaBold uppercase tracking-[0.1em] text-sm">Decline</Text>
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