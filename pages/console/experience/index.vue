<script setup lang="ts">
import { ref } from "vue";
import { experienceService } from "@/domains/console/services/workExperience.service";
import type { WorkExperience } from "@/types/WorkExperience";
import type { Media } from "@/types/Media";
import { mediaService } from "@/domains/console/services/media.service";
import CsvUploader from "@/domains/console/components/CsvUploader.vue";
import {
  useCsvImport,
  ImportStatus,
} from "@/domains/console/composables/useCsvImport";

// Page metadata
definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

useHead({
  title: "Work Experience",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

// State
const experiences = ref<WorkExperience[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Dialog state
const deleteDialog = ref(false);
const selectedExperience = ref<WorkExperience | null>(null);
const importDialog = ref(false);

// CSV import state
const {
  parsedData,
  previewData,
  importStatus,
  error: importError,
  handleCsvData,
  resetImport,
} = useCsvImport<WorkExperience>({
  type: "workExperience",
  transform: (data) => ({
    company: data.company || "",
    position: data.position || "",
    location: data.location || "",
    description: data.description || "",
    start_date: data.start_date || "",
    // end_date must be null if not provided or empty
    end_date: data.end_date || null,
    current: data.current === "true",
    technologies: data.technologies?.split(",").filter(Boolean) || [],
    company_url: data.company_url || "",
  }),
  validate: (data) => {
    if (!data.company) throw new Error("Company is required");
    if (!data.position) throw new Error("Position is required");
    if (!data.start_date) throw new Error("Start date is required");
  },
});

// Methods
const openCompanyUrl = (url: string | null | undefined) => {
  if (!url) return;
  if (import.meta.client) {
    window.open(url, "_blank");
  }
};

const handleImport = async () => {
  try {
    await Promise.all(
      previewData.value.map((item) => experienceService.createExperience(item)),
    );
    await loadExperiences();
    importDialog.value = false;
    resetImport();
  } catch (err: any) {
    error.value = err.message || "Failed to import experiences";
  }
};

// Load experiences
const loadExperiences = async () => {
  loading.value = true;
  error.value = null;

  try {
    experiences.value = await experienceService.getAllExperiences();
  } catch (err: any) {
    console.error("Failed to load work experiences:", err);
    error.value = err.message || "Failed to load work experiences";
  } finally {
    loading.value = false;
  }
};

// Delete experience
const deleteExperience = async () => {
  if (!selectedExperience.value) return;

  try {
    await experienceService.deleteExperience(selectedExperience.value.id);
    await loadExperiences();
    deleteDialog.value = false;
    selectedExperience.value = null;
  } catch (err: any) {
    console.error("Failed to delete work experience:", err);
    error.value = err.message || "Failed to delete work experience";
  }
};

// Format date
const formatDate = (date: string | null | undefined) => {
  if (!date) return "Present";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// Load data on mount
onMounted(async () => {
  await loadExperiences();
});
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4">Work Experience</h1>
      <div class="d-flex gap-2">
        <v-btn
          class="mr-4"
          color="secondary"
          prepend-icon="mdi-file-upload"
          @click="importDialog = true"
        >
          Import CSV
        </v-btn>
        <CrossDomainButton
          color="primary"
          :to="{ name: 'console-experience-new' }"
          prepend-icon="mdi-plus"
        >
          Add Experience
        </CrossDomainButton>
      </div>
    </div>

    <v-alert v-if="error" type="error" class="mb-6">
      {{ error }}
      <div class="mt-2">
        <v-btn color="white" @click="loadExperiences" size="small">Retry</v-btn>
      </div>
    </v-alert>

    <v-card>
      <v-data-table
        :loading="loading"
        :items="experiences"
        :headers="[
          { title: 'Company', key: 'company', width: '25%' },
          { title: 'Position', key: 'position', width: '25%' },
          { title: 'Period', key: 'period', width: '20%' },
          {
            title: 'Technologies',
            key: 'technologies',
            width: '20%',
            sortable: false,
          },
          { title: 'Actions', key: 'actions', sortable: false, width: '10%' },
        ]"
        hover
        class="experience-table"
      >
        <template v-slot:[`item.company`]="{ item }">
          <div class="d-flex align-center">
            <span class="font-weight-medium">{{ item.company }}</span>
            <v-icon
              v-if="item.company_url"
              icon="mdi-link-variant"
              size="small"
              color="primary"
              class="ms-1 cursor-pointer"
              @click="() => openCompanyUrl(item.company_url)"
            />
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ item.location }}
          </div>
        </template>

        <template v-slot:[`item.period`]="{ item }">
          <div class="d-flex align-center">
            {{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}
            <v-chip
              v-if="item.current"
              size="x-small"
              color="primary"
              class="ms-1"
              >Current</v-chip
            >
          </div>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            :to="{ name: 'console-experience-edit', params: { id: item.id } }"
            class="mr-2"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="
              selectedExperience = item;
              deleteDialog = true;
            "
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Work Experience</v-card-title>
        <v-card-text>
          Are you sure you want to delete this work experience? This action
          cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="error" variant="text" @click="deleteExperience"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- CSV Import dialog -->
    <v-dialog v-model="importDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Import Work Experience from CSV
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
              <code
                >company, location, position, start_date, description,
                technologies</code
              >
              <p class="mt-2 mb-2">Optional columns:</p>
              <code>end_date, company_url</code>
              <p class="mt-4 text-caption">
                Note: Technologies should be comma-separated values, e.g.,
                "React, TypeScript, Node.js"
              </p>
            </div>
            <CsvUploader
              :onDataParsed="handleCsvData"
              :requiredColumns="[
                'company',
                'location',
                'position',
                'start_date',
                'description',
                'technologies',
              ]"
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
                    <th class="text-primary">Company</th>
                    <th class="text-primary">Position</th>
                    <th class="text-primary">Location</th>
                    <th class="text-primary">Period</th>
                    <th class="text-primary">Technologies</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in previewData" :key="index">
                    <td class="text-caption">{{ index + 1 }}</td>
                    <td>
                      <div class="d-flex align-center">
                        <span>{{ item.company }}</span>
                        <v-icon
                          v-if="item.company_url"
                          icon="mdi-link-variant"
                          size="small"
                          color="primary"
                          class="ms-1"
                        />
                      </div>
                    </td>
                    <td>{{ item.position }}</td>
                    <td>{{ item.location }}</td>
                    <td>
                      {{ formatDate(item.start_date) }} -
                      {{ formatDate(item.end_date) }}
                      <v-chip
                        v-if="item.current"
                        size="x-small"
                        color="primary"
                        class="ms-1"
                        >Current</v-chip
                      >
                    </td>
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

.experience-table :deep(th) {
  font-size: 0.875rem !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.experience-table :deep(td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
