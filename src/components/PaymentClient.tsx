"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import QRCode from "qrcode";
import { motion } from "framer-motion";

export default function PaymentClient({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>("");
  const [paymentUtr, setPaymentUtr] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        let ordData: any = null;
        let settsData: any = null;

        try {
          const res = await fetch(`/api/orders/${orderNumber}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              ordData = data.order;
              settsData = data.settings;
            }
          }
        } catch {}

        // Fallback for static GitHub Pages
        if (!ordData) {
          try {
            const saved = localStorage.getItem(`zan_order_${orderNumber}`) || localStorage.getItem("zan_last_order");
            if (saved) {
              ordData = JSON.parse(saved);
            }
          } catch {}
        }

        if (!ordData) {
          ordData = {
            id: orderNumber,
            orderNumber: orderNumber || "ZAN-20261115-001",
            grandTotal: 580.0,
            table: { tableNumber: "T-01" },
            status: "NEW_ORDER",
            paymentStatus: "PENDING",
          };
        }

        if (!settsData) {
          settsData = {
            upiId: "zancafe@upi",
            restaurantName: "Zan Cafe",
          };
        }

        setOrder(ordData);
        setSettings(settsData);

        const upiId = settsData.upiId || "zancafe@upi";
        const merchant = encodeURIComponent(settsData.restaurantName || "Zan Cafe");
        const amount = (ordData.grandTotal || 580).toFixed(2);
        const note = encodeURIComponent(`Order ${ordData.orderNumber}`);

        const upiDeepLink = `upi://pay?pa=${upiId}&pn=${merchant}&am=${amount}&cu=INR&tn=${note}`;

        const qrDataUrl = await QRCode.toDataURL(upiDeepLink, {
          width: 320,
          margin: 2,
          color: {
            dark: "#171310",
            light: "#FFFFFF",
          },
        });
        setDynamicQrUrl(qrDataUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  const handleCopyUpi = () => {
    const upi = settings?.upiId || "zancafe@upi";
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitPaymentConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayment(true);
    try {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentUtr: paymentUtr.trim() || undefined,
            paymentNotes: paymentNotes.trim() || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPaymentSuccess(true);
            setTimeout(() => {
              router.push(`/track/${order.orderNumber}`);
            }, 1800);
            return;
          }
        }
      } catch {}

      // Local fallback for static site
      const updatedOrder = {
        ...order,
        paymentStatus: "VERIFICATION_PENDING",
        paymentUtr,
        paymentNotes,
      };
      try {
        localStorage.setItem(`zan_order_${order.orderNumber}`, JSON.stringify(updatedOrder));
        localStorage.setItem("zan_last_order", JSON.stringify(updatedOrder));
      } catch {}

      setPaymentSuccess(true);
      setTimeout(() => {
        router.push(`/track/${order.orderNumber}`);
      }, 1800);
    } catch {
      setError("Network error while submitting confirmation.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-espresso text-ivory flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-gold font-medium">Generating UPI Payment QR...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-espresso text-ivory flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md p-8 rounded-2xl bg-espresso-900 border border-gold/30">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="font-serif text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-xs text-ivory/70 mb-4">{error || "Could not retrieve order."}</p>
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-xl bg-gold text-espresso-950 font-serif font-bold text-xs"
            >
              Back to Food Menu
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 max-w-2xl py-10 flex-1">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold block mb-1">
            Zan Cafe Direct UPI Checkout
          </span>
          <h1 className="font-serif text-3xl font-bold text-white">Scan & Pay via UPI</h1>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 border border-gold/30 text-xs text-gold">
            <span>Order #{order.orderNumber}</span>
            <span>•</span>
            <span>Table {order.table?.tableNumber || "T-01"}</span>
          </div>
        </div>

        {paymentSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-forest-800/90 border border-gold/40 text-center shadow-gold-glow-lg space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">Payment Proof Submitted!</h3>
            <p className="text-xs text-ivory/80 max-w-md mx-auto leading-relaxed">
              Your payment verification request has reached the Zan Cafe cashier and kitchen.
              Redirecting you to live order tracking...
            </p>
            <div className="pt-2">
              <Link
                href={`/track/${order.orderNumber}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-espresso-950 font-bold text-xs font-serif"
              >
                <span>Track Order Live</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow text-center">
              <span className="text-xs text-ivory/60 uppercase tracking-wider block mb-1">
                Total Payable Amount
              </span>
              <div className="font-serif text-4xl sm:text-5xl font-bold text-gold mb-6">
                ₹{order.grandTotal.toFixed(2)}
              </div>

              <div className="relative inline-block p-4 rounded-2xl bg-white shadow-xl mx-auto mb-6">
                {dynamicQrUrl ? (
                  <img
                    src={dynamicQrUrl}
                    alt="Zan Cafe UPI QR Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-zinc-400">
                    <QrCode className="w-12 h-12" />
                  </div>
                )}
                <div className="mt-2 text-[11px] font-bold text-espresso-950 uppercase tracking-wider">
                  Scan with GPay / PhonePe / Paytm / BHIM
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto p-2 rounded-xl bg-espresso-800 border border-gold/20 text-xs">
                <span className="text-ivory/70 font-mono">{settings?.upiId || "zancafe@upi"}</span>
                <button
                  onClick={handleCopyUpi}
                  className="p-1 text-gold hover:text-gold-300 transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmitPaymentConfirmation}
              className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                <FileCheck className="w-4 h-4" />
                <span>Confirm Your Payment</span>
              </div>
              <p className="text-xs text-ivory/70 leading-relaxed font-light">
                After paying ₹{order.grandTotal} in your UPI app, enter your 12-digit UPI Reference / UTR
                number below and click <strong>"I Have Paid"</strong>.
              </p>

              <div>
                <label className="block text-xs font-medium text-ivory/80 mb-1">
                  UPI UTR / Transaction Reference ID (Optional)
                </label>
                <input
                  type="text"
                  value={paymentUtr}
                  onChange={(e) => setPaymentUtr(e.target.value)}
                  placeholder="e.g. 432190871234 or GPay Ref #"
                  className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ivory/80 mb-1">
                  Payment Note (e.g. Paid from HDFC / Google Pay)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via PhonePe"
                  className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/30"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPayment}
                className="w-full py-3.5 px-4 rounded-xl font-serif text-sm font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingPayment ? (
                  <span>Recording Confirmation...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Paid ₹{order.grandTotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-ivory/50 pt-2 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>
                  Our cashier confirms your payment immediately on their terminal to begin kitchen preparation.
                </span>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

