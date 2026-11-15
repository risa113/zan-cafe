import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Sparkles,
  Award,
  Coffee,
  Heart,
  Star,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Flame,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const cmsRecords = await prisma.websiteContent.findMany();
  const cms: Record<string, string> = cmsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="relative py-20 bg-espresso-950 border-b border-gold/15 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold block mb-3">
            {cms.about_tagline || "Melapalayam’s Premier Gastronomic Sanctuary"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-6">
            The Culinary Soul of Zan Cafe
          </h1>
          <p className="text-base sm:text-lg text-ivory/80 max-w-2xl mx-auto font-light leading-relaxed">
            Where artisanal baking, single-origin roasts, and the vibrant flavors of Melapalayam converge
            in a sophisticated, welcoming ambiance.
          </p>
        </div>
      </section>

      {/* Core Narrative */}
      <section className="py-20 bg-espresso">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                Rooted in Melapalayam, Crafted for Discerning Palates
              </h2>
              <p className="text-sm text-ivory/80 leading-relaxed font-light">
                {cms.about_story ||
                  "Nestled in Naniyar Nagar, Melapalayam, Tirunelveli, Zan Cafe is where culinary artistry meets warm southern hospitality. Rated 4.7 stars by our cherished guests, we specialize in handcrafted gourmet burgers, wood-fired pizzas, signature chillers, and specialty espresso coffees."}
              </p>
              <p className="text-sm text-ivory/80 leading-relaxed font-light">
                Our founders set out to build a cafe that broke away from generic commercial fast food.
                Every brioche bun is toasted in European butter; every patty is seasoned and smashed fresh to
                order; and every batch of chicken uses a proprietary blend of aromatic Melapalayam spices.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-espresso-900 border border-gold/30">
                  <div className="font-serif text-2xl font-bold text-gold">4.7 ★</div>
                  <div className="text-[11px] text-ivory/60">Google Reviews</div>
                </div>
                <div className="p-3 rounded-xl bg-espresso-900 border border-gold/30">
                  <div className="font-serif text-2xl font-bold text-gold">₹200–400</div>
                  <div className="text-[11px] text-ivory/60">Affordable Luxury</div>
                </div>
                <div className="p-3 rounded-xl bg-espresso-900 border border-gold/30">
                  <div className="font-serif text-2xl font-bold text-gold">100%</div>
                  <div className="text-[11px] text-ivory/60">Halal & Fresh Meat</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gold/30 shadow-espresso-deep">
                <img
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80"
                  alt="Zan Cafe Interior Ambiance"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Quality */}
      <section className="py-20 bg-espresso-900 border-y border-gold/15">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-2 block">
              Our Commitments
            </span>
            <h2 className="font-serif text-3xl font-bold text-white">The Zan Philosophy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-espresso-800 border border-gold/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Signature Grills & Chicken</h3>
              <p className="text-xs text-ivory/70 leading-relaxed font-light">
                Locally sourced poultry marinated with whole spices for 12 hours before meeting our searing
                grills or signature golden pressure fryers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-espresso-800 border border-gold/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Artisanal Espresso Roasts</h3>
              <p className="text-xs text-ivory/70 leading-relaxed font-light">
                Estate-grown Arabica beans ground moments before extraction. From velvety flat whites to
                Spanish caramel lattes and iced brew coolers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-espresso-800 border border-gold/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Hospitality & Ambiance</h3>
              <p className="text-xs text-ivory/70 leading-relaxed font-light">
                Designed with intimate booths, spacious family dining salons, and courtyard tables. Contactless
                QR ordering at every table for supreme convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-espresso text-center">
        <div className="container mx-auto px-4 max-w-xl">
          <h2 className="font-serif text-3xl font-bold text-white mb-3">Ready for a Taste?</h2>
          <p className="text-xs sm:text-sm text-ivory/70 mb-6">
            Join us in Melapalayam for lunch, coffee, or an unforgettable dinner experience.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/menu"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 shadow-gold-glow"
            >
              Explore Food Menu
            </Link>
            <Link
              href="/location"
              className="px-6 py-3 rounded-xl bg-espresso-800 text-gold border border-gold/40 text-xs font-semibold hover:bg-espresso-700"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

