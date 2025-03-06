<script setup lang="ts">
import { experienceService } from "@/domains/console/services/workExperience.service";
import { mediaService } from "@/domains/console/services/media.service";
import type { WorkExperience } from "@/types/WorkExperience";
import type { Media } from "@/types/Media";
import { useSupabaseClient } from "@/composables/useSupabaseClient";

// Page metadata
definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

// Route
const route = useRoute();
const router = useRouter();

useHead({
  title: "Edit Work Experience",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

// Form state
const form = ref<Partial<WorkExperience>>({
  company: "",
  position: "",
  location: "",
  description: "",
  start_date: "",
  end_date: "",
  current: false,
  technologies: [],
  company_url: "",
  company_logo_url: "",
  company_logo_media_id: undefined,
});

const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const logoFile = ref<File | null>(null);
const logoMedia = ref<Media | null>(null);
const uploadingLogo = ref(false);

// Load experience data
const loadExperience = async () => {
  try {
    const experience = await experienceService.getExperience(
      route.params.id as string,
    );
    form.value = { ...experience };

    // Load media if exists
    if (experience.company_logo_media_id) {
      const supabase = useSupabaseClient();
      const { data: media, error: mediaError } = await supabase
        .from("media")
        .select("*")
        .eq("id", experience.company_logo_media_id)
        .single();

      if (!mediaError && media) {
        logoMedia.value = media;
      }
    }
  } catch (err: any) {
    console.error("Failed to load work experience:", err);
    error.value = err.message || "Failed to load work experience";
  } finally {
    loading.value = false;
  }
};

// Handle logo file selection
const handleLogoFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    try {
      uploadingLogo.value = true;
      logoFile.value = input.files[0];
      form.value.company_logo_url = null; // Clear URL when file is selected

      // Upload immediately
      const media = await mediaService.upload({
        file: input.files[0],
        folder: "company-logos",
      });

      // Update form and preview
      form.value.company_logo_media_id = media.id;
      logoMedia.value = media;
      logoFile.value = null; // Clear file input

      // Save the experience with new media
      await experienceService.updateExperience(route.params.id as string, {
        company_logo_media_id: media.id,
        company_logo_url: null,
      });
    } catch (err: any) {
      console.error("Failed to upload logo:", err);
      error.value = err.message || "Failed to upload logo";
      logoFile.value = null;
    } finally {
      uploadingLogo.value = false;
    }
  }
};

// Clear logo
const clearLogo = async () => {
  try {
    uploadingLogo.value = true;

    // If we have a media ID, delete it first
    if (form.value.company_logo_media_id) {
      await mediaService.delete(form.value.company_logo_media_id);
    }

    // Update experience
    await experienceService.updateExperience(route.params.id as string, {
      company_logo_media_id: undefined,
      company_logo_url: "",
    });

    // Clear local state
    logoFile.value = null;
    form.value.company_logo_url = "";
    form.value.company_logo_media_id = undefined;
    logoMedia.value = null;
  } catch (err: any) {
    console.error("Failed to clear logo:", err);
    error.value = err.message || "Failed to clear logo";
  } finally {
    uploadingLogo.value = false;
  }
};

// Save experience
const saveExperience = async () => {
  saving.value = true;
  error.value = null;

  try {
    // Prepare form data
    const formData = { ...form.value };

    // Handle current position
    if (formData.current) {
      formData.end_date = null;
    }

    // Validate required fields
    if (!formData.company?.trim()) throw new Error("Company is required");
    if (!formData.position?.trim()) throw new Error("Position is required");
    if (!formData.location?.trim()) throw new Error("Location is required");
    if (!formData.start_date?.trim()) throw new Error("Start date is required");
    if (!formData.current && !formData.end_date?.trim())
      throw new Error("End date is required for non-current positions");

    // Clean up logo fields
    if (!formData.company_logo_url?.trim()) {
      formData.company_logo_url = null;
    }
    if (!formData.company_logo_media_id) {
      formData.company_logo_media_id = null;
    }

    await experienceService.updateExperience(
      route.params.id as string,
      formData,
    );
    router.push({ name: "console-experience" });
  } catch (err: any) {
    console.error("Failed to save work experience:", err);
    error.value = err.message || "Failed to save work experience";
  } finally {
    saving.value = false;
  }
};

// Load data on mount
onMounted(async () => {
  await loadExperience();
});

// Computed
const logoPreview = computed(() => {
  if (logoFile.value) {
    return URL.createObjectURL(logoFile.value);
  }
  if (logoMedia.value) {
    return mediaService.getPublicUrl(logoMedia.value);
  }
  return form.value.company_logo_url || null;
});
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4">Edit Work Experience</h1>
      <CrossDomainButton
        color="secondary"
        :to="{ name: 'console-experience' }"
        prepend-icon="mdi-arrow-left"
      >
        Back to List
      </CrossDomainButton>
    </div>

    <v-alert v-if="error" type="error" class="mb-6">
      {{ error }}
    </v-alert>

    <v-card :loading="loading">
      <v-form @submit.prevent="saveExperience">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company"
                label="Company"
                required
                :rules="[(v) => !!v || 'Company is required']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.location"
                label="Location"
                required
                :rules="[(v) => !!v || 'Location is required']"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.position"
                label="Position"
                required
                :rules="[(v) => !!v || 'Position is required']"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company_url"
                label="Company URL"
                hint="Optional"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company_logo_url"
                label="Company Logo URL"
                hint="Optional - Enter URL or upload file below"
                persistent-hint
                :disabled="!!logoFile || !!logoMedia"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-file-input
                v-model="logoFile"
                label="Upload Company Logo"
                accept="image/*"
                :loading="uploadingLogo"
                :disabled="!!form.company_logo_url || uploadingLogo"
                @change="handleLogoFileChange"
                hint="Optional - Upload image or enter URL above"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6" v-if="logoPreview">
              <div class="d-flex align-center">
                <v-img
                  :src="logoPreview"
                  max-width="100"
                  max-height="100"
                  contain
                  class="mr-4"
                />
                <v-btn
                  color="error"
                  variant="text"
                  :loading="uploadingLogo"
                  :disabled="uploadingLogo"
                  @click="clearLogo"
                  icon="mdi-close"
                />
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.start_date"
                label="Start Date"
                type="date"
                required
                :rules="[(v) => !!v || 'Start date is required']"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.end_date"
                label="End Date"
                type="date"
                :disabled="form.current"
                hint="Leave empty for current position"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="form.current"
                label="Current Position"
                @change="if (form.current) form.end_date = '';"
              />
            </v-col>

            <v-col cols="12">
              <v-combobox
                v-model="form.technologies"
                label="Technologies"
                multiple
                chips
                closable-chips
                :rules="[
                  (v) => v?.length > 0 || 'At least one technology is required',
                ]"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                required
                :rules="[(v) => !!v || 'Description is required']"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            type="submit"
            :loading="saving"
            :disabled="loading || uploadingLogo"
            prepend-icon="mdi-content-save"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>
