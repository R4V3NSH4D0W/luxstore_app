import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUploadAvatar } from "../api/uploads";
import { useProfile, useUpdateProfile } from "../api/users";
import { useTheme } from "../context/theme-context";
import { useToast } from "../context/toast-context";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { data: profileResponse, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const user = profileResponse?.data;

  const [username, setUsername] = useState(user?.username || "");

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];

      const formData = new FormData();
      // @ts-ignore
      formData.append("avatar", {
        uri: selectedImage.uri,
        name: selectedImage.fileName || "avatar.jpg",
        type: selectedImage.mimeType || "image/jpeg",
      });

      try {
        await uploadAvatarMutation.mutateAsync(formData);
        await refetch();
        showToast("Profile photo updated", "success");
      } catch (error) {
        console.error("Upload failed", error);
        showToast("Failed to upload image", "error");
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        username,
      });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/profile");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      showToast("Failed to update profile", "error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
            style={styles.saveButton}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, { color: colors.primary }]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </Text>
                )}
                {uploadAvatarMutation.isPending && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.changePicButton}
                onPress={handlePickImage}
                disabled={uploadAvatarMutation.isPending}
              >
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {uploadAvatarMutation.isPending
                    ? "Uploading..."
                    : "Change Profile Photo"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  FULL NAME
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  EMAIL
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.muted,
                      borderColor: colors.border,
                      opacity: 0.6,
                    },
                  ]}
                  value={user?.email}
                  editable={false}
                />
                <Text style={styles.helperText}>Email cannot be changed.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePicButton: {
    padding: 8,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
