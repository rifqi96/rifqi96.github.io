import { createClient, type Session } from "@supabase/supabase-js";

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.supabaseUrl;
  const supabaseKey = config.public.supabaseKey;

  // Use Nuxt's cookie composable for cross-domain support
  const authCookie = useCookie("sb-auth", {
    // Cookie will be valid for all subdomains
    domain: config.public.cookieDomain,
    // Secure in production, not in localhost
    secure: config.public.cookieSecure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    // Don't make it httpOnly so client JS can access it
    httpOnly: false,
    // Custom encode/decode to handle JSON
    encode: (value) => JSON.stringify(value),
    decode: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },
  });

  // Create Supabase client with minimal config first
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "sb-auth",
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  });

  // Function to sync session to cookie
  const syncSessionToCookie = (session?: Session | null) => {
    if (import.meta.server) {
      // Server-side: only handle cookie
      if (session) {
        authCookie.value = session;
      } else {
        authCookie.value = null;
      }
      return;
    }

    // Client-side: handle both cookie and localStorage
    if (session) {
      try {
        authCookie.value = session;
        window?.localStorage?.setItem("sb-auth", JSON.stringify(session));

        const redirectPath = window?.localStorage?.getItem("auth_redirect");
        if (redirectPath) {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith("/auth/")) {
            window.location.replace(redirectPath);
            window?.localStorage?.removeItem("auth_redirect");
          }
        }
      } catch (error) {
        console.error("Error syncing session:", error);
        window?.localStorage?.removeItem("auth_redirect");
      }
    } else {
      authCookie.value = null;
      window?.localStorage?.removeItem("sb-auth");
    }
  };

  // Initial session sync and redirect check
  if (import.meta.client) {
    try {
      const localSession = window?.localStorage?.getItem("sb-auth");
      const cookieSession = authCookie.value;

      let session = null;
      if (localSession) {
        session = JSON.parse(localSession);
      } else if (cookieSession) {
        session = cookieSession;
        window?.localStorage?.setItem("sb-auth", JSON.stringify(cookieSession));
      }

      if (session) {
        syncSessionToCookie(session);
      }
    } catch (error) {
      console.error("Error parsing session:", error);
      authCookie.value = null;
      window?.localStorage?.removeItem("sb-auth");
      window?.localStorage?.removeItem("auth_redirect");
    }
  }

  // Set up event listener for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event, session?.user?.email);
    syncSessionToCookie(session);
  });

  // Make supabase available in composables
  nuxtApp.provide("supabase", supabase);
});
