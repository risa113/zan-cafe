/**
 * Input sanitization, anti-XSS, and PII masking security module.
 */

/**
 * Escapes HTML characters to prevent Stored & Reflected Cross-Site Scripting (XSS).
 */
export function escapeHtml(input: string): string {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips dangerous executable script tags, event handlers, and javascript: protocols.
 */
export function stripDangerousMarkup(input: string): string {
  if (!input) return "";
  return String(input)
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, "")
    .replace(/<\s*object[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi, "")
    .replace(/<\s*embed[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

/**
 * Full sanitization for user-submitted text (customer names, notes, addresses).
 */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  const cleaned = stripDangerousMarkup(input);
  return escapeHtml(cleaned).slice(0, maxLength).trim();
}

/**
 * Masks phone numbers to protect Customer PII against scrapers and shoulder-surfing.
 * Example: "9842100001" -> "******0001"
 */
export function maskPhone(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length <= 4) return clean;
  return "*".repeat(clean.length - 4) + clean.slice(-4);
}

/**
 * Masks email addresses to protect Customer PII.
 * Example: "ahmed.customer@gmail.com" -> "a***r@gmail.com"
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "";
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

