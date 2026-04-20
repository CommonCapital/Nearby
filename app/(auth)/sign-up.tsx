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
    <ScrollView className="flex-1 bg-white swiss-grid">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[220px] flex justify-end pb-10 px-8 bg-white border-b-2 border-primary shadow-orangeMedium">
          <Text className="text-4xl text-primary font-JakartaExtraBold tracking-tighter uppercase">
            REGISTER
          </Text>
          <Text className="text-primary/60 mt-3 font-JakartaMedium text-base uppercase tracking-widest text-xs">
            Initiate new identification node in the nearby mesh.
          </Text>
        </View>
        <View className="p-8">
          <InputField
            label="NAME / ALIAS"
            placeholder="ACCESS_NAME"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
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
            title="Authorize Entry"
            onPress={onSignUpPress}
            className="mt-8 shadow-orangeStrong"
          />
          <OAuth />
          <Link
            href="/sign-in"
            className="text-base text-center text-primary/40 mt-12 lowercase tracking-wider"
          >
            Already synchronized?{" "}
            <Text className="text-primary font-JakartaBold uppercase">Authenticate</Text>
          </Link>
        </View>
        <ReactNativeModal
          isVisible={verification.state === "pending"}
        >
          <View className="bg-white px-8 py-10 rounded-brutalist border-2 border-primary min-h-[350px]">
            <Text className="font-JakartaExtraBold text-2xl text-primary mb-4 uppercase tracking-tight">
              VERIFICATION
            </Text>
            <Text className="font-JakartaMedium text-primary/60 mb-8 leading-6">
              A verification sequence has been transmitted to {form.email}.
            </Text>
            <InputField
              label={"SEQ_CODE"}
              icon={icons.lock}
              placeholder={"00000"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-primary font-JakartaBold text-xs mt-2 uppercase tracking-wide">
                ERROR: {verification.error}
              </Text>
            )}
            <CustomButton
              title="Confirm Identity"
              onPress={onPressVerify}
              className="mt-8 shadow-orangeMedium"
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-8 py-10 rounded-brutalist border-2 border-primary min-h-[350px] items-center justify-center">
            <View className="items-center justify-center mb-8">
               <Ionicons name="checkmark-circle" size={120} color="#FF6A00" />
            </View>
            <Text className="text-3xl font-JakartaExtraBold text-primary uppercase tracking-tighter">
              SYNCED
            </Text>
            <Text className="text-base text-primary/60 font-JakartaMedium text-center mt-4 px-6 leading-6">
              Your identity has been successfully synchronized with the mesh.
            </Text>
            <CustomButton
              title="Enter Mesh"
              onPress={() => {
                setShowSuccessModal(false);
                router.push(`/(root)/(tabs)/home`);
              }}
              className="mt-10 w-full shadow-orangeStrong"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};
export default SignUp;