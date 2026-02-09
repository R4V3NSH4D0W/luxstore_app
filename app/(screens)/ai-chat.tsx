import { ChatProduct, sendChatMessage } from "@/app/api/ai";
import { useCurrency } from "@/app/context/currency-context";
import { useTheme } from "@/app/context/theme-context";
import { useChatHistory } from "@/app/hooks/use-chat-history";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper for shadow styles
const getShadowHelper = (theme: "light" | "dark") => {
  return Platform.select({
    ios: {
      shadowColor: theme === "dark" ? "#000" : "#889",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  });
};

interface DisplayMessage {
  id: string;
  role: "user" | "model";
  text: string;
  products?: ChatProduct[];
  timestamp?: number;
}

const TypingIndicator = () => {
  const { colors, isDark } = useTheme();

  const Dot = ({ delay }: { delay: number }) => {
    const opacity = useRef(new Animated.Value(0.4)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const anim = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -4,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      const timer = setTimeout(() => anim.start(), delay);
      return () => clearTimeout(timer);
    }, [delay, opacity, translateY]);

    return (
      <Animated.View
        style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: isDark ? "#CCC" : "#666",
          marginHorizontal: 3,
          opacity,
          transform: [{ translateY }],
        }}
      />
    );
  };

  return (
    <View style={[styles.messageRow, styles.botRow, { marginBottom: 16 }]}>
      <View
        style={[styles.avatarContainer, { backgroundColor: "transparent" }]}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isDark ? "#333" : "#E0E0E0",
          }}
        >
          <Ionicons
            name="sparkles"
            size={16}
            color={isDark ? "#FFF" : colors.primary}
          />
        </View>
      </View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isDark ? "#1C1C1E" : "#FFF",
            borderTopLeftRadius: 4,
            paddingVertical: 14,
            width: 70,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            ...getShadowHelper(isDark ? "dark" : "light"),
          },
        ]}
      >
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );
};

const SuggestionChip = ({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) => {
  const { isDark, colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.suggestionChip,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.03)",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.suggestionText, { color: isDark ? "#EEE" : "#444" }]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default function AIChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { currency } = useCurrency();
  const { messages, addMessage, clearHistory } = useChatHistory();
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsLoading(true);

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: Date.now(),
    };
    addMessage(userMsg as any);

    try {
      const apiHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await sendChatMessage(
        textToSend,
        apiHistory,
        currency || "USD",
      );

      const botMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text,
        products: response.products,
        timestamp: Date.now(),
      };

      addMessage(botMsg as any);
    } catch (error: any) {
      const errorMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now(),
      };
      addMessage(errorMsg as any);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, currency, addMessage]);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all chat history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearHistory();
          },
        },
      ],
    );
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: DisplayMessage;
    index: number;
  }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark ? "#555" : "#EEE",
                backgroundColor: isDark ? "#333" : "#FFF",
              }}
            >
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
          </View>
        )}

        <View
          style={{
            maxWidth: "82%",
            alignItems: isUser ? "flex-end" : "flex-start",
          }}
        >
          {isUser ? (
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: colors.primary,
                  borderBottomRightRadius: 4,
                  ...getShadowHelper(isDark ? "dark" : "light"),
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: "#FFF", fontWeight: "500" },
                ]}
              >
                {item.text}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: isDark ? "#1C1C1E" : "#FFF",
                  borderTopLeftRadius: 4,
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.02)",
                  ...getShadowHelper(isDark ? "dark" : "light"),
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: colors.text, opacity: 0.9 },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}

          {/* Product Carousel */}
          {item.products && item.products.length > 0 && (
            <FlatList
              horizontal
              data={item.products}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 16,
                paddingBottom: 8,
                paddingLeft: isUser ? 0 : 4,
              }}
              renderItem={({ item: product }) => (
                <Pressable
                  style={[
                    styles.productCard,
                    {
                      backgroundColor: isDark ? "#1C1C1E" : "#FFF",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                      ...getShadowHelper(isDark ? "dark" : "light"),
                    },
                  ]}
                  onPress={() => router.push(`/product/${product.id}`)}
                >
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: product.images?.[0] }}
                      style={[
                        styles.productImage,
                        { backgroundColor: isDark ? "#333" : "#F8F8F8" },
                      ]}
                      resizeMode="cover"
                    />
                    <View style={styles.priceTag}>
                      <Text style={styles.priceText}>
                        {currency}{" "}
                        {typeof product.price === "number"
                          ? product.price
                          : product.price}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productInfo}>
                    <Text
                      numberOfLines={2}
                      style={[styles.productName, { color: colors.text }]}
                    >
                      {product.name}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.viewButton,
                        { backgroundColor: isDark ? "#333" : "#F0F0F0" },
                      ]}
                      onPress={() => router.push(`/product/${product.id}`)}
                    >
                      <Text
                        style={[styles.viewButtonText, { color: colors.text }]}
                      >
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#F7F7F9" },
      ]}
    >
      {/* Background Decor (Optional) */}
      {!isDark && (
        <View
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: colors.primary,
            opacity: 0.05,
          }}
        />
      )}

      {/* Header */}
      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 100}
        tint={isDark ? "dark" : "light"}
        style={[
          styles.headerAbsolute,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Generative AI
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#4CAF50",
                }}
              />
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                Always Active
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.iconButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)",
          }}
        />
      </BlurView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Main Content */}
        <View style={styles.content}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingTop: insets.top + 70,
                paddingBottom: 20,
              },
            ]}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.logoContainer,
                    { backgroundColor: isDark ? "#222" : "#FFF" },
                    getShadowHelper(isDark ? "dark" : "light"),
                  ]}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: 0.9,
                      backgroundColor: colors.primary || "#000",
                    }}
                  >
                    <Ionicons name="sparkles" size={32} color="#FFF" />
                  </View>
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Hello, I'm Lux.
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  I can help you find products, check order status, or get style
                  advice.
                </Text>

                <View style={styles.suggestions}>
                  <SuggestionChip
                    text="Check my order status"
                    onPress={() => setInputText("Where is my order?")}
                  />
                  <SuggestionChip
                    text="Find me a black dress"
                    onPress={() => setInputText("Show me black dresses")}
                  />
                  <SuggestionChip
                    text="Recommend a gift"
                    onPress={() => setInputText("I need a gift for a friend")}
                  />
                </View>
              </View>
            }
            ListFooterComponent={
              isLoading ? <TypingIndicator /> : <View style={{ height: 20 }} />
            }
          />
        </View>

        {/* Input Area */}
        <BlurView
          intensity={Platform.OS === "ios" ? 80 : 100}
          tint={isDark ? "dark" : "light"}
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopWidth: 1,
            borderTopColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? "rgba(40,40,40,0.8)" : "#FFF",
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
                ...getShadowHelper(isDark ? "dark" : "light"),
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ask Lux..."
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: inputText.trim() ? 1 : 0.6 },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: inputText.trim()
                    ? colors.primary
                    : isDark
                      ? "#444"
                      : "#E0E0E0",
                }}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={inputText.trim() ? "#FFF" : isDark ? "#AAA" : "#888"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    // backgroundColor: 'rgba(0,0,0,0.02)', // optional hover effect
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  messageRow: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 10,
    marginBottom: 4,
  },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    maxWidth: "100%",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  productCard: {
    width: 160,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 140,
  },
  priceTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 18,
  },
  viewButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
    borderRadius: 40, // Match visual
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    fontSize: 15,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    maxWidth: 320,
  },
  suggestionChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 6,
    borderRadius: 30,
    borderWidth: 1,
    minHeight: 52,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
