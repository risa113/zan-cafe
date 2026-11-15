import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { UserRole } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "zan-cafe-super-secret-jwt-key-2026";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("⚠️ SECURITY WARNING: JWT_SECRET environment variable is not explicitly configured in production!");
}

const STAFF_COOKIE = "zan_staff_token";
const CUSTOMER_COOKIE = "zan_customer_token";

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface CustomerTokenPayload {
  customerId: string;
  phone: string;
  name: string;
}

/**
 * Staff Token Management
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d", algorithm: "HS256" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(STAFF_COOKIE)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Customer Token Management (IDOR & Privacy Isolation)
 */
export function signCustomerToken(payload: CustomerTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d", algorithm: "HS256" });
}

export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as CustomerTokenPayload;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerTokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
    if (!token) return null;
    return verifyCustomerToken(token);
  } catch {
    return null;
  }
}

/**
 * Cryptographic Password Hashing (bcrypt with 12 salt rounds)
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export const STAFF_COOKIE_NAME = STAFF_COOKIE;
export const CUSTOMER_COOKIE_NAME = CUSTOMER_COOKIE;
