<script setup lang="ts">
import { ref } from "vue";
import { blogPostService } from "@/domains/console/services/blogPost.service";
import type { BlogPost } from "@/types/BlogPost";
import { mediaService } from "@/domains/console/services/media.service";
import Draggable from "vuedraggable-es";

definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

useHead({
  title: "Blog Management",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const posts = ref<BlogPost[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const dragEnabled = ref(false);
const isDragging = ref(false);
const orderChanged = ref(false);

// Dialog states
const deleteDialog = ref(false);
const selectedPost = ref<BlogPost | null>(null);

// Load blog posts
async function loadPosts() {
  loading.value = true;
  error.value = null;
  try {
    posts.value = await blogPostService.getAllPosts();
  } catch (err) {
    error.value = "Failed to load blog posts";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Delete blog post
async function handleDelete() {
  if (!selectedPost.value) return;

  try {
    await blogPostService.deletePost(selectedPost.value.id);
    await loadPosts();
    deleteDialog.value = false;
    selectedPost.value = null;
  } catch (err) {
    console.error("Error deleting blog post:", err);
    error.value = "Failed to delete blog post";
  }
}

// Update order after drag
async function onDragEnd() {
  isDragging.value = false;
  if (orderChanged.value) {
    await updateOrder();
    orderChanged.value = false;
  }
}

// Track when drag starts
function onDragStart() {
  isDragging.value = true;
}

// Handle changes during drag
function onDragChange() {
  orderChanged.value = true;
}

// Toggle drag mode
function toggleDragMode() {
  dragEnabled.value = !dragEnabled.value;
  if (!dragEnabled.value && orderChanged.value) {
    updateOrder();
    orderChanged.value = false;
  }
}

// Update order
async function updateOrder() {
  try {
    loading.value = true;
    await blogPostService.updateOrder(
      posts.value.map((post, index) => ({
        id: post.id,
        order: index + 1,
      })),
    );
    loading.value = false;
  } catch (err) {
    console.error("Error updating order:", err);
    error.value = "Failed to update order";
    loading.value = false;
  }
}

// Format date
function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Get post status
function getPostStatus(post: BlogPost) {
  if (post.is_published) {
    return { label: "Published", color: "success" };
  } else {
    return { label: "Draft", color: "warning" };
  }
}

// Initial load
onMounted(() => {
  loadPosts();
});
</script>

<template>
  <div class="blog-management">
    <v-container>
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4">Blog Management</h1>
        <div class="actions">
          <CrossDomainButton
            color="primary"
            :to="{ name: 'console-blog-new' }"
            prepend-icon="mdi-plus"
          >
            New Post
          </CrossDomainButton>
        </div>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </div>

      <!-- Toggle Drag Button -->
      <div v-if="!loading && posts.length > 1" class="mb-4 d-flex justify-end">
        <v-btn
          :color="dragEnabled ? 'success' : 'primary'"
          :prepend-icon="dragEnabled ? 'mdi-check' : 'mdi-drag'"
          @click="toggleDragMode"
          class="ml-4"
        >
          {{ dragEnabled ? "Save Order" : "Reorder Posts" }}
        </v-btn>
      </div>

      <!-- Blog Posts Table -->
      <v-data-table
        v-if="!loading && !dragEnabled"
        :items="posts"
        :headers="[
          { title: 'Title', key: 'title', width: '30%' },
          { title: 'Slug', key: 'slug', width: '20%' },
          { title: 'Author', key: 'author', width: '15%' },
          { title: 'Date', key: 'created_at', width: '15%' },
          { title: 'Status', key: 'status', width: '10%' },
          { title: 'Actions', key: 'actions', sortable: false, width: '10%' },
        ]"
        hover
        class="blog-posts-table"
      >
        <template v-slot:[`item.author`]="{ item }">
          {{ item.author?.email || "Unknown" }}
        </template>

        <template v-slot:[`item.created_at`]="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip :color="getPostStatus(item).color" size="small">
            {{ getPostStatus(item).label }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            class="mr-2"
            :href="`/blog/${item.slug}`"
            target="_blank"
          ></v-btn>
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            class="mr-2"
            :to="{
              name: 'console-blog-edit',
              params: { id: item.id },
            }"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="
              selectedPost = item;
              deleteDialog = true;
            "
          ></v-btn>
        </template>
      </v-data-table>

      <!-- Draggable Blog Posts List -->
      <div v-if="!loading && dragEnabled" class="draggable-posts-container">
        <Draggable
          v-model="posts"
          item-key="id"
          handle=".handle"
          @start="onDragStart"
          @end="onDragEnd"
          @change="onDragChange"
          :animation="200"
          ghost-class="ghost-post"
        >
          <template #item="{ element: post, index }">
            <v-card
              class="mb-3 draggable-post"
              :class="{ 'is-dragging': isDragging }"
            >
              <div class="d-flex align-center pa-4">
                <v-icon
                  class="handle mr-3 drag-handle"
                  icon="mdi-drag"
                ></v-icon>
                <div class="order-number mr-4">{{ index + 1 }}</div>
                <div class="flex-grow-1">
                  <div class="d-flex flex-column">
                    <div class="text-h6">{{ post.title }}</div>
                    <div class="text-body-2 text-truncate">
                      {{ post.description }}
                    </div>
                  </div>
                </div>
                <v-chip
                  :color="getPostStatus(post).color"
                  size="small"
                  class="ml-2"
                >
                  {{ getPostStatus(post).label }}
                </v-chip>
              </div>
            </v-card>
          </template>
        </Draggable>
      </div>

      <!-- No Posts Message -->
      <v-card v-if="!loading && posts.length === 0" class="pa-4 text-center">
        <v-card-text>
          <p class="text-h6 mb-4">No blog posts found</p>
          <p class="mb-4">Get started by creating your first blog post.</p>
          <CrossDomainButton
            color="primary"
            :to="{ name: 'console-blog-new' }"
            prepend-icon="mdi-plus"
          >
            Create Blog Post
          </CrossDomainButton>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Blog Post</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedPost?.title }}"? This
          action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="error" variant="text" @click="handleDelete"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.blog-posts-table :deep(th) {
  font-size: 0.875rem !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.blog-posts-table :deep(td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

/* Draggable styles */
.draggable-posts-container {
  padding: 8px 0;
}

.draggable-post {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.draggable-post:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.drag-handle {
  cursor: grab;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.draggable-post:hover .drag-handle {
  color: rgba(var(--v-theme-primary), 0.8);
}

.ghost-post {
  opacity: 0.5;
  background: rgb(var(--v-theme-surface-variant));
}

.is-dragging {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.order-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
  font-size: 14px;
}
</style>
