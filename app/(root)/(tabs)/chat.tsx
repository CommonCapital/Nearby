import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { fetchAPI } from "@/lib/fetch";
import { icons } from "constant";
import { useLocationStore } from "@/store";

export default function Chat() {
  const { userId } = useAuth();
  const { theme } = useLocationStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSignals = async () => {
    try {
      const res = await fetchAPI(`/(api)/requests?userId=${userId}`);
      if (res) {
        setFriends(res.friends || []);
        setPending(res.pending || []);
      }
    } catch (err) {
      console.error("Failed to fetch signals", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      setUpdatingId(requestId);
      await fetchAPI(`/(api)/requests`, {
        method: 'PATCH',
        body: JSON.stringify({ requestId, status }),
      });
      // Immediate optimistic update or refetch
      fetchSignals();
    } catch (err) {
      Alert.alert("Error", "Failed to update signal status.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const renderPulse = ({ item }: { item: any }) => (
    <View className="bg-surface/80 p-6 mb-4 rounded-organic border border-primary shadow-pulse flex flex-row items-center">
      <View className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
        <Text className="text-background font-JakartaBold text-lg">
          {item.sender_name?.slice(0, 2).toUpperCase() || 'AN'}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-primary font-JakartaBold text-lg">{item.sender_name || "Unknown Signal"}</Text>
        <Text className="text-primary/60 text-xs font-JakartaMedium italic mt-1">"{item.note}"</Text>
      </View>
      <View className="flex flex-row gap-2">
        <TouchableOpacity 
          onPress={() => handleStatusUpdate(item.id, 'accepted')}
          disabled={!!updatingId}
          className="bg-primary px-3 py-2 rounded-pill"
        >
          <Text className="text-background font-JakartaBold text-[10px]">ACCEPT</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleStatusUpdate(item.id, 'declined')}
          disabled={!!updatingId}
          className="bg-surface border border-primary/20 px-3 py-2 rounded-pill"
        >
          <Text className="text-primary font-JakartaBold text-[10px]">DECLINE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 theme-${theme}`}>
    <SafeAreaView className="flex-1 bg-background aura-bg">
      <View className="px-6 pt-12 pb-24 flex-1">
        <Text className="text-5xl font-JakartaExtraBold text-primary mb-2 tracking-tighter">
          Mesh
        </Text>
        <Text className="text-primary/40 font-JakartaBold mb-10 text-xs uppercase tracking-[0.3em]">
          Signal Syncing Active
        </Text>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="hsla(var(--primary), 1)" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {pending.length > 0 && (
              <View className="mb-12">
                <Text className="text-primary/40 font-JakartaBold uppercase tracking-widest text-[10px] mb-6">SIGNALS INBOUND ({pending.length})</Text>
                {pending.map((item) => (
                   <View key={item.id}>
                      {renderPulse({ item })}
                   </View>
                ))}
              </View>
            )}

            <View>
              <Text className="text-primary/40 font-JakartaBold uppercase tracking-widest text-[10px] mb-6">MUTUAL CONNECTIONS</Text>
              <FlatList
                data={friends}
                keyExtractor={(item) => item.clerk_id}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View className="flex flex-col items-center justify-center mt-10 border border-primary/10 p-10 rounded-organic bg-surface/20">
                    <Text className="text-primary/30 font-JakartaMedium text-sm">NO ACTIVE MATCHES</Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => router.push(`/(root)/chat/${item.clerk_id}`)}
                    className="flex flex-row items-center bg-surface/60 p-6 mb-4 rounded-organic border border-primary/5 shadow-noir"
                  >
                    <View className="w-14 h-14 bg-surface rounded-full border border-primary/20 flex items-center justify-center mr-5 shadow-pulse">
                        <Text className="text-primary font-JakartaBold text-xl">
                          {item.name?.slice(0, 2).toUpperCase() || 'AN'}
                        </Text>
                    </View>

                    <View className="flex-1 flex flex-col">
                      <Text className="font-JakartaExtraBold text-xl text-primary tracking-tight">
                        {item.name || "Anonymous"}
                      </Text>
                      <Text className="text-[10px] font-JakartaBold text-primary/40 mt-1 uppercase tracking-widest">
                        ESTABLISHED NODE
                      </Text>
                    </View>
                    
                    <Image source={icons.to} className="w-5 h-5 tint-primary opacity-20" />
                  </TouchableOpacity>
                )}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
    </View>
  );
}