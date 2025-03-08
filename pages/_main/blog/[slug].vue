<script setup lang="ts">
import { blogPostService } from "@/services/blogPost.service";
import type { BlogPost } from "@/types/BlogPost";
import { mediaService } from "@/services/media.service";

// Dynamic route for blog posts
definePageMeta({
  layout: "default",
});

const route = useRoute();
const slug = route.params.slug as string;

// Get blog post by slug
const { data: post } = await useAsyncData<BlogPost>(`blog-post-${slug}`, () =>
  blogPostService.getPostBySlug(slug),
);

// Handle missing content
if (!post.value) {
  throw createError({
    statusCode: 404,
    message: "Blog post not found",
  });
}

// Set SEO metadata
useHead({
  title: post.value.title + " | Rifqi Ruhyattamam",
  meta: [
    { name: "description", content: post.value.description },
    { property: "og:title", content: post.value.title },
    { property: "og:description", content: post.value.description },
    { property: "og:type", content: "article" },
    {
      property: "og:image",
      content: getImageUrl(post.value) || "/img/default-og.jpg",
    },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// Get image URL
function getImageUrl(post: BlogPost) {
  if (post.media) {
    return mediaService.getPublicUrl(post.media);
  }
  return post.image_url || "";
}

// Parse content as HTML
function renderContent(content: string) {
  return content;
}
</script>

<template>
  <v-container v-if="post" class="blog-post">
    <v-row>
      <v-col cols="12" class="mb-6">
        <v-btn
          to="/blog"
          prepend-icon="mdi-arrow-left"
          variant="text"
          color="primary"
          class="mb-6"
        >
          Back to Blog
        </v-btn>

        <h1 class="text-h3 mb-4">{{ post.title }}</h1>
        <div class="mb-6 d-flex align-center">
          <span class="text-subtitle-1">
            {{ formatDate(post.published_at || post.created_at) }}
            <span v-if="post.author" class="ml-2"
              >by {{ post.author.email }}</span
            >
          </span>
          <v-spacer></v-spacer>
          <div>
            <v-chip
              v-for="tag in post.tags"
              :key="tag"
              size="small"
              class="ml-2"
              color="primary"
              variant="outlined"
            >
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <v-img
          v-if="post && getImageUrl(post)"
          :src="getImageUrl(post)"
          :alt="post.title"
          class="mb-8 rounded"
          height="400"
          cover
        ></v-img>

        <div
          class="content-container"
          v-html="post ? renderContent(post.content) : ''"
        ></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style></style>
