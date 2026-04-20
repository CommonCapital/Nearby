import React, { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, Text, View, StyleSheet, Platform } from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";

import { icons } from "constant";
import { useFetch } from "@/lib/fetch";
import { useNearbyStore, useLocationStore } from "@/store";
import { useAuth } from "@clerk/expo";

const Map = ({ themeColor = "#D4537E" }: { themeColor?: string }) => {
  const { userLatitude, userLongitude, isVisible } = useLocationStore();
  const { nearbyUsers, setSelectedUser, selectedUser, setNearbyUsers, refetchSignal, discoveryFilter } = useNearbyStore();
  const { userId } = useAuth();

  // Poll for nearby users based on location
  const { data: fetchUsers, loading, error, refetch } = useFetch<any[]>(
    userLatitude && userLongitude 
      ? `/(api)/nearby?userId=${userId}&lat=${userLatitude.toFixed(4)}&lng=${userLongitude.toFixed(4)}&filter=${discoveryFilter}`
      : `/(api)/nearby?userId=${userId}&filter=${discoveryFilter}`
  );

  // Reactive Signal Listener
  useEffect(() => {
    if (refetchSignal > 0) {
      refetch();
    }
  }, [refetchSignal]);

  // Polling interval
  useEffect(() => {
    if (fetchUsers) {
      setNearbyUsers(fetchUsers);
    }
    const interval = setInterval(() => {
      refetch();
    }, 3000); // Pulse every 3 seconds for real-time feel

    return () => clearInterval(interval);
  }, [fetchUsers]);

  if (!userLatitude || !userLongitude)
    return (
      <View className="flex justify-between items-center w-full h-full bg-white flex-1 justify-center">
        <ActivityIndicator size="small" color="#FF6A00" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text className="text-primary font-JakartaBold">Error: {error}</Text>
      </View>
    );

  // Fallback if MapView is missing (Expo Go without native build)
  if (!MapView) {
    return (
      <View className="flex-1 w-full h-full bg-white items-center justify-center p-10">
        <View className="bg-white p-8 rounded-brutalist border border-primary/10 shadow-orange items-center">
            <Text className="text-primary font-JakartaExtraBold text-xl mb-4 text-center">NATIVE BUILD REQUIRED</Text>
            <Text className="text-primary/70 text-center font-JakartaMedium mb-6 leading-6">
              Map functionality requires a custom Development Build. Expo Go does not include the necessary native modules for this project.
            </Text>
            <Text className="text-primary/40 text-xs font-JakartaBold uppercase tracking-widest">Run: npx expo run:ios</Text>
        </View>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ width: '100%', height: '100%' }}
      tintColor={themeColor}
      mapType="mutedStandard"
      showsPointsOfInterests={false}
      initialRegion={{
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.002, 
        longitudeDelta: 0.002,
      }}
      showsUserLocation={isVisible}
      userInterfaceStyle="dark"
    >
      {Circle && (
        <Circle
          center={{ latitude: userLatitude, longitude: userLongitude }}
          radius={100}
          strokeWidth={2}
          strokeColor={`${themeColor}66`} 
          fillColor={`${themeColor}1A`}
        />
      )}

      {Marker && nearbyUsers?.map((user) => (
        <Marker
          key={user.id}
          coordinate={{
            latitude: user.latitude,
            longitude: user.longitude,
          }}
          title={user.name ? user.name.slice(0, 2).toUpperCase() : "AN"}
          onPress={() => setSelectedUser(user)}
        >
           <View style={{ backgroundColor: themeColor }} className={`w-5 h-5 rounded-full border-2 border-background shadow-pulse ${selectedUser?.id === user.id ? 'w-8 h-8' : ''}`} />
        </Marker>
      ))}
    </MapView>
  );
};

export default Map;