import { useUser, useAuth } from "@clerk/expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReactNativeModal } from "react-native-modal";

import Map from "@/components/Map";
import CustomButton from "@/components/CustomButton";
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
    <SafeAreaView className="flex-1 bg-white swiss-grid">
      <View className="flex flex-row items-center justify-between px-5 py-4 absolute w-full z-10 pt-16 top-0">
        <View className="bg-white rounded-brutalist px-4 py-2 shadow-orange border border-primary/10 flex flex-row items-center">
             <View className={`w-3 h-3 rounded-full mr-2 ${isVisible ? 'bg-primary' : 'bg-primary/20'}`} />
             <Text className="font-JakartaBold text-primary uppercase tracking-widest text-xs">
               {isVisible ? "Active / Radar" : "Ghost / Stealth"}
             </Text>
        </View>

        <View className="flex flex-row gap-4">
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
                  Alert.alert("Authorized", "A simulated identifier has been injected into the mesh.");
                } catch (e) {
                  console.error(e);
                  Alert.alert("Access Denied", "Simulation failed. Mesh rejection encountered.");
                }
              }}
              className="justify-center items-center w-12 h-12 rounded-brutalist bg-white border border-primary/20 shadow-orange"
            >
              <Text className="font-JakartaBold text-xl text-primary">+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsVisible(!isVisible)}
              className="justify-center items-center w-12 h-12 rounded-brutalist bg-white border border-primary/20 shadow-orange"
            >
              <Image source={isVisible ? icons.person : icons.eyecross} className="w-5 h-5 tint-primary" resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              className="justify-center items-center w-12 h-12 rounded-brutalist bg-white border border-primary/20 shadow-orange"
            >
              <Image source={icons.out} className="w-5 h-5 tint-primary" resizeMode="contain" />
            </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <Map />
      </View>

      {/* HUD Bottom */}
      <View className="absolute bottom-10 w-full px-6">
        <View className="bg-white p-8 rounded-brutalist shadow-orangeStrong border border-primary/20 flex flex-col items-center">
            <Text className="text-center font-JakartaMono text-3xl text-primary mb-2">
                {nearbyUsers.length.toString().padStart(2, '0')}
            </Text>
            <Text className="text-center font-JakartaBold text-xs text-primary uppercase tracking-widest opacity-60">
                Identifiers in Range
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
        <View className="bg-white px-8 py-10 rounded-t-[4px] border-t-2 border-primary min-h-[400px]">
          <View className="w-16 h-[2px] bg-primary/10 rounded-full mx-auto mb-10" />
          
          <Text className="text-2xl font-JakartaExtraBold text-primary mb-2 uppercase tracking-tight">
            Approach Request
          </Text>
          <Text className="text-base text-primary/60 mb-10 font-JakartaMedium leading-6">
            Establishing connection to identification node "{selectedUser?.name ? selectedUser.name.slice(0, 2).toUpperCase() : "AN"}". Source tracing active.
          </Text>

          <TextInput
            className="bg-primary/5 rounded-brutalist border border-primary/10 p-5 font-JakartaMono text-primary text-base h-28 mb-8"
            placeholder="INPUT COMMUNICATION DATA..."
            placeholderTextColor="#FF6A004D"
            multiline
            maxLength={100}
            value={noteContent}
            onChangeText={setNoteContent}
            textAlignVertical="top"
          />

          <CustomButton 
            title={sending ? "Processing..." : "Authorize Connection"}
            onPress={handleSendRequest}
            disabled={sending || noteContent.trim().length === 0}
            className={`shadow-orangeStrong ${sending || noteContent.trim().length === 0 ? 'opacity-50' : ''}`}
          />
        </View>
      </ReactNativeModal>

    </SafeAreaView>
  );
}