import type { Router } from "vue-router";

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

/**
 * Helper function to create main domain redirect for session synchronization
 *
 * @param targetPath The path to redirect to after synchronization
 * @param mainDomain The main domain
 * @returns The URL for session synchronization
 */
export const createSessionSyncUrl = (
  targetPath: string,
  mainDomain: string,
) => {
  const _mainDomain = mainDomain.startsWith("localhost")
    ? `http://${mainDomain}`
    : `https://${mainDomain}`;

  return `${_mainDomain}/sync-session?redirect=${encodeURIComponent(
    targetPath,
  )}`;
};

/**
 * Helper function to create auth redirect URL
 *
 * @param redirectPath The path to redirect to after login
 * @param authDomain The auth domain
 * @returns The URL for auth redirect
 */
export const createAuthRedirectUrl = (
  redirectPath: string,
  authDomain: string,
) => {
  const origin = window.location.origin;
  const protocol = authDomain.startsWith("localhost") ? "http://" : "https://";
  return `${protocol}${authDomain}/login?redirect=${encodeURIComponent(
    origin + redirectPath,
  )}`;
};
