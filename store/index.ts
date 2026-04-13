import { create } from "zustand";

import { LocationStore, MarkerData } from "@/types/type";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  isVisible: true,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },
  setDestinationLocation: () => {
    // Deprecated for Nearby app, keeping for type compliance if needed elsewhere temporarily
  },
  setIsVisible: (visible: boolean) => set(() => ({ isVisible: visible })),
}));

export interface NearbyUser {
  id: string;
  clerk_id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface NearbyStore {
  nearbyUsers: NearbyUser[];
  selectedUser: NearbyUser | null;
  setNearbyUsers: (users: NearbyUser[]) => void;
  setSelectedUser: (user: NearbyUser | null) => void;
}

export const useNearbyStore = create<NearbyStore>((set) => ({
  nearbyUsers: [],
  selectedUser: null,
  setNearbyUsers: (users: NearbyUser[]) => set(() => ({ nearbyUsers: users })),
  setSelectedUser: (user: NearbyUser | null) => set(() => ({ selectedUser: user })),
}));