export const optionsService = {
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
};
