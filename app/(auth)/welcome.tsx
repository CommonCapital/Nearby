import { router } from "expo-router";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "components/CustomButton";
import { onboarding } from "constant";

const { width } = Dimensions.get("window");

const Home = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="w-full flex justify-end items-end p-6"
      >
        <Text className="text-[#9CA3AF] text-base font-JakartaBold tracking-wide">Skip</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[8px] h-[8px] mx-1.5 bg-[#F3F4F6] rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[8px] mx-1.5 bg-[#4F46E5] rounded-full" />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item: any) => (
          <View key={item.id} className="flex items-center justify-center p-8 mt-12">
            
            {/* Elegant Icon Container */}
            <View className="w-48 h-48 rounded-full bg-indigo-50/50 border border-indigo-100 flex items-center justify-center mb-16 shadow-sm">
              <View className="w-36 h-36 rounded-full bg-indigo-100/80 flex items-center justify-center shadow-lg">
                <Ionicons name={item.icon} size={64} color="#4F46E5" />
              </View>
            </View>
            
            <Text className="text-black text-3xl font-JakartaExtraBold text-center mb-4 tracking-tight">
              {item.title}
            </Text>
            
            <Text className="text-[17px] font-JakartaMedium text-center text-[#6B7280] leading-7 px-2">
              {item.description}
            </Text>

          </View>
        ))}
      </Swiper>

      <View className="w-full px-6 pb-12">
        <CustomButton
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollBy(1)
          }
          className="w-full bg-[#4F46E5] shadow-lg shadow-indigo-300 py-3.5 rounded-full"
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;