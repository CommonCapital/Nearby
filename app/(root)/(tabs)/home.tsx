import { useUser, useAuth } from "@clerk/expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReactNativeModal } from "react-native-modal";

import Map from "@/components/Map";
import { icons } from "constant";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore, useNearbyStore } from "@/store";

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { setUserLocation, isVisible, setIsVisible } = useLocationStore();
  const { nearbyUsers, selectedUser, setSelectedUser } = useNearbyStore();

  const [noteContent, setNoteContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleSendRequest = async () => {
    if (!selectedUser || !user) return;
    setSending(true);
    try {
      await fetchAPI("/(api)/requests", {
        method: "POST",
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedUser.clerk_id,
          note: noteContent,
        }),
      });
      setSelectedUser(null);
      setNoteContent("");
    } catch (error) {
      console.error("Failed to send request", error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      // Set a default fallback location immediately so the map renders
      setUserLocation({
        latitude: 37.78825, // San Francisco Apple default
        longitude: -122.4324,
        address: "Default (Simulator)",
      });

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission not granted, using fallback.");
        return;
      }

      let location;
      try {
        location = await Promise.race([
          Location.getCurrentPositionAsync({}),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]) as Location.LocationObject;
      } catch (err) {
        // Fallback to last known if current position request timed out or failed
        location = await Location.getLastKnownPositionAsync({});
      }
      
      const updateServer = async (lat: number, lng: number) => {
        try {
          await fetchAPI("/(api)/nearby", {
            method: "POST",
            body: JSON.stringify({
              userId: user?.id,
              latitude: lat,
              longitude: lng,
              isVisible: isVisible,
            }),
          });
        } catch (error) {
          console.error("Failed syncing location", error);
        }
      };

      if (location && location.coords) {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: "Nearby",
        });
        
        if (user?.id) updateServer(location.coords.latitude, location.coords.longitude);
      }

      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
        (newLoc) => {
          setUserLocation({
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
            address: "Nearby",
          });
          if (user?.id) updateServer(newLoc.coords.latitude, newLoc.coords.longitude);
        }
      );
    })();

    return () => {
      if (locationSubscription) {
         locationSubscription.remove();
      }
    };
  }, [user?.id, isVisible]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex flex-row items-center justify-between px-5 py-4 absolute w-full z-10 pt-16 top-0">
        <View className="bg-white rounded-full px-4 py-2 shadow-sm flex flex-row items-center">
             <View className={`w-3 h-3 rounded-full mr-2 ${isVisible ? 'bg-green-500' : 'bg-gray-400'}`} />
             <Text className="font-JakartaBold">
               {isVisible ? "Visible to Nearby" : "Invisible"}
             </Text>
        </View>

        <View className="flex flex-row gap-3">
            <TouchableOpacity
              onPress={async () => {
                try {
                  const location = await Location.getCurrentPositionAsync({});
                  await fetchAPI("/(api)/mock", {
                    method: "POST",
                    body: JSON.stringify({
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }),
                  });
                  alert("Simulated user added nearby!");
                } catch (e) {
                  console.error(e);
                  alert("Failed to add user");
                }
              }}
              className="justify-center items-center w-10 h-10 rounded-full bg-white shadow-sm"
            >
              <Text className="font-JakartaBold text-lg text-teal-500">+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsVisible(!isVisible)}
              className="justify-center items-center w-10 h-10 rounded-full bg-white shadow-sm"
            >
              <Image source={isVisible ? icons.person : icons.eyecross} className="w-5 h-5 opacity-70" resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              className="justify-center items-center w-10 h-10 rounded-full bg-white shadow-sm"
            >
              <Image source={icons.out} className="w-5 h-5 opacity-70" resizeMode="contain" />
            </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <Map />
      </View>

      {/* HUD Bottom */}
      <View className="absolute bottom-5 w-full px-5">
        <View className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 flex flex-col pointer-events-none">
            <Text className="text-center font-JakartaBold text-lg text-gray-800">
                {nearbyUsers.length} People Nearby
            </Text>
            <Text className="text-center font-Jakarta mt-1 text-gray-500 text-sm">
                Radar updating live within 100m. Tap a dot to send an approach request.
            </Text>
        </View>
      </View>

      {/* Approach Request Modal */}
      <ReactNativeModal
        isVisible={!!selectedUser}
        onBackdropPress={() => setSelectedUser(null)}
        swipeDirection="down"
        onSwipeComplete={() => setSelectedUser(null)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View className="bg-white px-7 py-9 rounded-t-3xl min-h-[350px]">
          <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
          
          <Text className="text-2xl font-JakartaExtraBold text-center mb-2">
            Approach Request
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6 font-Jakarta">
            Send a context-aware note to "{selectedUser?.name ? selectedUser.name.slice(0, 2).toUpperCase() : "AN"}". They will see your distance.
          </Text>

          <TextInput
            className="bg-gray-100 rounded-xl p-4 font-Jakarta text-base h-24 mb-6"
            placeholder="Why would you like to connect? (e.g., 'Are you reading Dune?')"
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={100}
            value={noteContent}
            onChangeText={setNoteContent}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            onPress={handleSendRequest}
            disabled={sending || noteContent.trim().length === 0}
            className={`w-full py-4 rounded-full flex flex-row justify-center items-center ${sending || noteContent.trim().length === 0 ? 'bg-blue-300' : 'bg-blue-600'}`}
          >
            <Text className="text-white font-JakartaBold text-lg">
              {sending ? "Sending..." : "Send Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </ReactNativeModal>

    </SafeAreaView>
  );
}