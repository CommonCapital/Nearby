import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
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
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

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
      <Circle
        center={{ latitude: userLatitude, longitude: userLongitude }}
        radius={100}
        strokeWidth={2}
        strokeColor="rgba(20, 184, 166, 0.5)" // Dashed ring
        fillColor="rgba(20, 184, 166, 0.05)"
        lineDashPattern={[10, 10]}
      />

      {nearbyUsers?.map((user) => (
        <Marker
          key={user.id}
          coordinate={{
            latitude: user.latitude,
            longitude: user.longitude,
          }}
          title={user.name ? user.name.slice(0, 2).toUpperCase() : "AN"}
          onPress={() => setSelectedUser(user)}
          // Using a default fallback or we can customize the marker to show initials visually
          pinColor={selectedUser?.id === user.id ? "blue" : "red"}
        />
      ))}
    </MapView>
  );
};

export default Map;