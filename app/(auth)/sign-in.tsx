
import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "components/CustomButton";
import InputField from "components/InputField";
import OAuth from "components/OAuth";
import { icons, images } from "constant";
import { useAuth, useClerk } from "@clerk/expo";

const SignIn = () => {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
  const { client, setActive } = useClerk();
  const signIn = client.signIn; 

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetForm, setResetForm] = useState({
    code: "",
    password: "",
  });
  const [resetLoading, setResetLoading] = useState(false);

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
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      if (err.errors?.[0]?.code === "session_exists") {
        router.replace("/(root)/(tabs)/home");
        return;
      }
      Alert.alert("Error", err.errors?.[0]?.longMessage || "An unexpected error occurred. Please try again.");
    }
  }, [isLoaded, form]);

  const onForgotPasswordPress = async () => {
    if (!isLoaded) return;
    if (!form.email) {
      Alert.alert("Error", "Please enter your email to reset password.");
      return;
    }

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: form.email,
      });
      setShowResetModal(true);
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.longMessage || "Failed to initiate password reset.");
    }
  };

  const onResetPasswordPress = async () => {
    if (!isLoaded) return;
    setResetLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetForm.code,
        password: resetForm.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setShowResetModal(false);
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Password reset failed.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.longMessage || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-flesh aura-bg">
      <View className="flex-1">
        <View className="relative w-full h-[280px] flex justify-end pb-12 px-10 bg-[#4D0011] border-b border-primary/20 shadow-noir rounded-b-organic-lg">
          <Text className="text-5xl text-primary font-JakartaExtraBold tracking-tighter">
            Imperial Sync
          </Text>
          <Text className="text-primary/60 mt-4 font-JakartaMedium text-lg leading-7">
            Re-synchronize your identifier with the grandeur mesh.
          </Text>
        </View>

        <View className="p-8">
          <InputField
            label="ID / EMAIL"
            placeholder="ACCESS_EMAIL"
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
            isPassword={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <View className="flex-row justify-end -mt-2">
            <Text 
              onPress={onForgotPasswordPress}
              className="text-[#D4AF37] font-JakartaBold text-sm"
              style={{ color: '#FFD700' }}
            >
              Recover Access Code?
            </Text>
          </View>

          <CustomButton
            title="Authenticate Pulse"
            onPress={onSignInPress}
            className="mt-10 shadow-noir"
          />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-lg text-center text-primary/60 mt-12 font-JakartaMedium"
          >
            New to the mesh?{" "}
            <Text className="text-primary font-JakartaExtraBold">Register Grandeur</Text>
          </Link>
        </View>

        <ReactNativeModal isVisible={showResetModal}>
          <View className="bg-surface p-8 rounded-organic-lg border border-primary/20">
            <View className="items-center mb-6">
              <Image source={images.message} className="w-20 h-20 mb-4 tint-primary opacity-80" />
              <Text className="text-2xl font-JakartaExtraBold text-primary text-center">Reset Grandeur Code</Text>
              <Text className="text-primary/60 text-center font-JakartaMedium mt-2">
                An authorization code has been sent to {form.email}
              </Text>
            </View>

            <InputField
              label="Verification Code"
              placeholder="123456"
              icon={icons.lock}
              keyboardType="numeric"
              value={resetForm.code}
              onChangeText={(value) => setResetForm({ ...resetForm, code: value })}
            />

            <InputField
              label="New Access Code"
              placeholder="SECURE_PASSWORD"
              icon={icons.lock}
              secureTextEntry={true}
              isPassword={true}
              value={resetForm.password}
              onChangeText={(value) => setResetForm({ ...resetForm, password: value })}
            />

            <CustomButton
                title={resetLoading ? "Processing..." : "Authorize New Code"}
                onPress={onResetPasswordPress}
                className="mt-6"
            />
            
            <Text 
              onPress={() => setShowResetModal(false)}
              className="text-center text-primary/40 font-JakartaBold mt-6 uppercase tracking-widest text-xs"
            >
              Cancel Synchronization
            </Text>
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignIn;