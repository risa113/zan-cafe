"use client";

import React, { useEffect, useState } from "react";
import { Globe, Save, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminCmsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const fetchCms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms");
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCms();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessKey(key);
        setTimeout(() => setSuccessKey(null), 2500);
      }
    } catch {
      alert("Failed to update CMS record");
    } finally {
      setSavingKey(null);
    }
  };

  const handleInputChange = (key: string, newValue: string) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, value: newValue } : i))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-gold">
          Content Management System
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          Website Content Management
        </h1>
        <p className="text-xs text-ivory/60 mt-0.5">
          Edit headlines, about story, promotional banners & restaurant hours with instant live updates
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-espresso-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {items.map((item) => (
            <div
              key={item.key}
              className="p-5 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 mr-2">
                    {item.section}
                  </span>
                  <span className="font-serif text-sm font-bold text-white">{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {successKey === item.key && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Updated Live!
                    </span>
                  )}
                  <button
                    onClick={() => handleUpdate(item.key, item.value)}
                    disabled={savingKey === item.key}
                    className="px-3.5 py-1.5 rounded-xl bg-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingKey === item.key ? "Saving..." : "Save Change"}</span>
                  </button>
                </div>
              </div>

              {item.value.length > 80 ? (
                <textarea
                  rows={3}
                  value={item.value}
                  onChange={(e) => handleInputChange(item.key, e.target.value)}
                  className="w-full p-3 rounded-xl bg-espresso-800 border border-gold/20 focus:border-gold focus:outline-none text-xs sm:text-sm text-white placeholder-ivory/30 leading-relaxed font-sans"
                />
              ) : (
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleInputChange(item.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 focus:border-gold focus:outline-none text-xs sm:text-sm text-white font-sans"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

