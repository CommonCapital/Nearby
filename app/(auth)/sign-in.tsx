
import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "components/CustomButton";
import InputField from "components/InputField";
import OAuth from "components/OAuth";
import { icons } from "constant";
import { useAuth, useClerk } from "@clerk/expo";

const SignIn = () => {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
  const { client, setActive } = useClerk();
  const signIn = client.signIn; // ← get signIn from client
  // ← get signUp from client
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(root)/(tabs)/home");
    }
  }, [isLoaded, isSignedIn]);

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));

      // Handle specific "session_exists" error gracefully
      if (err.errors?.[0]?.code === "session_exists") {
        router.replace("/(root)/(tabs)/home");
        return;
      }

      Alert.alert("Error", err.errors?.[0]?.longMessage || "An unexpected error occurred. Please try again.");
    }
  }, [isLoaded, form]);

  return (
    <ScrollView className="flex-1 bg-white swiss-grid">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[220px] flex justify-end pb-10 px-8 bg-white border-b-2 border-primary shadow-orangeMedium">
          <Text className="text-4xl text-primary font-JakartaExtraBold tracking-tighter uppercase">
            IDENTIFY👋
          </Text>
          <Text className="text-primary/60 mt-3 font-JakartaMedium text-base uppercase tracking-widest text-xs">
            Enter credentials to synchronize with nearby identifiers.
          </Text>
        </View>

        <View className="p-8">
          <InputField
            label="ID / EMAIL"
            placeholder="ACCESS_EMAIL@DOMAIN.COM"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="ACCESS_CODE"
            placeholder="SECURE_PASSWORD"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Authenticate"
            onPress={onSignInPress}
            className="mt-8 shadow-orangeStrong"
          />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-base text-center text-primary/40 mt-12 lowercase tracking-wider"
          >
            No identification?{" "}
            <Text className="text-primary font-JakartaBold uppercase">Establish Node</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;