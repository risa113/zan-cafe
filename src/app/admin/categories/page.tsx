"use client";

import React, { useEffect, useState } from "react";
import { FolderTree, Plus, Edit2, Trash2, Check, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80");
    setDisplayOrder(String(categories.length + 1));
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setDisplayOrder(String(cat.displayOrder || 0));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: editingCategory?.id,
        name,
        description,
        image,
        displayOrder: parseInt(displayOrder),
      };

      const res = await fetch("/api/admin/categories", {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? This will also affect linked dishes.`)) return;
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      fetchCategories();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Menu Taxonomy
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Food Category Management
          </h1>
          <p className="text-xs text-ivory/60 mt-0.5">
            Organize customer-facing menu sections and order
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-gold-glow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-espresso-900 border border-gold/20 flex flex-col justify-between"
          >
            <div>
              {cat.image && (
                <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-espresso-800">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-base font-bold text-white">{cat.name}</h3>
                <span className="text-[10px] text-gold font-bold px-2 py-0.5 rounded-full bg-gold/15">
                  Order {cat.displayOrder}
                </span>
              </div>
              <p className="text-xs text-ivory/60 line-clamp-2 leading-relaxed mb-3">
                {cat.description || "No description provided."}
              </p>
              <div className="text-[11px] text-ivory/50">
                Dishes in category: <strong className="text-gold">{cat._count?.foodItems || 0}</strong>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-white/5 flex justify-end gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="p-1.5 rounded-lg bg-espresso-800 hover:bg-espresso-700 text-ivory hover:text-gold border border-white/10"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 rounded-lg bg-espresso-800 hover:bg-red-900/60 text-ivory hover:text-red-400 border border-white/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-espresso-900 border border-gold/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ivory/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-ivory/80 font-medium mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sizzling Grills & Platters"
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary shown on category cards..."
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-espresso-800 border border-gold/20 text-white"
                />
              </div>

              <div>
                <label className="block text-ivory/80 font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
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
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

