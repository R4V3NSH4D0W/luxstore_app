import { useMyOrders } from "@/app/api/orders";
import { useCreateReview, useProductReviews } from "@/app/api/reviews";
import { useProfile } from "@/app/api/users";
import { useAuth } from "@/app/context/auth-context";
import { useTheme } from "@/app/context/theme-context";
import { api } from "@/app/lib/api-client";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from "react-native-reanimated";

interface ProductReviewsProps {
  productId: string;
  scrollViewRef?: React.RefObject<any>;
  sectionY?: number;
}

export const ProductReviews = ({
  productId,
  scrollViewRef,
  sectionY,
}: ProductReviewsProps) => {
  const { colors } = useTheme();
  const { userToken } = useAuth();
  const { data: userProfile } = useProfile({ enabled: !!userToken });
  const { data: reviewsResponse, isLoading: loadingReviews } =
    useProductReviews(productId);
  const { data: ordersResponse, isLoading: loadingOrders } = useMyOrders();
  const [isFormVisible, setFormVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<View>(null);

  const hasPurchased = ordersResponse?.data?.some(
    (order) =>
      order.status.toUpperCase() !== "CANCELLED" &&
      order.status.toUpperCase() !== "CART" &&
      order.items?.some(
        (item: any) =>
          item.productId === productId || item.product?.id === productId
      )
  );

  const isLoading = loadingReviews || loadingOrders;

  // Auto-scroll to the form when it opens
  useEffect(() => {
    if (isFormVisible && scrollViewRef?.current && containerRef.current) {
      // Use measureLayout to find exact position relative to the ScrollView
      setTimeout(() => {
        containerRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y, width, height) => {
            scrollViewRef.current?.scrollTo({
              // Scroll to the top of the reviews section with a small offset
              y: y + 80,
              animated: true,
            });
          },
          () => console.error("Measurement failed")
        );
      }, 400); // Wait for keyboard and animation
    }
  }, [isFormVisible]);

  const reviews = reviewsResponse?.reviews || [];
  const reviewCount = reviews.length;

  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);
  const hasMoreReviews = reviewCount > 4;
  const currentUserReview = userProfile?.data?.id
    ? reviews.find((r) => r.userId === userProfile.data.id)
    : null;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((acc, current) => acc + current.rating, 0) / reviewCount
      : 0;

  // Calculate distribution
  const distribution = [0, 0, 0, 0, 0]; // 5 to 1
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[5 - r.rating]++;
    }
  });

  return (
    <View ref={containerRef} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          REVIEWS
        </Text>
        {userToken && !isFormVisible && hasPurchased && (
          <TouchableOpacity
            onPress={() => setFormVisible(true)}
            style={[styles.writeButtonSmall, { borderColor: colors.border }]}
          >
            <Text style={[styles.writeButtonTextSmall, { color: colors.text }]}>
              {currentUserReview ? "EDIT YOUR REVIEW" : "WRITE A REVIEW"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {userToken && !hasPurchased && !isLoading && (
        <View style={styles.verifiedOnlyContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={12}
            color={colors.muted}
          />
          <Text style={[styles.verifiedOnlyText, { color: colors.muted }]}>
            ONLY VERIFIED PURCHASERS CAN LEAVE REVIEWS
          </Text>
        </View>
      )}

      {reviewCount > 0 ? (
        <View style={styles.summaryContainer}>
          <View style={styles.avgSection}>
            <Text style={[styles.avgNumber, { color: colors.text }]}>
              {averageRating.toFixed(1)}
            </Text>
            <StarRating rating={averageRating} size={14} color={colors.text} />
            <Text style={[styles.totalReviews, { color: colors.muted }]}>
              {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
            </Text>
          </View>

          <View style={styles.distributionSection}>
            {distribution.map((count, index) => {
              const starLevel = 5 - index;
              const percentage =
                reviewCount > 0 ? (count / reviewCount) * 100 : 0;
              return (
                <View key={starLevel} style={styles.distRow}>
                  <Text style={[styles.distLabel, { color: colors.muted }]}>
                    {starLevel}
                  </Text>
                  <View
                    style={[styles.bgBar, { backgroundColor: colors.border }]}
                  >
                    <Animated.View
                      entering={FadeInDown.delay(index * 100)}
                      style={[
                        styles.fillBar,
                        {
                          width: `${percentage}%`,
                          backgroundColor: colors.text,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              NO REVIEWS YET
            </Text>
            {!userToken && (
              <Text style={[styles.loginPrompt, { color: colors.muted }]}>
                LOG IN TO BE THE FIRST TO REVIEW
              </Text>
            )}
          </View>
        )
      )}

      {/* Inline Review Form */}
      {isFormVisible && (
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          layout={Layout.springify()}
          style={[styles.inlineForm, { borderColor: colors.border }]}
        >
          <InlineReviewForm
            productId={productId}
            initialData={
              currentUserReview
                ? {
                    rating: currentUserReview.rating,
                    comment: currentUserReview.comment || "",
                  }
                : undefined
            }
            onClose={() => setFormVisible(false)}
          />
        </Animated.View>
      )}

      {reviewCount > 0 && (
        <View style={styles.reviewsList}>
          {displayedReviews.map((review, index) => (
            <Animated.View
              key={review.id}
              entering={FadeInDown.delay(index * 100)}
              style={[styles.reviewCard, { borderBottomColor: colors.border }]}
            >
              <View style={styles.reviewUserHeader}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: colors.border,
                      overflow: "hidden",
                    },
                  ]}
                >
                  {review.user?.avatar ? (
                    <Image
                      source={{ uri: review.user.avatar }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.muted }]}>
                      {(review.user?.username || "A")
                        .substring(0, 1)
                        .toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.username, { color: colors.text }]}>
                    {review.user?.username || "Anonymous"}
                  </Text>
                  <Text style={[styles.date, { color: colors.muted }]}>
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <StarRating
                  rating={review.rating}
                  size={10}
                  color={colors.text}
                />
              </View>
              {review.comment && (
                <Text style={[styles.comment, { color: colors.text }]}>
                  {review.comment}
                </Text>
              )}
              {review.images && review.images.length > 0 && (
                <View style={[styles.photosContainer, { marginTop: 12 }]}>
                  {review.images.map((img, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        /* View full screen? */
                      }}
                    >
                      <Image
                        source={{ uri: img }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 4,
                          backgroundColor: "#f0f0f0",
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>
          ))}

          {hasMoreReviews && !showAll && (
            <TouchableOpacity
              onPress={() => setShowAll(true)}
              style={[styles.showMoreButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.showMoreText, { color: colors.text }]}>
                SHOW MORE ({reviewCount - 4})
              </Text>
              <Ionicons
                name="chevron-down-outline"
                size={14}
                color={colors.text}
              />
            </TouchableOpacity>
          )}

          {showAll && reviewCount > 4 && (
            <TouchableOpacity
              onPress={() => setShowAll(false)}
              style={[
                styles.showMoreButton,
                { borderColor: colors.border, marginTop: 12 },
              ]}
            >
              <Text style={[styles.showMoreText, { color: colors.text }]}>
                SHOW LESS
              </Text>
              <Ionicons
                name="chevron-up-outline"
                size={14}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {!userToken && reviewCount > 0 && (
        <View
          style={[styles.loginPromptContainer, { borderColor: colors.border }]}
        >
          <Text style={[styles.loginPromptText, { color: colors.muted }]}>
            SIGN IN TO SHARE YOUR EXPERIENCE
          </Text>
        </View>
      )}
    </View>
  );
};

const StarRating = ({
  rating,
  size = 20,
  color = "#000",
}: {
  rating: number;
  size?: number;
  color?: string;
}) => {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? "star" : "star-outline"}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
};

const InlineReviewForm = ({
  productId,
  initialData,
  onClose,
}: {
  productId: string;
  initialData?: { rating: number; comment: string };
  onClose: () => void;
}) => {
  const { colors } = useTheme();
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const createReviewMutation = useCreateReview();
  const inputRef = useRef<TextInput>(null);

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - selectedImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // Auto-focus when mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500); // Small delay to allow animation to complete
    return () => clearTimeout(timer);
  }, []);

  // Reset/Update form if initialData changes
  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (createReviewMutation.isPending || isUploading) return;
    setIsUploading(true);
    try {
      let uploadedImagePaths: string[] = [];

      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((img, index) => {
          // @ts-ignore
          formData.append("images", {
            uri: img.uri,
            type: "image/jpeg", // Force jpeg or infer from uri
            name: `review-image-${index}.jpg`,
          });
        });

        const uploadRes = await api.upload<{
          success: boolean;
          data: { images: string[] };
        }>("/api/uploads/reviews/images", formData);
        if (uploadRes.success && uploadRes.data?.images) {
          uploadedImagePaths = uploadRes.data.images;
        }
      }

      await createReviewMutation.mutateAsync({
        productId,
        rating,
        comment: comment.trim() || undefined,
        images: uploadedImagePaths.length > 0 ? uploadedImagePaths : undefined,
      });
      onClose();
      setComment("");
      setRating(5);
      setSelectedImages([]);
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.formContent}
    >
      <View style={styles.formHeader}>
        <Text style={[styles.formTitle, { color: colors.text }]}>
          SHARE YOUR EXPERIENCE
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
          <Ionicons name="close-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.ratingSection}>
        <Text style={[styles.label, { color: colors.muted }]}>RATING</Text>
        <View style={styles.starPicker}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={[styles.label, { color: colors.muted }]}>PHOTOS</Text>
        <View style={styles.photosContainer}>
          {selectedImages.map((img, index) => (
            <View key={index} style={styles.photoPreviewWrapper}>
              <Image source={{ uri: img.uri }} style={styles.photoPreview} />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                style={styles.removePhotoBtn}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 5 && (
            <TouchableOpacity
              style={[styles.addPhotoButton, { borderColor: colors.border }]}
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={24} color={colors.text} />
              <Text style={[styles.addPhotoText, { color: colors.text }]}>
                Add Photos
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={[styles.label, { color: colors.muted }]}>YOUR REVIEW</Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.inlineInput,
            {
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="What did you like or dislike?"
          placeholderTextColor={colors.muted}
          multiline
          value={comment}
          onChangeText={setComment}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.inlineSubmitButton,
          {
            backgroundColor: colors.text,
            opacity:
              createReviewMutation.isPending ||
              (comment.length === 0 && rating === 0)
                ? 0.7
                : 1,
          },
        ]}
        onPress={handleSubmit}
        disabled={createReviewMutation.isPending || isUploading}
      >
        <Text style={[styles.inlineSubmitText, { color: colors.background }]}>
          {createReviewMutation.isPending || isUploading
            ? "SUBMITTING..."
            : initialData
            ? "UPDATE REVIEW"
            : "POST REVIEW"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  writeButtonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 2,
  },
  writeButtonTextSmall: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    gap: 32,
  },
  avgSection: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  avgNumber: {
    fontSize: 48,
    fontWeight: "300",
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  distributionSection: {
    flex: 1,
    gap: 6,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  distLabel: {
    fontSize: 10,
    width: 10,
    fontWeight: "600",
  },
  bgBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  fillBar: {
    height: "100%",
  },
  inlineForm: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 24,
    marginBottom: 40,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  closeIcon: {
    padding: 4,
  },
  formContent: {
    gap: 20,
  },
  ratingSection: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  starPicker: {
    flexDirection: "row",
    gap: 8,
  },
  inputSection: {
    gap: 8,
  },
  inlineInput: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 40,
  },
  inlineSubmitButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
    marginTop: 12,
  },
  inlineSubmitText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  reviewsList: {
    gap: 0,
  },
  reviewCard: {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewUserHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  comment: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  loginPrompt: {
    fontSize: 10,
    letterSpacing: 1,
  },
  loginPromptContainer: {
    paddingTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  loginPromptText: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "600",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 2,
    gap: 8,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  verifiedOnlyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    opacity: 0.8,
  },
  verifiedOnlyText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  photosContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 8,
  },
  photoPreviewWrapper: {
    width: 60,
    height: 60,
    position: "relative",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  removePhotoBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 0,
  },
  addPhotoButton: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addPhotoText: {
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
  },
});
