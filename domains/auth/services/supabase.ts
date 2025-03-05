import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuthOptions, UserProfile } from "../types";

// Create a single supabase client for interacting with the database
export const createSupabaseClient = () => {
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.supabaseUrl;
  const supabaseKey = config.public.supabaseKey;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

const supabaseClient = ref<SupabaseClient | undefined>();

// Helper to get the supabase client with proper typing
export const useSupabaseClient = () => {
  if (!supabaseClient.value) {
    supabaseClient.value = createSupabaseClient();
  }

  return supabaseClient.value;
};

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

// Options methods
export const supabaseOptions = {
  // Get all options
  async getAllOptions() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase.from("options").select("*");

    if (error) throw error;
    return data;
  },

  // Get option by key
  async getOptionByKey(key: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("options")
      .select("*")
      .eq("key", key)
      .single();

    if (error) throw error;
    return data;
  },

  // Update option
  async updateOption(id: string, value: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("options")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
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

  // Add email to whitelist
  async addToWhitelist(email: string, addedBy: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("whitelist")
      .insert([{ email, added_by: addedBy }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Remove email from whitelist
  async removeFromWhitelist(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase.from("whitelist").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
