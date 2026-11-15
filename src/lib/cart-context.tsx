"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, CustomerSession, FoodItemData } from "./types";
import { playSuccessBeep } from "./sound";

interface CartContextType {
  items: CartItem[];
  addItem: (item: FoodItemData, quantity?: number, notes?: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  removeItem: (foodItemId: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  tableNumber: string | null;
  setTableNumber: (table: string) => void;
  customer: CustomerSession | null;
  setCustomer: (customer: CustomerSession) => void;
  isRegistered: boolean;
  logoutCustomer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState<string | null>(null);
  const [customer, setCustomerState] = useState<CustomerSession | null>(null);
  const [taxPercentage] = useState<number>(5.0);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem("zan_cart_items");
      if (savedItems) setItems(JSON.parse(savedItems));

      const savedCustomer = localStorage.getItem("zan_customer_session");
      if (savedCustomer) setCustomerState(JSON.parse(savedCustomer));

      const savedTable = localStorage.getItem("zan_table_lock");
      if (savedTable) setTableNumberState(savedTable);
    } catch {
      // LocalStorage access issues in private mode
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem("zan_cart_items", JSON.stringify(items));
    } catch {}
  }, [items]);

  const setTableNumber = (table: string) => {
    setTableNumberState(table);
    try {
      localStorage.setItem("zan_table_lock", table);
    } catch {}
  };

  const setCustomer = (cust: CustomerSession) => {
    setCustomerState(cust);
    try {
      localStorage.setItem("zan_customer_session", JSON.stringify(cust));
    } catch {}
  };

  const logoutCustomer = () => {
    setCustomerState(null);
    try {
      localStorage.removeItem("zan_customer_session");
    } catch {}
  };

  const addItem = (foodItem: FoodItemData, quantity: number = 1, notes?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.foodItem.id === foodItem.id);
      if (existing) {
        return prev.map((i) =>
          i.foodItem.id === foodItem.id
            ? { ...i, quantity: i.quantity + quantity, notes: notes || i.notes }
            : i
        );
      }
      return [...prev, { foodItem, quantity, notes }];
    });
    playSuccessBeep();
  };

  const updateQuantity = (foodItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(foodItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.foodItem.id === foodItemId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (foodItemId: string) => {
    setItems((prev) => prev.filter((i) => i.foodItem.id !== foodItemId));
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("zan_cart_items");
    } catch {}
  };

  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const subtotal = items.reduce((acc, i) => {
    const itemPrice = i.foodItem.discountedPrice || i.foodItem.price;
    return acc + itemPrice * i.quantity;
  }, 0);

  const taxAmount = Math.round(subtotal * (taxPercentage / 100) * 100) / 100;
  const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItemsCount,
        subtotal,
        taxPercentage,
        taxAmount,
        grandTotal,
        tableNumber,
        setTableNumber,
        customer,
        setCustomer,
        isRegistered: Boolean(customer?.phone && customer?.name),
        logoutCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

