export type UserRole = "OWNER" | "ADMIN" | "KITCHEN_STAFF" | "BILLING_STAFF";

export type OrderStatus =
  | "NEW_ORDER"
  | "PAYMENT_PENDING"
  | "PAYMENT_VERIFIED"
  | "ORDER_ACCEPTED"
  | "PREPARING"
  | "ORDER_READY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "VERIFICATION_PENDING"
  | "PAID"
  | "REJECTED"
  | "REFUNDED";

export type PaymentMethod = "UPI_QR" | "CASH" | "CARD";

export interface FoodCategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface FoodItemData {
  id: string;
  categoryId: string;
  category?: FoodCategoryData;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number | null;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isVeg: boolean;
  spicyLevel: number;
  preparationTimeMinutes: number;
  displayOrder: number;
}

export interface CartItem {
  foodItem: FoodItemData;
  quantity: number;
  notes?: string;
}

export interface CustomerSession {
  name: string;
  phone: string;
  email?: string;
}

export interface RestaurantTableData {
  id: string;
  tableNumber: string;
  displayName: string;
  capacity: number;
  locationDesc?: string | null;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  qrCodeData?: string | null;
  isActive: boolean;
}

export interface RestaurantSettingsData {
  id: string;
  restaurantName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  upiId: string;
  upiQrImageUrl?: string | null;
  taxPercentage: number;
  currencySymbol: string;
  isOrderingEnabled: boolean;
  openingHours: string;
  googleMapsEmbedUrl: string;
}

export interface OrderItemData {
  id: string;
  orderId: string;
  foodItemId: string;
  foodName: string;
  price: number;
  quantity: number;
  total: number;
  notes?: string | null;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  };
  tableId: string;
  table?: {
    id: string;
    tableNumber: string;
    displayName: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentProofUrl?: string | null;
  paymentUtr?: string | null;
  paymentNotes?: string | null;
  customerNotes?: string | null;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  preparedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  items: OrderItemData[];
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  tableNumber: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  printedCount: number;
  createdAt: string;
  order?: {
    items: OrderItemData[];
  };
}

