"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import {
  Search,
  Clock,
  MapPin,
  ArrowRight,
  Receipt,
  User,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

export default function CustomerOrdersHistoryPage() {
  const { customer } = useCart();
  const [phone, setPhone] = useState(customer?.phone || "");
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/customer/orders?phone=${cleanPhone}`);
      const data = await res.json();
      if (data.success) {
        setCustomerData(data.customer);
        setOrders(data.orders || []);
      } else {
        setError(data.error || "Failed to find order history.");
      }
    } catch {
      setError("Network error while looking up orders.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 max-w-3xl py-12 flex-1">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold block mb-1">
            Order Lookup & Repeat Dining
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Your Order History</h1>
          <p className="text-xs sm:text-sm text-ivory/70 mt-1 max-w-md mx-auto">
            Enter your registered mobile number to track existing live orders or view past culinary visits.
          </p>
        </div>

        {/* Lookup Input Form */}
        <form
          onSubmit={handleLookup}
          className="p-6 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number (e.g., 9840123456)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-sm text-white placeholder-ivory/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-gold-glow disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find Orders"}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-6">
            {customerData && (
              <div className="p-4 rounded-xl bg-forest-800/80 border border-gold/30 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-white">{customerData.name}</h3>
                  <p className="text-xs text-gold mt-0.5">{customerData.phone}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-ivory/70 block">Total Visits: <strong className="text-white">{customerData.totalVisits}</strong></span>
                  <span className="text-ivory/70 block">Lifetime Spend: <strong className="text-gold">₹{customerData.totalSpend}</strong></span>
                </div>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-2xl bg-espresso-900 border border-gold/20">
                <ShoppingBag className="w-12 h-12 text-gold/50 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold text-white">No Orders Found</h4>
                <p className="text-xs text-ivory/60 mt-1 mb-4">
                  We couldn't find any orders under this mobile number.
                </p>
                <Link
                  href="/menu"
                  className="px-5 py-2.5 rounded-xl bg-gold text-espresso-950 font-serif font-bold text-xs inline-block"
                >
                  Start an Order
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-gold">Past & Active Orders</h3>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl bg-espresso-900 border border-gold/20 hover:border-gold/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif text-sm font-bold text-white">
                          #{ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                              : "bg-gold/15 border-gold/40 text-gold"
                          }`}
                        >
                          {ord.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-ivory/60 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gold" />
                          Table {ord.table?.tableNumber || "T-01"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gold" />
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-ivory/80">
                        {ord.items?.map((it: any) => it.foodName).join(", ")}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <span className="font-serif text-lg font-bold text-gold">₹{ord.grandTotal}</span>
                      <Link
                        href={`/track/${ord.orderNumber}`}
                        className="mt-1 text-xs text-gold hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>View Status Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

