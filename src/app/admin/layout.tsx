"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Receipt,
  BookOpen,
  FolderTree,
  Users,
  BarChart3,
  Globe,
  QrCode,
  CreditCard,
  Bell,
  UserCog,
  LogOut,
  Menu as MenuIcon,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { playOrderChime } from "@/lib/sound";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "KITCHEN_STAFF" | "BILLING_STAFF";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Check auth
  useEffect(() => {
    // If on login page, render children directly
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          router.push("/admin/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, router]);

  // Notifications polling & audio chime trigger
  useEffect(() => {
    if (pathname === "/admin/login") return;

    let previousCount = 0;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (data.success) {
          setUnreadNotifications(data.unreadCount);
          if (data.unreadCount > previousCount && previousCount !== 0 && soundEnabled) {
            playOrderChime();
          }
          previousCount = data.unreadCount;
        }
      } catch {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [pathname, soundEnabled]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-espresso text-ivory flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gold">Loading Zan Cafe Terminal...</p>
        </div>
      </div>
    );
  }

  // Navigation Links based on role
  const isOwner = user?.role === "OWNER";
  const isAdmin = user?.role === "ADMIN" || isOwner;
  const isKitchen = user?.role === "KITCHEN_STAFF" || isOwner || isAdmin;
  const isBilling = user?.role === "BILLING_STAFF" || isOwner || isAdmin;

  const navigationItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, show: isAdmin },
    { label: "Live Orders", href: "/admin/orders", icon: UtensilsCrossed, show: true },
    { label: "Kitchen Display (KDS)", href: "/admin/kitchen", icon: ChefHat, show: isKitchen },
    { label: "Billing & Invoices", href: "/admin/billing", icon: Receipt, show: isBilling },
    { label: "Food Menu", href: "/admin/menu", icon: BookOpen, show: isAdmin },
    { label: "Food Categories", href: "/admin/categories", icon: FolderTree, show: isAdmin },
    { label: "Customer CRM", href: "/admin/customers", icon: Users, show: isAdmin },
    { label: "Sales & Analytics", href: "/admin/reports", icon: BarChart3, show: isAdmin },
    { label: "Tables & QR Stands", href: "/admin/tables", icon: QrCode, show: isAdmin },
    { label: "Website CMS", href: "/admin/cms", icon: Globe, show: isAdmin },
    { label: "Payment & UPI", href: "/admin/settings", icon: CreditCard, show: isAdmin },
    { label: "Staff Accounts", href: "/admin/staff", icon: UserCog, show: isOwner },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-espresso-950 text-ivory flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-espresso-900 border-r border-gold/20 flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-gold/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-espresso-800 border border-gold/40 flex items-center justify-center text-gold shadow-gold-glow">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold gold-gradient-text block">
                ZAN CAFE
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gold/80 block">
                Melapalayam Terminal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-gradient-to-r from-gold-500 to-gold text-espresso-950 shadow-gold-glow font-bold"
                      : "text-ivory/70 hover:text-white hover:bg-espresso-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-espresso-950" : "text-gold"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gold/15">
          <div className="p-3 rounded-xl bg-espresso-800/80 border border-gold/20 mb-3 flex items-center justify-between">
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <span className="text-[10px] font-semibold text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 inline-block mt-1">
                {user?.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-ivory/60 hover:text-gold flex items-center gap-1 text-[11px]"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-espresso-900/90 border-b border-gold/20 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-ivory hover:text-gold"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

            <span className="text-xs font-semibold text-gold/80 hidden sm:inline uppercase tracking-widest">
              Zan Cafe Control Center
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sound alert toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? "bg-forest-800 border-gold/40 text-gold"
                  : "bg-espresso-800 border-white/10 text-ivory/40"
              }`}
              title={soundEnabled ? "Order chime audio is enabled" : "Order chime is muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline text-[11px]">
                {soundEnabled ? "Chime On" : "Chime Muted"}
              </span>
            </button>

            {/* Notification Indicator */}
            <Link
              href="/admin/orders"
              className="relative p-2 rounded-lg bg-espresso-800 border border-gold/20 text-gold hover:bg-espresso-700 transition-colors"
              title="Incoming Order Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-copper text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {/* User role pill on mobile */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate max-w-[100px]">
                {user?.name.split(" ")[0]}
              </span>
              <button onClick={handleLogout} className="p-1.5 text-red-400">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-espresso-950/80 backdrop-blur-sm flex">
            <div className="w-64 bg-espresso-900 border-r border-gold/30 h-full p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-4">
                  <span className="font-serif text-lg font-bold text-gold">Zan Cafe</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 text-ivory">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                        pathname === item.href
                          ? "bg-gold text-espresso-950 font-bold"
                          : "text-ivory/70 hover:bg-espresso-800"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-gold/20 flex justify-between items-center text-xs">
                <span className="text-gold font-bold">{user?.name}</span>
                <button onClick={handleLogout} className="text-red-400">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

