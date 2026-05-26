import { Role, SaleStatus } from "@/generated/prisma";

export { Role, SaleStatus };

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type ProductWithCategory = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  minStock: number;
  sku: string | null;
  active: boolean;
  category: {
    id: string;
    name: string;
  } | null;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type ApiResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};