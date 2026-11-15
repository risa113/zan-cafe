"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("2");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 max-w-5xl py-12 flex-1">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold block mb-2">
            Reservations & Inquiries
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-3">
            Contact Zan Cafe
          </h1>
          <p className="text-xs sm:text-sm text-ivory/70 max-w-lg mx-auto">
            Book a table for family dinners, inquire about catering platters, or connect with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow space-y-6">
              <h3 className="font-serif text-xl font-bold text-gold">Direct Touchpoints</h3>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-espresso-800 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-ivory/60 block">Telephone / WhatsApp</span>
                  <a
                    href="tel:06369313196"
                    className="text-base font-bold text-white hover:text-gold transition-colors"
                  >
                    063693 13196
                  </a>
                  <p className="text-[11px] text-ivory/50 mt-0.5">Available during working hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-espresso-800 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-ivory/60 block">Restaurant Address</span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Zan+Cafe+Melapalayam+Tirunelveli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold hover:underline mt-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-espresso-800 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-ivory/60 block">Operating Hours</span>
                  <p className="text-sm font-semibold text-white">Monday – Sunday: 11:30 AM – 11:30 PM</p>
                  <p className="text-[11px] text-ivory/50 mt-0.5">Kitchen orders close at 11:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-espresso-800 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-ivory/60 block">Email Inquiries</span>
                  <a
                    href="mailto:contact@zancafe.in"
                    className="text-sm font-semibold text-white hover:text-gold"
                  >
                    contact@zancafe.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Table Reservation & Inquiry Form */}
          <div className="p-6 sm:p-8 rounded-2xl bg-espresso-900 border border-gold/30 shadow-gold-glow">
            <h3 className="font-serif text-xl font-bold text-white mb-2">Reserve a Table</h3>
            <p className="text-xs text-ivory/70 mb-6">
              Fill in your details below and we will confirm your table seating via phone.
            </p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-forest-800/80 border border-gold/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-white">Reservation Request Sent!</h4>
                <p className="text-xs text-ivory/80 leading-relaxed">
                  Thank you, <strong>{name}</strong>! Our Melapalayam floor manager will call {phone} to
                  confirm your table seating.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs text-gold hover:underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fareed Ahmed"
                    className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1">
                      Number of Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white"
                    >
                      <option value="2">2 Guests (Intimate Table)</option>
                      <option value="4">4 Guests (Standard Table)</option>
                      <option value="6">6 Guests (Family Booth)</option>
                      <option value="8+">8+ Guests (VIP Salon)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1">
                    Preferred Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ivory/80 uppercase tracking-wider mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Birthday celebration, window seating, quiet corner..."
                    className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold/25 focus:border-gold focus:outline-none text-xs text-white placeholder-ivory/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-serif text-sm font-bold bg-gradient-to-r from-gold-500 via-gold to-gold-600 text-espresso-950 hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reservation Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

