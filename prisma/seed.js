const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Zan Cafe database...');

  // 1. Settings
  await prisma.restaurantSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      restaurantName: 'Zan Cafe',
      tagline: 'Gourmet Bistro, Handcrafted Brews & Melapalayam Sizzle',
      address: '36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005',
      phone: '063693 13196',
      email: 'contact@zancafe.in',
      upiId: 'zancafe@upi',
      upiQrImageUrl: '/images/sample-upi-qr.png',
      taxPercentage: 5.0,
      currencySymbol: '₹',
      isOrderingEnabled: true,
      openingHours: 'Monday - Sunday: 11:30 AM - 11:30 PM',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.918809187381!2d77.7289569!3d8.6992631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0413ec5ac275fb%3A0x9ad6e4c0f4e942bb!2sZan%20Cafe!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
    }
  });

  // 2. Staff & Users
  const passwordOwner = await bcrypt.hash('owner123', 10);
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordKitchen = await bcrypt.hash('kitchen123', 10);
  const passwordBilling = await bcrypt.hash('billing123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@zancafe.in' },
    update: {},
    create: {
      name: 'Mohammed Ziyad (Owner)',
      email: 'owner@zancafe.in',
      passwordHash: passwordOwner,
      role: 'OWNER',
      phone: '063693 13196',
      isActive: true
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zancafe.in' },
    update: {},
    create: {
      name: 'Arshad Khan (Manager)',
      email: 'admin@zancafe.in',
      passwordHash: passwordAdmin,
      role: 'ADMIN',
      phone: '9842109876',
      isActive: true
    }
  });

  const kitchen = await prisma.user.upsert({
    where: { email: 'kitchen@zancafe.in' },
    update: {},
    create: {
      name: 'Chef Fareed (Head Chef)',
      email: 'kitchen@zancafe.in',
      passwordHash: passwordKitchen,
      role: 'KITCHEN_STAFF',
      phone: '9842101234',
      isActive: true
    }
  });

  const billing = await prisma.user.upsert({
    where: { email: 'billing@zancafe.in' },
    update: {},
    create: {
      name: 'Suhail Ahmed (Cashier)',
      email: 'billing@zancafe.in',
      passwordHash: passwordBilling,
      role: 'BILLING_STAFF',
      phone: '9842105678',
      isActive: true
    }
  });

  // 3. Tables
  const tableData = [
    { tableNumber: 'T-01', displayName: 'Table 01 - Courtyard Garden', capacity: 2, locationDesc: 'Ground Floor Outdoor Garden' },
    { tableNumber: 'T-02', displayName: 'Table 02 - Courtyard Garden', capacity: 4, locationDesc: 'Ground Floor Outdoor Garden' },
    { tableNumber: 'T-03', displayName: 'Table 03 - Espresso Lounge', capacity: 4, locationDesc: 'Coffee Bar Side' },
    { tableNumber: 'T-04', displayName: 'Table 04 - Espresso Lounge', capacity: 2, locationDesc: 'Coffee Bar Window Side' },
    { tableNumber: 'T-05', displayName: 'Table 05 - Family Booth A', capacity: 6, locationDesc: 'First Floor AC Dining' },
    { tableNumber: 'T-06', displayName: 'Table 06 - Family Booth B', capacity: 6, locationDesc: 'First Floor AC Dining' },
    { tableNumber: 'T-07', displayName: 'Table 07 - Intimate Corner', capacity: 2, locationDesc: 'Window View Corner' },
    { tableNumber: 'T-08', displayName: 'Table 08 - Group Banquet', capacity: 8, locationDesc: 'VIP Dining Salon' },
    { tableNumber: 'T-09', displayName: 'Table 09 - Balcony Terrace', capacity: 4, locationDesc: 'First Floor Balcony' },
    { tableNumber: 'T-10', displayName: 'Table 10 - Balcony Terrace', capacity: 4, locationDesc: 'First Floor Balcony' },
    { tableNumber: 'T-11', displayName: 'Table 11 - Express High Top', capacity: 2, locationDesc: 'Ground Floor Quick Bites' },
    { tableNumber: 'T-12', displayName: 'Table 12 - Express High Top', capacity: 2, locationDesc: 'Ground Floor Quick Bites' },
  ];

  for (const t of tableData) {
    await prisma.restaurantTable.upsert({
      where: { tableNumber: t.tableNumber },
      update: {},
      create: {
        tableNumber: t.tableNumber,
        displayName: t.displayName,
        capacity: t.capacity,
        locationDesc: t.locationDesc,
        status: 'AVAILABLE',
        qrCodeData: `/menu?table=${t.tableNumber}`,
        isActive: true
      }
    });
  }

  // 4. Food Categories
  const categories = [
    {
      name: 'Gourmet Burgers & Sliders',
      slug: 'burgers-sliders',
      description: 'Artisan handcrafted brioche buns with freshly smashed patties, artisanal sauces & melted cheese.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1
    },
    {
      name: 'Wood-Fired & Artisanal Pizzas',
      slug: 'artisanal-pizzas',
      description: 'Slow-fermented Neapolitan style dough, San Marzano tomato reduction & Fior di Latte mozzarella.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2
    },
    {
      name: 'Melapalayam Fried Chicken & Grills',
      slug: 'fried-chicken-grills',
      description: 'Signature spiced crispy fried chicken, tender peri-peri wings and smokey glazed grills.',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3
    },
    {
      name: 'Artisan Coffees & Hot Brews',
      slug: 'coffees-brews',
      description: 'Single-origin Arabica roasts, silky flat whites, Spanish lattes and pour-over specialties.',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4
    },
    {
      name: 'Signature Mojitos & Chillers',
      slug: 'mojitos-chillers',
      description: 'Crushed mint, hand-pressed citrus, exotic passion fruit and cold-pressed fruit refreshers.',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5
    },
    {
      name: 'Wraps, Rolls & Quesadillas',
      slug: 'wraps-quesadillas',
      description: 'Toasted tortilla wraps packed with crunchy chicken, chipotle dip and grilled veggies.',
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
      displayOrder: 6
    },
    {
      name: 'Pastas & Crispy Starters',
      slug: 'pastas-starters',
      description: 'Creamy Alfredo, spicy Arrabiata, loaded cheese nachos and truffle parmesan fries.',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      displayOrder: 7
    },
    {
      name: 'Waffles, Cheesecakes & Desserts',
      slug: 'waffles-desserts',
      description: 'Belgian golden waffles topped with Nutella, Lotus Biscoff cheesecakes and sizzling brownies.',
      image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
      displayOrder: 8
    }
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const c = await prisma.foodCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        displayOrder: cat.displayOrder,
        isActive: true
      }
    });
    categoryMap[cat.slug] = c.id;
  }

  // 5. Food Items
  const foodItems = [
    // Burgers
    {
      categorySlug: 'burgers-sliders',
      name: 'Zan Royale Truffle Burger',
      slug: 'zan-royale-truffle-burger',
      description: 'Double grilled tender chicken patties, caramelized onions, smoked cheddar, house truffle aioli on toasted butter brioche.',
      price: 280,
      discountedPrice: 260,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      isVeg: false,
      spicyLevel: 1,
      preparationTimeMinutes: 18,
      displayOrder: 1
    },
    {
      categorySlug: 'burgers-sliders',
      name: 'Crispy Peri-Peri Chicken Burger',
      slug: 'crispy-peri-peri-chicken-burger',
      description: 'Crunchy golden fried breast dipped in zesty peri-peri glaze, crunchy iceberg lettuce and jalapeño mayonnaise.',
      price: 240,
      discountedPrice: 220,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      isVeg: false,
      spicyLevel: 2,
      preparationTimeMinutes: 15,
      displayOrder: 2
    },
    {
      categorySlug: 'burgers-sliders',
      name: 'Smoked Paneer & Mushroom Burger',
      slug: 'smoked-paneer-mushroom-burger',
      description: 'Grilled tandoori paneer steak, sautéed garlic mushrooms, melted mozzarella and mint coriander chutney aioli.',
      price: 210,
      discountedPrice: null,
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      isVeg: true,
      spicyLevel: 1,
      preparationTimeMinutes: 14,
      displayOrder: 3
    },

    // Pizzas
    {
      categorySlug: 'artisanal-pizzas',
      name: 'Zan Signature BBQ Chicken Pizza',
      slug: 'zan-signature-bbq-chicken-pizza',
      description: 'Slow-smoked chicken chunks, sweet smoky BBQ reduction, red bell peppers, caramelized onions and double mozzarella.',
      price: 360,
      discountedPrice: 340,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      isVeg: false,
      spicyLevel: 1,
      preparationTimeMinutes: 20,
      displayOrder: 1
    },
    {
      categorySlug: 'artisanal-pizzas',
      name: 'Classic Margherita con Bufala',
      slug: 'classic-margherita-con-bufala',
      description: 'San Marzano plum tomato sauce, fresh buffalo mozzarella, virgin olive oil drizzle and fresh garden basil leaves.',
      price: 290,
      discountedPrice: null,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      isVeg: true,
      spicyLevel: 0,
      preparationTimeMinutes: 15,
      displayOrder: 2
    },

    // Melapalayam Chicken & Grills
    {
      categorySlug: 'fried-chicken-grills',
      name: 'Melapalayam Fiery Fried Chicken (4 Pcs)',
      slug: 'melapalayam-fiery-fried-chicken-4pcs',
      description: 'Locally curated secret spice crust, succulent bone-in chicken fried to crackling perfection, served with garlic dip.',
      price: 320,
      discountedPrice: 299,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      isVeg: false,
      spicyLevel: 3,
      preparationTimeMinutes: 18,
      displayOrder: 1
    },
    {
      categorySlug: 'fried-chicken-grills',
      name: 'Honey Glazed Peri-Peri Wings (6 Pcs)',
      slug: 'honey-glazed-peri-peri-wings',
      description: 'Crisp chicken wings tossed in rich honey peri-peri reduction and sprinkled with roasted sesame seeds.',
      price: 250,
      discountedPrice: null,
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      isVeg: false,
      spicyLevel: 2,
      preparationTimeMinutes: 15,
      displayOrder: 2
    },

    // Beverages & Coffees
    {
      categorySlug: 'coffees-brews',
      name: 'Spanish Caramel Iced Latte',
      slug: 'spanish-caramel-iced-latte',
      description: 'Espresso double shot pulled over condensed milk and chilled fresh milk, topped with rich sea-salt caramel foam.',
      price: 190,
      discountedPrice: 175,
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      isVeg: true,
      spicyLevel: 0,
      preparationTimeMinutes: 7,
      displayOrder: 1
    },
    {
      categorySlug: 'coffees-brews',
      name: 'Hazelnut Cappuccino Roast',
      slug: 'hazelnut-cappuccino-roast',
      description: 'Freshly ground Arabica blend, steamed frothy milk and premium roasted hazelnut essence.',
      price: 160,
      discountedPrice: null,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      isVeg: true,
      spicyLevel: 0,
      preparationTimeMinutes: 6,
      displayOrder: 2
    },

    // Mojitos
    {
      categorySlug: 'mojitos-chillers',
      name: 'Blue Ocean Curacao Sparkler',
      slug: 'blue-ocean-curacao-sparkler',
      description: 'Blue Curacao reduction, crushed Persian limes, bruised fresh mint leaves, sparkling soda and cracked ice.',
      price: 150,
      discountedPrice: 140,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      isVeg: true,
      spicyLevel: 0,
      preparationTimeMinutes: 5,
      displayOrder: 1
    },
    {
      categorySlug: 'mojitos-chillers',
      name: 'Passion Fruit & Mint Cooler',
      slug: 'passion-fruit-mint-cooler',
      description: 'Exotic crushed tropical passion fruit pulp, lemonade reduction, fresh mint and fizz.',
      price: 160,
      discountedPrice: null,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      isVeg: true,
      spicyLevel: 0,
      preparationTimeMinutes: 5,
      displayOrder: 2
    },

    // Desserts
    {
      categorySlug: 'waffles-desserts',
      name: 'Belgian Lotus Biscoff Waffle',
      slug: 'belgian-lotus-biscoff-waffle',
      description: 'Freshly baked golden Belgian waffle drizzled with melted Biscoff spread, crushed spiced cookies and vanilla gelato.',
      price: 240,
      discountedPrice: 220,
      image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      isVeg: true,
      spicyLevel: 0,
      preparationTimeMinutes: 12,
      displayOrder: 1
    },
    {
      categorySlug: 'waffles-desserts',
      name: 'Sizzling Triple Chocolate Brownie',
      slug: 'sizzling-triple-chocolate-brownie',
      description: 'Warm fudge brownie served on a piping hot iron sizzler, drenched with hot Belgian chocolate sauce and French vanilla ice cream.',
      price: 220,
      discountedPrice: null,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      isVeg: true,
      spicyLevel: 0,
      preparationTimeMinutes: 10,
      displayOrder: 2
    }
  ];

  for (const item of foodItems) {
    const catId = categoryMap[item.categorySlug];
    if (catId) {
      await prisma.foodItem.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          categoryId: catId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          discountedPrice: item.discountedPrice,
          image: item.image,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
          isPopular: item.isPopular,
          isVeg: item.isVeg,
          spicyLevel: item.spicyLevel,
          preparationTimeMinutes: item.preparationTimeMinutes,
          displayOrder: item.displayOrder
        }
      });
    }
  }

  // 6. Realistic Customers
  const customer1 = await prisma.customer.upsert({
    where: { phone: '9840123456' },
    update: {},
    create: {
      name: 'Syed Ibrahim',
      phone: '9840123456',
      email: 'syed.ibrahim@gmail.com',
      notes: 'Prefers extra spicy chicken and window seating',
      totalVisits: 4,
      totalSpend: 2450.0
    }
  });

  const customer2 = await prisma.customer.upsert({
    where: { phone: '9840987654' },
    update: {},
    create: {
      name: 'Aisha Fathima',
      phone: '9840987654',
      email: 'aisha.fathima@gmail.com',
      notes: 'Loves iced Spanish latte and Belgian waffles',
      totalVisits: 3,
      totalSpend: 1890.0
    }
  });

  const customer3 = await prisma.customer.upsert({
    where: { phone: '9840555666' },
    update: {},
    create: {
      name: 'Rahman Khan',
      phone: '9840555666',
      email: 'rahman.k@gmail.com',
      notes: 'Regular weekend visitor',
      totalVisits: 2,
      totalSpend: 1120.0
    }
  });

  // 7. Seed Initial Orders and Billing Records
  const table1 = await prisma.restaurantTable.findUnique({ where: { tableNumber: 'T-01' } });
  const table3 = await prisma.restaurantTable.findUnique({ where: { tableNumber: 'T-03' } });
  const burgerItem = await prisma.foodItem.findUnique({ where: { slug: 'zan-royale-truffle-burger' } });
  const coffeeItem = await prisma.foodItem.findUnique({ where: { slug: 'spanish-caramel-iced-latte' } });
  const chickenItem = await prisma.foodItem.findUnique({ where: { slug: 'melapalayam-fiery-fried-chicken-4pcs' } });

  if (table1 && burgerItem && coffeeItem) {
    const orderNum1 = 'ZAN-20261115-001';
    const subtotal1 = burgerItem.price * 2 + coffeeItem.price * 2;
    const tax1 = Math.round(subtotal1 * 0.05 * 100) / 100;
    const total1 = subtotal1 + tax1;

    const order1 = await prisma.order.upsert({
      where: { orderNumber: orderNum1 },
      update: {},
      create: {
        orderNumber: orderNum1,
        customerId: customer1.id,
        tableId: table1.id,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI_QR',
        subtotal: subtotal1,
        taxPercentage: 5.0,
        taxAmount: tax1,
        discountAmount: 0,
        grandTotal: total1,
        paymentUtr: 'UPI-REF-908123712891',
        paymentProofUrl: '/images/sample-upi-qr.png',
        verifiedByUserId: admin.id,
        verifiedAt: new Date(Date.now() - 3600000 * 2),
        completedAt: new Date(Date.now() - 3600000 * 1),
        items: {
          create: [
            {
              foodItemId: burgerItem.id,
              foodName: burgerItem.name,
              price: burgerItem.price,
              quantity: 2,
              total: burgerItem.price * 2
            },
            {
              foodItemId: coffeeItem.id,
              foodName: coffeeItem.name,
              price: coffeeItem.price,
              quantity: 2,
              total: coffeeItem.price * 2
            }
          ]
        }
      }
    });

    // Payment record
    await prisma.payment.upsert({
      where: { orderId: order1.id },
      update: {},
      create: {
        orderId: order1.id,
        amount: total1,
        paymentMethod: 'UPI_QR',
        status: 'COMPLETED',
        transactionRef: 'UPI-REF-908123712891',
        proofImageUrl: '/images/sample-upi-qr.png',
        verifiedByUserId: admin.id,
        verifiedAt: new Date(Date.now() - 3600000 * 2)
      }
    });

    // Invoice record
    await prisma.invoice.upsert({
      where: { orderId: order1.id },
      update: {},
      create: {
        invoiceNumber: 'INV-20261115-001',
        orderId: order1.id,
        customerId: customer1.id,
        customerName: customer1.name,
        customerPhone: customer1.phone,
        customerEmail: customer1.email,
        tableNumber: table1.tableNumber,
        subtotal: subtotal1,
        taxRate: 5.0,
        taxAmount: tax1,
        discountAmount: 0,
        grandTotal: total1,
        paymentMethod: 'UPI_QR',
        paymentStatus: 'PAID',
        printedCount: 1
      }
    });
  }

  // Active Pending Order for verification test
  if (table3 && chickenItem && coffeeItem) {
    const orderNum2 = 'ZAN-20261115-002';
    const subtotal2 = chickenItem.price + coffeeItem.price;
    const tax2 = Math.round(subtotal2 * 0.05 * 100) / 100;
    const total2 = subtotal2 + tax2;

    const order2 = await prisma.order.upsert({
      where: { orderNumber: orderNum2 },
      update: {},
      create: {
        orderNumber: orderNum2,
        customerId: customer2.id,
        tableId: table3.id,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'VERIFICATION_PENDING',
        paymentMethod: 'UPI_QR',
        subtotal: subtotal2,
        taxPercentage: 5.0,
        taxAmount: tax2,
        discountAmount: 0,
        grandTotal: total2,
        paymentUtr: 'UPI-REF-891230192841',
        paymentNotes: 'Paid via GPay to Zan Cafe UPI QR',
        customerNotes: 'Please ensure chicken is well-done and extra crispy',
        items: {
          create: [
            {
              foodItemId: chickenItem.id,
              foodName: chickenItem.name,
              price: chickenItem.price,
              quantity: 1,
              total: chickenItem.price
            },
            {
              foodItemId: coffeeItem.id,
              foodName: coffeeItem.name,
              price: coffeeItem.price,
              quantity: 1,
              total: coffeeItem.price
            }
          ]
        }
      }
    });

    await prisma.payment.upsert({
      where: { orderId: order2.id },
      update: {},
      create: {
        orderId: order2.id,
        amount: total2,
        paymentMethod: 'UPI_QR',
        status: 'VERIFICATION_PENDING',
        transactionRef: 'UPI-REF-891230192841',
        notes: 'Customer submitted payment confirmation via UPI'
      }
    });

    await prisma.notification.create({
      data: {
        type: 'PAYMENT_PROOF',
        title: 'UPI Payment Verification Required',
        message: `Order #${orderNum2} (Table ${table3.tableNumber}) submitted UPI verification for ₹${total2}.`,
        link: `/admin/orders?order=${order2.id}`,
        orderId: order2.id
      }
    });
  }

  // 8. Website Content (CMS)
  const defaultCms = [
    {
      section: 'HERO',
      key: 'hero_title',
      label: 'Homepage Hero Title',
      value: 'Savor Every Moment at Zan Cafe'
    },
    {
      section: 'HERO',
      key: 'hero_subtitle',
      label: 'Homepage Hero Subtitle',
      value: 'Artisanal single-origin brews, gourmet brioche burgers, wood-fired pizzas, and authentic Melapalayam flavors crafted with passion.'
    },
    {
      section: 'ABOUT',
      key: 'about_story',
      label: 'Our Story & Philosophy',
      value: 'Nestled in Naniyar Nagar, Melapalayam, Tirunelveli, Zan Cafe is where culinary artistry meets warm southern hospitality. Rated 4.7 stars by our cherished guests, we specialize in handcrafted gourmet burgers, wood-fired pizzas, signature chillers, and specialty espresso coffees.'
    },
    {
      section: 'ABOUT',
      key: 'about_tagline',
      label: 'About Tagline',
      value: 'Melapalayam\'s Premier Gastronomic Sanctuary'
    },
    {
      section: 'PROMO',
      key: 'promo_headline',
      label: 'Promotional Banner Headline',
      value: 'Special Chef\'s Tasting Platter & Duo Combos'
    },
    {
      section: 'PROMO',
      key: 'promo_text',
      label: 'Promotional Banner Text',
      value: 'Get complimentary signature mojito with any 2 Gourmet Burgers on weekdays from 3:00 PM to 6:00 PM.'
    },
    {
      section: 'CONTACT',
      key: 'contact_address',
      label: 'Restaurant Physical Address',
      value: '36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005'
    },
    {
      section: 'CONTACT',
      key: 'contact_phone',
      label: 'Contact Phone Number',
      value: '063693 13196'
    },
    {
      section: 'TIMINGS',
      key: 'operating_hours',
      label: 'Opening & Closing Timings',
      value: 'Open Everyday: 11:30 AM - 11:30 PM (Kitchen closes 11:00 PM)'
    }
  ];

  for (const c of defaultCms) {
    await prisma.websiteContent.upsert({
      where: { key: c.key },
      update: {},
      create: {
        section: c.section,
        key: c.key,
        label: c.label,
        value: c.value
      }
    });
  }

  console.log('Zan Cafe database seeded successfully with tables, users, menu, and initial orders!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

