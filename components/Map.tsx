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
      tintColor="#FF6A00"
      mapType="mutedStandard"
      showsPointsOfInterests={false}
      initialRegion={{
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.002, 
        longitudeDelta: 0.002,
      }}
      showsUserLocation={isVisible}
      userInterfaceStyle="light"
    >
      {Circle && (
        <Circle
          center={{ latitude: userLatitude, longitude: userLongitude }}
          radius={100}
          strokeWidth={1}
          strokeColor="rgba(255, 106, 0, 0.3)" 
          fillColor="rgba(255, 106, 0, 0.03)"
          lineDashPattern={[5, 10]}
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
           <View className={`w-4 h-4 rounded-full border-2 border-white shadow-orangeMedium ${selectedUser?.id === user.id ? 'bg-primary w-6 h-6' : 'bg-primary/80'}`} />
        </Marker>
      ))}
    </MapView>
  );
};

export default Map;