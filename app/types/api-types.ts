export interface User {
  id: string;
  email: string;
  username: string;
  name?: string; // Mapped from username often, but schema has username.
  phone?: string | null;
  avatar?: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
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
  name?: string;
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
  sku: string;
  price: number;
  stock: number;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  isFeatured: boolean;
  parentCategoryId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  catalogueId?: string | null;
  catalogue?: {
    name: string;
  };
}

export interface CategoryWithProducts {
  success: boolean;
  category: Category;
  products: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  isFeatured: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  sku: string;
  active: boolean;
  stock: number;
  brand?: string | null;
  tags: string[];
  weight?: number | null;
  dimensions?: string | null;
  featured: boolean;
  images: string[];
  
  catalogueId?: string | null;
  categoryId?: string | null;
  collectionId?: string | null;
   careInstructions?: CareInstructionItem[];
  
  // Relations (optional/loaded sometimes)
  category?: Category | null;
  collection?: Collection | null;
  variants?: Variant[];
  media?: Media[];
  
  createdAt: string;
  updatedAt: string;
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
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  addressId: string;
  address?: Address;
  items: OrderItem[];
  paymentMethod: 'cod' | 'card';
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  addressId: string;
  paymentMethod: 'cod' | 'card';
  cartId: string;
  currency?: string;
}

export interface Discount {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
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
