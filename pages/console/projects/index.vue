<script setup lang="ts">
import { ref } from "vue";
import { projectService } from "@/domains/console/services/project.service";
import type { Project } from "@/types/Project";
import { mediaService } from "@/domains/console/services/media.service";
import type { Media } from "@/types/Media";
import CsvUploader from "@/domains/console/components/CsvUploader.vue";
import {
  useCsvImport,
  ImportStatus,
} from "@/domains/console/composables/useCsvImport";
import Draggable from "vuedraggable-es";

definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

useHead({
  title: "Projects Management",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const projects = ref<Project[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const dragEnabled = ref(false);
const isDragging = ref(false);
const orderChanged = ref(false);

// Dialog states
const deleteDialog = ref(false);
const selectedProject = ref<Project | null>(null);
const importDialog = ref(false);

// CSV import state
const {
  parsedData,
  previewData,
  importStatus,
  error: importError,
  handleCsvData,
  resetImport,
} = useCsvImport<Project>({
  type: "project",
  transform: (data) => ({
    title: data.title || "",
    description: data.description || "",
    technologies: data.technologies?.split(",").filter(Boolean) || [],
    link: data.link,
    is_available: data.is_available === "true",
    is_featured: false,
    is_coming_soon: false,
    is_published: true,
  }),
  validate: (data) => {
    if (!data.title) throw new Error("Title is required");
    if (!data.description) throw new Error("Description is required");
    if (!data.technologies) throw new Error("Technologies are required");
  },
});

// Load projects
async function loadProjects() {
  loading.value = true;
  error.value = null;
  try {
    projects.value = await projectService.getAllProjects();
  } catch (err) {
    error.value = "Failed to load projects";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Delete project
async function handleDelete() {
  if (!selectedProject.value) return;

  try {
    await projectService.deleteProject(selectedProject.value.id);
    await loadProjects();
    deleteDialog.value = false;
    selectedProject.value = null;
  } catch (err) {
    console.error("Error deleting project:", err);
    error.value = "Failed to delete project";
  }
}

// Import CSV
async function handleImport() {
  try {
    await Promise.all(
      previewData.value.map((item) =>
        projectService.createProject({
          title: item.title || "",
          description: item.description || "",
          technologies: item.technologies || [],
          link: item.link,
          is_available: item.is_available || false,
          is_featured: false,
          is_coming_soon: false,
          is_published: true,
        }),
      ),
    );
    await loadProjects();
    importDialog.value = false;
    resetImport();
  } catch (err: any) {
    error.value = err.message || "Failed to import projects";
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
    await Promise.all(
      projects.value.map((project, index) =>
        projectService.updateProject(project.id, {
          order: index + 1,
        }),
      ),
    );
    loading.value = false;
  } catch (err) {
    console.error("Error updating order:", err);
    error.value = "Failed to update order";
    loading.value = false;
  }
}

// Initial load
onMounted(() => {
  loadProjects();
});
</script>

<template>
  <div class="projects-management">
    <v-container>
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4">Projects Management</h1>
        <div class="actions">
          <v-btn
            color="secondary"
            class="mr-4"
            prepend-icon="mdi-file-upload"
            @click="importDialog = true"
          >
            Import CSV
          </v-btn>
          <CrossDomainButton
            color="primary"
            :to="{ name: 'console-projects-new' }"
            prepend-icon="mdi-plus"
          >
            Add Project
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
      <div v-if="!loading" class="mb-4 d-flex justify-end">
        <v-btn
          :color="dragEnabled ? 'success' : 'primary'"
          :prepend-icon="dragEnabled ? 'mdi-check' : 'mdi-drag'"
          @click="toggleDragMode"
          class="ml-4"
        >
          {{ dragEnabled ? "Save Order" : "Reorder Projects" }}
        </v-btn>
      </div>

      <!-- Projects Table -->
      <v-data-table
        v-if="!loading && !dragEnabled"
        :items="projects"
        :headers="[
          { title: 'Title', key: 'title', width: '25%' },
          { title: 'Description', key: 'description', width: '30%' },
          {
            title: 'Technologies',
            key: 'technologies',
            width: '25%',
            sortable: false,
          },
          { title: 'Status', key: 'status', width: '10%' },
          { title: 'Actions', key: 'actions', sortable: false, width: '10%' },
        ]"
        hover
        class="projects-table"
      >
        <template v-slot:[`item.technologies`]="{ item }">
          <v-chip
            v-for="tech in item.technologies"
            :key="tech"
            size="small"
            class="mr-1 mb-1"
            color="primary"
            variant="outlined"
          >
            {{ tech }}
          </v-chip>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            :color="item.is_available ? 'success' : 'warning'"
            size="small"
          >
            {{ item.is_available ? "Available" : "Coming Soon" }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            class="mr-2"
            :to="{
              name: 'console-projects-edit',
              params: { id: item.id },
            }"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="
              selectedProject = item;
              deleteDialog = true;
            "
          ></v-btn>
        </template>
      </v-data-table>

      <!-- Draggable Projects List -->
      <div v-if="!loading && dragEnabled" class="draggable-projects-container">
        <Draggable
          v-model="projects"
          item-key="id"
          handle=".handle"
          @start="onDragStart"
          @end="onDragEnd"
          @change="onDragChange"
          :animation="200"
          ghost-class="ghost-project"
        >
          <template #item="{ element: project, index }">
            <v-card
              class="mb-3 draggable-project"
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
                    <div class="text-h6">{{ project.title }}</div>
                    <div class="text-body-2 text-truncate">
                      {{ project.description }}
                    </div>
                    <div class="mt-2">
                      <v-chip
                        v-for="tech in project.technologies?.slice(0, 3)"
                        :key="tech"
                        size="x-small"
                        color="primary"
                        variant="outlined"
                        class="mr-1"
                      >
                        {{ tech }}
                      </v-chip>
                      <v-chip
                        v-if="(project.technologies?.length ?? 0) > 3"
                        size="x-small"
                        color="primary"
                        variant="outlined"
                      >
                        +{{ (project.technologies?.length ?? 0) - 3 }}
                      </v-chip>
                    </div>
                  </div>
                </div>
                <v-chip
                  :color="project.is_available ? 'success' : 'warning'"
                  size="small"
                  class="ml-2"
                >
                  {{ project.is_available ? "Available" : "Coming Soon" }}
                </v-chip>
              </div>
            </v-card>
          </template>
        </Draggable>
      </div>
    </v-container>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Project</v-card-title>
        <v-card-text>
          Are you sure you want to delete this project? This action cannot be
          undone.
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

    <!-- CSV Import dialog -->
    <v-dialog v-model="importDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Import Projects from CSV
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            class="float-right"
            @click="
              importDialog = false;
              resetImport();
            "
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <div v-if="importStatus === ImportStatus.IDLE">
            <div class="csv-instructions mb-4">
              <p class="text-subtitle-1 font-weight-bold mb-2">
                CSV File Format
              </p>
              <p class="mb-2">Required columns:</p>
              <code>title, description, technologies</code>
              <p class="mt-2 mb-2">Optional columns:</p>
              <code>link, is_available</code>
              <p class="mt-4 text-caption">
                Note: Technologies should be comma values, e.g., "React,
                TypeScript, Node.js"
              </p>
            </div>
            <CsvUploader
              :onDataParsed="handleCsvData"
              :requiredColumns="['title', 'description', 'technologies']"
            />
          </div>

          <div v-else-if="importStatus === ImportStatus.PREVIEW">
            <p class="text-h6 mb-4">
              Preview of {{ previewData.length }} items to be imported:
            </p>
            <div class="csv-preview-table">
              <v-table density="compact" hover>
                <thead>
                  <tr>
                    <th class="text-primary">#</th>
                    <th class="text-primary">Title</th>
                    <th class="text-primary">Description</th>
                    <th class="text-primary">Technologies</th>
                    <th class="text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in previewData" :key="index">
                    <td class="text-caption">{{ index + 1 }}</td>
                    <td>{{ item.title }}</td>
                    <td>{{ item.description }}</td>
                    <td>
                      <v-chip
                        v-for="tech in item.technologies?.slice(0, 2)"
                        :key="tech"
                        size="x-small"
                        color="secondary"
                        variant="outlined"
                        class="me-1"
                        >{{ tech }}</v-chip
                      >
                      <v-chip
                        v-if="(item.technologies?.length ?? 0) > 2"
                        size="x-small"
                        color="secondary"
                        variant="outlined"
                        >+{{ (item.technologies?.length ?? 0) - 2 }}</v-chip
                      >
                    </td>
                    <td>
                      <v-chip
                        :color="item.is_available ? 'success' : 'warning'"
                        size="x-small"
                      >
                        {{ item.is_available ? "Available" : "Coming Soon" }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </div>

          <v-alert v-if="importError" type="error" variant="tonal" class="mt-4">
            {{ importError }}
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            v-if="importStatus === ImportStatus.PREVIEW"
            color="secondary"
            variant="text"
            @click="resetImport"
            >Back</v-btn
          >
          <v-btn
            v-if="importStatus === ImportStatus.PREVIEW"
            color="primary"
            :loading="importStatus === ImportStatus.IMPORTING"
            @click="handleImport"
            >Import {{ previewData.length }} Items</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.csv-preview-table {
  max-height: 400px;
  overflow-y: auto;
}

.csv-instructions {
  background-color: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 16px;
}

.csv-instructions code {
  background-color: rgb(var(--v-theme-surface));
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  word-break: break-all;
}

.projects-table :deep(th) {
  font-size: 0.875rem !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.projects-table :deep(td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

/* Draggable styles */
.draggable-projects-container {
  padding: 8px 0;
}

.draggable-project {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.draggable-project:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.drag-handle {
  cursor: grab;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.draggable-project:hover .drag-handle {
  color: rgba(var(--v-theme-primary), 0.8);
}

.ghost-project {
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
