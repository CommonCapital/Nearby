import { useAuth, useClerk } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "components/CustomButton";
import InputField from "components/InputField";
import OAuth from "components/OAuth";
import { icons } from "constant";
import { fetchAPI } from "lib/fetch";
import { Ionicons } from "@expo/vector-icons";

const SignUp = () => {
  

const { client, setActive } = useClerk();
  const signUp = client.signUp; // ← get signUp from client
const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));

      // Handle specific "session_exists" error gracefully
      if (err.errors?.[0]?.code === "session_exists") {
        router.replace("/(root)/(tabs)/home");
        return;
      }

      Alert.alert("Error", err.errors?.[0]?.longMessage || "An unexpected error occurred. Please try again.");
    }
  };
  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      
      // Handle session exists case in verification as well
      if (err.errors?.[0]?.code === "session_exists") {
        router.replace("/(root)/(tabs)/home");
        return;
      }

      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage || "An unexpected error occurred during verification.",
        state: "failed",
      });
    }
  };
  return (
    <ScrollView className="flex-1 bg-flesh aura-bg">
      <View className="flex-1">
        <View className="relative w-full h-[280px] flex justify-end pb-12 px-10 bg-[#4D0011] border-b border-primary/20 shadow-noir rounded-b-organic-lg">
          <Text className="text-5xl text-primary font-JakartaExtraBold tracking-tighter">
            Imperial Pulse
          </Text>
          <Text className="text-primary/60 mt-4 font-JakartaMedium text-lg leading-7">
            Initiate your royal identifier and signal within the grandeur mesh.
          </Text>
        </View>
        <View className="p-8">
          <InputField
            label="Pseudonym"
            placeholder="ENTER_NAME"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Pulse Link"
            placeholder="ENTER_ID"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Cipher"
            placeholder="SECURE_CODE"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title="Secure Pulse"
            onPress={onSignUpPress}
            className="mt-10 shadow-noir"
          />

          <OAuth />

          <Link
            href="/sign-in"
            className="text-lg text-center text-primary/60 mt-12 font-JakartaMedium"
          >
            Already pulsing?{" "}
            <Text className="text-primary font-JakartaExtraBold">Synchronize</Text>
          </Link>
        </View>

        {/* Verification Modal */}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-[#4D0011] px-8 py-12 rounded-organic border border-primary/10 min-h-[300px]">
             <Text className="font-JakartaExtraBold text-3xl text-primary text-center mb-4 uppercase">
              Confirm Pulse
            </Text>
            <Text className="text-base text-primary/60 font-JakartaMedium text-center mb-10 leading-7 px-4">
              An imperial cipher has been transmitted to {form.email}.
            </Text>
            <InputField
              label="Sync Code"
              placeholder="000000"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) => setVerification({ ...verification, code })}
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-2 text-center">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Activate Pulse"
              onPress={onPressVerify}
              className="mt-10 shadow-pulse"
            />
          </View>
        </ReactNativeModal>

        {/* Success Modal */}
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-[#4D0011] px-10 py-12 rounded-organic border border-primary/10 min-h-[400px] items-center justify-center shadow-pulse">
            <View className="items-center justify-center mb-10">
               <Ionicons name="checkmark-circle" size={140} color="#D4AF37" />
            </View>
            <Text className="text-4xl font-JakartaExtraBold text-primary text-center tracking-tighter">
              SYNCED
            </Text>
            <Text className="text-lg text-primary/60 font-JakartaMedium text-center mt-6 px-4 leading-7">
              Your identifier is now part of the imperial pulse network.
            </Text>
            <CustomButton
              title="Open Radar"
              onPress={() => {
                setShowSuccessModal(false);
                router.push(`/(root)/(tabs)/home`);
              }}
              className="mt-12 w-full shadow-noir"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};
export default SignUp;