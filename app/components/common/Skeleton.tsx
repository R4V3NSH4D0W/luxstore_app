import { useTheme } from "@/app/context/theme-context";
import React, { useEffect } from "react";
import { ViewStyle } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) => {
  const { isDark } = useTheme();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      shimmerValue.value,
      [0, 1],
      isDark ? ["#1C1C1E", "#2C2C2E"] : ["#E5E5EA", "#F2F2F7"]
    );

    return {
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};
