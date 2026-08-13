const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Humanizes an assignment/task due date relative to today — "Due today",
 * "Due tomorrow", "Overdue by N days" — falling back to a plain date once
 * it's more than a week out either way.
 */
export function formatDueLabel(dueDateIso: string): string {
  const due = new Date(dueDateIso);
  const diffDays = Math.round(
    (startOfDay(due).getTime() - startOfDay(new Date()).getTime()) / DAY_MS,
  );

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays === -1) return 'Overdue by 1 day';
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return `Due ${due.toLocaleDateString()}`;
}

/**
 * Humanizes a timestamp relative to now — "Just now", "5 minutes ago",
 * "2 hours ago", "Yesterday", "3 days ago" — falling back to a plain date
 * past a week.
 */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}
