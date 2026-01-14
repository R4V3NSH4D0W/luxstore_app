import { useTheme } from "@/app/context/theme-context";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get("window");
export const HERO_HEIGHT = 340;

interface CategoryHeroProps {
  name: string;
  description?: string | null;
  image?: string | null;
  imageAnimatedStyle: any;
}

export const CategoryHero = ({
  name,
  description,
  image,
  imageAnimatedStyle,
}: CategoryHeroProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <Image
          source={{ uri: image || "" }}
          style={styles.heroImage}
          contentFit="cover"
          transition={500}
        />
        <View
          style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.3)" }]}
        />
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(300).duration(800)}
        style={styles.contentOverlay}
      >
        <Text style={styles.categoryName}>{name}</Text>
        {description && (
          <Text style={styles.categoryDescription} numberOfLines={3}>
            {description}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    overflow: "hidden",
  },
  imageContainer: {
    height: HERO_HEIGHT + 100, // Extra height for parallax
    width: width,
    position: "absolute",
    top: -50,
  },
  heroImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 24,
    paddingBottom: 40,
  },
  categoryName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    maxWidth: "90%",
  },
});
