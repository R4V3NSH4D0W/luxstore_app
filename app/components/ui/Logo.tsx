import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface LogoProps {
  color?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  color = '#FFF', 
  width = 30, 
  height = 30,
  showText = true 
}) => {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 70 70" fill="none">
        {/* Top Shard */}
        <Path 
          d="M35 0L55 20H15L35 0Z" 
          fill={color}
        />
        {/* Middle Glitch Shard (Shifted Right) */}
        <Path 
          d="M23 24H63L71 32L63 40H23L15 32L23 24Z" 
          fill={color}
        />
        {/* Bottom Shard */}
        <Path 
          d="M15 44H55L35 64L15 44Z" 
          fill={color}
        />
      </Svg>
      {showText && (
        <Text style={[styles.text, { color }]}>LUXSTORE</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    // Using platform default serif or similar if available, otherwise defaulting to valid system font
    // For React Native, usually just fontWeight is enough for modern look
  }
});
