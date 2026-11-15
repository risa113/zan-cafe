const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================");
  console.log("STARTING FULL END-TO-END VERIFICATION: ZAN CAFE");
  console.log("==================================================");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedCount++;
    }
  }

  // --- TEST 1: Scan table QR -> Register Customer -> Open Menu ---
  console.log("\n--- TEST 1: Scan Table QR -> Register Customer -> Open Menu ---");
  const regRes = await fetch(`${BASE_URL}/api/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Bilal Ahmed",
      phone: "9840112233",
      email: "bilal.ahmed@gmail.com",
      tableNumber: "T-02",
    }),
  });
  const regData = await regRes.json();
  assert(regData.success === true, "Customer registration successful");
  assert(regData.customer.name === "Bilal Ahmed", "Customer name stored correctly");
  assert(regData.customer.phone === "9840112233", "Customer phone stored correctly");

  // --- TEST 2: Select Food -> Add to Cart -> Calculate Totals ---
  console.log("\n--- TEST 2: Select Food -> Add to Cart -> Verify Availability ---");
  const menuRes = await fetch(`${BASE_URL}/api/menu`);
  const menuData = await menuRes.json();
  assert(menuData.success === true, "Public menu API returned successfully");
  assert(menuData.allItems.length > 5, `Menu contains ${menuData.allItems.length} active dishes`);

  const burgerItem = menuData.allItems.find((i) => i.name.includes("Burger"));
  const drinkItem = menuData.allItems.find((i) => i.name.includes("Latte") || i.name.includes("Sparkler"));
  assert(!!burgerItem, `Found item: ${burgerItem?.name} (Price: ₹${burgerItem?.price})`);
  assert(!!drinkItem, `Found item: ${drinkItem?.name} (Price: ₹${drinkItem?.price})`);

  // --- TEST 3: Checkout -> Generate Order -> Display UPI QR ---
  console.log("\n--- TEST 3: Checkout -> Generate Order -> UPI QR ---");
  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tableNumber: "T-02",
      customerName: "Bilal Ahmed",
      customerPhone: "9840112233",
      customerEmail: "bilal.ahmed@gmail.com",
      customerNotes: "Please make burger extra crisp and less ice in beverage.",
      items: [
        { foodItemId: burgerItem.id, quantity: 2 },
        { foodItemId: drinkItem.id, quantity: 1 },
      ],
    }),
  });
  const orderData = await orderRes.json();
  assert(orderData.success === true, "Order placed successfully on server");
  assert(!!orderData.order.orderNumber, `Generated Order #${orderData.order.orderNumber}`);
  assert(orderData.order.grandTotal > 0, `Server-calculated grand total: ₹${orderData.order.grandTotal}`);
  assert(orderData.order.paymentStatus === "PENDING", "Payment status initialized to PENDING");
  assert(orderData.upiPayment.upiId === "zancafe@upi", "Configured UPI receiver ID is zancafe@upi");

  const orderNumber = orderData.order.orderNumber;
  const orderId = orderData.order.id;

  // --- TEST 4: Customer submits payment confirmation ---
  console.log("\n--- TEST 4: Customer Submits Payment Confirmation ---");
  const payConfirmRes = await fetch(`${BASE_URL}/api/orders/${orderNumber}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentUtr: "UPI-REF-998877665544",
      paymentNotes: "Paid via Google Pay to Zan Cafe UPI QR",
    }),
  });
  const payConfirmData = await payConfirmRes.json();
  assert(payConfirmData.success === true, "Payment confirmation received by server");
  assert(payConfirmData.order.paymentStatus === "VERIFICATION_PENDING", "Order marked VERIFICATION_PENDING (not blindly marked PAID)");

  // --- TEST 5: Admin Login & Verifies Payment -> Accepts Order ---
  console.log("\n--- TEST 5: Admin Login -> Verifies Payment -> Accepts Order ---");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "owner@zancafe.in",
      password: "owner123",
    }),
  });
  const loginData = await loginRes.json();
  assert(loginData.success === true, `Admin authenticated as: ${loginData.user.name} (${loginData.user.role})`);

  // Extract auth cookie
  const cookieHeader = loginRes.headers.get("set-cookie");
  assert(!!cookieHeader, "JWT Session cookie issued to admin");

  // Admin verifies payment
  const verifyRes = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      action: "VERIFY_PAYMENT",
    }),
  });
  const verifyData = await verifyRes.json();
  assert(verifyData.success === true, "Payment verified by Admin");
  assert(verifyData.order.paymentStatus === "PAID", "Order paymentStatus updated to PAID");
  assert(verifyData.order.status === "ORDER_ACCEPTED", "Order status advanced to ORDER_ACCEPTED");

  // --- TEST 6: Kitchen Updates Order -> Customer sees 'ORDER_READY' ---
  console.log("\n--- TEST 6: Kitchen Progression -> Customer Live Tracking ---");
  // Mark PREPARING
  await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ status: "PREPARING" }),
  });
  // Mark ORDER_READY
  await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ status: "ORDER_READY" }),
  });

  // Verify on customer tracking endpoint
  const trackRes = await fetch(`${BASE_URL}/api/orders/${orderNumber}`);
  const trackData = await trackRes.json();
  assert(trackData.success === true, "Tracking endpoint returned order");
  assert(trackData.order.status === "ORDER_READY", "Customer tracker confirms status is ORDER_READY");

  // --- TEST 7: Order Automatically Appears in Billing Software ---
  console.log("\n--- TEST 7: Order Automatically Synchronized into Billing ---");
  const billingRes = await fetch(`${BASE_URL}/api/admin/billing`, {
    headers: { Cookie: cookieHeader },
  });
  const billingData = await billingRes.json();
  assert(billingData.success === true, "Billing API accessible");
  const generatedInvoice = billingData.invoices.find((inv) => inv.orderId === orderId);
  assert(!!generatedInvoice, `Invoice automatically generated: ${generatedInvoice?.invoiceNumber}`);
  assert(generatedInvoice?.grandTotal === orderData.order.grandTotal, `Invoice amount matches order: ₹${generatedInvoice?.grandTotal}`);
  assert(generatedInvoice?.tableNumber === "T-02", `Invoice table matched Table T-02`);

  // --- TEST 8: Customer Information Stored in CRM Database ---
  console.log("\n--- TEST 8: Customer Information in CRM Database ---");
  const customerRes = await fetch(`${BASE_URL}/api/admin/customers?search=Bilal`, {
    headers: { Cookie: cookieHeader },
  });
  const customerList = await customerRes.json();
  assert(customerList.success === true, "Customer CRM API returned");
  const foundCustomer = customerList.customers.find((c) => c.phone === "9840112233");
  assert(!!foundCustomer, `Customer found in CRM: ${foundCustomer?.name}`);
  assert(foundCustomer?.totalSpend > 0, `Customer lifetime spend updated to: ₹${foundCustomer?.totalSpend}`);

  // --- TEST 9: Repeat Customer Visits -> Order History Retained ---
  console.log("\n--- TEST 9: Repeat Customer Visits -> Order History Retained ---");
  const repeatRes = await fetch(`${BASE_URL}/api/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Bilal Ahmed",
      phone: "9840112233",
      tableNumber: "T-05",
    }),
  });
  const repeatData = await repeatRes.json();
  assert(repeatData.success === true, "Repeat customer registered again");
  assert(repeatData.isReturning === true, "System recognized customer as returning guest");
  assert(repeatData.customer.totalVisits >= 2, `Total visit count incremented to ${repeatData.customer.totalVisits}`);

  // Customer order history lookup
  const historyRes = await fetch(`${BASE_URL}/api/customer/orders?phone=9840112233`);
  const historyData = await historyRes.json();
  assert(historyData.success === true, "Customer order history lookup successful");
  assert(historyData.orders.some((o) => o.orderNumber === orderNumber), "Previous order is present in history");

  // --- TEST 10: Admin Sales Reports & Analytics ---
  console.log("\n--- TEST 10: Admin Sales Reports & Analytics ---");
  const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics?range=30days`, {
    headers: { Cookie: cookieHeader },
  });
  const analyticsData = await analyticsRes.json();
  assert(analyticsData.success === true, "Analytics generated from real DB records");
  assert(analyticsData.summary.totalRevenue > 0, `Total DB revenue: ₹${analyticsData.summary.totalRevenue}`);
  assert(analyticsData.bestSellers.length > 0, `Bestsellers list populated with ${analyticsData.bestSellers.length} items`);

  // --- TEST 11: Admin Changes Food Price -> Customer Website Updates ---
  console.log("\n--- TEST 11: Admin Changes Food Price -> Realtime Menu Update ---");
  const newPrice = 285;
  const updateItemRes = await fetch(`${BASE_URL}/api/admin/menu`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      id: burgerItem.id,
      price: newPrice,
    }),
  });
  const updateItemData = await updateItemRes.json();
  assert(updateItemData.success === true, `Admin updated burger price to ₹${newPrice}`);

  // Fetch public menu to verify reflection
  const publicMenuAfter = await fetch(`${BASE_URL}/api/menu`);
  const publicMenuAfterData = await publicMenuAfter.json();
  const updatedBurger = publicMenuAfterData.allItems.find((i) => i.id === burgerItem.id);
  assert(updatedBurger?.price === newPrice, `Public menu reflects updated price ₹${updatedBurger?.price}`);

  // --- TEST 12: Admin Edits CMS Content -> Customer Website Reflects ---
  console.log("\n--- TEST 12: Admin Edits CMS Content -> Live Website Update ---");
  const newHeroTitle = "Experience the Royal Flavors of Zan Cafe Melapalayam";
  const cmsRes = await fetch(`${BASE_URL}/api/admin/cms`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      key: "hero_title",
      value: newHeroTitle,
    }),
  });
  const cmsData = await cmsRes.json();
  assert(cmsData.success === true, "Admin updated hero title in CMS");

  // Check public settings/CMS endpoint
  const publicSettings = await fetch(`${BASE_URL}/api/settings`);
  const publicSettingsData = await publicSettings.json();
  assert(publicSettingsData.cms.hero_title === newHeroTitle, `Customer website now serves: "${publicSettingsData.cms.hero_title}"`);

  console.log("\n==================================================");
  console.log(`TEST SUITE RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});

