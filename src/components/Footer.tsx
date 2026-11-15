import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  Star,
  ExternalLink,
  Utensils,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-espresso-950 border-t border-gold/20 text-ivory/80 pt-16 pb-12 relative overflow-hidden">
      {/* Background luxury glow element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gold/5 blur-3xl pointer-events-none rounded-full" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-gold/40 bg-espresso-800 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-gold" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold gold-gradient-text tracking-wide">
                  ZAN CAFE
                </span>
                <p className="text-[10px] uppercase tracking-widest text-gold/80">Melapalayam</p>
              </div>
            </div>
            <p className="text-xs text-ivory/70 leading-relaxed mb-4">
              A refined gastronomic sanctuary in Melapalayam, Tirunelveli. Handcrafted brioche
              burgers, slow-fermented pizzas, single-origin coffees, and signature grills.
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-espresso-900 border border-gold/20">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-white">4.7 / 5.0</span>
              <span className="text-[11px] text-ivory/60">(28 Verified Google Reviews)</span>
            </div>
          </div>

          {/* Opening Timings & Pricing */}
          <div>
            <h4 className="font-serif text-base text-gold font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              Hours & Dining
            </h4>
            <div className="space-y-3 text-xs text-ivory/70">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Monday – Sunday</span>
                <span className="text-white font-medium">11:30 AM – 11:30 PM</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Kitchen Last Call</span>
                <span className="text-gold font-medium">11:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Average Spend</span>
                <span className="text-white font-medium">₹200 – ₹400 / person</span>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Dine-in, Takeaway & Table QR Ordering
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif text-base text-gold font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home & Featured Specialties
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-gold transition-colors">
                  Digital Food Menu & Ordering
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  Our Culinary Story & Kitchen
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-gold transition-colors">
                  Track Existing Order
                </Link>
              </li>
              <li>
                <Link href="/location" className="hover:text-gold transition-colors">
                  Find Us on Google Maps
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-gold/80 hover:text-gold font-medium">
                  Staff & Management Login →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Melapalayam Address */}
          <div>
            <h4 className="font-serif text-base text-gold font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              Visit Zan Cafe
            </h4>
            <div className="space-y-3 text-xs text-ivory/70">
              <p className="leading-relaxed">
                <strong className="text-white block mb-0.5">Zan Cafe</strong>
                36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005
              </p>
              <div className="pt-1">
                <span className="block text-[11px] text-ivory/50">Call for Reservations / Inquiries:</span>
                <a
                  href="tel:06369313196"
                  className="text-sm font-bold text-gold hover:underline inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  063693 13196
                </a>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Zan+Cafe+Melapalayam+Tirunelveli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-espresso-900 border border-gold/30 text-gold hover:bg-gold hover:text-espresso-950 transition-all font-medium text-xs mt-2"
              >
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/15 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory/50 gap-4">
          <p>© {new Date().getFullYear()} Zan Cafe, Melapalayam, Tirunelveli. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-ivory/60">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              Official Restaurant Ecosystem
            </span>
            <Link href="/admin/login" className="hover:text-gold transition-colors">
              Owner & Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

