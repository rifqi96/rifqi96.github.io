<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { blogPostService } from "@/domains/console/services/blogPost.service";
import Editor from "@/components/Editor/Editor.vue";
import type { BlogPost } from "@/types/BlogPost";

const route = useRoute();
const router = useRouter();

const postData = ref<BlogPost | null>(null);
const loading = ref(false);
const error = ref("");
const showPublishDialog = ref(false);
const publishDate = ref<string>("");

// Computed properties for v-model binding
const slug = computed({
  get: () => postData.value?.slug || "",
  set: (value: string) => {
    if (postData.value) postData.value.slug = value;
  },
});

const description = computed({
  get: () => postData.value?.description || "",
  set: (value: string) => {
    if (postData.value) postData.value.description = value;
  },
});

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

    if (data.published_at) {
      publishDate.value = new Date(data.published_at)
        .toISOString()
        .slice(0, 16);
    } else {
      publishDate.value = "";
    }
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

    const updatedData = {
      ...updatedPost,
      author: undefined,
      media: undefined,
    };

    postData.value = {
      ...postData.value,
      ...updatedData,
    };

    await blogPostService.updatePost(postData.value.id, updatedData);
  } catch (err: any) {
    error.value = err.message || "Failed to update post";
  }
}

async function savePost() {
  if (!postData.value) return;
  try {
    await blogPostService.updatePost(postData.value.id, {
      ...postData.value,
      author: undefined,
      media: undefined,
    });
  } catch (err: any) {
    error.value = err.message || "Failed to save post";
  }
}

function openPublishDialog() {
  if (!postData.value) return;

  // Set default publish date to now if not already set
  if (!publishDate.value) {
    publishDate.value = new Date().toISOString().slice(0, 16);
  }

  showPublishDialog.value = true;
}

async function publishPost() {
  if (!postData.value) return;

  try {
    await blogPostService.updatePost(postData.value.id, {
      ...postData.value,
      is_published: true,
      published_at: publishDate.value || undefined,
      author: undefined,
      media: undefined,
    });

    // Update local data
    postData.value.is_published = true;
    postData.value.published_at = publishDate.value || undefined;

    showPublishDialog.value = false;
    await loadPost(); // Reload to get the latest data
  } catch (err: any) {
    error.value = err.message || "Failed to publish post";
  }
}

async function unpublishPost() {
  if (!postData.value) return;

  try {
    await blogPostService.updatePost(postData.value.id, {
      ...postData.value,
      is_published: false,
      author: undefined,
      media: undefined,
    });

    // Update local data
    postData.value.is_published = false;

    await loadPost(); // Reload to get the latest data
  } catch (err: any) {
    error.value = err.message || "Failed to unpublish post";
  }
}
</script>

<template>
  <div class="blog-post-edit-page">
    <v-container>
      <div class="d-flex align-center mb-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          :to="{ name: 'console-blog' }"
        ></v-btn>
        <h1 class="text-h4 ml-4">Edit Blog Post</h1>
        <v-spacer></v-spacer>

        <!-- Action buttons -->
        <v-btn
          color="primary"
          variant="tonal"
          class="mx-2"
          @click="savePost"
          :disabled="loading"
        >
          Save
        </v-btn>

        <v-btn
          v-if="postData && !postData.is_published"
          color="success"
          variant="tonal"
          class="mx-2"
          @click="openPublishDialog"
          :disabled="loading"
        >
          Publish
        </v-btn>

        <v-btn
          v-else-if="postData && postData.is_published"
          color="error"
          variant="tonal"
          class="mx-2"
          @click="unpublishPost"
          :disabled="loading"
        >
          Unpublish
        </v-btn>
      </div>

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

      <div v-else class="editor-container">
        <!-- Editor Component with integrated featured image -->
        <Editor @save="handleSave" :initialPost="postData" />
      </div>
    </v-container>

    <!-- Publish Dialog -->
    <v-dialog v-model="showPublishDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">Publish Settings</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="slug"
                  label="URL Slug"
                  required
                  hint="The URL-friendly identifier for this post"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="description"
                  label="Description"
                  required
                  hint="This will appear in meta tags and as a preview on the blog page"
                  rows="3"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="publishDate"
                  label="Publish Date & Time"
                  type="datetime-local"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showPublishDialog = false">
            Cancel
          </v-btn>
          <v-btn color="success" variant="tonal" @click="publishPost">
            Publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.blog-post-edit-page {
  padding: 16px;
}

.editor-container {
  max-width: 740px;
  margin: 0 auto;
}
</style>
