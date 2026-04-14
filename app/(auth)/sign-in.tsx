
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
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, form]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[200px] flex justify-end pb-8 px-6 bg-[#0B1536] rounded-b-[40px] shadow-lg shadow-indigo-900/20">
          <Text className="text-4xl text-white font-JakartaExtraBold tracking-tight">
            Welcome 👋
          </Text>
          <Text className="text-[#8B98C6] mt-2 font-Jakarta text-base">
            Log in to continue finding people nearby.
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign In"
            onPress={onSignInPress}
            className="mt-6"
          />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-lg text-center text-[#64748B] mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-[#0B1536] font-JakartaBold">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;