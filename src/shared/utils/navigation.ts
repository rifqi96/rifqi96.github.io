import { Router } from "vue-router";

/**
 * Check if a URL is internal (starts with '/')
 *
 * @param url The URL to check
 * @returns true if the URL is an internal link
 */
export const isInternalLink = (url: string): boolean => {
  return url.startsWith("/") && !url.startsWith("//");
};

/**
 * Handle navigation links
 * Use Vue Router for internal links and default behavior for external links
 *
 * @param link The link URL to navigate to
 * @param event The click event
 * @param router The Vue Router instance
 */
export const handleLinkNavigation = (
  link: string,
  event: Event,
  router: Router,
): void => {
  if (isInternalLink(link)) {
    event.preventDefault();
    router.push(link);
  }
  // External links will proceed normally with default <a> behavior
};
