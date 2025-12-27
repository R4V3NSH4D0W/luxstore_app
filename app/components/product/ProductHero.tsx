import { useTheme } from "@/app/context/theme-context";
import { getImageUrl } from "@/app/lib/api-client";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

const { width } = Dimensions.get("window");
export const IMAGE_HEIGHT = 480;

interface ProductHeroProps {
  images: string[];
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  imageAnimatedStyle: any;
}

export const ProductHero = ({
  images,
  activeImageIndex,
  setActiveImageIndex,
  imageAnimatedStyle,
}: ProductHeroProps) => {
  const { colors } = useTheme();
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);

  // Auto-scroll when activeImageIndex changes programmatically
  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: activeImageIndex * width,
        y: 0,
        animated: false, // Use false for smoother instant swap if content changed
      });
      // Re-enable animation for subsequent user/index driven scrolls
    }
  }, [activeImageIndex, images]);

  return (
    <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          if (index !== activeImageIndex) {
            setActiveImageIndex(index);
            Haptics.selectionAsync().catch(() => {});
          }
        }}
      >
        {images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: getImageUrl(img) }}
            style={styles.heroImage}
            contentFit="cover"
            transition={500}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.indicatorContainer}>
        {images.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  idx === activeImageIndex
                    ? colors.primary
                    : "rgba(255,255,255,0.4)",
                width: idx === activeImageIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: width,
  },
  heroImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
});
