"use client";

import React, { useState } from "react";
import { FoodItemData } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { Plus, Check, ShoppingBag, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  item: FoodItemData;
  compact?: boolean;
}

export default function AddToCartButton({ item, compact = false }: Props) {
  const { items, addItem, updateQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.foodItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1);
    }
  };

  if (!item.isAvailable) {
    return (
      <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-700">
        Sold Out
      </span>
    );
  }

  // If already in cart, show quantity counter controls
  if (quantity > 0) {
    return (
      <div className="flex items-center gap-2 bg-espresso-800 border border-gold/40 rounded-xl px-2 py-1 shadow-sm">
        <button
          onClick={handleDecrement}
          className="w-7 h-7 rounded-lg bg-espresso-700 hover:bg-espresso-600 text-ivory flex items-center justify-center transition-colors active:scale-95"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-bold text-white min-w-[18px] text-center font-sans">
          {quantity}
        </span>

        <button
          onClick={handleIncrement}
          className="w-7 h-7 rounded-lg bg-gold hover:bg-gold-500 text-espresso-950 font-bold flex items-center justify-center transition-colors active:scale-95"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={handleAdd}
        className={`relative overflow-hidden flex items-center gap-1.5 rounded-xl font-medium transition-all duration-200 border ${
          compact
            ? "px-3 py-1.5 text-xs bg-espresso-800 hover:bg-gold hover:text-espresso-950 border-gold/40 text-ivory"
            : "px-4 py-2 text-xs font-semibold bg-gradient-to-r from-gold-500 to-gold text-espresso-950 hover:brightness-110 border-gold shadow-gold-glow"
        }`}
      >
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-1 text-emerald-950 font-bold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating dot animation towards cart on click */}
      <AnimatePresence>
        {justAdded && (
          <motion.div
            initial={{ opacity: 1, scale: 0.8, y: 0 }}
            animate={{ opacity: 0, scale: 1.4, y: -25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-0 right-2 pointer-events-none text-gold font-bold text-xs"
          >
            +1
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

