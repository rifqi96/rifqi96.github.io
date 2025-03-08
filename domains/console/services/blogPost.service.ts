import type { BlogPost, ContentBlock } from "@/types/BlogPost";
import { useSupabaseClient } from "@/composables/useSupabaseClient";

export const blogPostService = {
  // Get all blog posts
  async getAllPosts() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*), media(*)")
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  },

  // Get a single blog post
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
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  // Create a new blog post
  async createPost(post: Partial<BlogPost>) {
    const supabase = useSupabaseClient();

    // Set author_id to current user if not provided
    if (!post.author_id) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      post.author_id = user?.id;
    }

    // Set default values
    if (post.content_blocks === undefined) {
      post.content_blocks = [];
    }

    // Get the highest order value and add 1
    const { data: maxOrderData } = await supabase
      .from("blog_posts")
      .select("order")
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder =
      maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order : 0;
    post.order = maxOrder + 1;

    const { data, error } = await supabase
      .from("blog_posts")
      .insert([post])
      .select("*, author:profiles(*), media(*)");

    if (error) throw error;
    return data[0] as BlogPost;
  },

  // Update a blog post
  async updatePost(id: string, post: Partial<BlogPost>) {
    const supabase = useSupabaseClient();

    // Check if slug is being updated and if it's unique
    if (post.title) {
      const newSlug = await this.generateSlug(post.title, id);
      post.slug = newSlug;
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update(post)
      .eq("id", id)
      .select("*, author:profiles(*), media(*)");

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

  // Update the order of blog posts
  async updateOrder(posts: { id: string; order: number }[]) {
    const supabase = useSupabaseClient();

    // Create an array of update operations
    const updates = posts.map(({ id, order }) => ({
      id,
      order,
    }));

    // Use upsert to update multiple records
    const { error } = await supabase
      .from("blog_posts")
      .upsert(updates, { onConflict: "id" });

    if (error) throw error;
    return true;
  },

  // Generate a unique slug from title
  async generateSlug(title: string, existingId?: string) {
    const supabase = useSupabaseClient();

    // Convert title to slug format
    let slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();

    // Check if slug exists
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug")
      .eq("slug", slug);

    // If slug exists and it's not the current post, append a number
    if (data && data.length > 0 && (!existingId || data[0].id !== existingId)) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;

      // Keep checking until we find a unique slug
      let isUnique = false;
      while (!isUnique) {
        const { data: checkData } = await supabase
          .from("blog_posts")
          .select("id")
          .eq("slug", newSlug);

        if (!checkData || checkData.length === 0) {
          slug = newSlug;
          isUnique = true;
        } else {
          counter++;
          newSlug = `${slug}-${counter}`;
        }
      }
    }

    return slug;
  },

  // Convert markdown content to content blocks
  convertMarkdownToBlocks(markdown: string): ContentBlock[] {
    // Simple conversion - in a real implementation, this would be more sophisticated
    const blocks: ContentBlock[] = [];

    // Split by double newlines to separate paragraphs
    const paragraphs = markdown.split(/\n\n+/);

    paragraphs.forEach((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return;

      // Check if it's a heading
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        blocks.push({
          id: `heading-${index}`,
          type: "heading",
          content: headingMatch[2],
          attrs: { level },
        });
        return;
      }

      // Check if it's a list
      if (trimmed.match(/^[-*]\s+/m)) {
        const items = trimmed
          .split(/\n/)
          .map((item) => item.replace(/^[-*]\s+/, "").trim())
          .filter(Boolean);

        blocks.push({
          id: `list-${index}`,
          type: "bulletList",
          content: items,
        });
        return;
      }

      // Default to paragraph
      blocks.push({
        id: `paragraph-${index}`,
        type: "paragraph",
        content: trimmed,
      });
    });

    return blocks;
  },

  // Convert content blocks to markdown
  convertBlocksToMarkdown(blocks: ContentBlock[]): string {
    if (!blocks || !blocks.length) return "";

    return blocks
      .map((block) => {
        switch (block.type) {
          case "heading": {
            const level = block.attrs?.level || 1;
            return `${"#".repeat(level)} ${block.content}\n\n`;
          }

          case "bulletList": {
            if (Array.isArray(block.content)) {
              return (
                block.content.map((item) => `- ${item}`).join("\n") + "\n\n"
              );
            }
            return "";
          }

          case "paragraph":
          default:
            return `${block.content}\n\n`;
        }
      })
      .join("");
  },
};
