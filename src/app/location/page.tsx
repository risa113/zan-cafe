import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin,
  Navigation,
  Car,
  Clock,
  Phone,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LocationPage() {
  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 max-w-5xl py-12 flex-1">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold block mb-2">
            Find Us in Tirunelveli
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-3">
            Directions to Zan Cafe
          </h1>
          <p className="text-xs sm:text-sm text-ivory/70 max-w-lg mx-auto">
            36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005.
          </p>
        </div>

        {/* Big Interactive Map Container */}
        <div className="rounded-2xl overflow-hidden border border-gold/30 shadow-espresso-deep mb-10 h-[420px] bg-espresso-900 relative">
          <iframe
            src={
              settings?.googleMapsEmbedUrl ||
              "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.918809187381!2d77.7289569!3d8.6992631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0413ec5ac275fb%3A0x9ad6e4c0f4e942bb!2sZan%20Cafe!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            title="Zan Cafe Melapalayam Google Maps Location"
          />
        </div>

        {/* Travel & Arrival Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-3">
              <Navigation className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-white">Landmarks</h3>
            <p className="text-xs text-ivory/70 leading-relaxed font-light">
              Centrally situated in Naniyar Nagar, Melapalayam, easily reachable from Palayamkottai
              and Tirunelveli Junction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-3">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-white">Parking</h3>
            <p className="text-xs text-ivory/70 leading-relaxed font-light">
              Dedicated front and roadside parking available for two-wheelers and four-wheelers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/20 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-white">Visiting Hours</h3>
            <p className="text-xs text-ivory/70 leading-relaxed font-light">
              Open 7 days a week from 11:30 AM to 11:30 PM. Peak evening dining from 7:00 PM to 10:30 PM.
            </p>
          </div>
        </div>

        {/* Direct Action */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-espresso-900 to-espresso-800 border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Need help finding us?</h4>
            <p className="text-xs text-ivory/70 mt-0.5">Call our floor staff for immediate guidance.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:06369313196"
              className="px-5 py-2.5 rounded-xl bg-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>063693 13196</span>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Zan+Cafe+Melapalayam+Tirunelveli"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-espresso-700 text-gold border border-gold/40 text-xs font-semibold hover:bg-espresso-600 flex items-center gap-1.5"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

