# 🍽️ Zan Cafe — Complete Restaurant Digital Ecosystem
**Location**: 36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005  
**Phone**: [063693 13196](tel:06369313196) | **Google Reviews**: 4.7 ★★★★★ (28 Reviews) | **Pricing**: ₹200–400 / person  

---

## 🌟 Executive Overview
**Zan Cafe Digital Ecosystem** is a production-grade, full-stack restaurant management platform engineered specifically for **Zan Cafe** in Melapalayam, Tirunelveli. It seamlessly connects customer table QR ordering, real-time UPI payments, live kitchen ticketing, billing software with thermal/PDF invoicing, customer CRM, sales analytics, and website CMS under **one centralized backend and unified admin dashboard**.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Lucide Icons** |
| **Backend** | **Next.js API Route Handlers**, **Prisma ORM 5.22**, **PostgreSQL / SQLite** (zero-setup local default) |
| **Authentication & RBAC** | **JWT (HTTP-only secure cookies)**, **bcryptjs** password hashing, Role-Based Access Control |
| **Data Visualization** | **Recharts** (Daily & Monthly revenue charts, category performance) |
| **Document & Thermal Export** | **jsPDF**, **jspdf-autotable** (80mm standard restaurant receipts & PDF), **XLSX** (CRM & sales Excel/CSV exports) |
| **QR Code Engine** | **qrcode** (Table QR generation & dynamic amount-embedded UPI payload generation) |
| **Audio Synthesizer** | **Web Audio API** (Zero-asset browser native chime synthesizer for order & alert tones) |

---

## 🎨 Brand Identity & Visual Language
- **Midnight Espresso**: `#171310` (Primary deep coffee backdrop)
- **Warm Ivory**: `#F5F0E8` (Secondary soft typography & surfaces)
- **Champagne Gold**: `#C6A36A` (Accent luxury buttons, highlights & borders)
- **Deep Forest**: `#26382E` (Table badges, verified indicators)
- **Copper**: `#A66B45` (Notification tags & active alerts)

---

## 🔐 Staff & Role Credentials (Pre-seeded)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **OWNER** | `owner@zancafe.in` | `owner123` | Full access across all 14 management modules, staff creation & financials |
| **ADMIN (Manager)** | `admin@zancafe.in` | `admin123` | Live orders, billing, menu editing, table QR, and sales analytics |
| **KITCHEN_STAFF** | `kitchen@zancafe.in` | `kitchen123` | Dedicated Kitchen Display System (KDS) for preparation & dispatch |
| **BILLING_STAFF** | `billing@zancafe.in` | `billing123` | Point of Sale, invoice generation, thermal printing & payment reconciliation |

> Quick-fill demo buttons are embedded right on the `/admin/login` page for instantaneous role switching!

---

## 📱 Complete Customer & Order Lifecycle

```
Table QR Scanned (?table=T-01)
         │
         ▼
Customer Registration (Name, Mobile, Email) -> Auto Returning Guest Lookup
         │
         ▼
Digital Food Menu (Search, Veg/Non-Veg, Sizzle & Spice Badges, Add to Cart)
         │
         ▼
Cart Review (Table Locked, Special Cooking Instructions, 5% GST Breakdown)
         │
         ▼
Checkout -> Database Order Generated (ZAN-YYYYMMDD-XXX)
         │
         ▼
UPI QR Screen (Amount embedded, Customer pays via GPay/PhonePe/Paytm -> clicks "I Have Paid")
         │
         ▼
Order Status: VERIFICATION_PENDING (Audio alert chimes in Admin Terminal)
         │
         ▼
Cashier / Admin Verifies Payment (Confirms UTR/proof -> Status: PAID -> Auto-creates Invoice)
         │
         ▼
Kitchen KDS Display (Chef starts cooking -> Status: PREPARING -> Marks ORDER_READY)
         │
         ▼
Customer Live Tracker (/track/ZAN-...) Auto-updates in Real-time to "Ready to Serve"
         │
         ▼
Completed -> Retained in Customer CRM History & Synced into Billing Software
```

---

## 🗄️ Relational Database Schema

- `User`: Staff accounts, role-based authorization, hashed passwords, audit trails.
- `Customer`: Unique mobile numbers, total visit tracking, lifetime expenditure, notes.
- `RestaurantTable`: Table codes (`T-01` to `T-12`), location zones, live status, QR payloads.
- `FoodCategory`: Gourmet Burgers, Artisanal Pizzas, Melapalayam Fried Chicken, Roasts, Mojitos, Desserts.
- `FoodItem`: Prices, discounted prices, spice levels (0–3), prep times, veg/non-veg, availability toggle.
- `Order`: Unique sequence number, server-validated subtotal, 5% tax, grand total, payment reference.
- `OrderItem`: Line items, food names, rates, quantities, and cooking notes.
- `Payment`: Amount, method (`UPI_QR`, `CASH`, `CARD`), status, UTR reference, verification timestamps.
- `Invoice`: Non-duplicate invoice numbers (`INV-YYYYMMDD-XXX`), print tracking, thermal receipt data.
- `CustomerVisit`: Audit of every table seated and customer recurrence.
- `Notification`: High-priority order and payment alerts with unread counter.
- `WebsiteContent`: Dynamic CMS records for homepage headlines, about story, timings, and banners.
- `RestaurantSettings`: Dynamic UPI ID (`zancafe@upi`), QR uploads, tax rates, contact numbers.
- `AuditLog`: Security logs for payment verifications, price changes, and staff operations.

---

## 🚀 Quick Start Guide

### 1. Environment Setup
Create or verify `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="zan-cafe-super-secret-jwt-key-2026-melapalayam-tirunelveli"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_RESTAURANT_NAME="Zan Cafe"
NEXT_PUBLIC_RESTAURANT_PHONE="063693 13196"
NEXT_PUBLIC_RESTAURANT_ADDRESS="36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005"
NEXT_PUBLIC_UPI_ID="zancafe@upi"
NEXT_PUBLIC_CURRENCY_SYMBOL="₹"
```

### 2. Database Migration & Realistic Seeding
```bash
# Push schema and seed realistic data
npm run db:push
npm run db:seed
```

### 3. Build & Run
```bash
# Run production build
npm run build

# Start production server
npm start
```
Visit: [http://localhost:3000](http://localhost:3000)

### 4. Run Automated End-to-End Test Suite
```bash
node test-suite.js
```
*Executes all 12 validation scenarios: QR scan, customer registration, cart calculations, order placement, UPI verification pending state, admin verification, kitchen display, auto-invoicing, CRM persistence, sales analytics, menu updates, and CMS live updates.*

---

## 📍 Business Information
- **Brand**: Zan Cafe
- **Address**: 36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005
- **Phone**: 063693 13196
- **Rating**: 4.7 Stars (28 Verified Google Reviews)
- **UPI Receiver Handle**: `zancafe@upi`

---

## 🌐 GitHub Pages Live Demo & Deployment

The static presentation layer and interactive ordering simulator are published to **GitHub Pages** directly from the `gh-pages` branch.

- **GitHub Repository**: [https://github.com/risa113/zan-cafe](https://github.com/risa113/zan-cafe)
- **Live GitHub Pages URL**: [https://risa113.github.io/zan-cafe/](https://risa113.github.io/zan-cafe/)

### How to Configure GitHub Pages on the Repository:
1. Go to your GitHub repository: [https://github.com/risa113/zan-cafe/settings/pages](https://github.com/risa113/zan-cafe/settings/pages)
2. Under **Build and deployment** -> **Source**:
   - Select **Deploy from a branch**
   - Branch: **`gh-pages`** / Folder: **`/ (root)`**
   - Click **Save**
   *(Alternatively, choose **GitHub Actions** to use `.github/workflows/deploy.yml`)*
3. Your site will be served live at `https://risa113.github.io/zan-cafe/`.

### Re-deploying Static Updates:
```bash
npm run deploy:gh-pages
```
This single command automatically parks backend API routes, generates static HTML for all 31 routes under `/zan-cafe/` basePath, places `.nojekyll` and `404.html`, restores all backend files, and pushes directly to `origin/gh-pages`.
