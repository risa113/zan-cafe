"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Download,
  Calendar,
  Phone,
  Mail,
  ShoppingBag,
  Clock,
  MapPin,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (dateRange !== "ALL") params.set("dateRange", dateRange);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, dateRange]);

  // Export to Excel / CSV using xlsx
  const handleExport = (format: "csv" | "xlsx") => {
    const exportData = customers.map((c) => ({
      "Customer ID": c.id,
      "Full Name": c.name,
      "Mobile Number": c.phone,
      "Email Address": c.email || "N/A",
      "Total Visits": c.totalVisits,
      "Total Orders": c.orders?.length || 0,
      "Lifetime Spend (₹)": c.totalSpend,
      "First Visit": new Date(c.firstVisitAt).toLocaleDateString("en-IN"),
      "Last Visit": new Date(c.lastVisitAt).toLocaleDateString("en-IN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Zan Cafe Customers");

    if (format === "csv") {
      XLSX.writeFile(workbook, `zan_cafe_customers_${Date.now()}.csv`);
    } else {
      XLSX.writeFile(workbook, `zan_cafe_customers_${Date.now()}.xlsx`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Guest Relationship Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Customer Database & CRM
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Auto-populated from Table QR registrations • Visit & spend history
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="px-3.5 py-2 rounded-xl bg-espresso-900 border border-gold/30 text-gold hover:bg-espresso-800 transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-gold-glow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Total Unique Diners
          </span>
          <div className="font-serif text-3xl font-bold text-white">{stats.totalCustomers || 0}</div>
          <span className="text-[11px] text-ivory/50 mt-1 block">Registered via Table QR</span>
        </div>

        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Repeat Customers
          </span>
          <div className="font-serif text-3xl font-bold text-gold">{stats.repeatCustomers || 0}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {stats.repeatRate || 0}% Customer Retention Rate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Total Customer Lifetime Spend
          </span>
          <div className="font-serif text-3xl font-bold text-white">
            ₹
            {customers
              .reduce((sum, c) => sum + (c.totalSpend || 0), 0)
              .toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-ivory/50 mt-1 block">Cumulative diner spend</span>
        </div>
      </div>

      {/* Search & Date Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diner by Name, Mobile number, Email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-900 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/40"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { key: "ALL", label: "All Time" },
            { key: "TODAY", label: "Today" },
            { key: "LAST_7_DAYS", label: "Last 7 Days" },
            { key: "LAST_30_DAYS", label: "Last 30 Days" },
            { key: "THIS_MONTH", label: "This Month" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setDateRange(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                dateRange === item.key
                  ? "bg-gold text-espresso-950 font-bold"
                  : "bg-espresso-900 text-ivory/70 hover:text-white border border-gold/15"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-ivory/60 uppercase text-[10px]">
                <th className="py-3 px-3">Guest</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Visits</th>
                <th className="py-3 px-3">Orders</th>
                <th className="py-3 px-3">Lifetime Spend</th>
                <th className="py-3 px-3">Last Visit</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-espresso-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{c.name}</span>
                    {c.totalVisits > 1 && (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        ★ Repeat Guest ({c.totalVisits} visits)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-gold font-bold block">{c.phone}</span>
                    {c.email && <span className="text-[10px] text-ivory/50">{c.email}</span>}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">{c.totalVisits}</td>
                  <td className="py-3 px-3 text-ivory/80">{c.orders?.length || 0} orders</td>
                  <td className="py-3 px-3 font-serif font-bold text-gold text-sm">
                    ₹{c.totalSpend.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-3 text-ivory/70">
                    {new Date(c.lastVisitAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-2.5 py-1 rounded-lg bg-espresso-800 hover:bg-gold hover:text-espresso-950 border border-gold/30 text-gold text-[11px] font-semibold transition-colors"
                    >
                      Profile & History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Past Orders Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-espresso-900 border border-gold/40 rounded-2xl shadow-gold-glow-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">{selectedCustomer.name}</h3>
                <span className="text-xs text-gold">Diner Profile #{selectedCustomer.id}</span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-ivory/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-espresso-800 border border-gold/20">
                <span className="text-[10px] text-ivory/50 block">Mobile Number</span>
                <span className="font-bold text-white text-sm">{selectedCustomer.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-espresso-800 border border-gold/20">
                <span className="text-[10px] text-ivory/50 block">Lifetime Spend</span>
                <span className="font-serif font-bold text-gold text-sm">
                  ₹{selectedCustomer.totalSpend}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-espresso-800 border border-gold/20">
                <span className="text-[10px] text-ivory/50 block">Total Visits</span>
                <span className="font-bold text-white text-sm">{selectedCustomer.totalVisits}</span>
              </div>
              <div className="p-3 rounded-xl bg-espresso-800 border border-gold/20">
                <span className="text-[10px] text-ivory/50 block">First Joined</span>
                <span className="font-bold text-white text-sm">
                  {new Date(selectedCustomer.firstVisitAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            {/* Orders History List */}
            <div>
              <h4 className="font-serif text-sm font-bold text-gold mb-3">Order History at Zan Cafe</h4>
              <div className="space-y-3">
                {selectedCustomer.orders?.length === 0 ? (
                  <p className="text-xs text-ivory/50 italic">No orders recorded yet.</p>
                ) : (
                  selectedCustomer.orders?.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-espresso-800 border border-gold/15 text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-white">#{ord.orderNumber}</span>
                        <span className="font-serif font-bold text-gold">₹{ord.grandTotal}</span>
                      </div>
                      <div className="text-[11px] text-ivory/60 flex items-center gap-3">
                        <span>Table {ord.table?.tableNumber}</span>
                        <span>•</span>
                        <span>
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{ord.paymentStatus}</span>
                      </div>
                      <div className="text-[11px] text-ivory/80 pt-1 border-t border-white/5">
                        {ord.items?.map((it: any) => `${it.foodName} (×${it.quantity})`).join(", ")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

