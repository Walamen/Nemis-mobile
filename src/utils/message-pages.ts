/** The server's largest page size for a conversation's messages. */
export const MESSAGES_PAGE_SIZE = 50;

/** At most this many pages (500 messages) of a thread are loaded. */
export const MESSAGES_MAX_PAGES = 10;

/**
 * Which pages of a conversation to load, given what page 1 reported.
 *
 * The server returns a thread oldest-first, a page at a time — so loading
 * only page 1 showed a long conversation's *first* messages and never its
 * newest ones (including a message just sent). This picks the newest pages,
 * up to `maxPages`, and says whether page 1 (already fetched) is among them.
 * Pages are 1-based and returned in ascending order.
 */
export function planMessagePages(
  totalPages: number,
  maxPages: number = MESSAGES_MAX_PAGES,
): { keepFirstPage: boolean; extraPages: number[] } {
  if (totalPages <= 1) return { keepFirstPage: true, extraPages: [] };
  const firstWanted = Math.max(1, totalPages - maxPages + 1);
  const extraPages: number[] = [];
  for (let page = Math.max(2, firstWanted); page <= totalPages; page++) extraPages.push(page);
  return { keepFirstPage: firstWanted === 1, extraPages };
}
