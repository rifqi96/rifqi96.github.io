<script setup>
// Dynamic route for blog posts
definePageMeta({
  layout: "default",
});

const route = useRoute();

// Get content for the current page
const { data: post } = await useAsyncData(`content-${route.path}`, () =>
  queryContent(route.path).findOne(),
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
      content: post.value.image || "/img/default-og.jpg",
    },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};
</script>

<template>
  <v-container class="blog-post">
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
          <span class="text-subtitle-1">{{ formatDate(post.date) }}</span>
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
          v-if="post.image"
          :src="post.image"
          :alt="post.title"
          class="mb-8 rounded"
          height="400"
          cover
        ></v-img>

        <div class="content-container">
          <ContentRenderer :value="post" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.blog-post h1 {
  font-weight: 700;
}

.content-container {
  font-size: 1.1rem;
  line-height: 1.8;
}

.content-container h1,
.content-container h2,
.content-container h3,
.content-container h4,
.content-container h5,
.content-container h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.content-container p {
  margin-bottom: 1.5rem;
}

.content-container ul,
.content-container ol {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.content-container li {
  margin-bottom: 0.5rem;
}

.content-container pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.content-container code {
  font-family: monospace;
  background-color: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}

.content-container pre code {
  background-color: transparent;
  padding: 0;
}

.content-container blockquote {
  border-left: 4px solid var(--v-primary-base);
  padding-left: 1rem;
  font-style: italic;
  margin: 1.5rem 0;
  color: rgba(0, 0, 0, 0.7);
}

.content-container img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1.5rem 0;
}

@media (max-width: 600px) {
  .content-container {
    font-size: 1rem;
  }
}
</style>
