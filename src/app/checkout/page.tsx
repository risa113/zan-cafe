"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import CustomerRegistrationModal from "@/components/CustomerRegistrationModal";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    taxPercentage,
    taxAmount,
    grandTotal,
    tableNumber,
    customer,
  } = useCart();

  const [customerNotes, setCustomerNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-espresso text-ivory flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md p-8 rounded-2xl bg-espresso-900 border border-gold/20 shadow-gold-glow">
            <div className="w-16 h-16 rounded-full bg-espresso-800 border border-gold/40 flex items-center justify-center mx-auto mb-4 text-gold">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
            <p className="text-xs text-ivory/70 mb-6 leading-relaxed">
              Explore our artisanal menu to add delicious burgers, wood-fired pizzas, and handcrafted beverages.
            </p>
            <Link
              href={tableNumber ? `/menu?table=${tableNumber}` : "/menu"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 shadow-gold-glow"
            >
              <span>Browse Digital Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleProceedToPayment = async () => {
    setError(null);

    // Require customer registration before checkout
    if (!customer?.phone || !customer?.name) {
      setIsRegModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        tableNumber: tableNumber || "T-01",
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email || "",
        customerNotes,
        items: items.map((i) => ({
          foodItemId: i.foodItem.id,
          quantity: i.quantity,
          notes: i.notes || "",
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to place order. Please review your cart.");
        setLoading(false);
        return;
      }

      // Order created! Clear local cart items and forward to payment screen
      clearCart();
      router.push(`/payment/${data.order.orderNumber}`);
    } catch (err) {
      console.error(err);
      setError("Network error while submitting order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      <CustomerRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        onSuccess={handleProceedToPayment}
        title="Customer Details Required"
        subtitle="Please provide your name & mobile number to confirm your order."
      />

      <div className="container mx-auto px-4 max-w-4xl py-10 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gold font-medium mb-1">
            <Link href="/menu" className="hover:underline">
              ← Back to Menu
            </Link>
            <span>/</span>
            <span>Cart Review & Checkout</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Review Your Order</h1>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-200 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-espresso-900 border border-gold/20">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                  Selected Dishes ({items.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-white/5 space-y-3">
                {items.map((cartItem) => {
                  const price = cartItem.foodItem.discountedPrice || cartItem.foodItem.price;
                  const lineTotal = price * cartItem.quantity;

                  return (
                    <div
                      key={cartItem.foodItem.id}
                      className="pt-3 first:pt-0 flex items-center gap-4"
                    >
                      <img
                        src={cartItem.foodItem.image}
                        alt={cartItem.foodItem.name}
                        className="w-16 h-16 rounded-xl object-cover bg-espresso-800 border border-gold/20 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cartItem.foodItem.isVeg ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <h4 className="font-serif text-sm font-bold text-white truncate">
                            {cartItem.foodItem.name}
                          </h4>
                        </div>
                        <div className="text-xs text-gold font-medium mt-0.5">
                          ₹{price} × {cartItem.quantity} = <strong className="text-white">₹{lineTotal}</strong>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-espresso-800 border border-gold/30 rounded-lg px-2 py-1 shrink-0">
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.foodItem.id, cartItem.quantity - 1)
                          }
                          className="w-6 h-6 rounded bg-espresso-700 hover:bg-espresso-600 text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[16px] text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.foodItem.id, cartItem.quantity + 1)
                          }
                          className="w-6 h-6 rounded bg-gold hover:bg-gold-500 text-espresso-950 font-bold flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="p-4 rounded-2xl bg-espresso-900 border border-gold/20">
              <label className="block text-xs font-semibold text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gold" />
                Kitchen Instructions (Optional)
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Less spicy, extra sauce, allergy info, or ice on the side..."
                rows={2}
                className="w-full p-3 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/30"
              />
            </div>
          </div>

          {/* Order Summary & Payment Action */}
          <div className="space-y-4">
            {/* Table & Customer Summary Card */}
            <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold block mb-3">
                Dining & Customer Info
              </span>

              {/* Table assignment */}
              <div className="p-3 rounded-xl bg-forest-800/80 border border-gold/30 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span className="text-xs text-ivory/80">Table Number:</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {tableNumber || "T-01 (Dine-in)"}
                </span>
              </div>

              {/* Customer info */}
              {customer ? (
                <div className="p-3 rounded-xl bg-espresso-800 border border-gold/20 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ivory/60">Guest Name:</span>
                    <span className="font-semibold text-white">{customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ivory/60">Mobile:</span>
                    <span className="font-semibold text-gold">{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ivory/60">Email:</span>
                      <span className="text-white truncate max-w-[140px]">{customer.email}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setIsRegModalOpen(true)}
                    className="text-[11px] text-gold hover:underline pt-1 block"
                  >
                    Edit details
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsRegModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-espresso-800 hover:bg-espresso-700 border border-gold/40 text-gold text-xs font-medium transition-colors text-center block"
                >
                  + Add Contact Details to Order
                </button>
              )}

              {/* Pricing Breakdown */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-ivory/80">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-ivory/80">
                  <span>Taxes (5% GST)</span>
                  <span>₹{taxAmount}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="text-gold font-serif">₹{grandTotal}</span>
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full mt-6 py-3.5 px-4 rounded-xl font-serif text-sm font-bold bg-gradient-to-r from-gold-500 via-gold to-gold-600 text-espresso-950 hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Order...</span>
                ) : (
                  <>
                    <span>Proceed to UPI QR Pay (₹{grandTotal})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-ivory/50">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                <span>Zero gateway fee • Direct UPI payment to Zan Cafe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

