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
    <SafeAreaView className="flex h-full items-center justify-between bg-[#4D0011] aura-bg">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="w-full flex justify-end items-end p-8"
      >
        <Text className="text-primary/60 text-md font-JakartaBold uppercase tracking-widest">Skip</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View className="w-[8px] h-[8px] mx-1 bg-primary/10 rounded-full" />}
        activeDot={<View className="w-[28px] h-[8px] mx-1 bg-primary rounded-full" />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item: any) => (
          <View key={item.id} className="flex items-center justify-center p-8 mt-12">
            
            {/* Organic Icon Container */}
            <View className="w-60 h-60 rounded-organic bg-surface border border-primary/10 flex items-center justify-center mb-16 shadow-pulse">
              <View className="w-48 h-48 rounded-organic bg-primary/10 flex items-center justify-center">
                <Ionicons name={item.icon} size={84} color="#D4AF37" />
              </View>
            </View>
            
            <Text className="text-primary text-4xl font-JakartaExtraBold text-center mb-4 tracking-tighter">
              {item.title}
            </Text>
            
            <Text className="text-[18px] font-JakartaMedium text-center text-primary/70 leading-8 px-6">
              {item.description}
            </Text>

          </View>
        ))}
      </Swiper>

      <View className="w-full px-10 pb-16">
        <CustomButton
          title={isLastSlide ? "Begin Grandeur" : "Continue"}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollBy(1)
          }
          className="w-full shadow-noir"
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;