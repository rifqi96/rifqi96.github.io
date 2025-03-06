import { useSupabaseClient } from "@/composables/useSupabaseClient";
import type { AuthOptions } from "../types";
import type { UserProfile } from "@/types/User";

// Authentication methods
export const supabaseAuth = {
  // Sign in with Google SSO
  async signInWithGoogle(options: AuthOptions = { rememberMe: false }) {
    const supabase = useSupabaseClient();
    const { rememberMe } = options;

    const redirectTo = `${window.location.origin}/callback`;

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          remember_me: rememberMe ? "true" : "false",
        },
      },
    });
  },

  // Sign out
  async signOut() {
    const supabase = useSupabaseClient();
    return supabase.auth.signOut();
  },

  // Get the current session
  async getSession() {
    const supabase = useSupabaseClient();
    return supabase.auth.getSession();
  },

  // Get the current user
  async getUserProfile(): Promise<UserProfile | null> {
    const supabase = useSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Get the extended profile from the profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email || "",
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: profile.updated_at,
      role: profile.role,
    };
  },
};

// Whitelist methods
export const supabaseWhitelist = {
  // Check if an email is whitelisted
  async isWhitelisted(email: string): Promise<boolean> {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("whitelist")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !data) return false;
    return true;
  },

  // Get all whitelist entries
  async getAllWhitelistEntries() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("whitelist")
      .select("*, added_by:profiles(email)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Check if a user is on the whitelist
  async checkEmail(email: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("whitelist")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    return !!data; // Return true if data exists
  },
};
