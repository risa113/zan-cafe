"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Receipt,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/billing?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
        setMetrics(data.metrics || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [search]);

  // Handle thermal print
  const handlePrint = async (inv: any) => {
    try {
      await fetch("/api/admin/billing/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: inv.id }),
      });
      // Trigger browser window print
      window.print();
      fetchBilling();
    } catch {}
  };

  // Generate & Download PDF with jsPDF & autoTable
  const handleDownloadPdf = (inv: any) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200], // 80mm standard restaurant thermal roll width
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ZAN CAFE", 40, 10, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("36B/A14 ROAD, Naniyar Nagar", 40, 15, { align: "center" });
    doc.text("Melapalayam, Tirunelveli - 627005", 40, 19, { align: "center" });
    doc.text("Phone: 063693 13196 | GST: 5%", 40, 23, { align: "center" });

    doc.setLineWidth(0.3);
    doc.line(5, 26, 75, 26);

    doc.setFontSize(8);
    doc.text(`Invoice: ${inv.invoiceNumber}`, 5, 30);
    doc.text(`Table: ${inv.tableNumber}`, 75, 30, { align: "right" });
    doc.text(`Date: ${new Date(inv.createdAt).toLocaleString("en-IN")}`, 5, 34);
    doc.text(`Customer: ${inv.customerName}`, 5, 38);
    doc.text(`Mobile: ${inv.customerPhone}`, 75, 38, { align: "right" });

    doc.line(5, 41, 75, 41);

    const itemsData = (inv.order?.items || []).map((it: any) => [
      it.foodName,
      String(it.quantity),
      `₹${it.price}`,
      `₹${it.total}`,
    ]);

    autoTable(doc, {
      startY: 43,
      margin: { left: 5, right: 5 },
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [30, 25, 20], textColor: [255, 255, 255] },
      head: [["Item", "Qty", "Rate", "Total"]],
      body: itemsData,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 4;

    doc.setFontSize(8);
    doc.text(`Subtotal:`, 45, finalY);
    doc.text(`₹${inv.subtotal.toFixed(2)}`, 75, finalY, { align: "right" });

    doc.text(`CGST + SGST (5%):`, 45, finalY + 4);
    doc.text(`₹${inv.taxAmount.toFixed(2)}`, 75, finalY + 4, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Grand Total:`, 45, finalY + 9);
    doc.text(`₹${inv.grandTotal.toFixed(2)}`, 75, finalY + 9, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Payment: UPI / Paid Verified", 40, finalY + 16, { align: "center" });
    doc.text("Thank you for dining at Zan Cafe Melapalayam!", 40, finalY + 20, { align: "center" });

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Point of Sale & Invoicing
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Restaurant Billing Software
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Auto-generated invoices synchronized with confirmed orders
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Today's Invoiced Revenue
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-gold">
            ₹{(metrics.todayRevenue || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-ivory/50 mt-1 block">
            {metrics.todayInvoicesCount || 0} invoices generated today
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            Total Lifetime Invoiced
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-white">
            ₹{(metrics.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-ivory/50 mt-1 block">
            {metrics.totalInvoicesCount || 0} total invoices in records
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-espresso-900 border border-gold/25 shadow-gold-glow">
          <span className="text-xs text-ivory/70 uppercase tracking-wider block mb-1">
            GST Collected (5%)
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400">
            ₹{(metrics.totalTaxCollected || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">
            Audit compliant tax tracking
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Invoice #, Guest Name, Mobile, Table..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-900 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/40"
        />
      </div>

      {/* Invoices Table */}
      <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-ivory/60 uppercase text-[10px]">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Table</th>
                <th className="py-3 px-3">Subtotal</th>
                <th className="py-3 px-3">GST (5%)</th>
                <th className="py-3 px-3">Grand Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-espresso-800/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-gold">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-ivory/70">
                    {new Date(inv.createdAt).toLocaleString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{inv.customerName}</span>
                    <span className="text-[10px] text-ivory/50">{inv.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white">Table {inv.tableNumber}</td>
                  <td className="py-3 px-3 text-ivory/70">₹{inv.subtotal}</td>
                  <td className="py-3 px-3 text-ivory/70">₹{inv.taxAmount}</td>
                  <td className="py-3 px-3 font-serif font-bold text-gold text-sm">
                    ₹{inv.grandTotal}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500 text-emerald-400">
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 rounded-lg bg-espresso-800 hover:bg-gold hover:text-espresso-950 border border-gold/30 text-gold text-[11px] font-semibold transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(inv)}
                      className="p-1 rounded-lg bg-espresso-800 hover:bg-espresso-700 text-ivory hover:text-gold border border-white/10"
                      title="Print Invoice"
                    >
                      <Printer className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(inv)}
                      className="p-1 rounded-lg bg-espresso-800 hover:bg-espresso-700 text-ivory hover:text-gold border border-white/10"
                      title="Download PDF Invoice"
                    >
                      <Download className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details & Printable Thermal Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-espresso-900 border border-gold/40 rounded-2xl shadow-gold-glow-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-serif text-lg font-bold text-white">Invoice Details</span>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-ivory/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Receipt Preview */}
            <div
              ref={printAreaRef}
              className="p-5 rounded-xl bg-espresso-950 border border-gold/30 text-xs font-mono space-y-3"
            >
              <div className="text-center pb-2 border-b border-white/10">
                <h3 className="font-serif text-lg font-bold text-gold tracking-wide">ZAN CAFE</h3>
                <p className="text-[10px] text-ivory/70">36B/A14, Naniyar Nagar, Melapalayam</p>
                <p className="text-[10px] text-ivory/70">Phone: 063693 13196 | GST: 5%</p>
              </div>

              <div className="flex justify-between text-[11px] text-ivory/80">
                <span>Inv: {selectedInvoice.invoiceNumber}</span>
                <span>Table: {selectedInvoice.tableNumber}</span>
              </div>
              <div className="text-[10px] text-ivory/60">
                Guest: {selectedInvoice.customerName} ({selectedInvoice.customerPhone})
              </div>

              {/* Items Table */}
              <div className="pt-2 border-t border-dashed border-white/20 space-y-1">
                {selectedInvoice.order?.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">
                      {it.foodName} ×{it.quantity}
                    </span>
                    <span className="text-gold font-bold">₹{it.total}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-dashed border-white/20 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span>₹{selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/10">
                  <span>Grand Total:</span>
                  <span className="text-gold">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-ivory/50 border-t border-white/10">
                Payment Method: {selectedInvoice.paymentMethod} (PAID)
                <br />
                Thank you for visiting Zan Cafe!
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleDownloadPdf(selectedInvoice)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-espresso-800 hover:bg-espresso-700 border border-gold/30 text-gold text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF</span>
              </button>
              <button
                onClick={() => handlePrint(selectedInvoice)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 text-xs font-bold font-serif hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

