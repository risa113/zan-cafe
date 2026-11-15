"use client";

import React, { useEffect, useState } from "react";
import {
  ChefHat,
  Clock,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Flame,
  AlertCircle,
} from "lucide-react";
import { playOrderChime } from "@/lib/sound";
import { DEMO_ORDERS } from "@/lib/initial-data";

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchenOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          // Filter only active kitchen orders
          const active = (data.orders || []).filter((o: any) =>
            ["ORDER_ACCEPTED", "PREPARING", "NEW_ORDER"].includes(o.status)
          );
          setOrders(active);
          return;
        }
      }
      throw new Error("Static fallback");
    } catch {
      // Static fallback for GitHub Pages
      const active = DEMO_ORDERS.filter((o: any) =>
        ["ORDER_ACCEPTED", "PREPARING", "NEW_ORDER"].includes(o.status)
      );
      setOrders(active);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(() => fetchKitchenOrders(true), 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchKitchenOrders(true);
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              Live Kitchen Display System (KDS)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Active Chef Order Tickets
          </h1>
        </div>

        <button
          onClick={() => fetchKitchenOrders()}
          className="p-2.5 rounded-xl bg-espresso-900 border border-gold/30 text-gold hover:bg-espresso-800 transition-colors text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-espresso-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 p-6 rounded-2xl bg-espresso-900 border border-gold/20">
          <ChefHat className="w-16 h-16 text-emerald-400/50 mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold text-white">Kitchen is All Caught Up!</h3>
          <p className="text-xs text-ivory/60 mt-1 max-w-sm mx-auto">
            No pending tickets in preparation queue right now. New table QR orders will appear here
            automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((ord) => {
            const isPreparing = ord.status === "PREPARING";
            const elapsedMins = Math.round(
              (Date.now() - new Date(ord.createdAt).getTime()) / 60000
            );

            return (
              <div
                key={ord.id}
                className={`p-6 rounded-2xl bg-espresso-900 border flex flex-col justify-between transition-all ${
                  isPreparing
                    ? "border-amber-500/60 shadow-lg ring-1 ring-amber-500/20"
                    : "border-gold/30 hover:border-gold/50"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <span className="font-mono text-base font-bold text-white">
                      #{ord.orderNumber}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-forest-800 border border-gold/40 text-xs font-bold text-gold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Table {ord.table?.tableNumber}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          elapsedMins > 15
                            ? "bg-red-950 text-red-400 border border-red-500"
                            : "bg-espresso-800 text-ivory/70 border border-white/10"
                        }`}
                      >
                        ⏱ {elapsedMins}m ago
                      </span>
                    </div>
                  </div>

                  {/* Customer Notes if any */}
                  {ord.customerNotes && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/30 text-xs text-amber-200">
                      <strong>Cooking Note:</strong> {ord.customerNotes}
                    </div>
                  )}

                  {/* Order Items with Checkable Items */}
                  <div className="space-y-3 mb-6">
                    {ord.items?.map((it: any) => (
                      <div
                        key={it.id}
                        className="p-3 rounded-xl bg-espresso-800 border border-gold/15 flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="font-serif text-sm font-bold text-white block">
                            {it.foodName}
                          </span>
                          {it.notes && (
                            <span className="text-[11px] text-ivory/50 block mt-0.5">
                              {it.notes}
                            </span>
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-gold text-espresso-950 font-bold text-xs shrink-0 font-sans">
                          × {it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Actions */}
                <div className="pt-4 border-t border-white/10">
                  {isPreparing ? (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "ORDER_READY")}
                      className="w-full py-3 px-4 rounded-xl font-serif text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Plated & Ready to Serve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "PREPARING")}
                      className="w-full py-3 px-4 rounded-xl font-serif text-xs font-bold bg-gradient-to-r from-gold-500 to-gold text-espresso-950 hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Cooking Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

