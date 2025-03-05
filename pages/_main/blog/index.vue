<script setup>
// Blog listing page
definePageMeta({
  layout: "default",
});

// SEO metadata
useHead({
  title: "Blog",
  meta: [
    {
      name: "description",
      content:
        "Software engineering insights, web development tips, and technology articles by Rifqi Ruhyattamam",
    },
  ],
});

// Fetch all blog posts
const { data: posts } = await useAsyncData("blog-posts", () =>
  queryContent("/blog").sort({ date: -1 }).limit(20).find(),
);

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
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Blog</h1>
        <p class="text-subtitle-1 mb-8">
          Thoughts, insights and ideas about software engineering, web
          development and technology
        </p>
      </v-col>
    </v-row>

    <v-row v-if="posts && posts.length">
      <v-col
        v-for="post in posts"
        :key="post._path"
        cols="12"
        md="6"
        class="mb-6"
      >
        <v-card class="h-100" :to="post._path">
          <v-img v-if="post.image" :src="post.image" height="200" cover></v-img>
          <v-card-title class="text-h5">{{ post.title }}</v-card-title>
          <v-card-subtitle>{{ formatDate(post.date) }}</v-card-subtitle>
          <v-card-text class="pb-2">
            <p>{{ post.description }}</p>

            <div class="mt-2">
              <v-chip
                v-for="tag in post.tags"
                :key="tag"
                size="small"
                class="mr-2 mb-2"
                color="primary"
                variant="outlined"
              >
                {{ tag }}
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="post._path" variant="text">
              Read More
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <p>No blog posts found.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
  line-height: 1.4;
}
</style>
