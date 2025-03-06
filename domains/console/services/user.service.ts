import type { UserProfile } from "@/types/User";

// User management services
export const userService = {
  // Get all users
  async getAllUsers() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as UserProfile[];
  },

  // Update a user's role
  async updateUserRole(id: string, role: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as UserProfile;
  },
};
