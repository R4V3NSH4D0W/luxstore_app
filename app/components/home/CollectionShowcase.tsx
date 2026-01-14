import { Collection } from "@/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/theme-context";

const { width } = Dimensions.get("window");

interface CollectionShowcaseProps {
  collections: Collection[];
  onPressCollection: (id: string) => void;
  onViewAll?: () => void;
}

export const CollectionShowcase = ({
  collections,
  onPressCollection,
  onViewAll,
}: CollectionShowcaseProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ marginTop: 40 }}>
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, paddingHorizontal: 24 },
          ]}
        >
          OUR COLLECTIONS
        </Text>
        {onViewAll && (
          <TouchableOpacity
            onPress={onViewAll}
            style={{ paddingHorizontal: 24 }}
          >
            <Text style={[styles.viewAll, { color: colors.muted }]}>
              VIEW ALL
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collectionsScrollContent}
      >
        {collections.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => onPressCollection(item.slug || item.id)}
            style={styles.collectionCard}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.collectionCardImage}
              />
            ) : (
              <View
                style={[
                  styles.placeholderContainer,
                  { backgroundColor: isDark ? "#222" : "#F5F5F5" },
                ]}
              >
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={colors.muted}
                />
              </View>
            )}
            <View style={styles.collectionOverlay}>
              <Text style={styles.collectionCardTitle}>
                {item.name.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  viewAll: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  collectionsScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  collectionCard: {
    width: width * 0.64,
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectionCardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    padding: 16,
  },
  collectionCardTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
