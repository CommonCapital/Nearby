import React, { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, Text, View, StyleSheet, Platform } from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";

import { icons } from "constant";
import { useFetch } from "@/lib/fetch";
import { useNearbyStore, useLocationStore } from "@/store";
import { useAuth } from "@clerk/expo";

const Map = () => {
  const { userLatitude, userLongitude, isVisible } = useLocationStore();
  const { nearbyUsers, setSelectedUser, selectedUser, setNearbyUsers } = useNearbyStore();
  const { userId } = useAuth();

  // Poll for nearby users based on location
  const { data: fetchUsers, loading, error, refetch } = useFetch<any[]>(
    `/(api)/nearby?userId=${userId}`
  );

  // Polling interval
  useEffect(() => {
    if (fetchUsers) {
      setNearbyUsers(fetchUsers);
    }
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [fetchUsers]);

  if (!userLatitude || !userLongitude)
    return (
      <View className="flex justify-between items-center w-full h-full bg-gray-50 flex-1 justify-center">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  // Fallback if MapView is missing (Expo Go without native build)
  if (!MapView) {
    return (
      <View className="flex-1 w-full h-full bg-slate-100 items-center justify-center p-10">
        <View className="bg-white p-6 rounded-3xl shadow-lg border border-red-100 items-center">
            <Text className="text-red-500 font-JakartaBold text-xl mb-2 text-center">Native Build Required</Text>
            <Text className="text-gray-600 text-center font-Jakarta mb-4">
              Map functionality requires a custom Development Build. Expo Go does not include the necessary native modules for this project.
            </Text>
            <Text className="text-slate-400 text-xs font-JakartaBold">Please run: npx expo run:ios</Text>
        </View>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ width: '100%', height: '100%', borderRadius: 16 }}
      tintColor="#14B8A6" // Teal tint for Nearby
      mapType="mutedStandard"
      showsPointsOfInterests={false}
      initialRegion={{
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.002, // Zoomed in to roughly 100-200m scale
        longitudeDelta: 0.002,
      }}
      showsUserLocation={isVisible}
      userInterfaceStyle="light"
    >
      {Circle && (
        <Circle
          center={{ latitude: userLatitude, longitude: userLongitude }}
          radius={100}
          strokeWidth={2}
          strokeColor="rgba(20, 184, 166, 0.5)" // Dashed ring
          fillColor="rgba(20, 184, 166, 0.05)"
          lineDashPattern={[10, 10]}
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
          pinColor={selectedUser?.id === user.id ? "blue" : "red"}
        />
      ))}
    </MapView>
  );
};

export default Map;