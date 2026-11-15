"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  CreditCard,
  UtensilsCrossed,
  FileSpreadsheet,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

export default function AdminReportsPage() {
  const [range, setRange] = useState("30days");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const handleExport = (format: "csv" | "xlsx") => {
    if (!data) return;

    const reportRows = (data.bestSellers || []).map((item: any) => ({
      "Food Item": item.name,
      Category: item.category,
      "Quantity Sold": item.quantity,
      "Total Revenue (₹)": item.revenue,
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Analytics");

    if (format === "csv") {
      XLSX.writeFile(workbook, `zan_cafe_sales_report_${range}.csv`);
    } else {
      XLSX.writeFile(workbook, `zan_cafe_sales_report_${range}.xlsx`);
    }
  };

  const summary = data?.summary || {
    totalRevenue: 0,
    totalOrdersCount: 0,
    averageOrderValue: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Financial & Performance Intelligence
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Aggregated from verified table and online orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="px-3 py-2 rounded-xl bg-espresso-900 border border-gold/30 text-gold hover:bg-espresso-800 transition-colors text-xs font-semibold flex items-center gap-1.5"
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

      {/* Date Range Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
        {[
          { key: "today", label: "Today" },
          { key: "7days", label: "Last 7 Days" },
          { key: "30days", label: "Last 30 Days" },
          { key: "year", label: "This Year" },
          { key: "all", label: "All Time" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRange(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              range === tab.key
                ? "bg-gold text-espresso-950 font-bold shadow-gold-glow"
                : "bg-espresso-900 text-ivory/70 hover:text-white border border-gold/15"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Total Revenue
          </span>
          <div className="font-serif text-3xl font-bold text-gold">
            ₹{summary.totalRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            Verified payments received
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Total Orders Settled
          </span>
          <div className="font-serif text-3xl font-bold text-white">
            {summary.totalOrdersCount}
          </div>
          <span className="text-[11px] text-ivory/50 mt-1 block">Orders in selected period</span>
        </div>

        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Average Ticket Size
          </span>
          <div className="font-serif text-3xl font-bold text-white">
            ₹{summary.averageOrderValue}
          </div>
          <span className="text-[11px] text-ivory/50 mt-1 block">Avg spend per guest table</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
          <h3 className="font-serif text-base font-bold text-white mb-1">Revenue Timeline</h3>
          <p className="text-xs text-ivory/60 mb-6">Daily sales progression (₹)</p>

          <div className="h-64 w-full">
            {data?.revenueTimeline?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTimeline}>
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
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ivory/50">
                No orders in this period.
              </div>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
          <h3 className="font-serif text-base font-bold text-white mb-1">Category Sales Revenue</h3>
          <p className="text-xs text-ivory/60 mb-6">Sales breakdown by food category</p>

          <div className="h-64 w-full">
            {data?.categoryPerformance?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d251f" />
                  <XAxis dataKey="category" stroke="#B8A589" fontSize={10} />
                  <YAxis stroke="#B8A589" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171310",
                      borderColor: "#C6A36A",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#C6A36A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ivory/50">
                No category sales in this period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Best Sellers Table */}
      <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
        <h3 className="font-serif text-base font-bold text-white mb-1">
          Bestselling Dishes Leaderboard
        </h3>
        <p className="text-xs text-ivory/60 mb-4">Ranked by volume ordered</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-ivory/60 uppercase text-[10px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Item Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Quantity Sold</th>
                <th className="py-3 px-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.bestSellers?.map((dish: any, idx: number) => (
                <tr key={dish.name} className="hover:bg-espresso-800/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-gold">#{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-white">{dish.name}</td>
                  <td className="py-3 px-3 text-ivory/70">{dish.category}</td>
                  <td className="py-3 px-3 font-semibold text-white">{dish.quantity} units</td>
                  <td className="py-3 px-3 text-right font-serif font-bold text-gold">
                    ₹{dish.revenue.toLocaleString("en-IN")}
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

