export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string | null;
  avatar?: string | null;
  role: "USER" | "ADMIN" | "MODERATOR";
  loyaltyPoints: number;
  heldPoints: number;
  lifetimePointsEarned: number;
  membershipTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  createdAt?: string;
  updatedAt?: string;
  totalOrders?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number | string;
  };
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
  };
  message?: string;
}

export interface ForgotPasswordData {
  email: string;
  source?: "app" | "web";
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  phone?: string;
  username?: string;
}

// --- Ecommerce Entities based on Prisma Schema ---

export interface Media {
  id: string;
  url: string;
  type: string;
  productId: string;
}

export interface Variant {
  id: string;
  name: string;
  sku?: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  hasSale: boolean;
  formattedPrice?: string;
  formattedSalePrice?: string | null;
  image?: string | null;
  images: string[];
  productId?: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  slug?: string;
  catalogue?: { id: string; name: string } | null;
}

export interface Collection {
  id: string;
  name: string;
  image?: string;
  description?: string;
  slug?: string;
}

export interface CategoryWithProducts {
  id: string;
  name: string;
  description?: string;
  image?: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  sku?: string;
  price: number;
  salePrice?: number | null;
  currency?: string;
  stock: number; // totalStock mapped to stock
  isAvailable: boolean;
  hasSale: boolean;
  formattedPrice?: string;
  formattedSalePrice?: string | null;
  rating?: number;
  reviewsCount?: number;

  images: string[];
  coverImage?: string | null; // computed main image

  brand?: { id: string; name: string } | null;

  category?: {
    id: string;
    name: string;
    image?: string;
    description?: string;
  } | null;
  collection?: {
    id: string;
    name: string;
    image?: string;
    description?: string;
  } | null;
  catalogue?: {
    id: string;
    name: string;
    image?: string;
    description?: string;
  } | null;

  tags: string[];

  // Transformed Metadata
  careInstructions?: string[];
  specifications?: { key: string; value: string }[];
  features?: string[];

  variants?: Variant[];

  createdAt?: string;
  updatedAt?: string;

  hasMultipleVariants: boolean;
  defaultVariantId?: string | null;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  phone?: string | null;
  isDefault: boolean;
  userId: string;
  type?: "HOME" | "WORK" | "OTHER";
}

export interface CreateAddressData {
  name: string;
  street: string;
  city: string;
  zip: string;
  phone?: string;
  type?: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

export interface UpdateAddressData {
  name?: string;
  street?: string;
  city?: string;
  zip?: string;
  phone?: string;
  isDefault?: boolean;
  type?: "HOME" | "WORK" | "OTHER";
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  images?: string[];
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CareInstructionItem {
  id: string;
  productId: string;
  careInstructionId: string;
  careInstruction?: {
    id?: string;
    instruction?: string; // <-- update this line
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  variantId?: string | null;
  variant?: Variant;
  quantity: number;
  price: number;
  formattedPrice?: string;
  total?: number;
  formattedTotal?: string;
  displayImage?: string | null;
}

export interface Shipment {
  id: string;
  orderId: string;
  labelUrl?: string | null;
  tracking?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

export interface Return {
  id: string;
  orderId: string;
  status: string;
  statusTheme?: {
    label: string;
    color: string;
    backgroundColor: string;
    isActionRequired: boolean;
  };
  reason: string;
  description?: string | null;
  adminNotes?: string | null;
  refundAmount?: number | null;
  formattedRefundAmount?: string | null;
  restocked: boolean;
  createdAt: string;
  formattedDate?: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  statusTheme?: {
    label: string;
    color: string;
    backgroundColor: string;
    isActionRequired: boolean;
  };
  total: number;
  formattedTotal?: string;
  addressId: string;
  address?: Address;
  items: OrderItem[];
  paymentMethod: "cod" | "card";
  currency?: string;
  shipments?: Shipment[];
  returns?: Return[];
  discountCode?: string | null;
  discountAmount?: number;
  formattedDiscountAmount?: string | null;
  tierDiscount?: number;
  formattedTierDiscount?: string | null;
  tierDiscountRate?: number;
  pointsUsed: number;
  pointsEarned: number;
  potentialPoints?: number;
  subtotal?: number;
  formattedSubtotal?: string;
  taxAmount?: number;
  formattedTaxAmount?: string;
  totalWithTax?: number;
  createdAt: string;
  formattedDate?: string;
  updatedAt: string;
  processingAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  formattedProcessingAt?: string | null;
  formattedShippedAt?: string | null;
  formattedDeliveredAt?: string | null;
}

export interface CreateOrderInput {
  address: string;
  paymentMethod?: "cod" | "card"; // Optional initially
  orderId: string;
  currency?: string;
  usePoints?: number;
}

export interface Discount {
  id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  formattedValue?: string;
  currency?: string;
  active: boolean;
  usageLimit?: number | null;
  usageCount: number;
  isNewUserOnly: boolean;
  isVisible: boolean;
  isPromotional: boolean;
  themeColor?: string | null;
  iconName?: string | null;
  minPurchase?: number | null;
  formattedMinPurchase?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isClaimed?: boolean;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  config?: any;
}

export interface CancellationFeePreview {
  fee: number;
  currency: string;
  deductsFee: boolean;
  refundAmount: number;
}
