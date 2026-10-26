/** Friendly names for the staff roles a student or parent can message. */
const ROLE_LABELS: Record<string, string> = {
  TEACHER: 'Teacher',
  INSTITUTION_ADMIN: 'School administrator',
};

/**
 * Label for a conversation counterpart's or recipient's role. Known staff
 * roles get a friendly name; anything else is title-cased
 * (`COUNTY_ADMIN` → "County admin") rather than shown raw.
 */
export function messagingRoleLabel(role: string): string {
  const known = ROLE_LABELS[role];
  if (known) return known;
  const words = role.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
