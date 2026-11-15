"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Flame,
  Sparkles,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [image, setImage] = useState("");
  const [isVeg, setIsVeg] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState("0");
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState("15");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const [itemRes, catRes] = await Promise.all([
        fetch("/api/admin/menu"),
        fetch("/api/admin/categories"),
      ]);
      const iData = await itemRes.json();
      const cData = await catRes.json();

      if (iData.success) setItems(iData.items);
      if (cData.success) setCategories(cData.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setPrice("");
    setDiscountedPrice("");
    setImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80");
    setIsVeg(false);
    setIsAvailable(true);
    setIsFeatured(false);
    setSpicyLevel("0");
    setPreparationTimeMinutes("15");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setDescription(item.description);
    setPrice(String(item.price));
    setDiscountedPrice(item.discountedPrice ? String(item.discountedPrice) : "");
    setImage(item.image);
    setIsVeg(item.isVeg);
    setIsAvailable(item.isAvailable);
    setIsFeatured(item.isFeatured);
    setSpicyLevel(String(item.spicyLevel));
    setPreparationTimeMinutes(String(item.preparationTimeMinutes));
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (item: any) => {
    try {
      await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isAvailable: !item.isAvailable,
        }),
      });
      fetchMenu();
    } catch {}
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    try {
      await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" });
      fetchMenu();
    } catch {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      id: editingItem?.id,
      name,
      categoryId,
      description,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      image,
      isVeg,
      isAvailable,
      isFeatured,
      spicyLevel: parseInt(spicyLevel),
      preparationTimeMinutes: parseInt(preparationTimeMinutes),
    };

    try {
      const res = await fetch("/api/admin/menu", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchMenu();
      } else {
        setError(data.error || "Failed to save menu item");
      }
    } catch {
      setError("Network error saving item");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((it) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      it.name.toLowerCase().includes(q) ||
      it.category?.name.toLowerCase().includes(q) ||
      it.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Gastronomy Catalog
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Food Menu Management
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Add or edit dishes • Price updates update the customer menu immediately
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search food by name, category, or description..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-900 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/40"
        />
      </div>

      {/* Menu Items Table */}
      <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-ivory/60 uppercase text-[10px]">
                <th className="py-3 px-3">Item Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Prep Time</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((it) => (
                <tr key={it.id} className="hover:bg-espresso-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-12 h-12 rounded-xl object-cover bg-espresso-800 border border-gold/20 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              it.isVeg ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <span className="font-serif font-bold text-white">{it.name}</span>
                          {it.isFeatured && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gold/20 text-gold font-bold">
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-ivory/50 line-clamp-1 max-w-xs mt-0.5">
                          {it.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-ivory/80 font-medium">
                    {it.category?.name || "General"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-serif font-bold text-gold text-sm">
                      ₹{it.discountedPrice || it.price}
                    </span>
                    {it.discountedPrice && (
                      <span className="text-[10px] text-ivory/40 line-through block">
                        ₹{it.price}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-ivory/70">{it.preparationTimeMinutes} mins</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleAvailability(it)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                        it.isAvailable
                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 hover:bg-emerald-900"
                          : "bg-red-950/80 border-red-500 text-red-400 hover:bg-red-900"
                      }`}
                    >
                      {it.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{it.isAvailable ? "In Stock" : "Sold Out"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(it)}
                      className="p-1.5 rounded-lg bg-espresso-800 hover:bg-espresso-700 text-ivory hover:text-gold border border-white/10"
                      title="Edit Dish"
                    >
                      <Edit2 className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(it.id, it.name)}
                      className="p-1.5 rounded-lg bg-espresso-800 hover:bg-red-900/60 text-ivory hover:text-red-400 border border-white/10"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-espresso-900 border border-gold/40 rounded-2xl shadow-gold-glow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingItem ? "Edit Menu Dish" : "Create New Menu Dish"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ivory/60 hover:text-white">
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950 border border-red-500/40 text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-ivory/80 font-medium mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zan Royale Truffle Burger"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Category *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ivory/80 font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-ivory/80 font-medium mb-1">Special Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    placeholder="Optional (e.g. 230)"
                    className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, seasonings, and culinary notes..."
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Food Image URL *</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ivory/80 font-medium mb-1">Spice Level</label>
                  <select
                    value={spicyLevel}
                    onChange={(e) => setSpicyLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                  >
                    <option value="0">0 - Non-Spicy / Mild</option>
                    <option value="1">1 - Gentle Spice 🌶️</option>
                    <option value="2">2 - Medium Melapalayam Heat 🌶️🌶️</option>
                    <option value="3">3 - Fiery Sizzle 🌶️🌶️🌶️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-ivory/80 font-medium mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={preparationTimeMinutes}
                    onChange={(e) => setPreparationTimeMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded bg-espresso-800 text-gold focus:ring-0"
                  />
                  <span>100% Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-espresso-800 text-gold focus:ring-0"
                  />
                  <span>Featured Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded bg-espresso-800 text-gold focus:ring-0"
                  />
                  <span>Available in Stock</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingItem ? "Update Dish" : "Create Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

