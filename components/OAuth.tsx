import { useOAuth } from "@clerk/expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";

import CustomButton from "components/CustomButton";
import { icons } from "constant";
import { googleOAuth } from "lib/auth";

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(root)/(tabs)/home");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-6 gap-x-4">
        <View className="flex-1 h-[1px] bg-primary/10" />
        <Text className="text-base font-JakartaBold text-primary uppercase tracking-widest">Or</Text>
        <View className="flex-1 h-[1px] bg-primary/10" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="mt-6 w-full shadow-orange"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2 tint-primary opacity-80"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;