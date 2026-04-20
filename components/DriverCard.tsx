import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "constant";
import { formatTime } from "@/lib/utils";
import { DriverCardProps } from "@/types/type";

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  return (
    <TouchableOpacity
      onPress={setSelected}
      className={`${
        selected === item.id ? "bg-primary/10 border-primary" : "bg-white border-primary/5"
      } flex flex-row items-center justify-between py-5 px-3 rounded-brutalist border`}
    >
      <Image
        source={{ uri: item.profile_image_url }}
        className="w-14 h-14 rounded-full"
      />

      <View className="flex-1 flex flex-col items-start justify-center mx-3">
        <View className="flex flex-row items-center justify-start mb-1">
          <Text className="text-lg font-JakartaBold text-primary">{item.title}</Text>

          <View className="flex flex-row items-center space-x-1 ml-2">
            <Image source={icons.star} className="w-3.5 h-3.5 tint-primary" />
            <Text className="text-sm font-JakartaMedium text-primary">4</Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-start">
          <View className="flex flex-row items-center">
            <Image source={icons.dollar} className="w-4 h-4 tint-primary" />
            <Text className="text-sm font-JakartaBold text-primary ml-1">
              ${item.price}
            </Text>
          </View>

          <Text className="text-sm font-JakartaRegular text-primary/30 mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaMedium text-primary/70">
            {formatTime(item.time!)}
          </Text>

          <Text className="text-sm font-JakartaRegular text-primary/30 mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaMedium text-primary/70">
            {item.car_seats} seats
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: item.car_image_url }}
        className="h-14 w-14"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default DriverCard;