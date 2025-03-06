export const whitelistService = {
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

  // Get all whitelist entries
  async getAllEntries() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("whitelist_with_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add an email to the whitelist
  async addEmail(email: string, adminId: string) {
    const supabase = useSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("whitelist")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      throw new Error("Email is already on the whitelist");
    }

    // Add to whitelist
    const { data, error } = await supabase
      .from("whitelist")
      .insert([{ email, added_by: adminId }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Remove an email from the whitelist
  async removeEntry(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase.from("whitelist").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
