import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/expo";
import { View, Text, ScrollView, Image, Pressable, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocationStore, useNearbyStore } from "@/store";

import InputField from "@/components/InputField";
import { fetchAPI } from "@/lib/fetch";
import { THEMES } from "constant";

const IDENTITIES = ['Straight Man', 'Straight Woman', 'Gay', 'Lesbian', 'Bi-sexual', 'A-sexual'];

import * as ImagePicker from 'expo-image-picker';

const ChipSelector = ({ label, options, selected, onSelect, theme = 'rose', editable = true }: any) => (
  <View className="mb-6 w-full">
    <Text style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Jakarta-Bold', textTransform: 'uppercase', fontSize: 9, letterSpacing: 1, marginBottom: 12 }}>{label}</Text>
    <View className="flex flex-row flex-wrap" style={{ gap: 8 }}>
      {options.map((option: string) => {
        const isActive = selected === option;
        const currentTheme = THEMES[theme as keyof typeof THEMES] || THEMES.rose;
        return (
          <Pressable
            key={option}
            onPress={() => editable && onSelect(option)}
            style={{
              backgroundColor: isActive ? currentTheme.primary : 'rgba(255,255,255,0.05)',
              borderColor: isActive ? currentTheme.primary : 'rgba(120,120,120,0.1)',
              borderWidth: 1,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
              opacity: editable ? 1 : 0.6,
            }}
          >
            <Text
              style={{
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Jakarta-Bold',
                fontSize: 10
              }}
            >
              {option.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const Profile = () => {
  const { user } = useUser();
  const { theme } = useLocationStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [interestedIn, setInterestedIn] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync profile from DB on mount
  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        const res = await fetchAPI(`/(api)/nearby?userId=${user?.id}`);
        if (res.data && res.data.length > 0) {
          // In a real app we'd have a specific /profile/me endpoint, 
          // but for this Trinity MVP we sync with the upserted DB record
          const dbUser = res.data.find((u: any) => u.clerk_id === user.id);
          if (dbUser) {
             setBio(dbUser.bio || "");
             setAge(dbUser.age?.toString() || "");
             setGender(dbUser.gender || "");
             setInterestedIn(dbUser.interested_in || "");
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setUploading(true);
        const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        
        await user?.setProfileImage({
          file: base64,
        });
        
        // Sync the image URL immediately after upload
        await handleSave();
        Alert.alert("Success", "Identity Signal updated successfully.");
      }
    } catch (error: any) {
      console.error("Upload error", error);
      Alert.alert("Error", error.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Sync with Clerk
      await user?.update({
        firstName,
        lastName,
      });

      // Sync with Trinity Database Mesh
      await fetchAPI("/(api)/nearby", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          name: `${firstName} ${lastName}`,
          email: user?.primaryEmailAddress?.emailAddress,
          bio,
          gender, // Using gender column for combined identity
          age: parseInt(age) || null,
          interestedIn,
          imageUrl: user?.imageUrl, // Sync clerk image to DB
        }),
      });

      setIsEditing(false);
      if (!uploading) Alert.alert("Grandeur", "Identity mesh synchronized successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className={`flex-1 theme-${theme}`}>
      <SafeAreaView className="flex-1 bg-background aura-bg">
        <ScrollView
          className="px-6"
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-row justify-between items-center my-8 mt-12">
            <Text className="text-3xl font-JakartaExtraBold text-primary tracking-tight">Identity</Text>
            <Pressable
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              style={{
                backgroundColor: isEditing ? THEMES[theme as keyof typeof THEMES].primary : 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 9999,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: isEditing ? '#FFFFFF' : THEMES[theme as keyof typeof THEMES].primary, fontFamily: 'Jakarta-Bold' }}>
                  {isEditing ? "SAVE SIGNAL" : "EDIT SIGNAL"}
                </Text>
              )}
            </Pressable>
          </View>

          <View className="flex items-center justify-center my-10">
            <View className="p-2 bg-surface rounded-full shadow-pulse border-2 border-primary/20 relative">
              <Image
                source={{
                  uri: user?.imageUrl,
                }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
                className="rounded-full h-[120px] w-[120px] border-4 border-background"
              />
              
              {isEditing && (
                <TouchableOpacity 
                   onPress={handlePickImage}
                   disabled={uploading}
                   className="absolute bottom-1 right-1 bg-primary w-10 h-10 rounded-full items-center justify-center border-4 border-background shadow-lg"
                >
                   {uploading ? (
                     <ActivityIndicator size="small" color="#FFF" />
                   ) : (
                     <Text className="text-white font-bold text-lg">+</Text>
                   )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="bg-surface/40 rounded-organic-lg p-6 border border-primary/10 shadow-noir mb-8">
            <Text className="text-primary/40 font-JakartaBold uppercase tracking-widest text-[10px] mb-6">CORE IDENTIFIER</Text>
            <View className="flex flex-col items-start justify-start w-full">
              <InputField
                label="First name"
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                containerStyle="w-full"
                editable={isEditing}
              />

              <InputField
                label="Last name"
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                containerStyle="w-full"
                editable={isEditing}
              />

              <InputField
                label="Description / Bio"
                placeholder="Describe your signal..."
                value={bio}
                onChangeText={setBio}
                containerStyle="w-full"
                editable={isEditing}
                multiline
              />

              <InputField
                label="Age"
                placeholder="Your age"
                value={age}
                onChangeText={setAge}
                containerStyle="w-full"
                editable={isEditing}
                keyboardType="number-pad"
              />

              <ChipSelector
                label="IDENTITY SIGNAL"
                options={IDENTITIES}
                selected={gender}
                onSelect={setGender}
                editable={isEditing}
                theme={theme}
              />

              <ChipSelector
                label="LOOKING FOR"
                options={IDENTITIES}
                selected={interestedIn}
                onSelect={setInterestedIn}
                editable={isEditing}
                theme={theme}
              />

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Profile;