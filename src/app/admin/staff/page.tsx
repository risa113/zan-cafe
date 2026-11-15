"use client";

import React, { useEffect, useState } from "react";
import {
  UserCog,
  Plus,
  ShieldCheck,
  ChefHat,
  Receipt,
  UserCheck,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STAFF");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success) setStaff(data.staff);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        fetchStaff();
      } else {
        setError(data.error || "Failed to create staff");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member: any) => {
    try {
      await fetch("/api/admin/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, isActive: !member.isActive }),
      });
      fetchStaff();
    } catch {}
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "OWNER":
        return "bg-gold/20 text-gold border-gold/40";
      case "ADMIN":
        return "bg-purple-950 text-purple-400 border-purple-500";
      case "KITCHEN_STAFF":
        return "bg-emerald-950 text-emerald-400 border-emerald-500";
      case "BILLING_STAFF":
        return "bg-blue-950 text-blue-400 border-blue-500";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Role-Based Access Control (RBAC)
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Staff & Role Management
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Manage owner, kitchen chefs, cashiers & floor managers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-gold-glow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {staff.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl bg-espresso-900 border border-gold/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(
                    m.role
                  )}`}
                >
                  {m.role.replace("_", " ")}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    m.isActive ? "bg-emerald-400" : "bg-red-400"
                  }`}
                  title={m.isActive ? "Active" : "Disabled"}
                />
              </div>

              <h3 className="font-serif text-base font-bold text-white">{m.name}</h3>
              <p className="text-xs text-gold mt-0.5 truncate">{m.email}</p>
              {m.phone && <p className="text-[11px] text-ivory/60 mt-0.5">{m.phone}</p>}
            </div>

            <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-ivory/40">
                Created: {new Date(m.createdAt).toLocaleDateString("en-IN")}
              </span>
              <button
                onClick={() => handleToggleActive(m)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                  m.isActive
                    ? "bg-red-950/60 border-red-500/40 text-red-300 hover:bg-red-900"
                    : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900"
                }`}
              >
                {m.isActive ? "Disable Access" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-espresso-900 border border-gold/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif text-lg font-bold text-white">Create Staff Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ivory/60 hover:text-white">
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950 border border-red-500/40 text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-ivory/80 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fareed Kitchen Chef"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@zancafe.in"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                >
                  <option value="ADMIN">ADMIN (Floor Manager)</option>
                  <option value="KITCHEN_STAFF">KITCHEN_STAFF (Kitchen & KDS)</option>
                  <option value="BILLING_STAFF">BILLING_STAFF (Cashier & Invoicing)</option>
                  <option value="OWNER">OWNER (Full Permissions)</option>
                </select>
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
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
                  {saving ? "Creating..." : "Save Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

