import type { BlogPost } from "@/types/BlogPost";

export const blogPost = {
  // Get all blog posts
  async getAllPosts() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  },

  // Get a single blog post
  async getPost(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as BlogPost;
  },
};
