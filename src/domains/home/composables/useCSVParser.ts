/**
 * A composable for parsing CSV data with proper typing
 */

/**
 * Parses CSV text into an array of typed objects
 * @param text - The CSV text to parse
 * @returns An array of parsed objects with the specified type
 */
export function useCSVParser() {
  const parseCSV = <T>(text: string): T[] => {
    const lines = text.split("\n");
    const headers = lines[0]
      .split(",")
      .map((header) => header.replace(/"/g, ""));

    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        // Handle commas within quotes correctly
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = "";

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(currentValue.replace(/"/g, ""));
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.replace(/"/g, ""));

        // Create object from headers and values
        const entry = {} as any;
        headers.forEach((header, index) => {
          if (header === "technologies") {
            entry[header] = values[index] ? values[index].split(",") : [];
          } else if (header === "isAvailable") {
            // Convert "1" or "0" string to boolean
            entry[header] = values[index] === "1";
          } else {
            entry[header] = values[index] || "";
          }
        });

        return entry as T;
      });
  };

  return {
    parseCSV,
  };
}
