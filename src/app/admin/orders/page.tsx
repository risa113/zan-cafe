"use client";

import React, { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Search,
  Filter,
  RefreshCw,
  ChefHat,
  Receipt,
  FileCheck,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { playOrderChime } from "@/lib/sound";
import { DEMO_ORDERS } from "@/lib/initial-data";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal for payment verification
  const [selectedOrderForVerification, setSelectedOrderForVerification] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTab !== "ALL") {
        if (selectedTab === "VERIFICATION_PENDING") {
          params.set("paymentStatus", "VERIFICATION_PENDING");
        } else {
          params.set("status", selectedTab);
        }
      }
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
          setCounts(data.counts || {});
          return;
        }
      }
      throw new Error("Static fallback required");
    } catch {
      // Static fallback for GitHub Pages
      let filtered = [...DEMO_ORDERS];
      if (selectedTab === "VERIFICATION_PENDING") {
        filtered = filtered.filter((o) => o.paymentStatus === "VERIFICATION_PENDING");
      } else if (selectedTab !== "ALL") {
        filtered = filtered.filter((o) => o.status === selectedTab);
      }
      if (search.trim()) {
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            o.customer?.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setOrders(filtered);
      setCounts({
        ALL: DEMO_ORDERS.length,
        VERIFICATION_PENDING: DEMO_ORDERS.filter((o) => o.paymentStatus === "VERIFICATION_PENDING").length,
        PREPARING: DEMO_ORDERS.filter((o) => o.status === "PREPARING").length,
        ORDER_READY: DEMO_ORDERS.filter((o) => o.status === "ORDER_READY").length,
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 8000);
    return () => clearInterval(interval);
  }, [selectedTab, search]);

  const handleAction = async (orderId: string, actionPayload: any) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actionPayload),
      });
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setSelectedOrderForVerification(null);
          fetchOrders(true);
          return;
        }
      }
      throw new Error("Static fallback");
    } catch {
      // Simulate action locally in state on static hosts
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            if (actionPayload.action === "VERIFY_PAYMENT") {
              return { ...o, paymentStatus: "PAID", status: "ORDER_ACCEPTED" };
            }
            if (actionPayload.status) {
              return { ...o, status: actionPayload.status };
            }
          }
          return o;
        })
      );
      setSelectedOrderForVerification(null);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Kitchen & Front-of-House
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Live Order Management
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Real-time statuses from QR table orders • Auto syncs with billing
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="px-3.5 py-2 rounded-xl bg-espresso-900 border border-gold/30 text-gold hover:bg-espresso-800 transition-colors text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
        {[
          { key: "ALL", label: "All Orders", count: counts.all },
          { key: "VERIFICATION_PENDING", label: "UPI Verification", count: counts.paymentPending },
          { key: "NEW_ORDER", label: "New Received", count: counts.newOrders },
          { key: "ORDER_ACCEPTED", label: "Accepted", count: null },
          { key: "PREPARING", label: "In Kitchen", count: counts.kitchenActive },
          { key: "ORDER_READY", label: "Ready to Serve", count: counts.ready },
          { key: "COMPLETED", label: "Completed", count: counts.completed },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedTab === tab.key
                ? "bg-gold text-espresso-950 font-bold shadow-gold-glow"
                : "bg-espresso-900 text-ivory/70 hover:text-white border border-gold/15"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedTab === tab.key
                    ? "bg-espresso-950 text-gold"
                    : "bg-espresso-800 text-ivory/60"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by Order #, Customer Name, Phone or UTR..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-900 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/40"
        />
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-espresso-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-espresso-900 border border-gold/20">
          <UtensilsCrossed className="w-12 h-12 text-gold/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-ivory/60 mt-1">
            No customer orders match the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className={`p-5 rounded-2xl bg-espresso-900 border flex flex-col justify-between transition-all ${
                ord.paymentStatus === "VERIFICATION_PENDING"
                  ? "border-amber-500/70 shadow-lg ring-1 ring-amber-500/30"
                  : ord.status === "ORDER_READY"
                  ? "border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30"
                  : "border-gold/20 hover:border-gold/40"
              }`}
            >
              <div>
                {/* Header: Order ID & Table */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-white">
                      #{ord.orderNumber}
                    </span>
                    <div className="text-[10px] text-ivory/50 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>
                        {new Date(ord.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-forest-800 border border-gold/30 text-xs font-bold text-gold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Table {ord.table?.tableNumber}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-3 text-xs">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>{ord.customer?.name}</span>
                    <a
                      href={`tel:${ord.customer?.phone}`}
                      className="text-gold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      {ord.customer?.phone}
                    </a>
                  </div>
                  {ord.customerNotes && (
                    <div className="mt-1.5 p-2 rounded-lg bg-espresso-800 text-[11px] text-amber-300/90 border border-amber-500/20">
                      Note: {ord.customerNotes}
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div className="p-3 rounded-xl bg-espresso-800/80 border border-gold/15 mb-3 space-y-1.5 max-h-36 overflow-y-auto">
                  {ord.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between text-xs">
                      <span className="text-ivory/90">
                        {it.foodName} <strong className="text-gold">×{it.quantity}</strong>
                      </span>
                      <span className="font-bold text-white">₹{it.total}</span>
                    </div>
                  ))}
                </div>

                {/* Amount & Payment Status */}
                <div className="flex items-center justify-between text-xs pt-1 mb-4">
                  <div>
                    <span className="text-[10px] text-ivory/50 block">Payable Total</span>
                    <span className="font-serif text-lg font-bold text-gold">₹{ord.grandTotal}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                        ord.paymentStatus === "PAID"
                          ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                          : ord.paymentStatus === "VERIFICATION_PENDING"
                          ? "bg-amber-950 border-amber-500 text-amber-400 animate-pulse"
                          : "bg-red-950 border-red-500 text-red-400"
                      }`}
                    >
                      {ord.paymentStatus === "VERIFICATION_PENDING"
                        ? "Verify UPI Proof"
                        : ord.paymentStatus}
                    </span>
                    {ord.paymentUtr && (
                      <span className="text-[9px] text-ivory/40 block mt-0.5 truncate max-w-[120px]">
                        UTR: {ord.paymentUtr}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Advancement / Verification Action Buttons */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {/* If payment needs verification */}
                {ord.paymentStatus === "VERIFICATION_PENDING" ? (
                  <button
                    onClick={() => setSelectedOrderForVerification(ord)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-espresso-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Review & Verify Payment</span>
                  </button>
                ) : null}

                {/* Stage Progression Buttons */}
                <div className="flex gap-2">
                  {ord.status === "NEW_ORDER" && (
                    <button
                      onClick={() => handleAction(ord.id, { status: "ORDER_ACCEPTED" })}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-espresso-800 hover:bg-gold hover:text-espresso-950 text-gold border border-gold/30 text-xs font-semibold transition-colors"
                    >
                      Accept Order
                    </button>
                  )}

                  {["NEW_ORDER", "ORDER_ACCEPTED"].includes(ord.status) && (
                    <button
                      onClick={() => handleAction(ord.id, { status: "PREPARING" })}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-espresso-800 hover:bg-gold hover:text-espresso-950 text-gold border border-gold/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {ord.status === "PREPARING" && (
                    <button
                      onClick={() => handleAction(ord.id, { status: "ORDER_READY" })}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Ready to Serve</span>
                    </button>
                  )}

                  {ord.status === "ORDER_READY" && (
                    <button
                      onClick={() => handleAction(ord.id, { status: "COMPLETED" })}
                      className="w-full py-2 px-3 rounded-xl bg-gold hover:bg-gold-500 text-espresso-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 font-serif"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete & Archive Order</span>
                    </button>
                  )}

                  {ord.status === "COMPLETED" && (
                    <div className="w-full text-center py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                      ✓ Completed & Invoiced
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Verification Modal */}
      {selectedOrderForVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-espresso-900 border border-gold/40 rounded-2xl shadow-gold-glow-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Verify UPI Payment</h3>
                <span className="text-xs text-gold">
                  Order #{selectedOrderForVerification.orderNumber} • Table{" "}
                  {selectedOrderForVerification.table?.tableNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForVerification(null)}
                className="text-ivory/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-espresso-800 border border-gold/20 flex justify-between items-center">
                <span className="text-ivory/70">Payable Amount:</span>
                <span className="font-serif text-xl font-bold text-gold">
                  ₹{selectedOrderForVerification.grandTotal}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-espresso-800 border border-gold/20 space-y-1">
                <div className="flex justify-between">
                  <span className="text-ivory/60">Guest Name:</span>
                  <span className="font-bold text-white">
                    {selectedOrderForVerification.customer?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/60">Mobile:</span>
                  <span className="font-bold text-gold">
                    {selectedOrderForVerification.customer?.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/60">Submitted UTR:</span>
                  <span className="font-mono text-white font-bold">
                    {selectedOrderForVerification.paymentUtr || "None provided by guest"}
                  </span>
                </div>
                {selectedOrderForVerification.paymentNotes && (
                  <div className="flex justify-between">
                    <span className="text-ivory/60">Guest Note:</span>
                    <span className="text-ivory/90">
                      {selectedOrderForVerification.paymentNotes}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-ivory/60 mb-1">
                  Rejection Reason (only if rejecting):
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. UTR not matched on bank account"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex gap-3">
              <button
                onClick={() =>
                  handleAction(selectedOrderForVerification.id, {
                    action: "REJECT_PAYMENT",
                    rejectionReason: rejectionReason || "UTR or screenshot could not be matched",
                  })
                }
                disabled={updating}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-900/80 hover:bg-red-800 border border-red-500/40 text-red-200 text-xs font-semibold"
              >
                Reject Payment
              </button>

              <button
                onClick={() =>
                  handleAction(selectedOrderForVerification.id, {
                    action: "VERIFY_PAYMENT",
                  })
                }
                disabled={updating}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white text-xs font-bold font-serif shadow-sm"
              >
                Confirm & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

