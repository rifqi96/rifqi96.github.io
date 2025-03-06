<script setup lang="ts">
import { useOptions } from "@/domains/console/composables/useOptions";
import type { AppOption } from "@/types/Option";
import { OptionAccessLevel } from "@/types/Option";

// Settings page
definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

// SEO metadata
useHead({
  title: "Site Settings",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

// Options state
const { options, loading, error, loadOptions, updateOption, createOption } =
  useOptions();
const search = ref("");
const selectedOption = ref<AppOption | null>(null);
const newValue = ref("");
const showUpdateDialog = ref(false);
const showCreateDialog = ref(false);

// New option state
const newOption = ref<Omit<AppOption, "id" | "created_at" | "updated_at">>({
  key: "",
  value: "",
  description: "",
  access_level: OptionAccessLevel.SUPERADMIN_ONLY,
});

// Create new option
const saveNewOption = async () => {
  try {
    await createOption(newOption.value);
    showCreateDialog.value = false;
    // Reset form
    newOption.value = {
      key: "",
      value: "",
      description: "",
      access_level: OptionAccessLevel.SUPERADMIN_ONLY,
    };
  } catch (err) {
    console.error("Failed to create option:", err);
  }
};

// Load options on mount
onMounted(async () => {
  await loadOptions();
});

// Filtered options based on search
const filteredOptions = computed(() => {
  return options.value.filter((opt) => {
    const searchLower = search.value.toLowerCase();
    return (
      opt.key.toLowerCase().includes(searchLower) ||
      (opt.description && opt.description.toLowerCase().includes(searchLower))
    );
  });
});

// Open the update dialog
const openUpdateDialog = (option: AppOption) => {
  selectedOption.value = option;
  newValue.value = option.value;
  showUpdateDialog.value = true;
};

// Save option change
const saveOption = async () => {
  if (!selectedOption.value) return;

  try {
    await updateOption(selectedOption.value.id, newValue.value);
    showUpdateDialog.value = false;
    selectedOption.value = null;
  } catch (err) {
    console.error("Failed to update option:", err);
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Site Settings</h1>
      <div class="d-flex gap-2">
        <v-btn
          class="mr-4"
          color="success"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
          :disabled="loading"
        >
          Add Option
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="loadOptions"
          :loading="loading"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" class="mb-6">
      {{ error }}
    </v-alert>

    <v-card>
      <v-card-text>
        <v-text-field
          v-model="search"
          density="comfortable"
          label="Search settings"
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          class="mb-4"
        ></v-text-field>

        <v-data-table
          :headers="[
            { title: 'Key', key: 'key', width: '30%' },
            { title: 'Value', key: 'value', width: '40%' },
            { title: 'Last Updated', key: 'updated_at', width: '20%' },
            { title: 'Actions', key: 'actions', width: '10%', sortable: false },
          ]"
          :items="filteredOptions"
          :loading="loading"
          class="elevation-1"
        >
          <!-- Value column with truncation -->
          <template v-slot:[`item.value`]="{ item }">
            <span class="option-value text-truncate">{{ item.value }}</span>
          </template>

          <!-- Updated at column -->
          <template v-slot:[`item.updated_at`]="{ item }">
            {{ formatDate(item.updated_at) }}
          </template>

          <!-- Actions column -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              variant="text"
              icon
              color="primary"
              size="small"
              @click="openUpdateDialog(item)"
              title="Edit setting"
            >
              <v-icon icon="mdi-pencil"></v-icon>
            </v-btn>
          </template>

          <!-- Show description in the expanded section -->
          <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <div class="pa-4">
                  <strong>Description:</strong>
                  {{ item.description || "No description available" }}
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Update Option Dialog -->
    <v-dialog v-model="showUpdateDialog" max-width="600px">
      <v-card>
        <v-card-title>Update Setting</v-card-title>
        <v-card-text>
          <div class="my-4">
            <strong>Key:</strong> {{ selectedOption?.key }}
          </div>
          <div class="mb-4" v-if="selectedOption?.description">
            <strong>Description:</strong> {{ selectedOption.description }}
          </div>
          <v-textarea
            v-model="newValue"
            label="Value"
            variant="outlined"
            rows="5"
            auto-grow
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="showUpdateDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="saveOption" :loading="loading">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Option Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>Create New Setting</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newOption.key"
            label="Key"
            variant="outlined"
            class="mb-4"
            :rules="[(v) => !!v || 'Key is required']"
          ></v-text-field>
          <v-textarea
            v-model="newOption.value"
            label="Value"
            variant="outlined"
            rows="3"
            class="mb-4"
            :rules="[(v) => !!v || 'Value is required']"
          ></v-textarea>
          <v-textarea
            v-model="newOption.description"
            label="Description"
            variant="outlined"
            rows="2"
            class="mb-4"
          ></v-textarea>
          <v-select
            v-model="newOption.access_level"
            :items="[
              {
                title: 'Superadmin Only',
                value: OptionAccessLevel.SUPERADMIN_ONLY,
              },
              {
                title: 'Whitelisted Users',
                value: OptionAccessLevel.WHITELISTED,
              },
              { title: 'Public', value: OptionAccessLevel.PUBLIC },
            ]"
            label="Access Level"
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="showCreateDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            @click="saveNewOption"
            :loading="loading"
            :disabled="!newOption.key || !newOption.value"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.option-value {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
