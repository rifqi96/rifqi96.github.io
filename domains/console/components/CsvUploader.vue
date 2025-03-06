<script setup lang="ts">
import Papa from "papaparse";
import { ref, computed } from "vue";

interface Props {
  onDataParsed: (data: any[]) => void;
}

const props = defineProps<Props>();
const fileInput = ref<HTMLInputElement>();
const csvData = ref<any[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const requiredColumns = [
  "company",
  "location",
  "role",
  "startDate",
  "description",
  "technologies",
];

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  error.value = null;

  if (!file) {
    error.value = "No file selected";
    return;
  }

  if (!file.name.endsWith(".csv")) {
    error.value = "Please upload a CSV file";
    return;
  }

  isLoading.value = true;

  try {
    const result = (await new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => resolve(results),
        error: (err) => reject(err),
      });
    })) as Papa.ParseResult<any>;

    // Validate required columns
    const missingColumns = requiredColumns.filter(
      (col) => !result.meta.fields?.includes(col),
    );

    if (missingColumns.length > 0) {
      error.value = `Missing required columns: ${missingColumns.join(", ")}`;
      return;
    }

    // Clean and validate data
    csvData.value = result.data.map((row) => ({
      ...row,
      company: row.company?.trim(),
      location: row.location?.trim(),
      role: row.role?.trim(),
      startDate: row.startDate?.trim(),
      endDate: row.endDate?.trim(),
      description: row.description?.trim(),
      technologies: row.technologies?.trim(),
      company_url: row.company_url?.trim(),
    }));

    props.onDataParsed(csvData.value);
  } catch (err) {
    error.value = "Error parsing CSV file";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const resetUpload = () => {
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  csvData.value = [];
  error.value = null;
};
</script>

<template>
  <div class="csv-uploader">
    <v-file-input
      ref="fileInput"
      accept=".csv"
      label="Upload CSV"
      @change="handleFileUpload"
      :error-messages="error ? [error] : []"
      :loading="isLoading"
      variant="outlined"
      prepend-icon="mdi-file-upload"
    ></v-file-input>
  </div>
</template>

<style scoped>
.csv-uploader {
  max-width: 400px;
  margin: 0 auto;
}
</style>
