import { ref } from "vue";
import type { WorkExperience } from "@/types/WorkExperience";

export type ImportStatus = "idle" | "preview" | "importing" | "done";

export const ImportStatus = {
  IDLE: "idle" as ImportStatus,
  PREVIEW: "preview" as ImportStatus,
  IMPORTING: "importing" as ImportStatus,
  DONE: "done" as ImportStatus,
} as const;

interface CsvWorkExperience {
  company: string;
  location: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string;
  company_url?: string;
}

export function useCsvImport() {
  const parsedData = ref<CsvWorkExperience[]>([]);
  const previewData = ref<Partial<WorkExperience>[]>([]);
  const importStatus = ref<ImportStatus>("idle");
  const error = ref<string | null>(null);

  const handleCsvData = (data: CsvWorkExperience[]) => {
    parsedData.value = data;

    // Transform CSV data to match WorkExperience type
    try {
      previewData.value = data.map((item) => {
        // Parse dates safely
        const parseDateSafely = (dateStr: string | undefined) => {
          if (!dateStr?.trim()) return undefined;

          // Parse date parts
          const [year, month, day] = dateStr.split("/").map(Number);
          if (!year || !month || !day) {
            throw new Error(
              `Invalid date format (expected YYYY/MM/DD): ${dateStr}`,
            );
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
        };

        const start_date = parseDateSafely(item.startDate);
        if (!start_date) {
          throw new Error(
            `Start date is required but was empty or invalid: ${item.startDate}`,
          );
        }

        return {
          company: item.company?.trim(),
          location: item.location?.trim(),
          position: item.role?.trim(), // Map role to position
          description: item.description?.trim(),
          start_date,
          end_date: parseDateSafely(item.endDate),
          current: !item.endDate?.trim(),
          technologies:
            item.technologies
              ?.split(",")
              .map((tech) => tech.trim())
              .filter(Boolean) || [],
          company_url: item.company_url?.trim(),
        };
      });
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
