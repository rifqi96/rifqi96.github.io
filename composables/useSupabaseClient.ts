import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

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
