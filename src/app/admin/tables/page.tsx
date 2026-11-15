"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  QrCode,
  Plus,
  Printer,
  ExternalLink,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Table modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [locationDesc, setLocationDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Print Stand modal
  const [selectedTableForPrint, setSelectedTableForPrint] = useState<any>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/tables");
      const data = await res.json();
      if (data.success) setTables(data.tables);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          displayName,
          capacity: parseInt(capacity),
          locationDesc,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setTableNumber("");
        setDisplayName("");
        setLocationDesc("");
        fetchTables();
      } else {
        alert(data.error || "Failed to create table");
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintStand = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Physical Table Infrastructure
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Table & QR Code Management
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Table-specific QR codes for contactless dining & ordering in Melapalayam
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-gold-glow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Restaurant Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 hover:border-gold/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">{t.tableNumber}</h3>
                  <span className="text-xs text-gold font-medium">{t.displayName}</span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    t.status === "OCCUPIED"
                      ? "bg-amber-950 border-amber-500 text-amber-400"
                      : "bg-emerald-950 border-emerald-500 text-emerald-400"
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* QR Code Preview */}
              <div className="p-4 rounded-xl bg-white flex flex-col items-center justify-center mb-4">
                <img
                  src={t.qrCodeDataUrl}
                  alt={`QR for ${t.tableNumber}`}
                  className="w-36 h-36 object-contain"
                />
                <span className="text-[10px] text-espresso-950 font-mono font-bold mt-1">
                  Scan to Order at {t.tableNumber}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-ivory/70">
                <div className="flex items-center justify-between">
                  <span>Capacity:</span>
                  <span className="font-bold text-white">{t.capacity} Guests</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <span className="text-ivory/90 truncate max-w-[150px]">
                    {t.locationDesc || "Indoor Lounge"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Tickets:</span>
                  <span className="text-gold font-bold">{t.activeOrdersCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-white/5 flex gap-2">
              <button
                onClick={() => setSelectedTableForPrint(t)}
                className="flex-1 py-2 px-3 rounded-xl bg-espresso-800 hover:bg-gold hover:text-espresso-950 border border-gold/30 text-gold text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Stand QR</span>
              </button>

              <a
                href={t.orderUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-espresso-800 hover:bg-espresso-700 text-ivory border border-white/10"
                title="Test Table Digital Menu"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-espresso-900 border border-gold/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif text-lg font-bold text-white">Add Restaurant Table</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ivory/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4 text-xs">
              <div>
                <label className="block text-ivory/80 font-medium mb-1">Table Code *</label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-13 or VIP-02"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Table 13 (Garden Patio)"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ivory/80 font-medium mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-ivory/80 font-medium mb-1">Area / Location</label>
                  <input
                    type="text"
                    value={locationDesc}
                    onChange={(e) => setLocationDesc(e.target.value)}
                    placeholder="e.g. First Floor Balcony"
                    className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-espresso-800 text-ivory/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gold text-espresso-950 font-bold font-serif hover:brightness-110"
                >
                  {saving ? "Generating QR..." : "Create Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Stand Card Modal */}
      {selectedTableForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-espresso-900 border border-gold/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-serif text-sm font-bold text-white">Print Table QR Stand</span>
              <button
                onClick={() => setSelectedTableForPrint(null)}
                className="text-ivory/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Acrylic Stand Card Template */}
            <div className="p-6 rounded-2xl bg-white text-espresso-950 text-center shadow-2xl border-2 border-gold/40 space-y-3">
              <div className="font-serif text-2xl font-bold tracking-wider text-espresso-950">
                ZAN CAFE
              </div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                Artisanal Bistro • Melapalayam
              </p>

              <div className="my-3 p-3 bg-zinc-50 rounded-xl inline-block border border-zinc-200">
                <img
                  src={selectedTableForPrint.qrCodeDataUrl}
                  alt={`QR code for ${selectedTableForPrint.tableNumber}`}
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <div className="py-1 px-4 rounded-full bg-espresso-950 text-gold font-serif font-bold text-sm inline-block">
                TABLE {selectedTableForPrint.tableNumber}
              </div>

              <p className="text-[11px] text-zinc-700 font-semibold pt-1">
                Scan with Phone Camera to View Menu & Order
              </p>
              <p className="text-[9px] text-zinc-400">
                36B/A14 Naniyar Nagar, Melapalayam • 063693 13196
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePrintStand}
                className="w-full py-2.5 px-4 rounded-xl bg-gold text-espresso-950 font-bold font-serif text-xs hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Stand on Paper / Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

