"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { User, Phone, Mail, Sparkles, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function CustomerRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Welcome to Zan Cafe",
  subtitle = "Please enter your details to browse and order from your table.",
}: Props) {
  const { customer, setCustomer, tableNumber } = useCart();
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returningNotice, setReturningNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          tableNumber: tableNumber || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to register. Please try again.");
        setLoading(false);
        return;
      }

      setCustomer({
        name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.email,
      });

      if (data.isReturning) {
        setReturningNotice(`Welcome back to Zan Cafe, ${data.customer.name}!`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-espresso-900 border border-gold/40 rounded-2xl shadow-gold-glow-lg p-6 sm:p-8 overflow-hidden"
        >
          {/* Close button if user already has a session or wants to browse first */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-ivory/60 hover:text-white rounded-full hover:bg-espresso-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full border border-gold/40 bg-espresso-800 flex items-center justify-center mx-auto mb-3 shadow-gold-glow">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-serif text-2xl font-bold gold-gradient-text">{title}</h3>
            <p className="text-xs text-ivory/70 mt-1 max-w-xs mx-auto">{subtitle}</p>

            {tableNumber && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 border border-gold/30 text-xs text-gold font-medium">
                Dining at Table: <strong className="text-white">{tableNumber}</strong>
              </div>
            )}
          </div>

          {returningNotice ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-forest-800/80 border border-gold/40 text-center text-sm text-gold font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{returningNotice}</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/30 text-xs text-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Syed Ibrahim"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-sm text-white placeholder-ivory/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-sm text-white placeholder-ivory/30"
                  />
                </div>
                <p className="text-[10px] text-ivory/50 mt-1">
                  Used to connect past orders and loyalty benefits on repeat visits.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-ivory/40">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-sm text-white placeholder-ivory/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-gold-500 via-gold to-gold-600 text-espresso-950 hover:brightness-110 active:scale-[0.98] transition-all shadow-gold-glow font-serif disabled:opacity-50"
              >
                {loading ? "Registering..." : "Continue to Menu"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

