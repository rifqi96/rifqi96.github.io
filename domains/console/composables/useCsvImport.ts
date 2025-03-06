import { ref } from "vue";
import type { WorkExperience } from "@/types/WorkExperience";
import type { Project } from "@/types/Project";

export type ImportStatus = "idle" | "preview" | "importing" | "done";

export const ImportStatus = {
  IDLE: "idle" as ImportStatus,
  PREVIEW: "preview" as ImportStatus,
  IMPORTING: "importing" as ImportStatus,
  DONE: "done" as ImportStatus,
} as const;

type CsvDataType = "workExperience" | "project";

interface CsvConfig<T> {
  type: CsvDataType;
  transform: (data: Record<string, any>) => Partial<T>;
  validate?: (data: Record<string, any>) => void;
}

export function useCsvImport<T extends WorkExperience | Project>(
  config: CsvConfig<T>,
) {
  const parsedData = ref<Record<string, any>[]>([]);
  const previewData = ref<Partial<T>[]>([]);
  const importStatus = ref<ImportStatus>("idle");
  const error = ref<string | null>(null);

  const handleCsvData = (data: Record<string, any>[]) => {
    parsedData.value = data;

    try {
      // Validate data if validation function is provided
      if (config.validate) {
        data.forEach(config.validate);
      }

      // Transform CSV data to match the target type
      previewData.value = data.map(config.transform);
    } catch (err: any) {
      error.value = err.message || "Error parsing CSV data";
      importStatus.value = ImportStatus.IDLE;
      return;
    }

    importStatus.value = ImportStatus.PREVIEW;
  };

  const resetImport = () => {
    parsedData.value = [];
    previewData.value = [];
    importStatus.value = ImportStatus.IDLE;
    error.value = null;
  };

  return {
    parsedData,
    previewData,
    importStatus,
    error,
    handleCsvData,
    resetImport,
  };
}

// Utility function for parsing dates in CSV
export function parseDateSafely(dateStr: string | undefined) {
  if (!dateStr?.trim()) return undefined;

  // Parse date parts
  const [year, month, day] = dateStr.split("/").map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid date format (expected YYYY/MM/DD): ${dateStr}`);
  }

  // Create date at the beginning of the month
  const date = new Date(year, month - 1, 1);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  // Get the last day of the month
  const lastDay = new Date(year, month, 0).getDate();

  // Use the given day or the last day of the month if the given day exceeds it
  date.setDate(Math.min(day, lastDay));

  return date.toISOString();
}
