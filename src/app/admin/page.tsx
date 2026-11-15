"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  ChefHat,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/analytics?range=30days"),
        fetch("/api/admin/orders?limit=6"),
      ]);

      const aData = await analyticsRes.json();
      const oData = await ordersRes.json();

      if (aData.success) setAnalytics(aData);
      if (oData.success) setRecentOrders(oData.orders || []);
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-espresso-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-espresso-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalRevenue: 0,
    totalOrdersCount: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    pendingOrdersCount: 0,
    completedOrdersCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Centralized Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Zan Cafe Restaurant Overview
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Melapalayam, Tirunelveli • Real-time live synchronization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-espresso-900 border border-gold/30 text-gold hover:bg-espresso-800 transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Data</span>
          </button>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 shadow-gold-glow flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Live Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ivory/70 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-gold">
            ₹{summary.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-ivory/50 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Direct database verified sales</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ivory/70 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {summary.totalOrdersCount}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {summary.completedOrdersCount} completed • {summary.pendingOrdersCount} active
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ivory/70 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-white">
            ₹{summary.averageOrderValue}
          </div>
          <div className="text-[11px] text-ivory/50 mt-1">
            Aligned with Melapalayam target ₹200–400
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ivory/70 uppercase tracking-wider">
              Registered Guests
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {summary.totalCustomers}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">
            Tracked via QR ordering & visits
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart & Bestsellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-base font-bold text-white">Revenue Timeline</h3>
              <p className="text-xs text-ivory/60">Calculated from verified customer orders</p>
            </div>
            <span className="text-xs text-gold font-medium">Last 30 Days</span>
          </div>

          <div className="h-64 w-full">
            {analytics?.revenueTimeline?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenueTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d251f" />
                  <XAxis dataKey="date" stroke="#B8A589" fontSize={11} />
                  <YAxis stroke="#B8A589" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171310",
                      borderColor: "#C6A36A",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C6A36A"
                    strokeWidth={3}
                    dot={{ fill: "#C6A36A", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ivory/50">
                No orders recorded in this date window yet.
              </div>
            )}
          </div>
        </div>

        {/* Best Selling Dishes */}
        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
          <h3 className="font-serif text-base font-bold text-white mb-1">Top Selling Specialties</h3>
          <p className="text-xs text-ivory/60 mb-4">Ranked by order volume</p>

          <div className="space-y-3">
            {analytics?.bestSellers?.slice(0, 5).map((dish: any, idx: number) => (
              <div
                key={dish.name}
                className="p-3 rounded-xl bg-espresso-800/80 border border-gold/15 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-gold/15 text-gold text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-serif text-xs font-bold text-white line-clamp-1">
                      {dish.name}
                    </h5>
                    <span className="text-[10px] text-ivory/50">{dish.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gold block">{dish.quantity} sold</span>
                  <span className="text-[10px] text-ivory/60">₹{dish.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-base font-bold text-white">Recent Customer Orders</h3>
            <p className="text-xs text-ivory/60">Live orders appearing from table QR scans</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All Live Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-ivory/60 uppercase text-[10px]">
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Guest & Table</th>
                <th className="py-3 px-3">Dishes</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Kitchen Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-espresso-800/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{ord.customer?.name}</span>
                    <span className="text-[10px] text-gold font-medium">
                      Table {ord.table?.tableNumber}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-[200px] truncate text-ivory/80">
                    {ord.items?.map((it: any) => `${it.foodName} (×${it.quantity})`).join(", ")}
                  </td>
                  <td className="py-3 px-3 font-bold text-gold">₹{ord.grandTotal}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ord.paymentStatus === "PAID"
                          ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                          : ord.paymentStatus === "VERIFICATION_PENDING"
                          ? "bg-amber-950 border-amber-500 text-amber-400"
                          : "bg-red-950 border-red-500 text-red-400"
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold text-white">
                      {ord.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/admin/orders?order=${ord.id}`}
                      className="px-2.5 py-1 rounded-lg bg-espresso-800 hover:bg-gold hover:text-espresso-950 border border-gold/30 text-gold text-[11px] font-semibold transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

