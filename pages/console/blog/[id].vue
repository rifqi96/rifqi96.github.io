<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { blogPostService } from "@/domains/console/services/blogPost.service";
import Editor from "@/components/Editor/Editor.vue";
import type { BlogPost } from "@/types/BlogPost";

const route = useRoute();
const router = useRouter();

const postData = ref<BlogPost | null>(null);
const loading = ref(false);
const error = ref("");

async function loadPost() {
  loading.value = true;
  error.value = "";
  try {
    const data = await blogPostService.getPost(route.params.id as string);
    // Ensure tags is an array
    if (!data.tags) {
      data.tags = [];
    }
    postData.value = data;
  } catch (err: any) {
    error.value = err.message || "Failed to load post";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPost();
});

async function handleSave(updatedPost: Partial<BlogPost>) {
  try {
    if (!postData.value?.id) return;
    await blogPostService.updatePost(postData.value.id, {
      ...updatedPost,
      author: undefined,
      media: undefined,
    });
  } catch (err: any) {
    error.value = err.message || "Failed to update post";
  }
}
</script>

<template>
  <div class="blog-post-edit-page">
    <v-container>
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        :to="{ name: 'console-blog' }"
        class="mb-4"
      ></v-btn>
      <h1 class="text-h4 mb-4">Edit Blog Post</h1>
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>
      <div v-if="loading" class="d-flex justify-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </div>
      <div v-else>
        <Editor @save="handleSave" :initialPost="postData" />
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.blog-post-edit-page {
  padding: 16px;
}
</style>
