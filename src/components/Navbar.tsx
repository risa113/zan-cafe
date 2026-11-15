"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  MapPin,
  UtensilsCrossed,
  Clock,
  Sparkles,
  Search,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount, grandTotal, tableNumber, customer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Food Menu", href: tableNumber ? `/menu?table=${tableNumber}` : "/menu" },
    { label: "About Us", href: "/about" },
    { label: "Track Order", href: "/orders" },
    { label: "Location", href: "/location" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Top micro announcement bar */}
      <div className="bg-espresso-950 border-b border-gold/15 py-1.5 px-4 text-xs font-sans text-ivory/80 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gold font-medium">Zan Cafe • Melapalayam</span>
            <span className="hidden sm:inline text-ivory/60">| Artisanal Kitchen & Brews</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:inline-flex items-center gap-1 text-ivory/70">
              <Clock className="w-3.5 h-3.5 text-gold" />
              11:30 AM - 11:30 PM
            </span>
            <span className="flex items-center gap-1 text-gold font-medium">
              ★ 4.7 <span className="text-ivory/60 font-normal">(28 Google Reviews)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-espresso-900/95 backdrop-blur-md border-b border-gold/20 shadow-espresso-deep">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full border border-gold/40 bg-gradient-to-br from-espresso-700 to-espresso-950 flex items-center justify-center shadow-gold-glow group-hover:border-gold transition-all duration-300">
              <UtensilsCrossed className="w-6 h-6 text-gold group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-wider gold-gradient-text uppercase">
                  Zan Cafe
                </span>
                <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              </div>
              <p className="text-[10px] tracking-widest text-ivory/60 uppercase">
                Melapalayam, Tirunelveli
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href.startsWith("/menu") && pathname === "/menu");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm tracking-wide font-medium transition-colors relative py-1 ${
                    isActive ? "text-gold font-semibold" : "text-ivory/80 hover:text-gold"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Table Indicator, Cart & Action */}
          <div className="flex items-center gap-3">
            {/* Table Badge if customer scanned QR */}
            {tableNumber && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800/90 border border-gold/30 text-xs text-gold font-medium shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>Table: <strong className="text-white">{tableNumber}</strong></span>
              </div>
            )}

            {/* Customer greeting if registered */}
            {customer && (
              <div className="hidden xl:flex items-center gap-1 text-xs text-ivory/70">
                <UserCheck className="w-3.5 h-3.5 text-gold" />
                <span>Hi, {customer.name.split(" ")[0]}</span>
              </div>
            )}

            {/* Cart Button */}
            <Link
              href="/checkout"
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-espresso-700 hover:bg-espresso-600 border border-gold/30 hover:border-gold transition-all duration-200 group"
              title="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                {totalItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-copper text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-espresso-900 shadow-sm"
                  >
                    {totalItemsCount}
                  </motion.span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-ivory">
                {totalItemsCount > 0 ? `₹${grandTotal}` : "Cart"}
              </span>
            </Link>

            {/* Staff / Admin Login button */}
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex text-xs px-3 py-2 rounded-lg border border-gold/20 text-ivory/60 hover:text-gold hover:border-gold/40 transition-colors"
            >
              Staff Portal
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ivory hover:text-gold focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-espresso-950 border-b border-gold/20 px-6 py-6 overflow-hidden"
            >
              {tableNumber && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800 border border-gold/40 text-xs text-gold">
                  <MapPin className="w-4 h-4 text-gold" />
                  Assigned Table: <strong className="text-white">{tableNumber}</strong>
                </div>
              )}
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-ivory hover:text-gold transition-colors py-1 border-b border-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 flex items-center justify-between">
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-ivory/60 hover:text-gold underline"
                  >
                    Staff & Admin Sign In
                  </Link>
                  <span className="text-xs text-gold">Call: 063693 13196</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

