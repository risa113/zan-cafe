"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UtensilsCrossed,
  Sparkles,
  Lock,
  Mail,
  ShieldCheck,
  ChefHat,
  Receipt,
  UserCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { DEMO_STAFF_USERS } from "@/lib/initial-data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      // If server returned a valid JSON response
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Invalid email or password.");
          setLoading(false);
          return;
        }

        // Store staff session for client components
        localStorage.setItem("zan_staff_user", JSON.stringify(data.user));

        if (data.user.role === "KITCHEN_STAFF") {
          router.push("/admin/kitchen");
        } else if (data.user.role === "BILLING_STAFF") {
          router.push("/admin/billing");
        } else {
          router.push("/admin");
        }
        return;
      }
      throw new Error("No JSON response from backend");
    } catch {
      // Static Environment Fallback (GitHub Pages mode without active Node.js server)
      const matchedUser = DEMO_STAFF_USERS.find(
        (u) => u.email === cleanEmail && u.password === password
      );

      if (matchedUser) {
        const userObj = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
        };
        localStorage.setItem("zan_staff_user", JSON.stringify(userObj));
        // Cookie for middleware/client compatibility
        document.cookie = `zan_staff_token=demo_${matchedUser.role}; path=/; max-age=604800; SameSite=Lax`;

        if (matchedUser.role === "KITCHEN_STAFF") {
          router.push("/admin/kitchen");
        } else if (matchedUser.role === "BILLING_STAFF") {
          router.push("/admin/billing");
        } else {
          router.push("/admin");
        }
        return;
      }

      setError("Invalid email or password. Please use the demo credentials below.");
      setLoading(false);
    }
  };

  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-12 h-12 rounded-full border border-gold/40 bg-espresso-800 flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6 text-gold" />
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white">Zan Cafe Portal</h1>
          <p className="text-xs text-ivory/60 mt-1 uppercase tracking-widest">
            Staff & Management Terminal • Melapalayam
          </p>
        </div>

        {/* Login Box */}
        <div className="p-8 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow-lg">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-200 mb-5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@zancafe.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs sm:text-sm text-white placeholder-ivory/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs sm:text-sm text-white placeholder-ivory/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-serif text-sm font-bold bg-gradient-to-r from-gold-500 via-gold to-gold-600 text-espresso-950 hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Terminal"}
            </button>
          </form>

          {/* Quick Role Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold/80 block mb-3 text-center">
              Quick Role Test Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickFill("owner@zancafe.in", "owner123")}
                className="p-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-700 border border-gold/20 text-left transition-colors flex items-center gap-2 group"
              >
                <ShieldCheck className="w-4 h-4 text-gold shrink-0 group-hover:scale-110" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Owner</span>
                  <span className="text-[9px] text-ivory/50">Full Access</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill("admin@zancafe.in", "admin123")}
                className="p-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-700 border border-gold/20 text-left transition-colors flex items-center gap-2 group"
              >
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Manager</span>
                  <span className="text-[9px] text-ivory/50">Orders & Staff</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill("kitchen@zancafe.in", "kitchen123")}
                className="p-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-700 border border-gold/20 text-left transition-colors flex items-center gap-2 group"
              >
                <ChefHat className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Kitchen Chef</span>
                  <span className="text-[9px] text-ivory/50">KDS Display</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill("billing@zancafe.in", "billing123")}
                className="p-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-700 border border-gold/20 text-left transition-colors flex items-center gap-2 group"
              >
                <Receipt className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Billing Staff</span>
                  <span className="text-[9px] text-ivory/50">Invoices & UPI</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-ivory/60 hover:text-gold transition-colors inline-flex items-center gap-1"
          >
            <span>← Back to Customer Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

