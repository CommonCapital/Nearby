import { Image, Text, View } from "react-native";

import { icons } from "@/constant";
import { formatDate, formatTime } from "lib/utils";
import { Ride } from "@/types/type";

const RideCard = ({ ride }: { ride: Ride }) => {
  return (
    <View className="flex flex-row items-center justify-center bg-surface rounded-organic-lg border border-primary/10 shadow-pulseMedium mb-4">
      <View className="flex flex-col items-start justify-center p-8">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-[2px]"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5 tint-primary" />
              <Text className="text-md font-JakartaMedium text-primary" numberOfLines={1}>
                {ride.origin_address}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5 tint-primary" />
              <Text className="text-md font-JakartaMedium text-primary" numberOfLines={1}>
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-8 border-t border-primary/10 pt-6 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-primary/50">
              Date & Time
            </Text>
            <Text className="text-md font-JakartaBold text-primary" numberOfLines={1}>
              {formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-primary/50">
              Driver
            </Text>
            <Text className="text-md font-JakartaBold text-primary">
              {ride.driver.first_name} {ride.driver.last_name}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-primary/50">
              Car Seats
            </Text>
            <Text className="text-md font-JakartaBold text-primary">
              {ride.driver.car_seats}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-primary/50">
              Payment Status
            </Text>
            <Text
              className="text-md capitalize font-JakartaBold text-primary"
            >
              {ride.payment_status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RideCard;