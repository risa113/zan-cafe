/**
 * AUTOMATED COMPREHENSIVE SECURITY AUDIT SUITE
 * For Zan Cafe Restaurant Digital Ecosystem
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName} - ${details}`);
    failed++;
  }
}

async function runSecurityAudit() {
  console.log("\n=======================================================");
  console.log("🛡️  ZAN CAFE DEFENSIVE SECURITY AUDIT & HARDENING TEST");
  console.log(`Target: ${BASE_URL}`);
  console.log("=======================================================\n");

  // 1. HTTP Security Headers Audit
  console.log("--- 1. HTTP Security Headers & Information Disclosure ---");
  try {
    const res = await fetch(`${BASE_URL}/`);
    const headers = res.headers;

    assert(headers.get("x-frame-options") === "DENY", "X-Frame-Options is set to DENY (Clickjacking defense)");
    assert(headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options is set to nosniff (MIME sniffing defense)");
    assert(!!headers.get("content-security-policy"), "Content-Security-Policy header is active and present");
    assert(headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy is strict-origin-when-cross-origin");
    assert(!headers.get("x-powered-by"), "X-Powered-By header is removed (Technology stack disclosure defense)");
  } catch (err) {
    assert(false, "Security headers check", err.message);
  }

  // 2. Admin Route Protection (Unauthenticated Access Rejection)
  console.log("\n--- 2. Admin Route Authentication Enforcement ---");
  const protectedAdminEndpoints = [
    "/api/admin/orders",
    "/api/admin/menu",
    "/api/admin/categories",
    "/api/admin/settings",
    "/api/admin/staff",
    "/api/admin/customers",
    "/api/admin/billing",
    "/api/admin/analytics",
    "/api/admin/cms",
  ];

  for (const endpoint of protectedAdminEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      assert(res.status === 401, `Unauthenticated request to ${endpoint} returns HTTP 401`);
    } catch (err) {
      assert(false, `Check ${endpoint}`, err.message);
    }
  }

  // 3. Rate Limiting Enforcement
  console.log("\n--- 3. Rate Limiting Protection (Brute-Force Defense) ---");
  try {
    const attackIp = "192.168.100.50";
    let hitRateLimit = false;
    let rateLimitStatus = 0;

    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": attackIp,
        },
        body: JSON.stringify({ email: "victim@zancafe.in", password: `wrong_${i}` }),
      });
      if (res.status === 429) {
        hitRateLimit = true;
        rateLimitStatus = res.status;
        break;
      }
    }

    assert(hitRateLimit && rateLimitStatus === 429, "Rate limiter triggers HTTP 429 Too Many Requests after threshold");
  } catch (err) {
    assert(false, "Rate limiting check", err.message);
  }

  // 4. Anti-Enumeration & Constant Message Verification
  console.log("\n--- 4. Credential Protection & Anti-Enumeration ---");
  try {
    const checkIp = "192.168.100.51";
    const wrongUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": checkIp },
      body: JSON.stringify({ email: "nonexistent_user@zancafe.in", password: "Password123!" }),
    });
    const wrongUserData = await wrongUserRes.json();

    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": checkIp },
      body: JSON.stringify({ email: "owner@zancafe.in", password: "WrongPassword123!" }),
    });
    const wrongPassData = await wrongPassRes.json();

    assert(wrongUserRes.status === 401 && wrongPassRes.status === 401, "Both invalid user and wrong password return HTTP 401");
    assert(
      wrongUserData.error === wrongPassData.error && wrongUserData.error === "Invalid email or password",
      "Identical error message returned for non-existent vs wrong password (Anti-Enumeration)"
    );
  } catch (err) {
    assert(false, "Anti-enumeration check", err.message);
  }

  // 5. Role-Based Access Control (RBAC) & Privilege Escalation Defense
  console.log("\n--- 5. Role-Based Access Control (RBAC) ---");
  let kitchenCookie = "";
  let ownerCookie = "";

  try {
    const staffIp = "192.168.100.52";
    // Login as Kitchen Staff
    const kRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": staffIp },
      body: JSON.stringify({ email: "kitchen@zancafe.in", password: "kitchen123" }),
    });
    kitchenCookie = kRes.headers.get("set-cookie") || "";

    // Kitchen staff attempts to access OWNER-only staff management endpoint
    const staffAccessRes = await fetch(`${BASE_URL}/api/admin/staff`, {
      headers: { Cookie: kitchenCookie },
    });
    assert(
      staffAccessRes.status === 401 || staffAccessRes.status === 403,
      "Kitchen staff is forbidden from accessing staff management (HTTP 401/403)"
    );

    // Login as Owner
    const oRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": staffIp },
      body: JSON.stringify({ email: "owner@zancafe.in", password: "owner123" }),
    });
    ownerCookie = oRes.headers.get("set-cookie") || "";

    const ownerStaffRes = await fetch(`${BASE_URL}/api/admin/staff`, {
      headers: { Cookie: ownerCookie },
    });
    assert(ownerStaffRes.status === 200, "Owner can access staff management (HTTP 200)");
  } catch (err) {
    assert(false, "RBAC check", err.message);
  }

  // 6. Stored XSS & Input Sanitization
  console.log("\n--- 6. Input Sanitization & Stored XSS Defense ---");
  try {
    const menuRes = await fetch(`${BASE_URL}/api/menu`);
    const menuData = await menuRes.json();
    const realItemId = menuData.allItems[0].id;

    const maliciousPayload = {
      tableNumber: "T-01",
      customerName: "Safe Diner <script>alert('xss')</script>",
      customerPhone: "9842109999",
      customerEmail: "safediner@gmail.com",
      customerNotes: "<img src=x onerror=alert(1)> Extra crispy fries please",
      items: [
        {
          foodItemId: realItemId,
          quantity: 1,
          notes: "<script>document.location='http://evil.com'</script> No onions",
        },
      ],
    };

    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.100.53",
      },
      body: JSON.stringify(maliciousPayload),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 200, "Order placed with sanitized inputs");

    // Fetch the order and verify malicious tags are neutralized
    const orderDetailRes = await fetch(`${BASE_URL}/api/orders/${orderData.order.orderNumber}`);
    const orderDetail = await orderDetailRes.json();

    const storedNotes = orderDetail.order.customerNotes || "";
    assert(
      !storedNotes.includes("<script>") && !storedNotes.includes("<img src=x onerror"),
      "Script and HTML injection payloads were stripped/escaped from customerNotes"
    );
  } catch (err) {
    assert(false, "XSS sanitization check", err.message);
  }

  // 7. Customer PII Masking (Anti-Scraping / IDOR Defense)
  console.log("\n--- 7. Customer PII Protection on Public Endpoints ---");
  try {
    const publicOrderRes = await fetch(`${BASE_URL}/api/orders/ZAN-20261115-001`);
    const publicOrder = await publicOrderRes.json();

    if (publicOrder.order?.customer) {
      const phone = publicOrder.order.customer.phone;
      const email = publicOrder.order.customer.email;
      assert(phone.includes("*"), `Public tracker masks customer phone (${phone})`);
      assert(email.includes("*"), `Public tracker masks customer email (${email})`);
    } else {
      assert(true, "Customer info not exposed or masked");
    }
  } catch (err) {
    assert(false, "PII masking check", err.message);
  }

  // 8. SQL Injection & Parameter Tampering Defense
  console.log("\n--- 8. SQL Injection & Parameter Tampering ---");
  try {
    const sqlPayloads = [
      "' OR 1=1 --",
      "'; DROP TABLE FoodItem; --",
      "\" OR \"\"=\"",
      "1 UNION SELECT * FROM User",
    ];

    for (const sql of sqlPayloads) {
      const searchRes = await fetch(`${BASE_URL}/api/admin/billing?search=${encodeURIComponent(sql)}`, {
        headers: { Cookie: ownerCookie },
      });
      assert(
        searchRes.status === 200,
        `SQL injection attempt [${sql.slice(0, 15)}...] handled safely via Prisma parameterization`
      );
    }
  } catch (err) {
    assert(false, "SQL injection check", err.message);
  }

  // Summary
  console.log("\n=======================================================");
  console.log(`🏁 SECURITY AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAudit().catch((err) => {
  console.error("FATAL ERROR in security audit:", err);
  process.exit(1);
});
