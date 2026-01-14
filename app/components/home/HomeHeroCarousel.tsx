import { useTheme } from "@/app/context/theme-context";
import { Collection } from "@/types/api-types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface HomeHeroCarouselProps {
  collections: Collection[];
}

export const HomeHeroCarousel = ({ collections }: HomeHeroCarouselProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  const renderItem = ({ item, index }: { item: Collection; index: number }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.backgroundImage} />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.content}>
        <View style={styles.textContainer}>
          <Animated.Text
            key={`subtitle-${activeIndex === index}`}
            entering={FadeInRight.delay(200).duration(800)}
            style={styles.subtitle}
          >
            FEATURED COLLECTION
          </Animated.Text>
          <Animated.Text
            key={`title-${activeIndex === index}`}
            entering={FadeInDown.delay(400).duration(800)}
            style={styles.title}
          >
            {item.name}
          </Animated.Text>
          {item.description && (
            <Animated.Text
              key={`desc-${activeIndex === index}`}
              entering={FadeInDown.delay(500).duration(800)}
              style={styles.description}
            >
              {item.description}
            </Animated.Text>
          )}
          <Animated.View
            key={`button-${activeIndex === index}`}
            entering={FadeInDown.delay(600).duration(800)}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push(`/collection/${item.id}`)}
            >
              <Text style={styles.buttonText}>DISCOVER</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      {/* Indicators */}
      <View style={styles.indicatorContainer}>
        {collections.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  activeIndex === index ? "#FFF" : "rgba(255,255,255,0.4)",
              },
              activeIndex === index && { width: 24 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 550,
    width: width,
  },
  slide: {
    width: width,
    height: 550,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: 550,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  textContainer: {
    maxWidth: "80%",
  },
  subtitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 8,
    opacity: 0.9,
  },
  title: {
    color: "#FFF",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 12,
    lineHeight: 48,
  },
  description: {
    color: "#FFF",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 4,
    width: 140,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 30,
    left: 24,
    flexDirection: "row",
    gap: 8,
  },
  indicator: {
    height: 3,
    width: 12,
    borderRadius: 2,
  },
});
