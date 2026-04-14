import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";

import { fetchAPI } from "@/lib/fetch";

export default function DirectMessage() {
  const { id } = useLocalSearchParams();
  const { userId } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetchAPI(`/(api)/messages?userId=${userId}&otherId=${id}`);
      if (res && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id, userId]);

  const sendMessage = async () => {
    if (!input.trim() || messages.length >= 3) return;

    setSending(true);
    try {
      const res = await fetchAPI("/(api)/messages", {
        method: "POST",
        body: JSON.stringify({
          senderId: userId,
          receiverId: id,
          content: input.trim(),
        }),
      });

      if (res.error) {
        Alert.alert("Limit Reached", "Maximum limit of 3 messages reached for this chat to encourage real-world meetups!");
      } else {
        setInput("");
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not send message. You might have reached the 3-message limit.");
      fetchMessages();
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-[#0B1F3B1A] bg-white">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#0B1F3B" />
        </TouchableOpacity>
        <Text className="text-xl font-JakartaExtraBold tracking-tight text-[#0B1F3B]">Communications</Text>
        <View className="w-10" />
      </View>

      {/* Message List */}
      <View className="flex-1 bg-white px-4">
        {loading ? (
          <ActivityIndicator size="large" color="#0B1F3B" className="mt-10" />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 20 }}
            ListHeaderComponent={() => (
               <View className="bg-white p-4 rounded-[4px] mb-6 mx-2 border border-[#0B1F3B1A]">
                  <Text className="text-center font-JakartaMedium text-[#0B1F3B80] text-xs uppercase tracking-widest">
                    END-TO-END SECURE. LIMIT 3 TRANSMISSIONS.
                  </Text>
               </View>
            )}
            renderItem={({ item }) => {
              const isMine = item.sender_clerk_id === userId;
              return (
                <View className={`mb-4 max-w-[80%] ${isMine ? 'self-end' : 'self-start'}`}>
                  <View 
                    className={`p-4 rounded-[2px] ${
                      isMine 
                        ? 'bg-[#0B1F3B]' 
                        : 'bg-white border border-[#0B1F3B1A]'
                    }`}
                  >
                    <Text className={`font-JakartaMedium text-[15px] ${isMine ? 'text-white' : 'text-[#0B1F3B]'}`}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex flex-row items-center p-4 bg-white border-t border-[#0B1F3B1A]">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={messages.length >= 3 ? "TRANSMISSION OVER" : "Enter block..."}
            placeholderTextColor="#0B1F3B80"
            editable={messages.length < 3 && !sending}
            className="flex-1 bg-white h-[48px] px-4 font-JakartaMedium text-[#0B1F3B] border border-[#0B1F3B4D] rounded-[2px] focus:border-[#0B1F3B] focus:border-2"
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            disabled={!input.trim() || sending || messages.length >= 3}
            className={`w-12 h-[48px] rounded-[2px] items-center justify-center ml-3 ${
              !input.trim() || sending || messages.length >= 3 ? 'bg-white border border-[#0B1F3B1A]' : 'bg-[#0B1F3B]'
            }`}
          >
            {sending ? (
              <ActivityIndicator color={!input.trim() || messages.length >= 3 ? "#0B1F3B80" : "white"} size="small" />
            ) : (
              <Ionicons name="send" size={20} color={!input.trim() || sending || messages.length >= 3 ? "#0B1F3B4D" : "white"} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
