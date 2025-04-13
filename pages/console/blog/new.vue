<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Editor from "@/components/Editor/Editor.vue";
import { blogPostService } from "@/domains/console/services/blogPost.service";
import type { BlogPost } from "@/types/BlogPost";

const router = useRouter();
const postData = ref<Partial<BlogPost>>({
  title: "",
  slug: "",
  description: "",
  content: "",
  content_blocks: [],
  is_published: false,
  tags: [],
  media_id: undefined,
  image_url: undefined,
});

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

async function handleSave(post: Partial<BlogPost>) {
  postData.value = { ...postData.value, ...post };
}

async function savePost() {
  try {
    loading.value = true;
    error.value = "";

    const newPost = await blogPostService.createPost({
      title: postData.value.title,
      slug: postData.value.slug,
      description: postData.value.description,
      content: postData.value.content,
      content_blocks: postData.value.content_blocks,
      is_published: postData.value.is_published,
      media_id: postData.value.media_id,
      image_url: postData.value.image_url,
      tags: postData.value.tags,
    });

    router.push({ name: "console-blog-edit", params: { id: newPost.id } });
  } catch (err: any) {
    error.value = err.message || "Error saving blog post";
  } finally {
    loading.value = false;
  }
}

function openPublishDialog() {
  // Set default publish date to now
  publishDate.value = new Date().toISOString().slice(0, 16);
  showPublishDialog.value = true;
}

async function publishPost() {
  try {
    loading.value = true;
    error.value = "";

    const postToCreate = {
      ...postData.value,
      is_published: true,
      published_at: publishDate.value || undefined,
    };

    const newPost = await blogPostService.createPost(postToCreate);
    showPublishDialog.value = false;
    router.push({ name: "console-blog-edit", params: { id: newPost.id } });
  } catch (err: any) {
    error.value = err.message || "Error publishing blog post";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="blog-post-new">
    <v-container>
      <div class="d-flex align-center mb-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          :to="{ name: 'console-blog' }"
        ></v-btn>
        <h1 class="text-h4 ml-4">New Blog Post</h1>
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
          color="success"
          variant="tonal"
          class="mx-2"
          @click="openPublishDialog"
          :disabled="loading"
        >
          Publish
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
.blog-post-new {
  padding: 16px;
}

.editor-container {
  max-width: 740px;
  margin: 0 auto;
}
</style>
