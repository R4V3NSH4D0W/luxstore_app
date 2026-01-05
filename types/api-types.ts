export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  loyaltyPoints: number;
  heldPoints: number;
  lifetimePointsEarned: number;
  membershipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
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
  // sku: string; // Removed from client payload
  price: number;
  salePrice?: number | null;
  stock: number;
  hasSale: boolean;
  images: string[];
  // productId: string; // Removed from client payload often
  // productId: string; // Removed from client payload often
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  slug?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  currency?: string; 
  stock: number; // totalStock mapped to stock
  isAvailable: boolean;
  hasSale: boolean;
  rating?: number;
  reviewsCount?: number;

  images: string[];
  coverImage?: string | null; // computed main image

  brand?: { id: string; name: string } | null;
  
  category?: { id: string; name: string; image?: string; description?: string } | null;
  collection?: { id: string; name: string; image?: string; description?: string } | null;
  catalogue?: { id: string; name: string; image?: string; description?: string } | null;

  tags: string[];
  
  // Transformed Metadata
  careInstructions?: string[]; 
  specifications?: { key: string; value: string }[];
  features?: string[];

  variants?: Variant[];
  
  createdAt?: string;
  updatedAt?: string;
 
  hasMultipleVariants: boolean;
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
  type?: 'Home' | 'Work' | 'Other';
}

export interface CreateAddressData {
  name: string;
  street: string;
  city: string;
  zip: string;
  phone?: string;
  type?: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface UpdateAddressData {
  name?: string;
  street?: string;
  city?: string;
  zip?: string;
  phone?: string;
  isDefault?: boolean;
  type?: 'Home' | 'Work' | 'Other';
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
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'REFUNDED';
  reason: string;
  description?: string | null;
  adminNotes?: string | null;
  refundAmount?: number | null;
  restocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  addressId: string;
  address?: Address;
  items: OrderItem[];
  paymentMethod: 'cod' | 'card';
  currency?: string;
  shipments?: Shipment[];
  returns?: Return[];
  discountCode?: string | null;
  discountAmount?: number;
  tierDiscount?: number;
  pointsUsed: number;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
  processingAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export interface CreateOrderInput {
  address: string;
  paymentMethod?: 'cod' | 'card'; // Optional initially
  orderId: string;
  currency?: string;
  usePoints?: number;
}

export interface Discount {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
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

