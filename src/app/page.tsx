import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCartBar from "@/components/FloatingCartBar";
import AddToCartButton from "@/components/AddToCartButton";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  Coffee,
  Flame,
  Award,
  QrCode,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real data from database
  const categories = await prisma.foodCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  const featuredItems = await prisma.foodItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    take: 6,
    include: { category: true },
    orderBy: { displayOrder: "asc" },
  });

  const cmsRecords = await prisma.websiteContent.findMany();
  const cms: Record<string, string> = cmsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/90 to-espresso/60 z-10" />
          <div
            className="w-full h-full bg-cover bg-center scale-105 transition-transform duration-1000"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
        </div>

        {/* Ambient Gold & Forest Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/10 blur-[130px] rounded-full pointer-events-none z-10" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-forest/20 blur-[100px] rounded-full pointer-events-none z-10" />

        <div className="container mx-auto max-w-5xl relative z-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-espresso-900/90 border border-gold/40 text-gold text-xs font-semibold tracking-wide uppercase shadow-gold-glow mb-6">
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
            <span>Melapalayam’s Premier Gastronomic Destination</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-ivory font-normal">Tirunelveli</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            {cms.hero_title || "Savor Every Moment at Zan Cafe"}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-ivory/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {cms.hero_subtitle ||
              "Artisanal single-origin brews, gourmet brioche burgers, wood-fired pizzas, and authentic Melapalayam flavors crafted with passion."}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/menu"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-serif text-sm font-bold bg-gradient-to-r from-gold-500 via-gold to-gold-600 text-espresso-950 hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2 group"
            >
              <span>Explore Food Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/menu?table=T-01"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-serif text-sm font-semibold bg-espresso-800/80 hover:bg-espresso-700 text-gold border border-gold/40 hover:border-gold transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-gold" />
              <span>Simulate Table QR</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto pt-8 border-t border-gold/15">
            <div className="p-3">
              <div className="font-serif text-2xl font-bold text-gold">4.7 ★</div>
              <div className="text-xs text-ivory/60 mt-0.5">28 Google Reviews</div>
            </div>
            <div className="p-3">
              <div className="font-serif text-2xl font-bold text-gold">₹200–400</div>
              <div className="text-xs text-ivory/60 mt-0.5">Avg Spend / Person</div>
            </div>
            <div className="p-3">
              <div className="font-serif text-2xl font-bold text-gold">100% Fresh</div>
              <div className="text-xs text-ivory/60 mt-0.5">Custom Spice Crust</div>
            </div>
            <div className="p-3">
              <div className="font-serif text-2xl font-bold text-gold">Table QR</div>
              <div className="text-xs text-ivory/60 mt-0.5">Contactless Ordering</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Food Categories */}
      <section className="py-20 bg-espresso-900 border-y border-gold/15 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-2 block">
              Curated Gastronomy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
              Explore Our Culinary Categories
            </h2>
            <p className="text-sm text-ivory/70">
              From our famous smashed brioche burgers to Melapalayam fried chicken and specialty roasts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-espresso-800 border border-gold/20 hover:border-gold transition-all duration-300 hover:shadow-gold-glow flex flex-col justify-end p-5 min-h-[190px]"
              >
                {cat.image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-40 group-hover:opacity-60"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/60 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-gold transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-ivory/70 line-clamp-1 mt-1 font-light">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Chef Specialties */}
      <section className="py-20 bg-espresso relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-2 block">
                Signature Creations
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Chef’s Featured Recommendations
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-300 font-medium group"
            >
              <span>View Full 40+ Item Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-espresso-900 border border-gold/20 hover:border-gold/40 transition-all duration-300 p-4 flex flex-col justify-between group hover:shadow-gold-glow"
              >
                <div>
                  {/* Food Image */}
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-espresso-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-espresso-950/90 text-ivory/80 text-[10px]">
                      ⏱ {item.preparationTimeMinutes} mins
                    </div>
                  </div>

                  {/* Category and Name */}
                  <span className="text-[10px] uppercase tracking-wider text-gold font-medium">
                    {item.category?.name}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors mt-0.5 mb-1.5">
                    {item.name}
                  </h3>
                  <p className="text-xs text-ivory/70 line-clamp-2 font-light leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Price & Add to Cart */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gold">
                      ₹{item.discountedPrice || item.price}
                    </span>
                    {item.discountedPrice && (
                      <span className="text-xs text-ivory/40 line-through">₹{item.price}</span>
                    )}
                  </div>
                  <AddToCartButton item={item as any} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Melapalayam Story & About Section */}
      <section className="py-20 bg-espresso-950 border-t border-gold/15 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold px-3 py-1 rounded-full bg-gold/10 border border-gold/30">
                {cms.about_tagline || "Melapalayam’s Premier Gastronomic Sanctuary"}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Crafted With Passion In The Heart of Melapalayam
              </h2>
              <p className="text-sm sm:text-base text-ivory/80 font-light leading-relaxed">
                {cms.about_story ||
                  "Nestled in Naniyar Nagar, Melapalayam, Tirunelveli, Zan Cafe is where culinary artistry meets warm southern hospitality. Rated 4.7 stars by our cherished guests, we specialize in handcrafted gourmet burgers, wood-fired pizzas, signature chillers, and specialty espresso coffees."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-espresso-900 border border-gold/20">
                  <Award className="w-6 h-6 text-gold mb-2" />
                  <h4 className="font-serif text-sm font-bold text-white">Artisanal Standards</h4>
                  <p className="text-xs text-ivory/60 mt-1">
                    Freshly baked brioche, single-origin roasts, and zero frozen compromises.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-espresso-900 border border-gold/20">
                  <Coffee className="w-6 h-6 text-gold mb-2" />
                  <h4 className="font-serif text-sm font-bold text-white">Melapalayam Vibes</h4>
                  <p className="text-xs text-ivory/60 mt-1">
                    Warm ambient dining with family AC salons and garden outdoor seating.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline"
                >
                  <span>Read Our Full Story & Philosophy</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Collage */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-gold/40 shadow-espresso-deep">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                  alt="Zan Cafe Dining Atmosphere"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-espresso-900/90 border border-gold/30 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gold uppercase tracking-wider font-semibold">
                        Address
                      </span>
                      <p className="text-xs text-white mt-0.5">
                        36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli
                      </p>
                    </div>
                    <Link
                      href="/location"
                      className="px-3 py-1.5 rounded-lg bg-gold text-espresso-950 text-xs font-bold font-serif hover:brightness-110"
                    >
                      Map
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Customer Google Reviews */}
      <section className="py-20 bg-espresso-900 border-t border-gold/15">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-2 block">
              Google Verified Feedback
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
              Loved by Melapalayam & Tirunelveli Foodies
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-white">4.7 Rating</span>
              <span className="text-xs text-ivory/60">(28 Google Reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-espresso-800 border border-gold/20 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-ivory/90 italic font-serif leading-relaxed mb-4">
                  "The food is awesome with unique taste... the price is worth for the taste...
                  👑💐👌"
                </p>
              </div>
              <div className="border-t border-white/5 pt-3">
                <span className="text-xs font-bold text-gold block">Verified Guest</span>
                <span className="text-[10px] text-ivory/50">Google Review • Melapalayam</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-espresso-800 border border-gold/20 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-ivory/90 italic font-serif leading-relaxed mb-4">
                  "Staff are friendly and service is fast. Great ambience for family dinner and
                  hanging out with friends."
                </p>
              </div>
              <div className="border-t border-white/5 pt-3">
                <span className="text-xs font-bold text-gold block">Regular Diner</span>
                <span className="text-[10px] text-ivory/50">Google Review • Tirunelveli</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-espresso-800 border border-gold/20 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-ivory/90 italic font-serif leading-relaxed mb-4">
                  "Very Nice and Good Experience. Must try their signature chicken burgers and
                  Spanish iced latte!"
                </p>
              </div>
              <div className="border-t border-white/5 pt-3">
                <span className="text-xs font-bold text-gold block">Cafe Enthusiast</span>
                <span className="text-[10px] text-ivory/50">Google Review • Melapalayam</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps & Directions */}
      <section className="py-16 bg-espresso border-t border-gold/15">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-2xl bg-espresso-900 border border-gold/30 p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-gold-glow">
            <div className="flex-1 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold block">
                Find Your Table
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Visit Zan Cafe in Melapalayam
              </h3>
              <p className="text-xs sm:text-sm text-ivory/70 leading-relaxed">
                Located on 36B/A14 ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005.
                Convenient street parking available for cars and two-wheelers.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="tel:06369313196"
                  className="px-5 py-2.5 rounded-xl bg-gold text-espresso-950 font-serif font-bold text-xs hover:brightness-110 flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 063693 13196</span>
                </a>
                <Link
                  href="/location"
                  className="px-5 py-2.5 rounded-xl bg-espresso-800 text-gold border border-gold/40 text-xs font-semibold hover:bg-espresso-700"
                >
                  Interactive Map & Directions
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-72 h-44 rounded-xl overflow-hidden border border-gold/25 relative">
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
                title="Zan Cafe Map Preview"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingCartBar />
    </div>
  );
}
