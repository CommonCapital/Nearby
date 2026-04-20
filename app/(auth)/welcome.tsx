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
    <SafeAreaView className="flex h-full items-center justify-between bg-white swiss-grid">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="w-full flex justify-end items-end p-6"
      >
        <Text className="text-primary/40 text-base font-JakartaBold tracking-widest uppercase">Skip</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[8px] h-[8px] mx-1.5 bg-primary/10 rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[8px] mx-1.5 bg-primary rounded-full" />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item: any) => (
          <View key={item.id} className="flex items-center justify-center p-8 mt-12">
            
            {/* Brutalist Icon Container */}
            <View className="w-56 h-56 rounded-brutalist bg-white border border-primary/20 flex items-center justify-center mb-16 shadow-orangeMedium">
              <View className="w-44 h-44 rounded-brutalist bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Ionicons name={item.icon} size={72} color="#FF6A00" />
              </View>
            </View>
            
            <Text className="text-primary text-3xl font-JakartaExtraBold text-center mb-4 tracking-tighter uppercase">
              {item.title}
            </Text>
            
            <Text className="text-[17px] font-JakartaMedium text-center text-primary/60 leading-7 px-4">
              {item.description}
            </Text>

          </View>
        ))}
      </Swiper>

      <View className="w-full px-8 pb-12">
        <CustomButton
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollBy(1)
          }
          className="w-full shadow-orangeStrong"
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;