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
  theme: "rose",
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
  setTheme: (theme: "rose" | "golden" | "burgundy") => set(() => ({ theme })),
}));

export interface NearbyUser {
  id: string;
  clerk_id: string;
  name: string;
  latitude: number;
  longitude: number;
  bio?: string;
  gender?: string;
  orientation?: string;
  age?: number;
  interested_in?: string;
  image_url?: string;
}

export interface NearbyStore {
  nearbyUsers: NearbyUser[];
  selectedUser: NearbyUser | null;
  refetchSignal: number;
  discoveryFilter: string;
  setNearbyUsers: (users: NearbyUser[]) => void;
  setSelectedUser: (user: NearbyUser | null) => void;
  setDiscoveryFilter: (filter: string) => void;
  triggerRefetch: () => void;
}

export const useNearbyStore = create<NearbyStore>((set) => ({
  nearbyUsers: [],
  selectedUser: null,
  refetchSignal: 0,
  discoveryFilter: 'Everyone',
  setNearbyUsers: (users: NearbyUser[]) => set(() => ({ nearbyUsers: users })),
  setSelectedUser: (user: NearbyUser | null) => set(() => ({ selectedUser: user })),
  setDiscoveryFilter: (filter: string) => set(() => ({ discoveryFilter: filter })),
  triggerRefetch: () => set((state) => ({ refetchSignal: state.refetchSignal + 1 })),
}));