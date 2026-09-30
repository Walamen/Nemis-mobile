import * as WebBrowser from 'expo-web-browser';

/**
 * Opens a teacher-provided http(s) URL (resource link, assignment
 * attachment) in the in-app browser. Returns `false` — for the caller to
 * surface — when the URL is missing, isn't http(s), or couldn't be opened.
 */
export async function openExternalUrl(url: string | null | undefined): Promise<boolean> {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  try {
    await WebBrowser.openBrowserAsync(url);
    return true;
  } catch {
    return false;
  }
}
