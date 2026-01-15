import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface CollectionHeroProps {
  name: string;
  image?: string;
  description?: string | null;
  imageStyle?: any;
}

export const CollectionHero = ({
  name,
  image,
  description,
  imageStyle,
}: CollectionHeroProps) => {
  return (
    <View style={styles.heroContainer}>
      {image && (
        <Animated.Image
          source={{ uri: image }}
          style={[styles.heroImage, imageStyle]}
        />
      )}
      <View style={styles.heroOverlay}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroSubtitle}>COLLECTION</Text>
          <Text style={styles.heroTitleMain}>{name.toUpperCase()}</Text>
          {description && (
            <Text style={styles.heroDescription}>{description}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: 550, // Increased height for "long card" editorial feel
    width: width,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: 550,
    opacity: 0.9, // Slightly dimmed to help text pop
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)", // Much lighter overlay
    justifyContent: "flex-end",
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  heroTextContainer: {
    maxWidth: "95%",
  },
  heroSubtitle: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 12,
    opacity: 0.7,
  },
  heroTitleMain: {
    color: "#FFF",
    fontSize: 42,
    lineHeight: 56,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: 0.5,
    maxWidth: "85%",
  },
});
