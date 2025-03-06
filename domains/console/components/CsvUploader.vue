<script setup lang="ts">
import Papa from "papaparse";
import { ref, computed } from "vue";

interface Props<T> {
  onDataParsed: (data: T[]) => void;
  requiredColumns: string[];
}

const props = defineProps<Props<any>>();
const fileInput = ref<HTMLInputElement>();
const csvData = ref<any[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

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
    const missingColumns = props.requiredColumns.filter(
      (col) => !result.meta.fields?.includes(col),
    );

    if (missingColumns.length > 0) {
      error.value = `Missing required columns: ${missingColumns.join(", ")}`;
      return;
    }

    try {
      // Transform and validate data
      const transformedData = result.data.map((row, index) => {
        try {
          const transformedRow = row;

          return transformedRow;
        } catch (err: any) {
          throw new Error(`Error in row ${index + 1}: ${err.message}`);
        }
      });

      csvData.value = transformedData;
      props.onDataParsed(transformedData);
    } catch (err: any) {
      error.value = err.message;
      return;
    }
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
