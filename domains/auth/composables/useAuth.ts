import {
  supabaseAuth,
  supabaseWhitelist,
  useSupabaseClient,
} from "../services/supabase";
import type { AuthOptions, AuthState, UserProfile } from "../types";
import { UserRole } from "../types";

export function useAuth() {
  // Create a reactive auth state
  const authState = useState<AuthState>("auth", () => ({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  }));

  const config = useRuntimeConfig();
  const mainDomain = config.public.mainDomain;
  const authDomain = config.public.authDomain;
  const consoleDomain = config.public.consoleDomain;

  // Check if the user is authenticated
  const isAuthenticated = computed(() => authState.value.isAuthenticated);

  // Check if the user has a specific role
  const hasRole = (role: UserRole) => {
    return authState.value.user?.role === role;
  };

  // Check if the user is a superadmin
  const isSuperAdmin = computed(() => hasRole(UserRole.SUPERADMIN));

  // Check if the user is whitelisted
  const isWhitelisted = ref(false);

  // Check whitelist status from the whitelist table
  const checkWhitelistStatus = async () => {
    if (!authState.value.user) return false;

    try {
      const result = await supabaseWhitelist.isWhitelisted(
        authState.value.user.email,
      );
      isWhitelisted.value = result;
      return result;
    } catch (error) {
      console.error("Error checking whitelist status:", error);
      return false;
    }
  };

  // Initialize auth state
  const initAuth = async () => {
    authState.value.loading = true;
    authState.value.error = null;

    console.group("🔐 InitAuth");
    try {
      // Check both localStorage and cookie for session
      const localSession = localStorage.getItem("sb-auth");
      const authCookie = useCookie("sb-auth");

      console.log("Initial session state:", {
        hasLocalStorage: !!localSession,
        hasCookie: !!authCookie.value,
      });

      // If we have a cookie but no localStorage, sync it
      if (!localSession && authCookie.value) {
        console.log("Syncing from cookie to localStorage");
        localStorage.setItem("sb-auth", JSON.stringify(authCookie.value));
      }
      // If we have localStorage but no cookie, sync it
      else if (localSession && !authCookie.value) {
        console.log("Syncing from localStorage to cookie");
        authCookie.value = JSON.parse(localSession);
      }

      // Initialize Supabase client with session if we have it
      if (localSession) {
        try {
          const sessionData = JSON.parse(localSession);
          // Set the session directly on the Supabase client
          const supabase = useSupabaseClient();
          await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token,
          });
          console.log("Set session on Supabase client");
        } catch (error) {
          console.error("Failed to set session:", error);
        }
      }

      console.log("Getting session from Supabase");
      const { data, error: sessionError } = await supabaseAuth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (data?.session) {
        console.log("Session found, getting profile");
        // User is authenticated, get the profile
        const profile = await supabaseAuth.getUserProfile();

        if (profile) {
          console.log("Profile found:", profile);
          authState.value.user = profile;
          authState.value.isAuthenticated = true;

          // Check if user is in the whitelist
          await checkWhitelistStatus();
        } else {
          console.log("No profile found, signing out");
          // Session exists but no profile, sign out
          await signOut();
        }
      } else {
        // Only clear if we don't have local session data
        if (!localSession) {
          console.log("No session found and no local session, clearing auth");
          // No session
          authState.value.user = null;
          authState.value.isAuthenticated = false;
          isWhitelisted.value = false;

          // Clear both cookie and localStorage
          authCookie.value = null;
          localStorage.removeItem("sb-auth");
        } else {
          console.log(
            "No Supabase session but have local session, retrying auth",
          );
          // We have local session data but Supabase session failed
          // Set authenticated state based on local data
          try {
            const sessionData = JSON.parse(localSession);
            if (sessionData.user) {
              authState.value.user = sessionData.user;
              authState.value.isAuthenticated = true;
              await checkWhitelistStatus();
            }
          } catch (error) {
            console.error("Failed to parse local session:", error);
          }
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Don't clear session data on error, just set error state
      authState.value.error = "Failed to initialize authentication";

      // Try to recover from local session data
      const localSession = localStorage.getItem("sb-auth");
      if (localSession) {
        try {
          const sessionData = JSON.parse(localSession);
          if (sessionData.user) {
            authState.value.user = sessionData.user;
            authState.value.isAuthenticated = true;
            await checkWhitelistStatus();
          }
        } catch (parseError) {
          console.error("Failed to recover from local session:", parseError);
        }
      }
    } finally {
      console.log("Final auth state:", {
        isAuthenticated: authState.value.isAuthenticated,
        hasUser: !!authState.value.user,
        error: authState.value.error,
      });
      console.groupEnd();
      authState.value.loading = false;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (
    options: AuthOptions = { rememberMe: false },
  ) => {
    authState.value.loading = true;
    authState.value.error = null;

    try {
      const { data, error } = await supabaseAuth.signInWithGoogle({
        ...options,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      authState.value.error = error.message || "Failed to sign in with Google";
      return null;
    } finally {
      authState.value.loading = false;
    }
  };

  const handleAuthCallback = async () => {
    authState.value.loading = true;
    authState.value.error = null;

    try {
      // Get the redirect path from localStorage first, then fallback to query params
      let redirectPath = localStorage.getItem("auth_redirect");
      console.log("Initial auth_redirect from localStorage:", redirectPath);

      if (!redirectPath) {
        const route = useRoute();
        redirectPath = (route.query.redirect as string) || "/";
        console.log("Fallback redirect from query params:", redirectPath);
      }

      // Normalize the redirect path
      const normalizedRedirectPath = redirectPath.startsWith("/")
        ? redirectPath
        : `/${redirectPath}`;
      console.log("Normalized redirect path:", normalizedRedirectPath);

      // Clear the auth_redirect from localStorage immediately
      localStorage.removeItem("auth_redirect");

      // Get the hash parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");

      if (!accessToken) {
        throw new Error("No access token found in URL");
      }

      // Let Supabase handle the hash URL
      const { data: authData, error: authError } =
        await supabaseAuth.getSession();
      if (authError) throw authError;
      if (!authData.session) {
        throw new Error("No session found after authentication");
      }

      const profile = await supabaseAuth.getUserProfile();
      if (!profile) {
        throw new Error("No profile found after authentication");
      }

      authState.value.user = profile;
      authState.value.isAuthenticated = true;

      // Check whitelist status
      await checkWhitelistStatus();

      // Determine redirect URL based on role and whitelist status
      let redirectUrl: string;
      const isMainDomainPath = !normalizedRedirectPath.includes("/console");
      const mainDomainPrefix = config.public.mainDomain.startsWith("localhost")
        ? `http://${config.public.mainDomain}`
        : mainDomain;
      const consoleDomainPrefix = config.public.consoleDomain.startsWith(
        "localhost",
      )
        ? `http://${config.public.consoleDomain}`
        : consoleDomain;

      if (profile.role === UserRole.SUPERADMIN) {
        // For superadmin, respect the original redirect path and domain
        if (normalizedRedirectPath.includes("/console")) {
          redirectUrl = `${consoleDomainPrefix}${normalizedRedirectPath}`;
        } else {
          redirectUrl = `${mainDomainPrefix}${normalizedRedirectPath}`;
        }
        console.log("Superadmin redirect URL:", redirectUrl);
      } else if (isWhitelisted.value) {
        // For whitelisted users, respect the original redirect path and domain
        if (normalizedRedirectPath.includes("/console")) {
          redirectUrl = `${consoleDomainPrefix}${normalizedRedirectPath}`;
        } else {
          redirectUrl = `${mainDomainPrefix}${normalizedRedirectPath}`;
        }
      } else {
        // For non-whitelisted users, redirect to not-authorized
        redirectUrl = config.public.authDomain.startsWith("localhost")
          ? `http://${config.public.authDomain}/not-authorized`
          : `${authDomain}/not-authorized`;
      }

      // Clean up the URL before redirecting
      window.location.hash = "";

      // Use window.location.replace for a full page reload
      window.location.replace(redirectUrl);
    } catch (error) {
      console.error("Auth callback error:", error);
      authState.value.error =
        error instanceof Error ? error.message : "Authentication failed";

      // On error, clear auth_redirect and redirect to login
      localStorage.removeItem("auth_redirect");
      window.location.replace(`${authDomain}/login`);
    } finally {
      authState.value.loading = false;
    }
  };

  // Sign out
  const signOut = async () => {
    authState.value.loading = true;

    try {
      await supabaseAuth.signOut();
      authState.value.user = null;
      authState.value.isAuthenticated = false;

      // Clear both cookie and localStorage
      const authCookie = useCookie("sb-auth");
      authCookie.value = null;
      localStorage.removeItem("sb-auth");

      // Redirect to the home page and clear the localStorage and cookie again because it's on a different subdomain by recursing the function
      // But stop when the domain is the same as the main domain
      if (window.location.hostname !== mainDomain) {
        // Go to logout page
        window.location.replace(`${mainDomain}/logout`);
      }
    } catch (error: any) {
      console.error("Sign-out error:", error);
      authState.value.error = error.message || "Failed to sign out";
    } finally {
      authState.value.loading = false;
    }
  };

  // Check if the user has access to a protected resource
  const checkAccess = async (
    requiredRole?: UserRole,
    requireWhitelist: boolean = false,
  ) => {
    // If already loaded and authenticated, check permission
    if (!authState.value.loading) {
      if (!authState.value.isAuthenticated) {
        return false;
      }

      if (requiredRole && authState.value.user?.role !== requiredRole) {
        return false;
      }

      if (requireWhitelist && !isWhitelisted.value) {
        // Recheck whitelist status just to be sure
        const whitelisted = await checkWhitelistStatus();
        if (!whitelisted) {
          return false;
        }
      }

      return true;
    }

    // Otherwise initialize auth first
    await initAuth();

    if (!authState.value.isAuthenticated) {
      return false;
    }

    if (requiredRole && authState.value.user?.role !== requiredRole) {
      return false;
    }

    if (requireWhitelist && !isWhitelisted.value) {
      return false;
    }

    return true;
  };

  return {
    user: computed(() => authState.value.user),
    loading: computed(() => authState.value.loading),
    error: computed(() => authState.value.error),
    isAuthenticated,
    isSuperAdmin,
    isWhitelisted: computed(() => isWhitelisted.value),

    initAuth,
    signInWithGoogle,
    signOut,
    handleAuthCallback,
    checkAccess,
    checkWhitelistStatus,
  };
}
