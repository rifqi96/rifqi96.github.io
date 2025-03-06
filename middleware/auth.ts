import { UserRole } from "@/types/User";
import { useAuth } from "@/domains/auth/composables/useAuth";
import { supabaseAuth } from "@/domains/auth/services/supabase.service";
import type { H3Event } from "h3";

// Helper function to check session existence
const hasValidSession = () => {
  // Check both localStorage and cookie
  const localSession = localStorage.getItem("sb-auth");
  const authCookie = useCookie("sb-auth");

  return !!(localSession || authCookie.value);
};

// Add redirect loop prevention
const MAX_REDIRECTS = 3;
const redirectKey = "auth_redirect_count";
const getRedirectCount = () =>
  parseInt(sessionStorage.getItem(redirectKey) || "0", 10);
const incrementRedirectCount = () => {
  const count = getRedirectCount() + 1;
  sessionStorage.setItem(redirectKey, count.toString());
  return count;
};
const resetRedirectCount = () => sessionStorage.removeItem(redirectKey);

// Helper function to validate session with Supabase
const validateSession = async () => {
  try {
    const { data, error } = await supabaseAuth.getSession();
    if (error || !data?.session) {
      // Session is invalid, clear auth state
      localStorage.removeItem("sb-auth");
      const authCookie = useCookie("sb-auth");
      authCookie.value = null;
      return false;
    }
    return true;
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
};

// Middleware to check if user is authenticated
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware if we're already in auth pages
  if (to.path.startsWith("/auth/")) {
    resetRedirectCount(); // Reset counter on auth pages
    return;
  }

  const { checkAccess, initAuth } = useAuth();
  const config = useRuntimeConfig();
  const requiredRole = to.meta.role as UserRole;
  const requireWhitelist = to.meta.requireWhitelist as boolean;

  // For SSR, we need to handle auth check differently
  if (import.meta.server) {
    // Skip auth check on SSR - we'll handle it on client side
    return;
  }

  // Debug logging
  console.log("Auth middleware running", {
    hasLocalStorage: !!localStorage.getItem("sb-auth"),
    hasCookie: !!useCookie("sb-auth").value,
    hostname: window.location.hostname,
    path: to.fullPath,
    redirectCount: getRedirectCount(),
  });

  // Check for redirect loop
  if (getRedirectCount() >= MAX_REDIRECTS) {
    console.error(
      "Detected redirect loop, clearing auth state and redirecting to login",
    );
    localStorage.removeItem("sb-auth");
    const authCookie = useCookie("sb-auth");
    authCookie.value = null;
    resetRedirectCount();
    const authDomain = config.public.authDomain;
    window.location.href = createAuthRedirectUrl(to.fullPath, authDomain);
    return;
  }

  // First validate the current session if it exists
  if (hasValidSession()) {
    const isValid = await validateSession();
    if (!isValid) {
      // Session is invalid, redirect to login
      incrementRedirectCount();
      await useAuth().signOut();
      return;
    }
  }

  // Check for session data in URL parameters (for cross-domain sync)
  const route = useRoute();
  if (route.query.session) {
    try {
      const sessionData = JSON.parse(
        decodeURIComponent(route.query.session as string),
      );
      localStorage.setItem("sb-auth", JSON.stringify(sessionData));
      const authCookie = useCookie("sb-auth");
      authCookie.value = sessionData;

      // Initialize auth state with new session
      await initAuth();
      resetRedirectCount(); // Reset counter after successful sync

      // Clean up the URL
      const { pathname, search, hash } = window.location;
      const newSearch = search
        .replace(/[?&]session=[^&]+/, "")
        .replace(/^&/, "?");
      const newUrl = pathname + newSearch + hash;
      window.history.replaceState({}, "", newUrl);
    } catch (error) {
      console.error("Error processing session data from URL:", error);
      incrementRedirectCount();
    }
  }

  // For client-side navigation
  try {
    // First check if we have a session in storage
    if (!hasValidSession()) {
      // No session at all, try to sync from main domain if on subdomain
      if (
        window.location.hostname !== config.public.mainDomain &&
        !route.query.session
      ) {
        incrementRedirectCount();
        const currentUrl = window.location.href;
        // Store intended path before cross-domain sync
        localStorage.setItem("auth_redirect", to.fullPath);

        const mainDomain = config.public.mainDomain;
        window.location.href = createSessionSyncUrl(currentUrl, mainDomain);
        return;
      }

      // If we're on main domain or sync attempt failed, go to login
      // Store intended path before redirect
      localStorage.setItem("auth_redirect", to.fullPath);

      incrementRedirectCount();
      const authDomain = config.public.authDomain;
      window.location.href = createAuthRedirectUrl(to.fullPath, authDomain);
      return;
    }

    // We have a session, validate access
    const result = await checkAccess(requiredRole, requireWhitelist);
    if (!result) {
      // Access denied with existing session
      localStorage.removeItem("auth_redirect");
      resetRedirectCount(); // Reset counter on access denied
      const authDomain = config.public.authDomain.startsWith("localhost")
        ? `http://${config.public.authDomain}`
        : config.public.authDomain;
      window.location.href = `${authDomain}/not-authorized`;
      return;
    }

    // Success - reset redirect counter
    resetRedirectCount();
  } catch (error) {
    console.error("Auth middleware error:", error);
    localStorage.removeItem("auth_redirect"); // Clear on error
    incrementRedirectCount();
    const authDomain = config.public.authDomain.startsWith("localhost")
      ? `http://${config.public.authDomain}`
      : config.public.authDomain;
    window.location.href = `${authDomain}/login`;
    return;
  }
});
