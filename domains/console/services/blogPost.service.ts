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

  // Create a new blog post
  async createPost(post: Partial<BlogPost>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .insert([post])
      .select();

    if (error) throw error;
    return data[0] as BlogPost;
  },

  // Update a blog post
  async updatePost(id: string, post: Partial<BlogPost>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .update(post)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as BlogPost;
  },

  // Delete a blog post
  async deletePost(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
