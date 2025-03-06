import type { AppOption } from "@/types/Option";

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

  // Create new option
  async createOption(
    option: Omit<AppOption, "id" | "created_at" | "updated_at">,
  ) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("options")
      .insert([option])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Delete option
  async deleteOption(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("options")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return data;
  },
};
