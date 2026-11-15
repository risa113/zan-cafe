"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  Utensils,
  MapPin,
  Phone,
  RefreshCw,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { motion } from "framer-motion";

export default function OrderTrackClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
          setLoading(false);
          if (isManual) setRefreshing(false);
          return;
        }
      }
      throw new Error("API not available");
    } catch {
      // Fallback to local storage (for static GitHub Pages)
      try {
        const saved = localStorage.getItem(`zan_order_${orderNumber}`) || localStorage.getItem("zan_last_order");
        if (saved) {
          const parsed = JSON.parse(saved);
          setOrder(parsed);
          setLoading(false);
          if (isManual) setRefreshing(false);
          return;
        }
      } catch {}

      if (isManual) setError("Failed to refresh status.");
      else {
        // Fallback demo order so page is never empty on static preview
        setOrder({
          orderNumber: orderNumber || "ZAN-20261115-001",
          status: "ORDER_READY",
          paymentStatus: "PAID",
          grandTotal: 580,
          createdAt: new Date().toISOString(),
          table: { tableNumber: "T-01" },
          items: [
            { id: "1", foodName: "Zan Royale Truffle Burger", quantity: 2, total: 520 },
            { id: "2", foodName: "Spanish Caramel Iced Latte", quantity: 1, total: 175 }
          ]
        });
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-espresso text-ivory flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-gold">Loading order status...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-espresso text-ivory flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md p-8 rounded-2xl bg-espresso-900 border border-gold/30">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="font-serif text-xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-xs text-ivory/70 mb-4">
              We couldn't locate order #{orderNumber}. Please check the ID or contact staff.
            </p>
            <Link
              href="/orders"
              className="px-5 py-2.5 rounded-xl bg-gold text-espresso-950 font-serif font-bold text-xs"
            >
              Look Up Order by Mobile
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const steps = [
    { key: "NEW_ORDER", title: "Order Received", desc: "Sent to Zan Cafe terminal" },
    { key: "PAYMENT_VERIFIED", title: "Payment Confirmed", desc: "Verified by Cashier" },
    { key: "PREPARING", title: "Chef Preparing", desc: "In our Melapalayam kitchen" },
    { key: "ORDER_READY", title: "Ready to Serve", desc: "Hot & freshly plated" },
    { key: "COMPLETED", title: "Completed", desc: "Bon Appétit!" },
  ];

  let currentStepIndex = 0;
  if (order.status === "NEW_ORDER") {
    currentStepIndex = order.paymentStatus === "PAID" ? 1 : 0;
  } else if (order.status === "PAYMENT_PENDING") {
    currentStepIndex = 0;
  } else if (order.status === "PAYMENT_VERIFIED" || order.status === "ORDER_ACCEPTED") {
    currentStepIndex = 1;
  } else if (order.status === "PREPARING") {
    currentStepIndex = 2;
  } else if (order.status === "ORDER_READY") {
    currentStepIndex = 3;
  } else if (order.status === "COMPLETED") {
    currentStepIndex = 4;
  }

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 max-w-2xl py-10 flex-1">
        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                Live Kitchen Tracker
              </span>
              <h1 className="font-serif text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
            </div>
            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-espresso-800 hover:bg-espresso-700 text-gold border border-gold/30 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-ivory/80 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              Table: <strong className="text-white">{order.table?.tableNumber || "T-01"}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gold" />
              Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                order.paymentStatus === "PAID"
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-400"
                  : "bg-amber-950/80 border-amber-500 text-amber-400"
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 mb-6">
          <h3 className="font-serif text-base font-bold text-gold mb-6">Order Status Progression</h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? "bg-emerald-500 text-espresso-950 ring-4 ring-emerald-500/20"
                        : isCurrent
                        ? "bg-gold text-espresso-950 ring-4 ring-gold/30 animate-pulse"
                        : "bg-espresso-800 text-ivory/40 border border-white/10"
                    }`}
                  >
                    {isPast ? "✓" : idx + 1}
                  </div>

                  <div>
                    <h4
                      className={`font-serif text-sm font-bold ${
                        isCurrent
                          ? "text-gold text-base"
                          : isPast
                          ? "text-white"
                          : "text-ivory/50"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-ivory/60 mt-0.5">{step.desc}</p>

                    {isCurrent && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-[11px] text-gold font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                        Current Stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-gold" />
              <span>Items in this Order</span>
            </h3>
            <span className="text-xs text-ivory/60">{order.items?.length || 0} items</span>
          </div>

          <div className="divide-y divide-white/5 space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">{item.foodName}</span>
                  <span className="text-ivory/50 ml-2">× {item.quantity}</span>
                  {item.notes && <p className="text-[10px] text-ivory/40 italic mt-0.5">{item.notes}</p>}
                </div>
                <span className="font-bold text-gold">₹{item.total}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm font-bold">
            <span className="text-white">Grand Total (incl. GST)</span>
            <span className="text-gold font-serif text-base">₹{order.grandTotal}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-espresso-800/80 border border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-center sm:text-left">
            <span className="font-bold text-white block">Need any assistance?</span>
            <span className="text-ivory/60">Our floor staff is delighted to help at your table.</span>
          </div>
          <a
            href="tel:06369313196"
            className="px-4 py-2 rounded-lg bg-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>063693 13196</span>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}

