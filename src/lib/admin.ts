/** Comma-separated admin emails in NEXT_PUBLIC_ADMIN_EMAILS */
export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  // Fallback for local/dev if env not set: allow the primary project owner email
  if (list.length === 0) {
    return email.trim().toLowerCase() === 'hiyabteklu720@gmail.com';
  }
  return list.includes(email.trim().toLowerCase());
}
