/** Ethiopian local mobile: 09xxxxxxxx or 07xxxxxxxx (exactly 10 digits) */
export function isValidEtPhone(raw: string): boolean {
  const digits = raw.replace(/\s+/g, '').replace(/[-()]/g, '');
  // Local format
  if (/^0[97]\d{8}$/.test(digits)) return true;
  // +2519 / +2517 / 2519 / 2517
  if (/^(\+?251)[97]\d{8}$/.test(digits)) return true;
  return false;
}

export function phoneHint(raw: string): string | null {
  const t = raw.trim();
  if (!t) return 'Phone / WhatsApp is required (e.g. 09xxxxxxxx or 07xxxxxxxx).';
  if (!isValidEtPhone(t)) {
    return 'Phone must start with 09 or 07 and be 10 digits total (e.g. 0912345678), or +2519… / +2517…';
  }
  return null;
}

export function isValidEmail(raw: string): boolean {
  const t = raw.trim();
  // Practical email check (not overly strict RFC)
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(t);
}

export function emailHint(raw: string): string | null {
  const t = raw.trim();
  if (!t) return 'Email is required (e.g. name@gmail.com).';
  if (!isValidEmail(t)) return 'Enter a valid email like name@gmail.com';
  return null;
}

/** Contact field may be phone OR email */
export function contactHint(raw: string): string | null {
  const t = raw.trim();
  if (!t) return 'Add a contact email or phone (09/07… or name@gmail.com).';
  if (t.includes('@')) return emailHint(t);
  return phoneHint(t);
}

export function requiredText(raw: string, label: string, min = 3): string | null {
  const t = raw.trim();
  if (!t) return `${label} is required.`;
  if (t.length < min) return `${label} is too short (min ${min} characters).`;
  return null;
}

export function quantityHint(raw: string): string | null {
  const t = raw.trim();
  if (!t) return 'Quantity is required.';
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
    return 'Quantity must be a whole number greater than 0.';
  }
  if (n > 10000) return 'Quantity looks too large. Please check.';
  return null;
}
