import type { BlogPost } from "@/types/BlogPost";
import { useSupabaseClient } from "@/composables/useSupabaseClient";

export const blogPostService = {
  // Get all published blog posts
  async getAllPublishedPosts() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*), media(*)")
      .eq("is_published", true)
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  },

  // Get a single blog post by ID
  async getPost(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*), media(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  // Get a single blog post by slug
  async getPostBySlug(slug: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*), media(*)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  // Get featured blog posts
  async getFeaturedPosts(limit = 3) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*), media(*)")
      .eq("is_published", true)
      .order("order", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as BlogPost[];
  },

  // Get blog posts by tag
  async getPostsByTag(tag: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*), media(*)")
      .eq("is_published", true)
      .contains("tags", [tag])
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  },

  // Get all unique tags from published posts
  async getAllTags() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("tags")
      .eq("is_published", true);

    if (error) throw error;

    // Extract all tags and remove duplicates
    const allTags = data.flatMap((post) => post.tags || []);
    const uniqueTags = [...new Set(allTags)];

    return uniqueTags;
  },
};
