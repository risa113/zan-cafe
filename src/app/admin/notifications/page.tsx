"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, ExternalLink } from "lucide-react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      fetchNotifications();
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            System Alerts
          </span>
          <h1 className="font-serif text-2xl font-bold text-white">Notifications & Order Activity</h1>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="px-3.5 py-1.5 rounded-xl bg-espresso-900 border border-gold/30 text-gold text-xs font-semibold hover:bg-espresso-800 transition-colors flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-espresso-900 border border-gold/20">
            <Bell className="w-10 h-10 text-gold/30 mx-auto mb-2" />
            <p className="text-xs text-ivory/60">No notifications at the moment.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? "bg-espresso-900/60 border-gold/10"
                  : "bg-espresso-900 border-gold/30 shadow-md ring-1 ring-gold/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />}
                  <h4 className="font-serif text-sm font-bold text-white">{n.title}</h4>
                </div>
                <p className="text-xs text-ivory/80 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-ivory/50 flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-gold" />
                  {new Date(n.createdAt).toLocaleString("en-IN")}
                </span>
              </div>

              {n.link && (
                <Link
                  href={n.link}
                  className="px-3 py-1.5 rounded-lg bg-espresso-800 hover:bg-gold hover:text-espresso-950 border border-gold/30 text-gold text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

