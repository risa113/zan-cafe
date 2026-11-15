"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Save,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Building,
  Phone,
  Percent,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    restaurantName: "Zan Cafe",
    tagline: "Gourmet Bistro, Handcrafted Brews & Melapalayam Sizzle",
    address: "36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005",
    phone: "063693 13196",
    email: "contact@zancafe.in",
    upiId: "zancafe@upi",
    upiQrImageUrl: "",
    taxPercentage: 5.0,
    openingHours: "Monday - Sunday: 11:30 AM - 11:30 PM",
    googleMapsEmbedUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          taxPercentage: parseFloat(String(settings.taxPercentage)),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-gold">
          System Configuration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          Payment & Restaurant Settings
        </h1>
        <p className="text-xs text-ivory/60 mt-0.5">
          Configure UPI QR receiver ID, tax rates, and core business metadata
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-forest-800/90 border border-gold/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings and UPI configuration successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* UPI QR Payment Configuration Section */}
        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <CreditCard className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg font-bold text-white">UPI QR Payment Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-ivory/80 font-semibold mb-1">
                  Restaurant UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  required
                  value={settings.upiId || ""}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="e.g. zancafe@upi or 6369313196@okaxis"
                  className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 text-white font-mono text-sm"
                />
                <p className="text-[10px] text-ivory/50 mt-1">
                  Customer payment will be addressed to this UPI VPA handle.
                </p>
              </div>

              <div>
                <label className="block text-ivory/80 font-semibold mb-1">
                  Custom Static UPI QR Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={settings.upiQrImageUrl || ""}
                  onChange={(e) => setSettings({ ...settings, upiQrImageUrl: e.target.value })}
                  placeholder="https://... or /images/sample-upi-qr.png"
                  className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 text-white text-xs"
                />
                <p className="text-[10px] text-ivory/50 mt-1">
                  If left blank, the system automatically renders an interactive, amount-embedded UPI QR
                  code!
                </p>
              </div>

              <div>
                <label className="block text-ivory/80 font-semibold mb-1">
                  Applicable GST / Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={settings.taxPercentage || 5.0}
                    onChange={(e) => setSettings({ ...settings, taxPercentage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 text-white text-sm"
                  />
                  <Percent className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
                </div>
              </div>
            </div>

            {/* UPI QR Visual Preview */}
            <div className="p-4 rounded-xl bg-espresso-800/80 border border-gold/20 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-gold tracking-wider mb-2">
                Live UPI Receiver Preview
              </span>
              <div className="p-3 bg-white rounded-xl shadow-md mb-2">
                <QrCode className="w-28 h-28 text-espresso-950" />
              </div>
              <span className="font-mono text-xs font-bold text-white">{settings.upiId}</span>
              <span className="text-[10px] text-ivory/60 mt-0.5">
                Exact order amount auto-embedded at checkout
              </span>
            </div>
          </div>
        </div>

        {/* Restaurant Identity & Location */}
        <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Building className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg font-bold text-white">Restaurant Metadata & Contacts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-ivory/80 font-semibold mb-1">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurantName || ""}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
              />
            </div>

            <div>
              <label className="block text-ivory/80 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.phone || ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-ivory/80 font-semibold mb-1">Physical Address</label>
              <input
                type="text"
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
              />
            </div>

            <div>
              <label className="block text-ivory/80 font-semibold mb-1">Operating Hours</label>
              <input
                type="text"
                value={settings.openingHours || ""}
                onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
              />
            </div>

            <div>
              <label className="block text-ivory/80 font-semibold mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Updating..." : "Save Settings & Payment Configuration"}</span>
        </button>
      </form>
    </div>
  );
}

