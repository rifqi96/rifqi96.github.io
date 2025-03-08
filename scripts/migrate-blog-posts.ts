/**
 * Script to migrate blog posts from markdown files to the database
 *
 * Usage:
 * npx ts-node scripts/migrate-blog-posts.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to blog content
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// Function to convert markdown content to content blocks
function convertMarkdownToBlocks(markdown: string) {
  // Simple conversion - in a real implementation, this would be more sophisticated
  const blocks: import("../types/BlogPost").ContentBlock[] = [];

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
}

async function migrateMarkdownToDB() {
  try {
    console.log("Starting blog post migration...");

    // Get all markdown files
    const files = fs
      .readdirSync(BLOG_DIR)
      .filter((file) => file.endsWith(".md"));
    console.log(`Found ${files.length} markdown files to migrate.`);

    // Get current user (for author_id)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found. Please login first.");
      process.exit(1);
    }

    // Process each file
    for (const file of files) {
      const filePath = path.join(BLOG_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf8");

      // Parse frontmatter
      const { data: frontmatter, content } = matter(fileContent);

      // Generate slug from filename
      const slug = file.replace(".md", "");

      console.log(`Processing: ${slug}`);

      // Check if post already exists
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existingPost) {
        console.log(`Post with slug "${slug}" already exists, skipping.`);
        continue;
      }

      // Convert content to blocks
      const contentBlocks = convertMarkdownToBlocks(content);

      // Create post in database
      const { data, error } = await supabase
        .from("blog_posts")
        .insert([
          {
            title: frontmatter.title,
            slug: slug,
            description: frontmatter.description,
            content: content,
            content_blocks: contentBlocks,
            is_published: true,
            image_url: frontmatter.image,
            tags: frontmatter.tags || [],
            published_at: frontmatter.date
              ? new Date(frontmatter.date).toISOString()
              : new Date().toISOString(),
            author_id: user.id,
          },
        ])
        .select();

      if (error) {
        console.error(`Error migrating post "${slug}":`, error);
      } else {
        console.log(`Successfully migrated post: ${slug}`);
      }
    }

    console.log("Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateMarkdownToDB();
