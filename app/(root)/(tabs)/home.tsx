import { useUser, useAuth } from "@clerk/expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, TextInput, Alert, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReactNativeModal } from "react-native-modal";

import Map from "@/components/Map";
import CustomButton from "@/components/CustomButton";
import { icons, THEMES } from "constant";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore, useNearbyStore } from "@/store";

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { setUserLocation, isVisible, setIsVisible, theme, setTheme } = useLocationStore();
  const { nearbyUsers, selectedUser, setSelectedUser, triggerRefetch, discoveryFilter, setDiscoveryFilter } = useNearbyStore();

  const [noteContent, setNoteContent] = useState("");
  const [sending, setSending] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const CATEGORIES = ['Everyone', 'Straight Man', 'Straight Woman', 'Gay', 'Lesbian', 'Bi-sexual', 'A-sexual'];

  const handleFilterChange = (newFilter: string) => {
    setDiscoveryFilter(newFilter);
    triggerRefetch();
  };

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
      Alert.alert("Success", "Pulse transmitted to the local mesh.");
      triggerRefetch();
    } catch (error: any) {
      console.error("Failed to send request", error);
      const detailedError = error?.details || error?.message || String(error);
      Alert.alert("Transmission Failed", `Signal rejected: ${detailedError}`);
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
              name: user?.fullName || user?.firstName || "Nearby User",
              email: user?.primaryEmailAddress?.emailAddress,
              latitude: lat,
              longitude: lng,
              isVisible: isVisible,
              imageUrl: user?.imageUrl,
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
      if (locationSubscription) locationSubscription.remove();
    };
  }, [user?.id, isVisible]);

  return (
    <View className={`flex-1 theme-${theme}`}>
      <SafeAreaView className="flex-1 bg-background aura-bg">
        <View className="flex flex-row items-center justify-between px-6 py-4 absolute w-full z-10 pt-16 top-0">
          <View className="flex flex-col gap-3">
            <View className="bg-surface/90 rounded-pill px-5 py-3 shadow-noir border border-primary/20 flex flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${isVisible ? 'bg-primary' : 'bg-primary/20'}`} />
              <Text className="font-JakartaBold text-primary/90 tracking-tight text-xs">
                {isVisible ? "Radar Node Active" : "Stealth Mode Engaged"}
              </Text>
            </View>

            <View className="bg-surface/90 rounded-pill px-3 py-2 shadow-noir border border-primary/20 flex flex-row gap-3">
              <TouchableOpacity onPress={() => setTheme('rose')} className={`w-6 h-6 rounded-full border-2 ${theme === 'rose' ? 'border-white' : 'border-transparent'} bg-[#D4537E] shadow-pulse`} />
              <TouchableOpacity onPress={() => setTheme('golden')} className={`w-6 h-6 rounded-full border-2 ${theme === 'golden' ? 'border-white' : 'border-transparent'} bg-[#EF9F27] shadow-pulse`} />
              <TouchableOpacity onPress={() => setTheme('burgundy')} className={`w-6 h-6 rounded-full border-2 ${theme === 'burgundy' ? 'border-white' : 'border-transparent'} bg-[#D4AF37] shadow-pulse`} />
            </View>
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
                  triggerRefetch();
                  Alert.alert("Grandeur", "Pulse injected into the local mesh.");
                } catch (e) {
                  console.error(e);
                  Alert.alert("Error", "The mesh rejected the imperial signal.");
                }
              }}
              className="justify-center items-center w-14 h-14 rounded-pill bg-surface border border-primary/20 shadow-pulse"
            >
              <Text className="font-JakartaBold text-2xl text-primary">+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsVisible(!isVisible)}
              className="justify-center items-center w-14 h-14 rounded-pill bg-surface border border-primary/20 shadow-pulse"
            >
              <Image source={isVisible ? icons.person : icons.eyecross} className="w-6 h-6 tint-primary" resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              className="justify-center items-center w-14 h-14 rounded-pill bg-surface border border-primary/20 shadow-pulse"
            >
              <Image source={icons.out} className="w-5 h-5 tint-primary" resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

      <View className="absolute top-[160px] left-6 z-[100]" style={{ pointerEvents: 'box-none' }}>
        <Pressable
          onPress={() => setShowDropdown(!showDropdown)}
          style={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            borderColor: THEMES[theme as keyof typeof THEMES].primary,
            borderWidth: 1,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: THEMES[theme as keyof typeof THEMES].primary,
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'Jakarta-Bold', fontSize: 11, marginRight: 8 }}>
            IDENTIFIER: {discoveryFilter.toUpperCase()}
          </Text>
          <Image 
            source={icons.arrowDown} 
            style={{ width: 10, height: 10, tintColor: THEMES[theme as keyof typeof THEMES].primary, transform: [{ rotate: showDropdown ? '180deg' : '0deg' }] }} 
          />
        </Pressable>

        {showDropdown && (
          <View 
            style={{
              marginTop: 8,
              backgroundColor: 'rgba(20, 20, 20, 0.98)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              borderRadius: 12,
              width: 180,
              padding: 8,
              shadowColor: '#000',
              shadowOpacity: 0.5,
              shadowRadius: 20,
            }}
          >
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((cat) => {
                const isActive = discoveryFilter === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      handleFilterChange(cat);
                      setShowDropdown(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      marginBottom: 2,
                    }}
                  >
                    <Text style={{ 
                      color: isActive ? THEMES[theme as keyof typeof THEMES].primary : 'rgba(255,255,255,0.6)',
                      fontFamily: 'Jakarta-Bold',
                      fontSize: 10
                    }}>
                      {cat.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="flex-1">
        <Map themeColor={THEMES[theme].primary} />
      </View>

      <View className="absolute bottom-12 w-full px-8">
        <View className="bg-surface/95 p-8 rounded-organic-lg shadow-pulse border border-primary/20 flex flex-col items-center">
            <Text className="text-center font-JakartaExtraBold text-5xl text-primary mb-2">
                {nearbyUsers.length.toString().padStart(2, '0')}
            </Text>
            <Text className="text-center font-JakartaBold text-xs text-primary/60 uppercase tracking-[0.2em]">
                Active Signal Nodes
            </Text>
        </View>
      </View>

      <ReactNativeModal
        isVisible={!!selectedUser}
        onBackdropPress={() => setSelectedUser(null)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View className="bg-background px-8 py-10 rounded-t-organic-lg border-t-4 border-primary min-h-[550px]">
          <View className="w-16 h-1.5 bg-primary/20 rounded-full mx-auto mb-10" />
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View className="flex flex-row items-center mb-8">
              <View className="p-1.5 bg-surface rounded-full shadow-pulse border border-primary/20 mr-4">
                <Image
                  source={{ uri: selectedUser?.image_url || `https://avatar.iran.liara.run/username?username=${selectedUser?.name}` }}
                  className="w-20 h-20 rounded-full"
                />
              </View>
              <View className="flex-1">
                <Text className="text-3xl font-JakartaExtraBold text-primary tracking-tight">
                  {selectedUser?.name}
                </Text>
                <View className="flex flex-row items-center mt-1">
                  <View className="bg-primary/10 px-3 py-1 rounded-pill mr-2">
                    <Text className="text-primary font-JakartaBold text-[10px] uppercase">
                      {selectedUser?.gender || 'Unknown Signal'}
                    </Text>
                  </View>
                  <Text className="text-primary/60 font-JakartaBold text-xs">
                    {selectedUser?.age ? `${selectedUser.age} Cycles` : ''}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-surface/40 rounded-organic p-6 border border-primary/10 mb-8">
              <Text className="text-primary/40 font-JakartaBold uppercase tracking-widest text-[9px] mb-3">IDENTITY BIOGRAPHY</Text>
              <Text className="text-primary/80 font-JakartaMedium text-[15px] leading-6">
                {selectedUser?.bio || "This node has not yet transmitted an initial identity sequence."}
              </Text>
              {selectedUser?.interested_in && (
                <View className="mt-4 pt-4 border-t border-primary/5">
                   <Text className="text-primary/40 font-JakartaBold uppercase tracking-widest text-[9px] mb-2">SEEKING SIGNAL</Text>
                   <Text className="text-primary/70 font-JakartaBold text-xs">{selectedUser.interested_in.toUpperCase()}</Text>
                </View>
              )}
            </View>

            <TextInput
              className="bg-surface rounded-organic border border-primary/20 p-5 font-JakartaMedium text-primary text-md h-28 mb-8"
              placeholder="TRANSMIT SECURE PULSE..."
              placeholderTextColor="hsla(var(--primary), 0.5)"
              multiline
              maxLength={100}
              value={noteContent}
              onChangeText={setNoteContent}
              textAlignVertical="top"
            />

            <CustomButton 
              title={sending ? "Syncing Mesh..." : "Transmit Pulse"}
              onPress={handleSendRequest}
              disabled={sending || noteContent.trim().length === 0}
              className={`shadow-pulse ${sending || noteContent.trim().length === 0 ? 'opacity-50' : ''}`}
            />
          </ScrollView>
        </View>
      </ReactNativeModal>
      </SafeAreaView>
    </View>
  );
}