<script setup lang="ts">
import { useRouter } from "vue-router";
import Editor from "@/components/Editor/Editor.vue";
import { blogPostService } from "@/domains/console/services/blogPost.service";
import type { BlogPost } from "@/types/BlogPost";

const router = useRouter();

async function handleSave(post: Partial<BlogPost>) {
  try {
    const newPost = await blogPostService.createPost({
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.content,
      content_blocks: post.content_blocks,
      is_published: post.is_published,
      media_id: post.media_id,
      image_url: post.image_url,
      tags: post.tags,
    });
    router.push({ name: "console-blog-edit", params: { id: newPost.id } });
  } catch (error) {
    console.error("Error saving blog post:", error);
  }
}
</script>

<template>
  <div class="blog-post-new">
    <Editor @save="handleSave" :initialPost="{}" />
  </div>
</template>

<style scoped>
.blog-post-new {
  padding: 16px;
}
</style>
