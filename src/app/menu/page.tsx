"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCartBar from "@/components/FloatingCartBar";
import AddToCartButton from "@/components/AddToCartButton";
import CustomerRegistrationModal from "@/components/CustomerRegistrationModal";
import { useCart } from "@/lib/cart-context";
import { FoodCategoryData, FoodItemData } from "@/lib/types";
import { INITIAL_CATEGORIES, INITIAL_FOOD_ITEMS } from "@/lib/initial-data";
import {
  Search,
  MapPin,
  Sparkles,
  Filter,
  Flame,
  CheckCircle2,
  Info,
  Clock,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function MenuContent() {
  const searchParams = useSearchParams();
  const urlTable = searchParams.get("table");
  const urlCategory = searchParams.get("category");

  const { tableNumber, setTableNumber, customer, isRegistered } = useCart();

  const [categories, setCategories] = useState<FoodCategoryData[]>([]);
  const [allItems, setAllItems] = useState<FoodItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
  const [loading, setLoading] = useState(true);

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<FoodItemData | null>(null);

  // If table parameter exists in URL, lock it into CartContext
  useEffect(() => {
    if (urlTable) {
      setTableNumber(urlTable.toUpperCase());
    }
  }, [urlTable, setTableNumber]);

  // If visiting via table QR and not yet registered, prompt registration
  useEffect(() => {
    if (urlTable && !isRegistered) {
      const timer = setTimeout(() => {
        setIsRegModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [urlTable, isRegistered]);

  // Sync category if URL param changes
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  // Fetch Menu from API with graceful static fallback
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.categories?.length > 0) {
            setCategories(data.categories);
            setAllItems(data.allItems);
            return;
          }
        }
        throw new Error("API not available");
      } catch {
        // Fallback to pre-seeded static data for GitHub Pages!
        setCategories(INITIAL_CATEGORIES);
        setAllItems(INITIAL_FOOD_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== "all") {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat && item.categoryId !== cat.id) return false;
      }
      // Dietary filter
      if (dietaryFilter === "VEG" && !item.isVeg) return false;
      if (dietaryFilter === "NON_VEG" && item.isVeg) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [allItems, categories, selectedCategory, dietaryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      {/* Customer Registration Modal */}
      <CustomerRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Welcome to Zan Cafe"
        subtitle={
          tableNumber
            ? `You are seated at Table ${tableNumber}. Register once to order seamlessly.`
            : "Register your details to place orders and track food preparation."
        }
      />

      {/* Hero Header */}
      <div className="bg-espresso-950 border-b border-gold/15 py-8 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                  Zan Cafe Digital Menu
                </span>
                {tableNumber && (
                  <span className="px-2.5 py-0.5 rounded-full bg-forest-800 border border-gold/40 text-[11px] text-white font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold" />
                    Locked to Table: <strong>{tableNumber}</strong>
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Artisanal Food & Handcrafted Brews
              </h1>
              <p className="text-xs sm:text-sm text-ivory/70 mt-1 max-w-xl">
                Fresh gourmet burgers, wood-fired pizzas, Melapalayam chicken sizzles, and specialty coffees.
              </p>
            </div>

            {/* Customer greeting or Register Prompt */}
            <div className="flex items-center gap-3">
              {customer ? (
                <div className="p-3 rounded-xl bg-espresso-900 border border-gold/30 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{customer.name}</div>
                    <div className="text-[10px] text-ivory/60">{customer.phone}</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsRegModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-espresso-800 border border-gold/40 text-gold text-xs font-medium hover:bg-espresso-700 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register Details</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Bar & Veg/Non-Veg Filter Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by name or ingredient (e.g., burger, waffle, peri-peri)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-espresso-900 border border-gold/25 focus:border-gold focus:outline-none text-xs sm:text-sm text-white placeholder-ivory/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ivory/40 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dietary Filter Pills */}
            <div className="flex items-center gap-2 bg-espresso-900 p-1 rounded-xl border border-gold/20">
              <button
                onClick={() => setDietaryFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dietaryFilter === "ALL"
                    ? "bg-gold text-espresso-950 shadow-sm"
                    : "text-ivory/60 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietaryFilter("VEG")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  dietaryFilter === "VEG"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Veg
              </button>
              <button
                onClick={() => setDietaryFilter("NON_VEG")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  dietaryFilter === "NON_VEG"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-red-400 hover:text-red-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Non-Veg
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="sticky top-20 z-30 bg-espresso-900/95 backdrop-blur-md border-b border-gold/20 py-3 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                selectedCategory === "all"
                  ? "bg-gold text-espresso-950 font-bold border-gold shadow-gold-glow"
                  : "bg-espresso-800 text-ivory/80 border-gold/20 hover:border-gold/40 hover:text-white"
              }`}
            >
              All Categories ({allItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                  selectedCategory === cat.slug
                    ? "bg-gold text-espresso-950 font-bold border-gold shadow-gold-glow"
                    : "bg-espresso-800 text-ivory/80 border-gold/20 hover:border-gold/40 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="container mx-auto px-4 max-w-6xl py-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-espresso-900 border border-gold/15 animate-pulse p-4"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-espresso-800 border border-gold/30 flex items-center justify-center mx-auto mb-4 text-gold">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">No food items found</h3>
            <p className="text-xs text-ivory/60 mt-1 max-w-sm mx-auto">
              We couldn't find items matching your search or dietary filter. Try clearing the search.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setDietaryFilter("ALL");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-gold text-espresso-950 text-xs font-bold font-serif hover:brightness-110"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className="rounded-2xl bg-espresso-900 border border-gold/20 hover:border-gold/40 transition-all duration-300 p-4 flex flex-col justify-between group hover:shadow-gold-glow"
              >
                <div>
                  {/* Food Image with Badges */}
                  <div
                    onClick={() => setSelectedItemForDetail(item)}
                    className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-espresso-800 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Veg/Non-Veg & Spice badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.isVeg
                            ? "bg-emerald-950/90 border-emerald-500 text-emerald-400"
                            : "bg-red-950/90 border-red-500 text-red-400"
                        }`}
                      >
                        {item.isVeg ? "VEG" : "NON-VEG"}
                      </span>
                      {item.spicyLevel > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500 text-amber-400 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {"🌶️".repeat(item.spicyLevel)}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-espresso-950/90 text-ivory/80 text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>{item.preparationTimeMinutes}m</span>
                    </div>

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-espresso-950/80 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-red-900/90 border border-red-500 text-xs font-bold text-white uppercase tracking-wider">
                          Currently Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => setSelectedItemForDetail(item)}
                    className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors cursor-pointer mb-1.5"
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-ivory/70 line-clamp-2 font-light leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gold">
                        ₹{item.discountedPrice || item.price}
                      </span>
                      {item.discountedPrice && (
                        <span className="text-xs text-ivory/40 line-through">₹{item.price}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-ivory/40">incl. GST</span>
                  </div>

                  <AddToCartButton item={item} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Food Detail Modal */}
      <AnimatePresence>
        {selectedItemForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-espresso-900 border border-gold/40 rounded-2xl shadow-gold-glow-lg overflow-hidden"
            >
              <div className="relative h-60 w-full bg-espresso-800">
                <img
                  src={selectedItemForDetail.image}
                  alt={selectedItemForDetail.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedItemForDetail(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-espresso-950/80 text-white hover:bg-gold hover:text-espresso-950 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedItemForDetail.isVeg
                        ? "bg-emerald-950/90 border-emerald-500 text-emerald-400"
                        : "bg-red-950/90 border-red-500 text-red-400"
                    }`}
                  >
                    {selectedItemForDetail.isVeg ? "100% VEGETARIAN" : "NON-VEGETARIAN"}
                  </span>
                  <span className="text-xs text-gold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedItemForDetail.preparationTimeMinutes} mins prep
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-bold text-white mb-2">
                  {selectedItemForDetail.name}
                </h2>
                <p className="text-sm text-ivory/80 leading-relaxed mb-6 font-light">
                  {selectedItemForDetail.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                  <div>
                    <span className="text-2xl font-bold text-gold font-serif">
                      ₹{selectedItemForDetail.discountedPrice || selectedItemForDetail.price}
                    </span>
                    {selectedItemForDetail.discountedPrice && (
                      <span className="text-sm text-ivory/40 line-through ml-2">
                        ₹{selectedItemForDetail.price}
                      </span>
                    )}
                  </div>

                  <AddToCartButton item={selectedItemForDetail} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <FloatingCartBar />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-espresso text-ivory flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-gold">Loading Zan Cafe Digital Menu...</p>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}


