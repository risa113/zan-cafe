"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCartBar() {
  const { totalItemsCount, grandTotal, tableNumber } = useCart();

  if (totalItemsCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-40 pointer-events-auto"
      >
        <div className="p-3 sm:p-4 rounded-2xl bg-espresso-900/95 border border-gold/50 backdrop-blur-xl shadow-gold-glow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
              <ShoppingBag className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
                </span>
                {tableNumber && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest-800 text-gold border border-gold/20 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {tableNumber}
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-gold">
                ₹{grandTotal}{" "}
                <span className="text-[10px] text-ivory/60 font-normal">(incl. 5% GST)</span>
              </div>
            </div>
          </div>

          <Link
            href="/checkout"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif text-xs font-bold bg-gradient-to-r from-gold-500 via-gold to-gold-600 text-espresso-950 hover:brightness-110 active:scale-95 transition-all shadow-md group"
          >
            <span>Review & Pay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

